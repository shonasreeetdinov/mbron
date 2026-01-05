import { Component, OnInit } from '@angular/core';
import { AlertController, IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { OtaService } from './services/ota.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'mbron-mobile';
  constructor(
    private platform: Platform,
    private ota: OtaService,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    await this.platform.ready();

    // OTA servisini ishga tushiramiz
    await this.ota.initialize();

    // Agar pending update bo'lsa, foydalanuvchiga ko'rsatamiz
    const hasPendingUpdate = await this.ota.hasPendingUpdate();
    if (hasPendingUpdate) {
      this.askForReload('Kutayotgan yangilanish mavjud');
    }

    // Yangi update bor-yo'qligini tekshiramiz (background)
    this.checkForNewUpdate();
  }

  private async checkForNewUpdate() {
    try {
      console.log('[App] Checking for new update...');
      const versionInfo = await this.ota.checkForUpdate();
      if (versionInfo) {
        console.log('[App] New update found:', versionInfo);
        const message = versionInfo.changelog 
          ? `Yangi versiya: ${versionInfo.version}\n\n${versionInfo.changelog}`
          : `Yangi versiya yuklab olindi: ${versionInfo.version}`;
        this.askForReload(message);
      } else {
        console.log('[App] No update available');
      }
      
      // 1 minutdan keyin yana tekshirish
      setTimeout(() => this.checkForNewUpdate(), 60000);
    } catch (err) {
      console.error('[App] Update check failed:', err);
      // Xatoda ham 1 minutdan keyin qayta urinish
      setTimeout(() => this.checkForNewUpdate(), 60000);
    }
  }

  async askForReload(message?: string) {
    const alert = await this.alertCtrl.create({
      header: 'Yangilanish mavjud',
      message: message || 'Ilovani qayta ishga tushirsangiz yangi versiya ishlaydi.',
      buttons: [
        {
          text: 'Keyinroq',
          role: 'cancel',
        },
        {
          text: 'Qayta ishga tushirish',
          handler: () => {
            this.ota.reloadApp();
          },
        },
      ],
    });

    await alert.present();
  }

}
