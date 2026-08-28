package com.kiit.nersentinel.worker

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object SyncStatusManager {

    private val _message = MutableStateFlow<String?>(null)
    val message = _message.asStateFlow()

    fun showSuccess() {
        _message.value = "Pending reports synced successfully"
    }

    fun clear() {
        _message.value = null
    }
}
