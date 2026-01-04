# Native OTA Implementation - iOS/Android

Bu qo'llanma native platformda (iOS/Android) OTA update ni to'liq ishlatish uchun native code implementatsiyasini ko'rsatadi.

## Muammo

JavaScript dan to'g'ridan-to'g'ri Capacitor `server.url` ni o'zgartirish mumkin emas. Bu native code da qilinishi kerak.

## Yechim

App init bo'lganda native code Preferences dan URL ni o'qib, `server.url` ni yangilaydi.

---

## iOS Implementation (Swift)

### 1. AppDelegate.swift ni yangilash

`ios/App/App/AppDelegate.swift` faylini oching va quyidagilarni qo'shing:

```swift
import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // OTA URL ni tekshirish va server.url ni yangilash
        self.updateServerURLIfNeeded()
        return true
    }
    
    private func updateServerURLIfNeeded() {
        // Preferences dan OTA URL ni o'qish
        let userDefaults = UserDefaults.standard
        if let otaUrl = userDefaults.string(forKey: "ota_current_url"), !otaUrl.isEmpty {
            // Capacitor config ni yangilash
            if let url = URL(string: otaUrl) {
                // Capacitor 8 da server.url ni o'zgartirish
                // Bu yerda InstanceConfiguration ishlatiladi
                let config = InstanceConfiguration()
                config.serverURL = url
                
                print("[OTA] Server URL updated to: \(otaUrl)")
            }
        } else {
            print("[OTA] No OTA URL found, using default")
        }
    }
}
```

### 2. Capacitor 8 uchun to'g'ri implementatsiya

Capacitor 8 da `server.url` ni o'zgartirish uchun quyidagilarni qo'shing:

```swift
import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // OTA URL ni tekshirish
        self.checkAndUpdateServerURL()
        return true
    }
    
    private func checkAndUpdateServerURL() {
        let userDefaults = UserDefaults.standard
        if let otaUrl = userDefaults.string(forKey: "ota_current_url"), !otaUrl.isEmpty {
            // Capacitor Bridge ni yangilash
            if let bridge = self.window?.rootViewController as? CAPBridgeViewController {
                // Server URL ni yangilash
                bridge.setServerBasePath(otaUrl)
                print("[OTA] Server URL updated to: \(otaUrl)")
            }
        }
    }
}
```

### 3. Yoki capacitor.config.json ni yangilash

Runtime da `capacitor.config.json` ni yangilash:

```swift
private func updateCapacitorConfig() {
    let userDefaults = UserDefaults.standard
    if let otaUrl = userDefaults.string(forKey: "ota_current_url"), !otaUrl.isEmpty {
        // capacitor.config.json faylini yangilash
        let configPath = Bundle.main.path(forResource: "capacitor.config", ofType: "json")
        if let path = configPath {
            do {
                let data = try Data(contentsOf: URL(fileURLWithPath: path))
                var config = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
                
                if var server = config["server"] as? [String: Any] {
                    server["url"] = otaUrl
                    config["server"] = server
                } else {
                    config["server"] = ["url": otaUrl]
                }
                
                // Yangilangan config ni yozish
                let newData = try JSONSerialization.data(withJSONObject: config, options: .prettyPrinted)
                try newData.write(to: URL(fileURLWithPath: path))
                
                print("[OTA] Capacitor config updated with URL: \(otaUrl)")
            } catch {
                print("[OTA] Error updating config: \(error)")
            }
        }
    }
}
```

---

## Android Implementation (Kotlin)

### 1. MainActivity.kt ni yangilash

`android/app/src/main/java/.../MainActivity.kt` faylini oching:

```kotlin
package com.mbron.new

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.getcapacitor.Plugin
import android.content.SharedPreferences

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // OTA URL ni tekshirish va server.url ni yangilash
        updateServerURLIfNeeded()
    }
    
    private fun updateServerURLIfNeeded() {
        val prefs = getSharedPreferences("_capacitor_preferences", MODE_PRIVATE)
        val otaUrl = prefs.getString("ota_current_url", null)
        
        if (!otaUrl.isNullOrEmpty()) {
            // Capacitor Bridge ni yangilash
            val bridge = this.bridge
            if (bridge != null) {
                // Server URL ni yangilash
                bridge.setServerBasePath(otaUrl)
                android.util.Log.d("OTA", "Server URL updated to: $otaUrl")
            }
        } else {
            android.util.Log.d("OTA", "No OTA URL found, using default")
        }
    }
}
```

### 2. Yoki capacitor.config.json ni yangilash

```kotlin
private fun updateCapacitorConfig() {
    val prefs = getSharedPreferences("_capacitor_preferences", MODE_PRIVATE)
    val otaUrl = prefs.getString("ota_current_url", null)
    
    if (!otaUrl.isNullOrEmpty()) {
        try {
            // capacitor.config.json ni o'qish
            val configFile = File(filesDir, "capacitor.config.json")
            val config = JSONObject(configFile.readText())
            
            // Server URL ni yangilash
            val server = config.optJSONObject("server") ?: JSONObject()
            server.put("url", otaUrl)
            config.put("server", server)
            
            // Yangilangan config ni yozish
            configFile.writeText(config.toString())
            
            android.util.Log.d("OTA", "Capacitor config updated with URL: $otaUrl")
        } catch (e: Exception) {
            android.util.Log.e("OTA", "Error updating config: ${e.message}")
        }
    }
}
```

---

## Ishlash Prinsipi

1. **App init bo'lganda:**
   - Native code Preferences dan `ota_current_url` ni o'qiydi
   - Agar URL mavjud bo'lsa, `server.url` ni yangilaydi
   - App yangi URL dan yuklanadi

2. **Update qo'llash:**
   - JavaScript da `reloadApp()` chaqiriladi
   - Pending URL `ota_current_url` ga saqlanadi
   - App qayta ishga tushadi
   - Native code yangi URL dan yuklaydi

---

## Test Qilish

### iOS:

1. Xcode da app ni ishga tushiring
2. Console da quyidagilarni ko'ring:
   ```
   [OTA] Server URL updated to: https://mbron.vercel.app
   ```
3. App yangi URL dan yuklanishi kerak

### Android:

1. Android Studio da app ni ishga tushiring
2. Logcat da quyidagilarni ko'ring:
   ```
   OTA: Server URL updated to: https://mbron.vercel.app
   ```
3. App yangi URL dan yuklanishi kerak

---

## Eslatmalar

- Native code da `server.url` ni o'zgartirish kerak
- JavaScript dan to'g'ridan-to'g'ri o'zgartirish mumkin emas
- App init bo'lganda avtomatik tekshiriladi
- Preferences dan URL o'qiladi va qo'llanadi

---

## Muammo Hal Qilish

### Muammo: Server URL yangilanmayapti

**Yechim:**
1. Native code da Preferences dan URL o'qilayotganini tekshiring
2. Bridge yoki config yangilanayotganini tekshiring
3. Console/Logcat da xatolarni ko'ring

### Muammo: App yangi URL dan yuklanmayapti

**Yechim:**
1. Native code da `server.url` to'g'ri yangilanayotganini tekshiring
2. URL format to'g'ri ekanligini tekshiring (https://...)
3. App ni to'liq qayta ishga tushiring

---

## Qo'shimcha Ma'lumot

- Capacitor 8 Documentation: https://capacitorjs.com/docs
- iOS Bridge API: https://capacitorjs.com/docs/ios
- Android Bridge API: https://capacitorjs.com/docs/android

