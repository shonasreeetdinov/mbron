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
  private readonly VERSION_URL = 'https://mbron.vercel.app/version.json';
  private readonly CURRENT_VERSION = packageJson.version;

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {}

  async checkForUpdate(): Promise<void> {
    try {
      const server = await firstValueFrom(
        this.http.get<VersionResponse>(this.VERSION_URL)
      );

      console.log('Local:', this.CURRENT_VERSION);
      console.log('Server:', server.version);

      if (this.isNewer(server.version, this.CURRENT_VERSION) && server.force) {
        await this.showUpdateAlert(server.version);
      }
    } catch (e) {
      console.error('Version check failed', e);
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

  private async showUpdateAlert(version: string) {
    const alert = await this.alertCtrl.create({
      header: 'Yangilanish mavjud',
      message: `Yangi versiya (${version}) mavjud.`,
      backdropDismiss: false,
      buttons: [
        { text: 'Yangilash', handler: () => this.forceReload() }
      ]
    });

    await alert.present();
  }

  private forceReload() {
    if ('caches' in window) {
      caches.keys().then(keys =>
        keys.forEach(k => caches.delete(k))
      );
    }

    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }
}
