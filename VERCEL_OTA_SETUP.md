# Vercel OTA Setup - Qo'llanma

## Muammo: Yangi versiya ko'rinmayapti

Agar Vercel ga yuklaganingizdan keyin mobile app da yangi versiya ko'rinmasa, quyidagilarni tekshiring:

## 1. Version.json Faylini Tekshirish

Vercel da `version.json` fayli **public** papkasida yoki **root** da bo'lishi kerak.

### Vercel da version.json joylashuvi:

```
your-project/
├── public/
│   └── version.json  ✅ To'g'ri
└── dist/
    └── mobile/
        └── browser/
```

Yoki:

```
your-project/
└── version.json  ✅ To'g'ri (root da)
```

### Version.json Format:

```json
{
  "version": "1.0.5",
  "url": "https://mbron.vercel.app",
  "mandatory": false,
  "changelog": "Yangi versiya - OTA update tizimi qo'shildi"
}
```

**Muhim:** 
- `version` har safar yangi versiya deploy qilganda **o'sishi kerak** (masalan: 1.0.4 → 1.0.5)
- `url` Vercel URL ga mos kelishi kerak

## 2. Vercel Build Settings

Vercel da build qilganda `version.json` fayli **dist/mobile/browser** papkasiga copy qilinishi kerak.

### Vercel Build Command:

```bash
npm run build:mobile
```

### Vercel Output Directory:

```
dist/mobile/browser
```

## 3. Version.json ni Vercel ga Qo'shish

### Variant 1: Public papkada

1. `public/version.json` faylini yarating
2. Vercel ga push qiling
3. Build qilganda avtomatik copy qilinadi

### Variant 2: Build script da

`package.json` ga qo'shing:

```json
{
  "scripts": {
    "build:mobile": "ng build --project mbron-mobile --configuration mobile-production && cp public/version.json dist/mobile/browser/version.json"
  }
}
```

### Variant 3: Vercel API Route (Tavsiya etiladi)

Vercel da API route yarating: `api/version.ts`

```typescript
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    version: '1.0.5',
    url: 'https://mbron.vercel.app',
    mandatory: false,
    changelog: 'Yangi versiya'
  });
}
```

Keyin OTA service da URL ni o'zgartiring:
```typescript
private readonly VERSION_CHECK_URL = `${this.VERCEL_BASE_URL}/api/version`;
```

## 4. Debug Qilish

### Console Loglarni Tekshirish

Mobile app ni ishga tushiring va console loglarni ko'ring:

```
[OTA] Initializing...
[OTA] Platform: ios/android/web
[OTA] Is native: true/false
[OTA] App version: 1.0.4
[OTA] Vercel URL: https://mbron.vercel.app
[OTA] Checking for updates from: https://mbron.vercel.app/version.json
[OTA] Server version info: { version: "1.0.5", ... }
[OTA] Current stored version: 1.0.4
[OTA] Is newer version? true
[OTA] ✅ New version available: 1.0.5
```

### Browser da Test Qilish

1. Browser console ni oching
2. `http://localhost:4201` ga kiring
3. Console da OTA loglarni ko'ring
4. `https://mbron.vercel.app/version.json` ni browser da ochib tekshiring

### Vercel URL ni Tekshirish

Browser da oching:
```
https://mbron.vercel.app/version.json
```

Agar 404 xatosi bo'lsa, version.json fayli to'g'ri joylashmagan.

## 5. Tekshirish Ro'yxati

- [ ] `version.json` fayli Vercel da mavjud
- [ ] `version.json` dagi `version` yangi (joriy app versiyasidan katta)
- [ ] `version.json` dagi `url` to'g'ri
- [ ] Vercel build muvaffaqiyatli o'tdi
- [ ] `https://mbron.vercel.app/version.json` browser da ochiladi
- [ ] Console loglarda version check ko'rinadi
- [ ] Mobile app native platformda ishlayapti (iOS/Android)

## 6. CORS Muammosi Hal Qilish

### Muammo: CORS Policy Error

Agar browser console da quyidagi xatoni ko'rsangiz:
```
Access to fetch at 'https://mbron.vercel.app/version.json' from origin 'http://localhost:4201' 
has been blocked by CORS policy
```

**Yechimlar:**

#### 1. Vercel da CORS Headers (Production)

`vercel.json` fayli root da yaratilgan va CORS headers qo'shilgan. Vercel ga push qiling:

```bash
git add vercel.json
git commit -m "Add CORS headers for version.json"
git push
```

#### 2. Development modeda Proxy (Local)

Development modeda Angular proxy ishlatiladi:
- `apps/mobile/proxy.conf.json` - proxy konfiguratsiyasi
- `angular.json` da proxy sozlangan
- Development modeda `/version.json` proxy orqali ishlaydi

**Eslatma:** Native platformda (iOS/Android) CORS muammosi bo'lmaydi, chunki u browser emas.

### Muammo: Version.json 404 xatosi

**Yechim:** Version.json faylini `public/` papkasiga qo'ying yoki build script da copy qiling.

### Muammo: Versiya yangilanmayapti

**Yechim:** 
1. Version.json dagi `version` ni yangilang (masalan: 1.0.4 → 1.0.5)
2. Vercel ga push qiling
3. Mobile app ni qayta ishga tushiring

### Muammo: Console da hech narsa ko'rinmayapti

**Yechim:**
1. Development modeda test qiling (browser da)
2. Console loglarni tekshiring
3. Network tab da version.json request ni ko'ring

### Muammo: "Already up to date" ko'rsatilmoqda

**Yechim:**
1. Version.json dagi versiya joriy app versiyasidan **katta** bo'lishi kerak
2. Semantic versioning: 1.0.4 < 1.0.5 ✅
3. Preferences ni tozalang (app data ni o'chirish)

## 7. Native Platform Tekshiruvi

OTA service faqat **native platformda** (iOS/Android) ishlaydi. Browser da test qilish uchun:

1. Development modeda test qiling
2. Console loglarni ko'ring
3. Native build qiling: `npm run cap:build:ios` yoki `npm run cap:build:android`

## 8. Version Yangilash Workflow

1. Kod o'zgarishlarini qiling
2. `package.json` dagi versiyani yangilang (ixtiyoriy)
3. `public/version.json` dagi versiyani yangilang (**majburiy**)
4. `npm run build:mobile` ni ishga tushiring
5. Vercel ga deploy qiling
6. Mobile app ni qayta ishga tushiring
7. Update notification ko'rinishi kerak

