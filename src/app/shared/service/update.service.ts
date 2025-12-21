// update.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import packageJson from '../../../../package.json';

interface VersionResponse {
  version: string;
  build: number;
  force: boolean;
}

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly VERSION_URL = 'https://mbron.vercel.app/assets/version.json';
  private readonly CURRENT_VERSION = packageJson.version;
  private updateCheckInProgress = false;

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {}

  async checkForUpdate(): Promise<void> {
    if (this.updateCheckInProgress) return;
    
    try {
      this.updateCheckInProgress = true;
      const server = await firstValueFrom(
        this.http.get<VersionResponse>(this.VERSION_URL)
      );
      
      if (this.isNewer(server.version, this.CURRENT_VERSION)) {
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

  private isNewer(server: string, local: string): boolean {
    const s = server.split('.').map(Number);
    const l = local.split('.').map(Number);

    for (let i = 0; i < Math.max(s.length, l.length); i++) {
      if ((s[i] || 0) > (l[i] || 0)) return true;
      if ((s[i] || 0) < (l[i] || 0)) return false;
    }
    return false;
  }

  private async showUpdateAlert(version: string, force: boolean) {
    const alert = await this.alertCtrl.create({
      header: 'Yangilanish mavjud',
      message: `Yangi versiya (${version}) mavjud. ${force ? 'Ushbu yangilanish majburiy.' : 'Yangilashni tavsiya qilamiz.'}`,
      backdropDismiss: !force,
      buttons: force 
        ? [{ text: 'Yangilash', handler: () => this.forceReload() }]
        : [
            { text: 'Keyinroq', role: 'cancel' },
            { text: 'Yangilash', handler: () => this.forceReload() }
          ]
    });

    await alert.present();
  }

  private async forceReload() {
    // Cache tozalash
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }

    // Service Worker yangilash (agar mavjud bo'lsa)
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // Sahifani yangilash (hard reload)
    window.location.href = window.location.href;
  }
}