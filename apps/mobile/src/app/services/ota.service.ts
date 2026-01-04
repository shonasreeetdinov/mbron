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

interface StoredVersion {
  version: string;
  url: string;
  installedAt: number;
}

@Injectable({ providedIn: 'root' })
export class OtaService {
  private readonly VERSION_KEY = 'ota_current_version';
  private readonly VERSION_URL_KEY = 'ota_current_url';
  private readonly VERCEL_BASE_URL = 'https://mbron.vercel.app';
  // Development modeda assets dan, production da Vercel dan
  private readonly VERSION_CHECK_URL = environment.production 
    ? `${this.VERCEL_BASE_URL}/version.json`
    : `/assets/version.json`; // Assets papkasidan

  /**
   * App ishga tushganda chaqiriladi
   */
  async initialize(): Promise<void> {
    try {
      console.log('[OTA] Initializing...');
      console.log('[OTA] Platform:', Capacitor.getPlatform());
      console.log('[OTA] Is native:', Capacitor.isNativePlatform());
      console.log('[OTA] App version:', environment.app.version);
      console.log('[OTA] Vercel URL:', this.VERCEL_BASE_URL);

      // Joriy versiyani saqlaymiz (agar yo'q bo'lsa)
      const currentVersion = await this.getCurrentVersion();
      if (!currentVersion) {
        await this.saveCurrentVersion(environment.app.version, '');
        console.log('[OTA] Initial version saved:', environment.app.version);
      } else {
        console.log('[OTA] Current stored version:', currentVersion);
      }
    } catch (err) {
      console.error('[OTA] Initialize error', err);
    }
  }

  /**
   * Pending update bor-yo'qligini tekshiradi
   */
  async hasPendingUpdate(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const storedUrl = await Preferences.get({ key: this.VERSION_URL_KEY });
      const currentUrl = await Preferences.get({ key: 'ota_pending_url' });

      // Agar pending URL bor va u hali o'rnatilmagan bo'lsa
      if (currentUrl.value && currentUrl.value !== storedUrl.value) {
        return true;
      }

      return false;
    } catch (err) {
      console.error('[OTA] hasPendingUpdate error', err);
      return false;
    }
  }

  /**
   * Yangi update mavjudligini tekshiradi va yuklab oladi
   * @param checkOnly - Faqat tekshirish, yuklab olishmaslik
   * @returns Update mavjud bo'lsa VersionInfo, aks holda null
   */
  async checkForUpdate(checkOnly: boolean = false): Promise<VersionInfo | null> {
    // Development modeda ham test qilish uchun native check ni o'chirib qo'yamiz
    // Lekin production da faqat native platformda ishlaydi
    const isNative = Capacitor.isNativePlatform();
    const isProduction = environment.production;

    if (!isNative && isProduction) {
      console.log('[OTA] Skipping update check - not native platform in production');
      return null;
    }

    try {
      console.log('[OTA] Checking for updates from:', this.VERSION_CHECK_URL);
      console.log('[OTA] Current app version:', environment.app.version);
      
      // Serverdan versiya ma'lumotlarini olamiz
      const response = await fetch(this.VERSION_CHECK_URL, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
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

      // Versiyalarni solishtiramiz
      const isNewer = this.isNewerVersion(versionInfo.version, currentVersionToCompare);
      console.log('[OTA] Is newer version?', isNewer);

      if (isNewer) {
        console.log('[OTA] ✅ New version available:', versionInfo.version);

        if (!checkOnly) {
          // Yangi versiyani pending qilib saqlaymiz
          await Preferences.set({
            key: 'ota_pending_url',
            value: versionInfo.url,
          });
          await Preferences.set({
            key: 'ota_pending_version',
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

  /**
   * Appni yangi versiyaga o'tkazadi va qayta ishga tushiradi
   * Eslatma: server.url ni o'zgartirish uchun native code kerak
   * iOS/Android da server.url ni yangi URL ga o'zgartirish kerak
   */
  async reloadApp(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Web da oddiy reload
      window.location.reload();
      return;
    }

    try {
      const pendingUrl = await Preferences.get({ key: 'ota_pending_url' });
      const pendingVersion = await Preferences.get({ key: 'ota_pending_version' });

      if (!pendingUrl.value || !pendingVersion.value) {
        console.log('[OTA] No pending update to apply');
        return;
      }

      // Yangi versiyani joriy versiya qilib saqlaymiz
      await this.saveCurrentVersion(pendingVersion.value, pendingUrl.value);

      // Pending ma'lumotlarni tozalaymiz
      await Preferences.remove({ key: 'ota_pending_url' });
      await Preferences.remove({ key: 'ota_pending_version' });

      // Native tomonda server.url ni yangilash kerak
      // Hozircha appni qayta ishga tushiramiz
      // Native code da server.url ni o'zgartirish kerak (qo'llanmaga qarang)
      console.log('[OTA] New version URL saved:', pendingUrl.value);
      console.log('[OTA] Please implement native server.url update');

      // Appni qayta ishga tushiramiz
      // Native tomonda server.url yangilanganidan keyin reload qilinadi
      await App.exitApp();
    } catch (err) {
      console.error('[OTA] reload error', err);
    }
  }

  /**
   * Joriy versiyani olish
   */
  async getCurrentVersion(): Promise<string | null> {
    try {
      const result = await Preferences.get({ key: this.VERSION_KEY });
      return result.value || null;
    } catch (err) {
      console.error('[OTA] getCurrentVersion error', err);
      return null;
    }
  }

  /**
   * Joriy versiyani saqlash
   */
  private async saveCurrentVersion(version: string, url: string): Promise<void> {
    await Preferences.set({ key: this.VERSION_KEY, value: version });
    if (url) {
      await Preferences.set({ key: this.VERSION_URL_KEY, value: url });
    }
  }

  /**
   * Versiya yangi ekanligini tekshirish
   * Semantic versioning ni qo'llab-quvvatlaydi
   */
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

  /**
   * Vercel base URL ni o'rnatish
   */
  setVercelBaseUrl(url: string): void {
    (this as any).VERCEL_BASE_URL = url;
    (this as any).VERSION_CHECK_URL = `${url}/version.json`;
  }
}
