import Foundation
import React
import UserNotifications

@objc(NotificationReaderModule)
class NotificationReaderModule: RCTEventEmitter {
  private static let appGroupIdentifier = "group.com.trackpe.capture"
  private static let capturedMessagesKey = "capturedBankMessages"

  private static weak var sharedInstance: NotificationReaderModule?

  private var listeningEnabled = false
  private var hasActiveListeners = false

  override init() {
    super.init()
    NotificationReaderModule.sharedInstance = self
  }

  override static func requiresMainQueueSetup() -> Bool {
    true
  }

  override func supportedEvents() -> [String]! {
    ["onNotificationReceived"]
  }

  override func startObserving() {
    hasActiveListeners = true
  }

  override func stopObserving() {
    hasActiveListeners = false
  }

  @objc
  func startListening() {
    listeningEnabled = true
  }

  @objc
  func stopListening() {
    listeningEnabled = false
  }

  @objc
  func requestPermission() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) {
      _, _ in
    }
  }

  @objc
  func hasPermission(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
      let granted = settings.authorizationStatus == .authorized ||
        settings.authorizationStatus == .provisional ||
        settings.authorizationStatus == .ephemeral
      resolve(granted)
    }
  }

  @objc
  func drainCapturedMessages(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let groupDefaults = UserDefaults(suiteName: NotificationReaderModule.appGroupIdentifier)
    let standardDefaults = UserDefaults.standard

    let rawMessages =
      groupDefaults?.array(forKey: NotificationReaderModule.capturedMessagesKey) ??
      standardDefaults.array(forKey: NotificationReaderModule.capturedMessagesKey)

    guard let rawMessages else {
      resolve([])
      return
    }

    var drainedMessages: [[String: Any]] = []
    for rawMessage in rawMessages {
      guard let message = rawMessage as? [String: Any] else {
        continue
      }

      guard let body = message["body"] as? String else {
        continue
      }

      let sender = (message["sender"] as? String) ?? "unknown"
      let timestamp = (message["timestamp"] as? NSNumber)?.doubleValue
        ?? Date().timeIntervalSince1970 * 1000

      drainedMessages.append([
        "body": body,
        "sender": sender,
        "timestamp": timestamp,
      ])
    }

    groupDefaults?.removeObject(forKey: NotificationReaderModule.capturedMessagesKey)
    standardDefaults.removeObject(forKey: NotificationReaderModule.capturedMessagesKey)
    resolve(drainedMessages)
  }

  @objc
  static func handleNotificationContent(_ content: UNNotificationContent) {
    sharedInstance?.emitIfNeeded(content)
  }

  private func emitIfNeeded(_ content: UNNotificationContent) {
    guard listeningEnabled, hasActiveListeners else {
      return
    }

    let body = content.body.trimmingCharacters(in: .whitespacesAndNewlines)
    if body.isEmpty {
      return
    }

    let sender = inferredSender(from: content)

    sendEvent(
      withName: "onNotificationReceived",
      body: [
        "body": body,
        "sender": sender,
        "timestamp": Date().timeIntervalSince1970 * 1000,
      ]
    )
  }

  private func inferredSender(from content: UNNotificationContent) -> String {
    if !content.threadIdentifier.isEmpty {
      return content.threadIdentifier
    }

    if !content.categoryIdentifier.isEmpty {
      return content.categoryIdentifier
    }

    if !content.title.isEmpty {
      return content.title
    }

    return "unknown"
  }
}
