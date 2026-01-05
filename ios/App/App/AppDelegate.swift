import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // OTA Update: Server URL ni tekshirish va yangilash
        self.updateServerURLIfNeeded()
        return true
    }
    
    /// OTA Update: Preferences dan URL ni o'qib, server.url ni yangilash
    private func updateServerURLIfNeeded() {
        let userDefaults = UserDefaults.standard
        
        // Capacitor Preferences dan OTA URL ni o'qish
        // Key: "CapacitorStorage.ota_current_url" - Capacitor Preferences format
        let capacitorKey = "CapacitorStorage.ota_current_url"
        
        if let otaUrl = userDefaults.string(forKey: capacitorKey), !otaUrl.isEmpty {
            print("[OTA] Found OTA URL in preferences: \(otaUrl)")
            
            // Capacitor Bridge ni topish va server URL ni yangilash
            DispatchQueue.main.async {
                if let window = self.window,
                   let rootViewController = window.rootViewController as? CAPBridgeViewController {
                    
                    // Capacitor 5+ uchun to'g'ri metod
                    // setServerBasePath metodi path: label bilan chaqiriladi
                    rootViewController.setServerBasePath(path: otaUrl)
                    
                    print("[OTA] ✅ Server URL updated to: \(otaUrl)")
                    
                    // WebView ni reload qilish (ixtiyoriy)
                    if let webView = rootViewController.webView {
                        webView.reload()
                        print("[OTA] 🔄 WebView reloaded")
                    }
                } else {
                    print("[OTA] ⚠️  Bridge not found, will retry after delay")
                    // Bridge tayyor bo'lguncha kutish
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self.updateServerURLIfNeeded()
                    }
                }
            }
        } else {
            print("[OTA] No OTA URL found, using default server URL")
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}