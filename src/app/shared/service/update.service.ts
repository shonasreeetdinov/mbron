import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface VersionResponse {
  version: string;
  build: number;
  force: boolean;
  hash: string; // SHA-256 hash for integrity
  releaseDate: string;
}

interface AppMetadata {
  version: string;
  build: number;
  buildDate: string;
}

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly VERSION_URL = environment.versionCheckUrl;
  private readonly APP_METADATA: AppMetadata = environment.appMetadata;
  private updateCheckInProgress = false;

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {}

  async checkForUpdate(): Promise<void> {
    if (this.updateCheckInProgress) return;
    
    try {
      this.updateCheckInProgress = true;
      
      // Cache bypass qilish uchun timestamp qo'shish
      const timestamp = Date.now();
      const url = `${this.VERSION_URL}?t=${timestamp}`;
      
      const server = await firstValueFrom(
        this.http.get<VersionResponse>(url)
      );
      
      // Version va build raqamlarini tekshirish
      const needsUpdate = this.shouldUpdate(server);
      
      if (needsUpdate) {
        // Hash integrity tekshiruvi (agar kerak bo'lsa)
        if (server.hash && !this.verifyHash(server)) {
          console.error('Version hash mismatch - possible tampering');
          return;
        }
        
        if (server.force) {
          await this.showUpdateAlert(server.version, true);
        } else {
          await this.showUpdateAlert(server.version, false);
        }
      }
    } catch (e) {
      console.error('Version check failed', e);
    } finally {
      this.updateCheckInProgress = false;
    }
  }

  private shouldUpdate(server: VersionResponse): boolean {
    // Build raqamini tekshirish (eng ishonchli usul)
    if (server.build > this.APP_METADATA.build) {
      return true;
    }
    
    // Agar build bir xil bo'lsa, semantic versioning tekshirish
    if (server.build === this.APP_METADATA.build) {
      return this.isNewerVersion(server.version, this.APP_METADATA.version);
    }
    
    return false;
  }

  private isNewerVersion(server: string, local: string): boolean {
    const s = server.split('.').map(Number);
    const l = local.split('.').map(Number);

    for (let i = 0; i < Math.max(s.length, l.length); i++) {
      const serverPart = s[i] || 0;
      const localPart = l[i] || 0;
      
      if (serverPart > localPart) return true;
      if (serverPart < localPart) return false;
    }
    
    return false;
  }

  private verifyHash(server: VersionResponse): boolean {
    // Bu yerda server tarafdan kelgan hash bilan
    // lokal holatni tekshirish kerak
    // Misol uchun, build artifacts hash'i
    
    // Hozircha oddiy tekshiruv
    return server.hash.length > 0;
  }

  private async showUpdateAlert(version: string, force: boolean) {
    const alert = await this.alertCtrl.create({
      header: 'Yangilanish mavjud',
      message: `Yangi versiya (${version}) mavjud. ${
        force 
          ? 'Ushbu yangilanish majburiy. Ilovani davom ettirish uchun yangilash kerak.' 
          : 'Yangilashni tavsiya qilamiz.'
      }`,
      backdropDismiss: !force,
      buttons: force 
        ? [{ text: 'Yangilash', handler: () => this.performUpdate() }]
        : [
            { text: 'Keyinroq', role: 'cancel' },
            { text: 'Yangilash', handler: () => this.performUpdate() }
          ]
    });

    await alert.present();
  }

  private async performUpdate() {
    try {
      // 1. Service Worker ni to'xtatish
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // 2. Cache'ni tozalash
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      // 3. Hard reload (bypass cache)
      window.location.href = window.location.href + '?reload=' + Date.now();
    } catch (error) {
      console.error('Update failed:', error);
      // Fallback - oddiy reload
      window.location.reload();
    }
  }

  // Debug uchun
  getCurrentVersion(): AppMetadata {
    return this.APP_METADATA;
  }
}