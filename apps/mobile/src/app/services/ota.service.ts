import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
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
      console.log('[OTA] Initializing...');
      console.log('[OTA] Platform:', Capacitor.getPlatform());
      console.log('[OTA] Is native:', Capacitor.isNativePlatform());
      console.log('[OTA] App version:', environment.app.version);
      console.log('[OTA] Version check URL:', this.VERSION_CHECK_URL);

      await this.cleanupOldVersions();

      const currentVersion = await this.getCurrentVersion();
      if (!currentVersion) {
        await this.saveCurrentVersion(environment.app.version, '');
        console.log('[OTA] Initial version saved:', environment.app.version);
      } else {
        console.log('[OTA] Current stored version:', currentVersion);
        
        if (this.isNewerVersion(environment.app.version, currentVersion)) {
          console.log('[OTA] App version is newer than stored, updating...');
          await this.saveCurrentVersion(environment.app.version, '');
        }
      }
    } catch (err) {
      console.error('[OTA] Initialize error', err);
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
          console.log('[OTA] Cleaning up old pending update:', pendingVersion.value);
          await Preferences.remove({ key: this.PENDING_URL_KEY });
          await Preferences.remove({ key: this.PENDING_VERSION_KEY });
        }
      }

      if (pendingVersion.value && !pendingUrl.value) {
        console.log('[OTA] Cleaning up pending update without URL');
        await Preferences.remove({ key: this.PENDING_VERSION_KEY });
      }

      if (pendingUrl.value && !pendingVersion.value) {
        console.log('[OTA] Cleaning up pending URL without version');
        await Preferences.remove({ key: this.PENDING_URL_KEY });
      }

      if (currentUrl.value && !currentVersion) {
        console.log('[OTA] Cleaning up current URL without version');
        await Preferences.remove({ key: this.VERSION_URL_KEY });
      }

      console.log('[OTA] Storage cleanup completed');
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
      console.log('[OTA] Checking for updates from:', this.VERSION_CHECK_URL);
      console.log('[OTA] Current app version:', environment.app.version);
      
      const response = await fetch(this.VERSION_CHECK_URL, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Version check failed: ${response.status} ${response.statusText}`);
      }

      const versionInfo: VersionInfo = await response.json();
      console.log('[OTA] Server version info:', versionInfo);

      const currentVersion = await this.getCurrentVersion();
      const currentVersionToCompare = currentVersion || environment.app.version;
      console.log('[OTA] Current stored version:', currentVersion);
      console.log('[OTA] Version to compare:', currentVersionToCompare);

      const isNewer = this.isNewerVersion(versionInfo.version, currentVersionToCompare);
      console.log('[OTA] Is newer version?', isNewer);

      if (isNewer) {
        console.log('[OTA] ✅ New version available:', versionInfo.version);

        if (!checkOnly && isNative) {
          await Preferences.set({
            key: this.PENDING_URL_KEY,
            value: versionInfo.url,
          });
          await Preferences.set({
            key: this.PENDING_VERSION_KEY,
            value: versionInfo.version,
          });
          console.log('[OTA] Pending update saved:', versionInfo.version);
        }

        return versionInfo;
      }

      console.log('[OTA] ✅ Already up to date');
      return null;
    } catch (err: any) {
      console.error('[OTA] ❌ checkForUpdate error:', err);
      console.error('[OTA] Error details:', {
        message: err?.message,
        stack: err?.stack,
        url: this.VERSION_CHECK_URL,
      });
      return null;
    }
  }

  async reloadApp(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('[OTA] Web mode - simple reload');
      window.location.reload();
      return;
    }

    try {
      const pendingUrl = await Preferences.get({ key: this.PENDING_URL_KEY });
      const pendingVersion = await Preferences.get({ key: this.PENDING_VERSION_KEY });

      if (!pendingUrl.value || !pendingVersion.value) {
        console.log('[OTA] No pending update to apply');
        return;
      }

      console.log('[OTA] Applying update:', {
        version: pendingVersion.value,
        url: pendingUrl.value
      });

      await this.saveCurrentVersion(pendingVersion.value, pendingUrl.value);
      await Preferences.remove({ key: this.PENDING_URL_KEY });
      await Preferences.remove({ key: this.PENDING_VERSION_KEY });

      console.log('[OTA] Update applied, reloading app...');
      
      // Capacitor Live Updates ishlatilgan bo'lsa
      // Bu yerda server.url ni o'zgartirish kerak
      window.location.href = pendingUrl.value;
      
      // Yoki appni to'liq qayta ishga tushirish
      setTimeout(() => {
        App.exitApp();
      }, 500);
    } catch (err) {
      console.error('[OTA] reload error', err);
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