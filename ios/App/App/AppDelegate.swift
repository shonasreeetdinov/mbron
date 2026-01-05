import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // OTA yangilanishni qo'llash
        applyPendingOTAUpdate()
        
        // Override point for customization after application launch.
        return true
    }
    
    // MARK: - OTA Update Management
    
    /// Preferences dan pending OTA URLni o'qib, server.url ni yangilash
    private func applyPendingOTAUpdate() {
        let defaults = UserDefaults.standard
        let pendingUrl = defaults.string(forKey: "ota_pending_url")
        let pendingVersion = defaults.string(forKey: "ota_pending_version")
        let currentUrl = defaults.string(forKey: "ota_current_url")
        
        // Agar pending URL mavjud va u hali qo'llanmagan bo'lsa
        guard let pendingUrl = pendingUrl,
              let pendingVersion = pendingVersion,
              pendingUrl != currentUrl else {
            return
        }
        
        print("[OTA Native] Applying pending update: version=\(pendingVersion), url=\(pendingUrl)")
        
        // CAPBridge config'ni update qilish (runtime)
        CAPBridge.sharedInstance().config.server.url = pendingUrl
        
        // Hozirgi versiyani saqlaymiz
        defaults.set(pendingVersion, forKey: "ota_current_version")
        defaults.set(pendingUrl, forKey: "ota_current_url")
        
        // Pending ma'lumotlarni tozalaymiz
        defaults.removeObject(forKey: "ota_pending_url")
        defaults.removeObject(forKey: "ota_pending_version")
        defaults.synchronize()
        
        print("[OTA Native] Update applied successfully")
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
