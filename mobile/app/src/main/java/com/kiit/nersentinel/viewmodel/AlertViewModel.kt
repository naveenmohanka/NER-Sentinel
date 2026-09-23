package com.kiit.nersentinel.viewmodel

import androidx.lifecycle.ViewModel
import com.kiit.nersentinel.model.OfficialAlert
import com.kiit.nersentinel.repository.AlertRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AlertViewModel : ViewModel() {

    private val repository = AlertRepository()

    private val _alerts = MutableStateFlow<List<OfficialAlert>>(emptyList())
    val alerts: StateFlow<List<OfficialAlert>> = _alerts.asStateFlow()

    init {
        loadAlerts()
    }

    private fun loadAlerts() {
        _alerts.value = repository
            .getOfficialAlerts()
            .filter { it.isActive }
    }
}
