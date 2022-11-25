import Foundation

@objc public class NativeFileDownloader: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
