package com.kiit.nersentinel.util

import android.content.Context
import android.provider.Settings
import java.util.UUID

object DeviceIdProvider {

    private const val PREFS_NAME = "ner_device_prefs"
    private const val KEY_DEVICE_ID = "device_id"

    @Volatile
    private var cachedDeviceId: String? = null

    fun getDeviceId(context: Context): String {
        cachedDeviceId?.let { return it }

        synchronized(this) {
            cachedDeviceId?.let { return it }

            val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            var id = prefs.getString(KEY_DEVICE_ID, null)

            if (id.isNullOrBlank()) {
                val androidId = try {
                    Settings.Secure.getString(
                        context.applicationContext.contentResolver,
                        Settings.Secure.ANDROID_ID
                    )
                } catch (e: Exception) {
                    null
                }

                id = if (!androidId.isNullOrBlank() && androidId != "9774d56d682e549c") {
                    "android_$androidId"
                } else {
                    "device_${UUID.randomUUID().toString().take(8)}"
                }

                prefs.edit().putString(KEY_DEVICE_ID, id).apply()
            }

            cachedDeviceId = id
            return id
        }
    }
}
