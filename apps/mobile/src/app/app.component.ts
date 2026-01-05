import { Component, OnInit } from '@angular/core';
import { ToastController, IonApp, IonRouterOutlet, IonButton, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { OtaService } from './services/ota.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, IonButton, IonContent, IonHeader, IonToolbar, IonTitle],
  template: `
    <ion-app>
      <!-- Update banner - non-blocking -->
      <div *ngIf="updateAvailable && !updateApplied" style="position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: center; animation: slideDown 0.3s ease;">
        <div style="margin: 0 0 10px 0; font-weight: 600;">📦 Yangi versiya: {{ updateVersion }}</div>
        <div style="margin: 0 0 12px 0; font-size: 14px;">{{ updateChangelog }}</div>
        <button (click)="applyUpdate()" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; margin-right: 8px;">Yangilash</button>
        <button (click)="dismissUpdate()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">Keyinroq</button>
      </div>
      
      <!-- Debug panel - faqat development uchun -->
      <div *ngIf="showDebug" style="position: fixed; top: 60px; right: 0; z-index: 999; background: white; padding: 10px; border: 2px solid red; border-radius: 4px; font-size: 12px;">
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
  styles: [`
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
  `],
})
export class AppComponent implements OnInit {
  title = 'mbron-mobile';
  showDebug = true; // Test uchun true qiling, production da false
  platform = '';
  currentVersion = '';
  hasPending = false;
  updateAvailable = false;
  updateApplied = false;
  updateVersion = '';
  updateChangelog = '';

  constructor(
    private ota: OtaService,
    private toastCtrl: ToastController
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
      this.showToast(`Yangi versiya: ${versionInfo.version}`, 'success');
    } else {
      console.log('[Debug] No update available');
      this.showToast('Siz oxirgi versiyadan foydalanyapsiz', 'info');
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
    this.showToast(JSON.stringify(info, null, 2), 'info');
  }

  async clearStorage() {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.clear();
      console.log('[Debug] Storage cleared');
      this.showToast('Storage tozalandi. Ilovani qayta ishga tushiring.', 'success');
    } catch (err) {
      console.error('[Debug] Clear error:', err);
      this.showToast('Storage tozalashda xato!', 'danger');
    }
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
    // Update banner ni ko'rsatamiz
    this.updateAvailable = true;
    this.updateVersion = (await this.ota.getCurrentVersion()) || 'Latest';
    this.updateChangelog = message || 'Ilovani qayta ishga tushirsangiz yangi versiya ishlaydi.';
  }

  async applyUpdate() {
    this.updateApplied = true;
    this.showToast('Yangilash boshlanmoqda...', 'success');
    await this.ota.reloadApp();
  }

  dismissUpdate() {
    this.updateAvailable = false;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'info' = 'info') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}