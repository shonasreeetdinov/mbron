// src/app/core/services/update.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private readonly CURRENT_VERSION = '1.0.0'; // ← Har build'da o‘zgartiring yoki package.json'dan oling
  private readonly VERSION_URL = 'https://mbron.vercel.app/version.json'; // ← Server'da yaratiladigan fayl

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  async checkForUpdate(): Promise<void> {
    // Faqat native platform'da (iOS/Android)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const serverVersion: any = await this.http
        .get<{ version: string }>(this.VERSION_URL, {
          params: { t: Date.now().toString() }, // cache bypass
        })
        .toPromise();

      if (serverVersion.version !== this.CURRENT_VERSION) {
        this.forceUpdate();
      }
    } catch (error) {
      console.log('Update check failed (offline or error)', error);
      // Silent fail — user'ga bildirish shart emas
    }
  }

  private async showUpdateAlert(newVersion: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Yangi versiya mavjud!',
      message: `Versiya ${newVersion} chiqdi. App'ni yangilashni xohlaysizmi?`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Keyinroq',
          role: 'cancel',
        },
        {
          text: 'Yangilash',
          handler: () => {
            this.forceUpdate();
          },
        },
      ],
    });

    await alert.present();
  }

  private forceUpdate(): void {
    // Cache'ni tozalab, app'ni reload qilish
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });

    localStorage.clear();
    sessionStorage.clear();

    window.location.reload();
  }
}
