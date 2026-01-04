# OTA Update Test Qo'llanmasi

Bu qo'llanma OTA (Over-The-Air) update tizimini to'liq test qilish uchun ketma-ketlikni ko'rsatadi.

## 📋 Test Ketma-ketligi

### 1. Development Modeda Test (Browser)

#### 1.1. Dastlabki Holatni Tekshirish

```bash
# Dev server ni ishga tushiring
npm run start:mobile
```

1. Browser da `http://localhost:4201` ga kiring
2. Browser Console ni oching (F12)
3. Quyidagi loglarni ko'ring:
   ```
   [OTA] Initializing...
   [OTA] Platform: web
   [OTA] App version: 1.0.4
   [OTA] Checking for updates from: /assets/version.json
   ```

#### 1.2. Yangi Versiya Test Qilish

1. `apps/mobile/src/assets/version.json` faylini oching
2. Versiyani yangilang:
   ```json
   {
     "version": "1.0.6",
     "url": "https://mbron.vercel.app",
     "mandatory": false,
     "changelog": "Test versiya - 1.0.6"
   }
   ```
3. Browser ni refresh qiling (F5)
4. Console da quyidagilarni ko'ring:
   ```
   [OTA] ✅ New version available: 1.0.6
   [OTA] Pending update saved: 1.0.6
   [App] New update found: ...
   ```
5. Alert ko'rinishi kerak: "Yangilanish mavjud"
6. "Qayta ishga tushirish" tugmasini bosing
7. Browser reload bo'lishi kerak

#### 1.3. Versiya Solishtirish Testi

1. `version.json` da versiyani **kichikroq** qiling (masalan: 1.0.3)
2. Browser ni refresh qiling
3. Console da quyidagilarni ko'ring:
   ```
   [OTA] Is newer version? false
   [OTA] ✅ Already up to date
   [App] No update available
   ```

---

### 2. Production Build Test (Native Platform)

#### 2.1. Build va Sync

```bash
# Mobile app ni build qiling
npm run build:mobile

# Capacitor sync qiling (iOS uchun)
npm run cap:sync

# Yoki Android uchun
npx cap sync android
```

#### 2.2. iOS da Test

```bash
# Xcode ni oching
npm run cap:open:ios

# Yoki to'g'ridan-to'g'ri run qiling
npm run cap:run:ios
```

**Xcode da:**
1. Simulator yoki real device tanlang
2. Run tugmasini bosing (▶️)
3. App ishga tushganda Console loglarni ko'ring
4. Xcode Console da `[OTA]` loglarini qidiring

#### 2.3. Android da Test

```bash
# Android Studio ni oching
npm run cap:open:android

# Yoki to'g'ridan-to'g'ri run qiling
npm run cap:run:android
```

**Android Studio da:**
1. Emulator yoki real device tanlang
2. Run tugmasini bosing (▶️)
3. Logcat da `[OTA]` loglarini qidiring:
   ```
   adb logcat | grep OTA
   ```

---

### 3. Vercel da Test (Production)

#### 3.1. Version.json ni Vercel ga Deploy Qilish

1. `public/version.json` faylini yangilang:
   ```json
   {
     "version": "1.0.7",
     "url": "https://mbron.vercel.app",
     "mandatory": false,
     "changelog": "Production test - 1.0.7"
   }
   ```

2. Vercel ga push qiling:
   ```bash
   git add public/version.json
   git commit -m "Update version to 1.0.7"
   git push
   ```

3. Vercel build ni kuting (bir necha minut)

#### 3.2. Version.json ni Tekshirish

Browser da oching:
```
https://mbron.vercel.app/version.json
```

Quyidagilarni ko'rish kerak:
```json
{
  "version": "1.0.7",
  "url": "https://mbron.vercel.app",
  "mandatory": false,
  "changelog": "Production test - 1.0.7"
}
```

#### 3.3. Native App da Test

1. Native app ni ishga tushiring (iOS/Android)
2. Console/Logcat da quyidagilarni ko'ring:
   ```
   [OTA] Checking for updates from: https://mbron.vercel.app/version.json
   [OTA] Server version info: {version: "1.0.7", ...}
   [OTA] Current stored version: 1.0.4
   [OTA] Is newer version? true
   [OTA] ✅ New version available: 1.0.7
   ```
3. Alert ko'rinishi kerak
4. "Qayta ishga tushirish" tugmasini bosing
5. App qayta ishga tushishi kerak

---

### 4. To'liq Test Senaryolari

#### Senaryo 1: Birinchi Marta Update

1. App ni birinchi marta ishga tushiring
2. Version 1.0.4 saqlanadi
3. Vercel da version 1.0.5 bo'lsin
4. App ishga tushganda update topilishi kerak
5. Alert ko'rinishi kerak
6. Update qabul qilinganidan keyin version 1.0.5 saqlanadi

#### Senaryo 2: Bir Xil Versiya

1. App da version: 1.0.5
2. Vercel da version: 1.0.5
3. Update topilmasligi kerak
4. Console da: `[OTA] ✅ Already up to date`

#### Senaryo 3: Eski Versiya

1. App da version: 1.0.6
2. Vercel da version: 1.0.5
3. Update topilmasligi kerak
4. Console da: `[OTA] ✅ Already up to date`

#### Senaryo 4: Katta Versiya O'zgarishi

1. App da version: 1.0.4
2. Vercel da version: 2.0.0
3. Update topilishi kerak
4. Alert ko'rinishi kerak

#### Senaryo 5: Patch Versiya

1. App da version: 1.0.4
2. Vercel da version: 1.0.5
3. Update topilishi kerak

#### Senaryo 6: Minor Versiya

1. App da version: 1.0.4
2. Vercel da version: 1.1.0
3. Update topilishi kerak

---

### 5. Debug Qilish

#### 5.1. Console Loglarni Tekshirish

**Development (Browser):**
- F12 → Console tab
- `[OTA]` loglarini qidiring

**iOS (Xcode):**
- Xcode → View → Debug Area → Activate Console
- `[OTA]` loglarini qidiring

**Android (Logcat):**
```bash
adb logcat | grep -i "ota\|OTA"
```

#### 5.2. Network Requestlarni Tekshirish

**Browser:**
- F12 → Network tab
- `version.json` request ni ko'ring
- Status: 200 OK bo'lishi kerak

**Native:**
- iOS: Xcode → Network tab
- Android: Chrome DevTools → `chrome://inspect`

#### 5.3. Preferences/Storage ni Tekshirish

**Browser:**
- F12 → Application → Local Storage
- `ota_current_version` va `ota_pending_version` ni ko'ring

**Native:**
- iOS: Xcode → Debug → View Memory
- Android: `adb shell run-as com.mbron.new cat /data/data/com.mbron.new/shared_prefs/_capacitor_preferences.xml`

---

### 6. Muammo Hal Qilish

#### Muammo: Version.json topilmayapti

**Yechim:**
- Vercel da `public/version.json` mavjudligini tekshiring
- Browser da `https://mbron.vercel.app/version.json` ni ochib ko'ring
- 404 bo'lsa, fayl to'g'ri joylashmagan

#### Muammo: Update topilmayapti

**Yechim:**
1. Version.json dagi versiya joriy versiyadan **katta** bo'lishi kerak
2. Console loglarni tekshiring
3. Network request muvaffaqiyatli bo'lganini tekshiring

#### Muammo: Alert ko'rinmayapti

**Yechim:**
1. Console da `[App] New update found` logini tekshiring
2. `app.component.ts` da `askForReload()` chaqirilganini tekshiring
3. Ionic AlertController ishlayotganini tekshiring

#### Muammo: Reload ishlamayapti

**Yechim:**
- Development modeda: `window.location.reload()` ishlaydi
- Native modeda: `App.exitApp()` ishlaydi, lekin native code da `server.url` yangilanishi kerak

---

### 7. Test Checklist

- [ ] Development modeda version check ishlaydi
- [ ] Assets dan version.json o'qiladi
- [ ] Yangi versiya topilganda alert ko'rinadi
- [ ] Reload tugmasi ishlaydi
- [ ] Production build muvaffaqiyatli
- [ ] Native platformda version check ishlaydi
- [ ] Vercel dan version.json o'qiladi
- [ ] Version solishtirish to'g'ri ishlaydi
- [ ] Pending update saqlanadi
- [ ] Preferences to'g'ri ishlaydi

---

### 8. Tezkor Test Komandalari

```bash
# 1. Development test
npm run start:mobile

# 2. Build va sync
npm run build:mobile && npm run cap:sync

# 3. iOS test
npm run cap:open:ios

# 4. Android test
npm run cap:open:android

# 5. Version.json ni yangilash (test uchun)
echo '{"version":"1.0.8","url":"https://mbron.vercel.app","mandatory":false,"changelog":"Test"}' > apps/mobile/src/assets/version.json
```

---

## ✅ Muvaffaqiyatli Test Belgilari

1. ✅ Console da `[OTA] ✅ New version available` ko'rinadi
2. ✅ Alert dialog ko'rinadi
3. ✅ "Qayta ishga tushirish" tugmasi ishlaydi
4. ✅ Version Preferences ga saqlanadi
5. ✅ Native platformda CORS muammosi bo'lmaydi
6. ✅ Vercel dan version.json muvaffaqiyatli o'qiladi

---

## 📝 Eslatmalar

- Development modeda faqat test uchun
- Haqiqiy OTA update native platformda (iOS/Android) ishlaydi
- Vercel ga har safar yangi versiya deploy qilganda `version.json` ni yangilang
- Native code da `server.url` ni o'zgartirish kerak (OTA_SETUP.md ga qarang)

