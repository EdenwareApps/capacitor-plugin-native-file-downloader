import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(NativeFileDownloaderPlugin)
public class NativeFileDownloaderPlugin: CAPPlugin {

    @objc func scheduleFileDownload(_ call: CAPPluginCall) {
        call.unimplemented("Not implemented on iOS.")
    }
}
