import { Component, OnInit } from '@angular/core';
import { AlertController, IonApp, IonRouterOutlet, IonButton, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { OtaService } from './services/ota.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, IonButton, IonContent, IonHeader, IonToolbar, IonTitle],
  template: `
    <ion-app>
      <!-- Debug panel - faqat development uchun -->
      <div *ngIf="showDebug" style="position: fixed; top: 0; right: 0; z-index: 9999; background: white; padding: 10px; border: 2px solid red;">
        <h3>OTA Debug</h3>
        <p>Platform: {{ platform }}</p>
        <p>Current Version: {{ currentVersion }}</p>
        <p>Has Pending: {{ hasPending }}</p>
        <ion-button size="small" (click)="manualCheckUpdate()">Check Update</ion-button>
        <ion-button size="small" (click)="showDebugInfo()">Show Info</ion-button>
        <ion-button size="small" (click)="clearStorage()">Clear Storage</ion-button>
      </div>
      
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'mbron-mobile';
  showDebug = true; // Test uchun true qiling, production da false
  platform = '';
  currentVersion = '';
  hasPending = false;

  constructor(
    private ota: OtaService,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    this.platform = Capacitor.getPlatform();
    
    // OTA servisini ishga tushiramiz
    await this.ota.initialize();
    
    // Debug ma'lumotlarni yangilaymiz
    await this.updateDebugInfo();

    // Agar pending update bo'lsa, foydalanuvchiga ko'rsatamiz
    const hasPendingUpdate = await this.ota.hasPendingUpdate();
    if (hasPendingUpdate) {
      this.askForReload('Kutayotgan yangilanish mavjud');
    }

    // Yangi update bor-yo'qligini tekshiramiz
    this.checkForNewUpdate();
  }

  private async updateDebugInfo() {
    this.currentVersion = await this.ota.getCurrentVersion() || 'N/A';
    this.hasPending = await this.ota.hasPendingUpdate();
  }

  async manualCheckUpdate() {
    console.log('[Debug] Manual update check started');
    const versionInfo = await this.ota.checkForUpdate();
    
    await this.updateDebugInfo();
    
    if (versionInfo) {
      console.log('[Debug] Update found:', versionInfo);
      const alert = await this.alertCtrl.create({
        header: 'Update Found',
        message: `New version: ${versionInfo.version}\n${versionInfo.changelog || ''}`,
        buttons: ['OK']
      });
      await alert.present();
    } else {
      console.log('[Debug] No update available');
      const alert = await this.alertCtrl.create({
        header: 'No Update',
        message: 'You are using the latest version',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async showDebugInfo() {
    const info = {
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      currentVersion: await this.ota.getCurrentVersion(),
      hasPending: await this.ota.hasPendingUpdate(),
    };
    
    console.log('[Debug] App Info:', info);
    
    const alert = await this.alertCtrl.create({
      header: 'Debug Info',
      message: JSON.stringify(info, null, 2),
      buttons: ['OK']
    });
    await alert.present();
  }

  async clearStorage() {
    const confirm = await this.alertCtrl.create({
      header: 'Clear Storage?',
      message: 'This will remove all OTA data',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear',
          handler: async () => {
            try {
              const { Preferences } = await import('@capacitor/preferences');
              await Preferences.clear();
              console.log('[Debug] Storage cleared');
              
              const success = await this.alertCtrl.create({
                header: 'Success',
                message: 'Storage cleared. Restart app to reinitialize.',
                buttons: ['OK']
              });
              await success.present();
            } catch (err) {
              console.error('[Debug] Clear error:', err);
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  private async checkForNewUpdate() {
    try {
      console.log('[App] Checking for new update...');
      const versionInfo = await this.ota.checkForUpdate();
      
      await this.updateDebugInfo();
      
      if (versionInfo) {
        console.log('[App] New update found:', versionInfo);
        const message = versionInfo.changelog 
          ? `Yangi versiya: ${versionInfo.version}\n\n${versionInfo.changelog}`
          : `Yangi versiya yuklab olindi: ${versionInfo.version}`;
        this.askForReload(message);
      } else {
        console.log('[App] No update available');
      }
    } catch (err) {
      console.error('[App] Update check failed:', err);
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