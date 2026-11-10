import Foundation
import IdentityLookup

final class MessageFilterExtension: ILMessageFilterExtension {
  private let appGroupIdentifier = "group.com.trackpe.capture"
  private let capturedMessagesKey = "capturedBankMessages"

  private func shouldCapture(messageBody: String) -> Bool {
    let lowercasedBody = messageBody.lowercased()
    return lowercasedBody.contains("upi") ||
      lowercasedBody.contains("debit") ||
      lowercasedBody.contains("debited") ||
      lowercasedBody.contains("spent")
  }

  private func appendCapturedMessage(sender: String?, body: String) {
    let defaults = UserDefaults(suiteName: appGroupIdentifier)
    guard let defaults else {
      return
    }

    var capturedMessages = defaults.array(forKey: capturedMessagesKey) as? [[String: Any]] ?? []

    capturedMessages.append([
      "body": body,
      "sender": (sender?.isEmpty == false ? sender : "unknown") ?? "unknown",
      "timestamp": Date().timeIntervalSince1970 * 1000,
    ])

    defaults.set(capturedMessages, forKey: capturedMessagesKey)
  }
}

extension MessageFilterExtension: ILMessageFilterQueryHandling {
  func handle(
    _ queryRequest: ILMessageFilterQueryRequest,
    context: ILMessageFilterExtensionContext,
    completion: @escaping (ILMessageFilterQueryResponse) -> Void
  ) {
    if let body = queryRequest.messageBody?.trimmingCharacters(in: .whitespacesAndNewlines),
      !body.isEmpty,
      shouldCapture(messageBody: body)
    {
      let sender = queryRequest.sender?.trimmingCharacters(in: .whitespacesAndNewlines)
      appendCapturedMessage(sender: sender, body: body)
    }

    let response = ILMessageFilterQueryResponse()
    response.action = .allow
    completion(response)
  }
}
