# Manual OTA Update Setup - Vercel

Bu qo'llanma Vercel da manual OTA (Over-The-Air) update tizimini sozlash uchun.

## 1. Vercel Deployment

Mobile app ni Vercel ga yuklang:

```bash
npm run build:mobile
# dist/mobile/browser papkasini Vercel ga deploy qiling
```

## 2. Version.json Faylini Yaratish

Vercel da `public/version.json` faylini yarating yoki root da `version.json` faylini qo'ying:

```json
{
  "version": "1.0.5",
  "url": "https://your-app.vercel.app",
  "mandatory": false,
  "changelog": "Bug fixes va yaxshilanishlar"
}
```

**Muhim:** Har safar yangi versiya deploy qilganda, `version.json` dagi `version` ni yangilang.

## 3. OTA Service Konfiguratsiya

`apps/mobile/src/app/services/ota.service.ts` faylida Vercel URL ni o'zgartiring:

```typescript
private readonly VERCEL_BASE_URL = 'https://your-app.vercel.app';
```

Yoki runtime da o'rnatish:

```typescript
this.ota.setVercelBaseUrl('https://your-app.vercel.app');
```

## 4. Native Code (iOS/Android)

OTA to'liq ishlashi uchun native code da `server.url` ni o'zgartirish kerak.

### iOS (Swift)

`ios/App/App/AppDelegate.swift` faylida:

```swift
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // OTA URL ni tekshirish
        if let otaUrl = UserDefaults.standard.string(forKey: "ota_current_url"), !otaUrl.isEmpty {
            let config = InstanceConfiguration()
            config.serverURL = URL(string: otaUrl)
            return true
        }
        return true
    }
}
```

### Android (Kotlin)

`android/app/src/main/java/.../MainActivity.java` yoki Kotlin faylida:

```kotlin
import com.getcapacitor.BridgeActivity
import android.content.SharedPreferences

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // OTA URL ni tekshirish
        val prefs = getSharedPreferences("_capacitor_preferences", MODE_PRIVATE)
        val otaUrl = prefs.getString("ota_current_url", null)
        
        if (!otaUrl.isNullOrEmpty()) {
            // Capacitor config da server.url ni o'zgartirish
            // Bu qism Capacitor plugin orqali amalga oshirilishi kerak
        }
    }
}
```

## 5. Ishlash Prinsipi

1. **App ishga tushganda:**
   - OTA service `version.json` ni tekshiradi
   - Agar yangi versiya bo'lsa, foydalanuvchiga bildirishadi

2. **Update yuklab olish:**
   - Yangi versiya URL `ota_pending_url` ga saqlanadi
   - Foydalanuvchi "Qayta ishga tushirish" ni bosadi

3. **Update o'rnatish:**
   - Native code `ota_current_url` ni o'qiydi
   - `server.url` ni yangi URL ga o'zgartiradi
   - App reload qilinadi

## 6. Vercel Deployment Workflow

1. Kod o'zgarishlarini qiling
2. `package.json` dagi versiyani yangilang
3. `npm run build:mobile` ni ishga tushiring
4. `dist/mobile/browser` ni Vercel ga deploy qiling
5. `version.json` faylini yangilang (yangi versiya raqami bilan)

## 7. Testing

- Development: `npm run start:mobile`
- Production build: `npm run build:mobile`
- Native test: `npm run cap:run:ios` yoki `npm run cap:run:android`

## Eslatmalar

- `@capgo/capacitor-updater` paketini olib tashladik
- `@capacitor/preferences` paketini qo'shdik
- `capacitor.config.ts` dan Capgo konfiguratsiyasini olib tashladik
- Native code da server.url ni o'zgartirish kerak (yuqoridagi misollarga qarang)

