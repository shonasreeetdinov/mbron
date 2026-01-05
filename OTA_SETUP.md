# OTA (Over-The-Air) Update Setup

## Umumiy Tushuncha

Ilova Verceldan yangi versiyani avtomatik yuklashi uchun OTA tizimi sozlanishi kerak. Bu tizim quyidagi bosqichlardan iborat:

1. **JavaScript/TypeScript** - O'zgarish tekshirish va Preferences da saqlanishi
2. **Native kod (iOS/Android)** - Preferences'dan URL ni o'qib, server.url ni yangilash
3. **Vercel** - `version.json` faylini yangilash

---

## 1. Version.json Format (Vercelda)

File: `public/version.json`

```json
{
  "version": "1.0.12",
  "url": "https://mbron.vercel.app",
  "mandatory": false,
  "changelog": "Yangi versiya - OTA update tizimi qo'shildi"
}
```

**Muhim**: Serverda tuzilmani yangilasangiz, version raqamini o'zgartirib, `version.json` ni ham yangilashni unutmang!

---

## 2. JavaScript/TypeScript - OTA Service

**File**: `apps/mobile/src/app/services/ota.service.ts`

Ushbu servis:
- Verceldan `version.json` ni tekshiradi
- Yangi versiya mavjud bo'lsa, URL va versiyani **Preferences** da saqlaydi
- Bu pendingning yangi versiyasi hisoblanadi

**Qanday ishlaydi**:
```
Kapilapp boshlanishi
    ↓
initialize() - Preferences'dan current version ni o'qish
    ↓
checkForUpdate() - Server version.json bilan taqqosla
    ↓
Agar yangi versiya bo'lsa → pending_url va pending_version saqlash
    ↓
Foydalanuvchi "Yangilash" tugmasini bosganda → reloadApp()
    ↓
App.exitApp() - iOS AppDelegate'ga signal
    ↓
Native kodda Preferences'dan URL o'qish va server.url yangilash
    ↓
App qayta ishga tushadi → yangi tuzilma Verceldan yuklonadi
```

---

## 3. iOS Native Code

**File**: `ios/App/App/AppDelegate.swift`

AppDelegate'ning `didFinishLaunchingWithOptions` metodi oxirida:

```swift
private func applyPendingOTAUpdate() {
    let defaults = UserDefaults.standard
    let pendingUrl = defaults.string(forKey: "ota_pending_url")
    let pendingVersion = defaults.string(forKey: "ota_pending_version")
    let currentUrl = defaults.string(forKey: "ota_current_url")
    
    guard let pendingUrl = pendingUrl,
          let pendingVersion = pendingVersion,
          pendingUrl != currentUrl else {
        return
    }
    
    print("[OTA Native] Applying update: \(pendingUrl)")
    
    // ✅ Bu yerda server.url ni yangilash kerak!
    CAPBridge.sharedInstance().config.server.url = pendingUrl
    
    // Preferences'ni yangilash
    defaults.set(pendingVersion, forKey: "ota_current_version")
    defaults.set(pendingUrl, forKey: "ota_current_url")
    defaults.removeObject(forKey: "ota_pending_url")
    defaults.removeObject(forKey: "ota_pending_version")
    defaults.synchronize()
}
```

---

## 4. Preferences Key Mapping

| Key | Izoh |
|-----|------|
| `ota_current_version` | Hozirgi o'rnatilgan versiya |
| `ota_current_url` | Hozirgi server URLi |
| `ota_pending_version` | Yangi versiya (shunga kutmoqdamiz) |
| `ota_pending_url` | Yangi server URLi |

---

## 5. Testing

### iOS simulatorida test qilish:

```bash
# 1. Web build yaratish
npm run build:mobile

# 2. Xcode'da ochish
npm run cap:open:ios

# 3. Vercel version.json'ni yangilash:
# - public/version.json da version'ni o'zgartirish
# - Vercelga push qilish

# 4. Appda "Update" tugmasini bosganda:
# - Console'dan [OTA] loglarini ko'rish
# - AppDelegate'da server.url yangilanganligini tekshirish
# - App qayta ishga tushganda yangi tuzilma yuklonishi kerak
```

### Debug qilish:

**XCode Debug Console** da quyidagilarni qidirish:
```
[OTA] Checking for updates
[OTA] New version available
[OTA] Applying update
[OTA Native] Applying pending update
```

---

## 6. Muhim Eslatma

⚠️ **Version.json'ni vergulasiz yangilash kerak!**

Vercelga push qilganda, `public/version.json` faylida:
- `version` raqami yangilangan bo'lishi kerak (masalan: 1.0.9 → 1.0.10)
- `url` to'g'ri bo'lishi kerak (masalan: https://mbron.vercel.app)

Agar version.json'ni yangilash markazsizki, app yangi versiyani topilmaydi!

---

## 7. Flow Diagram

```
User → "Update available" dialog
    ↓
User → Click "Reload"
    ↓
OTA Service: reloadApp()
    ↓
Save pending_version & pending_url to Preferences
    ↓
App.exitApp()
    ↓
iOS App Restart → AppDelegate.didFinishLaunching()
    ↓
applyPendingOTAUpdate()
    ↓
Read Preferences → server.url = pendingUrl
    ↓
CAPBridge update
    ↓
App load → GET dist/mobile/browser from new URL
    ↓
✅ New version loaded successfully
```

---

## 8. Qo'shimcha Fayllar

- [OTA Service](apps/mobile/src/app/services/ota.service.ts)
- [App Component](apps/mobile/src/app/app.component.ts)
- [AppDelegate](ios/App/App/AppDelegate.swift)
