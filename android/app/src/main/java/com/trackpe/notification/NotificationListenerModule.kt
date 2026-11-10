package com.trackpe.notification

import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.atomic.AtomicBoolean

object NotificationListenerRuntime {
  private const val EVENT_NAME = "onNotificationReceived"
  private val listeningEnabled = AtomicBoolean(true)

  @Volatile
  private var reactContext: ReactApplicationContext? = null

  fun attachReactContext(context: ReactApplicationContext) {
    reactContext = context
  }

  fun setListeningEnabled(enabled: Boolean) {
    listeningEnabled.set(enabled)
  }

  fun dispatchNotification(packageName: String, title: String, body: String, timestamp: Long) {
    if (!listeningEnabled.get()) {
      return
    }

    val context = reactContext ?: return
    if (!context.hasActiveReactInstance()) {
      return
    }

    val payload = Arguments.createMap().apply {
      putString("packageName", packageName)
      putString("title", title)
      putString("body", body)
      putDouble("timestamp", timestamp.toDouble())
    }

    context
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EVENT_NAME, payload)
  }
}

class NotificationListenerModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  init {
    NotificationListenerRuntime.attachReactContext(reactContext)
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun startListening() {
    NotificationListenerRuntime.setListeningEnabled(true)
  }

  @ReactMethod
  fun stopListening() {
    NotificationListenerRuntime.setListeningEnabled(false)
  }

  @ReactMethod
  fun requestPermission() {
    val context = reactApplicationContext
    val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    context.startActivity(intent)
  }

  @ReactMethod
  fun hasPermission(promise: Promise) {
    val packageName = reactApplicationContext.packageName
    val flattenedComponentName =
      "${packageName}/${NotificationListenerService::class.java.name}"

    val enabledListeners = Settings.Secure.getString(
      reactApplicationContext.contentResolver,
      "enabled_notification_listeners"
    ).orEmpty()

    promise.resolve(enabledListeners.contains(flattenedComponentName))
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required by NativeEventEmitter.
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required by NativeEventEmitter.
  }

  companion object {
    const val NAME = "NotificationListener"
  }
}
