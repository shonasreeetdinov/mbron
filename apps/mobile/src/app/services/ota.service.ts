import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../../../libs/core/src/lib/config/environment';

interface VersionInfo {
  version: string;
  url: string;
  mandatory: boolean;
  changelog?: string;
}

@Injectable({ providedIn: 'root' })
export class OtaService {
  private readonly VERSION_KEY = 'ota_current_version';
  private readonly VERSION_URL_KEY = 'ota_current_url';
  private readonly PENDING_VERSION_KEY = 'ota_pending_version';
  private readonly PENDING_URL_KEY = 'ota_pending_url';
  private readonly VERCEL_BASE_URL = 'https://mbron.vercel.app';
  
  private get VERSION_CHECK_URL(): string {
    return environment.production 
      ? `${this.VERCEL_BASE_URL}/version.json`
      : `/assets/version.json`;
  }

  async initialize(): Promise<void> {
    try {
      await this.cleanupOldVersions();

      const currentVersion = await this.getCurrentVersion();
      if (!currentVersion) {
        await this.saveCurrentVersion(environment.app.version, '');
      } else {
        if (this.isNewerVersion(environment.app.version, currentVersion)) {
          await this.saveCurrentVersion(environment.app.version, '');
        }
      }

      // Native platformda pending URL ni tekshirib, server.url ni yangilash
      if (Capacitor.isNativePlatform()) {
        await this.applyPendingUpdateIfExists();
      }
    } catch (err) {
      console.error('[OTA] Initialize error', err);
    }
  }

  /**
   * App init bo'lganda pending update bor bo'lsa, uni qo'llash
   * Native code da server.url ni yangilash kerak
   */
  private async applyPendingUpdateIfExists(): Promise<void> {
    try {
      const pendingUrl = await Preferences.get({ key: this.PENDING_URL_KEY });
      const pendingVersion = await Preferences.get({ key: this.PENDING_VERSION_KEY });
      const currentUrl = await Preferences.get({ key: this.VERSION_URL_KEY });

      // Agar pending URL mavjud bo'lsa va u hali qo'llanmagan bo'lsa
      if (pendingUrl.value && pendingVersion.value && pendingUrl.value !== currentUrl.value) {
        // Versiyani yangilaymiz
        await this.saveCurrentVersion(pendingVersion.value, pendingUrl.value);
        
        // Pending ma'lumotlarni tozalaymiz
        await Preferences.remove({ key: this.PENDING_URL_KEY });
        await Preferences.remove({ key: this.PENDING_VERSION_KEY });
        
        console.log(`[OTA] 🔄 Applied pending update: ${pendingVersion.value}`);
      }
    } catch (err) {
      console.error('[OTA] Error applying pending update:', err);
    }
  }

  private async cleanupOldVersions(): Promise<void> {
    try {
      const pendingVersion = await Preferences.get({ key: this.PENDING_VERSION_KEY });
      const pendingUrl = await Preferences.get({ key: this.PENDING_URL_KEY });
      const currentVersion = await this.getCurrentVersion();
      const currentUrl = await Preferences.get({ key: this.VERSION_URL_KEY });

      if (pendingVersion.value && currentVersion) {
        if (!this.isNewerVersion(pendingVersion.value, currentVersion)) {
          await Preferences.remove({ key: this.PENDING_URL_KEY });
          await Preferences.remove({ key: this.PENDING_VERSION_KEY });
        }
      }

      if (pendingVersion.value && !pendingUrl.value) {
        await Preferences.remove({ key: this.PENDING_VERSION_KEY });
      }

      if (pendingUrl.value && !pendingVersion.value) {
        await Preferences.remove({ key: this.PENDING_URL_KEY });
      }

      if (currentUrl.value && !currentVersion) {
        await Preferences.remove({ key: this.VERSION_URL_KEY });
      }
    } catch (err) {
      console.error('[OTA] Cleanup error:', err);
    }
  }

  async hasPendingUpdate(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const pendingVersion = await Preferences.get({ key: this.PENDING_VERSION_KEY });
      const pendingUrl = await Preferences.get({ key: this.PENDING_URL_KEY });
      
      // Agar pending version va URL mavjud bo'lsa
      return !!(pendingVersion.value && pendingUrl.value);
    } catch (err) {
      console.error('[OTA] hasPendingUpdate error', err);
      return false;
    }
  }

  async checkForUpdate(checkOnly: boolean = false): Promise<VersionInfo | null> {
    const isNative = Capacitor.isNativePlatform();
    
    try {
      const response = await fetch(this.VERSION_CHECK_URL, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (!response.ok) {
        throw new Error(`Version check failed: ${response.status} ${response.statusText}`);
      }

      const versionInfo: VersionInfo = await response.json();
      
      // Server versiyasini log'ga qo'shamiz
      const sourceFile = isNative ? 'https://mbron.vercel.app/version.json' : 'assets/version.json';
      console.log(`[OTA] Server version: ${versionInfo.version} (from: ${sourceFile})`);

      const currentVersion = await this.getCurrentVersion();
      const currentVersionToCompare = currentVersion || environment.app.version;
      
      // Device versiyasini log'ga qo'shamiz
      const deviceSourceFile = isNative ? 'Preferences' : 'environment.prod.ts';
      console.log(`[OTA] Device version: ${currentVersionToCompare} (from: ${deviceSourceFile})`);

      const isNewer = this.isNewerVersion(versionInfo.version, currentVersionToCompare);

      if (isNewer) {
        console.log(`[OTA] ✅ Update available: ${currentVersionToCompare} → ${versionInfo.version}`);

        // Pending update ni saqlaymiz (native platformda yoki development modeda)
        if (!checkOnly && (isNative || !environment.production)) {
          await Preferences.set({
            key: this.PENDING_URL_KEY,
            value: versionInfo.url,
          });
          await Preferences.set({
            key: this.PENDING_VERSION_KEY,
            value: versionInfo.version,
          });
        }

        return versionInfo;
      }

      console.log(`[OTA] ✅ Up to date: ${currentVersionToCompare}`);
      return null;
    } catch (err: any) {
      console.error('[OTA] ❌ Version check failed:', err?.message || err);
      return null;
    }
  }

  async reloadApp(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Web/Development modeda
      if (environment.production) {
        return;
      }

      try {
        const pendingVersion = await Preferences.get({ key: this.PENDING_VERSION_KEY });
        const pendingUrl = await Preferences.get({ key: this.PENDING_URL_KEY });

        if (pendingVersion.value && pendingUrl.value) {
          await this.saveCurrentVersion(pendingVersion.value, pendingUrl.value);
          await Preferences.remove({ key: this.PENDING_URL_KEY });
          await Preferences.remove({ key: this.PENDING_VERSION_KEY });
        }
      } catch (err) {
        console.error('[OTA] Error updating version before reload:', err);
      }

      window.location.reload();
      return;
    }

    // Native platform - Preferences'dan reload qilish
    // AppDelegate.swift'da applyPendingOTAUpdate() Preferences'dan URL ni o'qib 
    // WebView'ni qayta yuklaydi
    try {
      const pendingUrl = await Preferences.get({ key: this.PENDING_URL_KEY });
      const pendingVersion = await Preferences.get({ key: this.PENDING_VERSION_KEY });

      if (!pendingUrl.value || !pendingVersion.value) {
        console.log('[OTA] No pending update to apply');
        return;
      }

      await this.saveCurrentVersion(pendingVersion.value, pendingUrl.value);
      await Preferences.remove({ key: this.PENDING_URL_KEY });
      await Preferences.remove({ key: this.PENDING_VERSION_KEY });

      console.log(`[OTA] 🔄 Restarting app with version: ${pendingVersion.value}`);
      
      // Native app qayta ishga tushadi → AppDelegate → applyPendingOTAUpdate()
      // → WebView qayta yuklanydi yangi tuzilma bilan
      window.location.reload();
    } catch (err) {
      console.error('[OTA] Reload error', err);
    }
  }

  async getCurrentVersion(): Promise<string | null> {
    try {
      const result = await Preferences.get({ key: this.VERSION_KEY });
      return result.value || null;
    } catch (err) {
      console.error('[OTA] getCurrentVersion error', err);
      return null;
    }
  }

  private async saveCurrentVersion(version: string, url: string): Promise<void> {
    await Preferences.set({ key: this.VERSION_KEY, value: version });
    if (url) {
      await Preferences.set({ key: this.VERSION_URL_KEY, value: url });
    }
  }

  private isNewerVersion(newVersion: string, currentVersion: string): boolean {
    const newParts = newVersion.split('.').map(Number);
    const currentParts = currentVersion.split('.').map(Number);

    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (newPart > currentPart) {
        return true;
      } else if (newPart < currentPart) {
        return false;
      }
    }

    return false;
  }
}