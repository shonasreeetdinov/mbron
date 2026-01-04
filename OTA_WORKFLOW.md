# OTA Update Workflow - To'liq Ketma-ketlik

Bu qo'llanma OTA update tizimining to'liq ishlash ketma-ketligini ko'rsatadi.

## ✅ Ha, Device da Avtomatik Yangilanadi!

Agar quyidagi qadamlarni bajarsangiz, device da avtomatik yangilanadi:

1. ✅ Kodni device ga yuklash (native app build)
2. ✅ Server ga deploy qilish (Vercel)
3. ✅ Server da yangi versiya qo'shish (version.json yangilash)
4. ✅ Native code implementatsiya qilish (iOS/Android)

---

## 📋 To'liq Workflow

### 1. Dastlabki Setup

```bash
# 1. Build qiling
npm run build:mobile

# 2. Capacitor sync qiling
npm run cap:sync

# 3. Native app ni build qiling va device ga yuklang
npm run cap:build:ios    # iOS uchun
# yoki
npm run cap:build:android  # Android uchun
```

### 2. Server ga Deploy

```bash
# 1. Vercel ga deploy qiling
git add .
git commit -m "Deploy mobile app"
git push

# 2. Vercel avtomatik build qiladi
# 3. App https://mbron.vercel.app da mavjud bo'ladi
```

### 3. Yangi Versiya Qo'shish

```bash
# 1. public/version.json ni yangilang
{
  "version": "1.0.10",  # Yangi versiya
  "url": "https://mbron.vercel.app",
  "mandatory": false,
  "changelog": "Yangi funksiyalar"
}

# 2. Git ga push qiling
git add public/version.json
git commit -m "Update version to 1.0.10"
git push
```

### 4. Device da Avtomatik Yangilanish

**Qanday ishlaydi:**

1. **App ishga tushganda:**
   - JavaScript: `initialize()` chaqiriladi
   - Version check: `checkForUpdate()` chaqiriladi
   - Server dan `version.json` o'qiladi
   - Yangi versiya topilsa: Pending update saqlanadi
   - Alert ko'rinadi: "Yangilanish mavjud"

2. **Foydalanuvchi "Qayta ishga tushirish" ni bosganda:**
   - JavaScript: `reloadApp()` chaqiriladi
   - Pending URL `ota_current_url` ga saqlanadi
   - App qayta ishga tushadi

3. **App qayta ishga tushganda:**
   - Native code: `applyPendingUpdateIfExists()` chaqiriladi
   - Preferences dan `ota_current_url` o'qiladi
   - Native code: `server.url` yangilanadi
   - App yangi URL dan yuklanadi ✅

---

## 🔄 End-to-End Test

### Test Senaryosi:

1. **Device da app ishga tushiriladi:**
   ```
   [OTA] Initializing...
   [OTA] Current stored version: 1.0.4
   [OTA] Checking for updates from: https://mbron.vercel.app/version.json
   [OTA] Server version info: {version: "1.0.10", ...}
   [OTA] ✅ New version available: 1.0.10
   [OTA] Pending update saved: 1.0.10
   ```

2. **Alert ko'rinadi:**
   - "Yangilanish mavjud"
   - "Qayta ishga tushirish" tugmasi

3. **Foydalanuvchi "Qayta ishga tushirish" ni bosadi:**
   ```
   [OTA] Applying update: {version: "1.0.10", url: "https://mbron.vercel.app"}
   [OTA] Update applied. App will reload with new URL.
   ```

4. **App qayta ishga tushadi:**
   ```
   [OTA] Pending update found on app init: {version: "1.0.10", url: "https://mbron.vercel.app"}
   [OTA] Applying pending update...
   [OTA] ⚠️  Native code should update server.url to: https://mbron.vercel.app
   ```

5. **Native code (iOS/Android):**
   ```
   [OTA] Server URL updated to: https://mbron.vercel.app
   ```

6. **App yangi versiyadan yuklanadi** ✅

---

## ⚠️ Muhim: Native Code Kerak!

**JavaScript qismi ishlaydi:**
- ✅ Version check
- ✅ Pending update saqlash
- ✅ Alert ko'rsatish

**Lekin native code bo'lmasa:**
- ❌ App yangi URL dan yuklanmaydi
- ❌ Server.url yangilanmaydi

**Native code qo'shish kerak:**
- ✅ iOS: `AppDelegate.swift` ni yangilash
- ✅ Android: `MainActivity.kt` ni yangilash

Batafsil: `NATIVE_OTA_IMPLEMENTATION.md` faylida

---

## 📱 Device da Test Qilish

### 1. Dastlabki Holat

```bash
# Device da app ishga tushiriladi
# Version: 1.0.4 (eski versiya)
```

### 2. Server da Yangi Versiya

```bash
# Vercel da version.json yangilandi
# Version: 1.0.10 (yangi versiya)
```

### 3. Device da App Ochiladi

- App ishga tushganda version check qiladi
- Yangi versiya topiladi
- Alert ko'rinadi

### 4. Update Qo'llash

- "Qayta ishga tushirish" bosiladi
- App qayta ishga tushadi
- Native code server.url ni yangilaydi
- App yangi versiyadan yuklanadi ✅

---

## ✅ Checklist

- [ ] Native code implementatsiya qilingan (iOS/Android)
- [ ] App device ga yuklangan
- [ ] Server ga deploy qilingan (Vercel)
- [ ] version.json mavjud va to'g'ri
- [ ] Native code Preferences dan URL o'qiyapti
- [ ] Native code server.url ni yangilayapti

---

## 🎯 Xulosa

**Ha, device da avtomatik yangilanadi**, agar:

1. ✅ JavaScript kod ishlayapti (ishlayapti)
2. ✅ Native code implementatsiya qilingan (qilish kerak)
3. ✅ Server da yangi versiya mavjud (qo'shish kerak)

**Keyingi qadam:**
1. `NATIVE_OTA_IMPLEMENTATION.md` ni o'qing
2. iOS/Android native code ni qo'shing
3. Test qiling

