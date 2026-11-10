package com.trackpe.notification

import android.app.Notification
import android.os.Bundle
import android.text.TextUtils
import android.util.Log
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.trackpe.BuildConfig

class NotificationListenerService : NotificationListenerService() {

  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    if (sbn == null) {
      return
    }

    val packageName = sbn.packageName ?: return
    if (!isSupportedPackage(packageName)) {
      return
    }

    val notification = sbn.notification
    val extras = notification.extras
    val title = extras?.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
    val body = resolveBody(extras, notification)
    val timestamp = sbn.postTime

    if (BuildConfig.DEBUG) {
      Log.d(LOG_TAG, "captured package=$packageName title=$title body=$body")

      if (packageName == DEBUG_SHELL_PACKAGE) {
        val keys = extras?.keySet()?.joinToString(",").orEmpty()
        Log.d(LOG_TAG, "shell extras keys=$keys")
      }
    }

    NotificationListenerRuntime.dispatchNotification(packageName, title, body, timestamp)
  }

  private fun resolveBody(extras: Bundle?, notification: Notification): String {
    if (extras == null) {
      return ""
    }

    val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty()
    val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString().orEmpty()
    val summaryText = extras.getCharSequence(Notification.EXTRA_SUMMARY_TEXT)?.toString().orEmpty()
    val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString().orEmpty()
    val infoText = extras.getCharSequence(Notification.EXTRA_INFO_TEXT)?.toString().orEmpty()
    val titleBig = extras.getCharSequence(Notification.EXTRA_TITLE_BIG)?.toString().orEmpty()
    val tickerText = notification.tickerText?.toString().orEmpty()
    val textLines = extras
      .getCharSequenceArray(Notification.EXTRA_TEXT_LINES)
      ?.map { it?.toString().orEmpty() }
      ?.filter { it.isNotBlank() }
      ?.joinToString(" ")
      .orEmpty()

    val candidates = listOf(text, bigText, textLines, summaryText, subText, infoText, tickerText)
    val body = candidates.firstOrNull { it.isNotBlank() }.orEmpty()

    if (BuildConfig.DEBUG && body.isNotBlank() && titleBig.isNotBlank() && !TextUtils.equals(body, titleBig)) {
      Log.d(LOG_TAG, "titleBig=$titleBig")
    }

    if (BuildConfig.DEBUG && body.isNotBlank()) {
      Log.d(
        LOG_TAG,
        "resolve candidates text=$text bigText=$bigText textLines=$textLines summary=$summaryText sub=$subText info=$infoText ticker=$tickerText",
      )
    }

    return body
  }

  private fun isSupportedPackage(packageName: String): Boolean {
    if (SUPPORTED_PACKAGES.contains(packageName)) {
      return true
    }

    return BuildConfig.DEBUG && packageName == DEBUG_SHELL_PACKAGE
  }

  companion object {
    private const val DEBUG_SHELL_PACKAGE = "com.android.shell"
    private const val LOG_TAG = "TrackPeNotification"

    private val SUPPORTED_PACKAGES = setOf(
      "com.google.android.apps.nbu.paisa.user",
      "com.phonepe.app",
      "net.one97.paytm",
      "in.org.npci.upiapp",
      "com.amazon.mShop.android.shopping",
      "com.dreamplug.androidapp"
    )
  }
}
