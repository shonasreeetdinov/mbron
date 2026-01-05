# OTA Update - Deployment Guide

## Serverda yangi versiyani deploy qilish qadam-qadam

### 1️⃣ Kod o'zgartirishlarini amalga oshirish

Ilova kodini o'zgartirganda:

```bash
# Butun proyektni build qilish
npm run build:mobile
```

### 2️⃣ Vercelga yuklamadan OLDIN - Version raqamini o'zgartirish

**File**: `public/version.json`

Versiyani o'zgartirish (masalan):
```json
{
  "version": "1.0.10",
  "url": "https://mbron.vercel.app",
  "mandatory": false,
  "changelog": "Bug fixes va yangi features"
}
```

### 3️⃣ Vercelga yuklamago (Deploy)

```bash
# Git'ga commit qilish
git add .
git commit -m "v1.0.10: Bug fixes"
git push origin main
```

**Vercel** avtomatik deploy qiladi. Yoki:
- Vercel dashboard'dan manual deploy qilish
- URL: https://vercel.com/dashboard

### 4️⃣ iOS app'ni rebuild qilish (IHTIYORIY)

Agar app'ni tuzilmasi o'zgargan bo'lsa:

```bash
npm run cap:build:ios
# Yoki test uchun simulatorida:
npm run cap:run:ios
```

---

## User Experience

1. **Device'dagi app** avtomatik yangilashni tekshiradi
2. **"Update available"** dialog ko'rsatiladi
3. User **"Reload"** tugmasini bosganda:
   - App kapanishi
   - Preferences'dan yangi URL ni o'qish
   - App qayta ishga tushish
   - **Yangi versiya Verceldan yuklanadi**

---

## Verification Checklist

Deploy qilganda tekshirish:

- [ ] `package.json` da version yangilangan?
- [ ] `public/version.json` da version yangilangan?
- [ ] Build hatasiz tugadi? (`npm run build:mobile`)
- [ ] Vercel deploy'i muvaffaqiyatli bo'ldi?
- [ ] `https://mbron.vercel.app/version.json` mavjud?

---

## Debugging

Agar app yangilash ishlashmagani bo'lsa:

```bash
# 1. Console'dan OTA loglarini ko'rish (Xcode)
# Qidirish: "[OTA]"

# 2. Preferences'dan ma'lumotlarni tekshirish
# Xcode → Debug → Breakpoint

# 3. Network'ni tekshirish
# Safari DevTools → Network tab

# 4. server.url ni tekshirish
# AppDelegate.swift da log qo'shish
```

---

## Ommaviy Deployment Process

```
1. Kod o'zgartirishni yakunlashtirish
   ↓
2. version.json da versiyani o'zgartirish
   ↓
3. npm run build:mobile
   ↓
4. git push origin main
   ↓
5. Vercel auto deploy (1-2 min kutish)
   ↓
6. Device: "Update available" bildirish
   ↓
7. User: "Reload" bosganda yangi versiya yuklanadi
```

---

## Tips

✅ **Version format**: `major.minor.patch` (masalan: 1.0.10)

✅ **Changelog**: Foydalanuvchiga nima qo'shilganini ko'rsating

✅ **Mandatory**: `false` qoyilsa, user noladi yuklab oladi. `true` bo'lsa, majburiy

⚠️ **URL**: Doim HTTPS bo'lishi kerak

⚠️ **version.json**: Har safar deploy'dan oldin yangilang!
