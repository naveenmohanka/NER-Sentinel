package com.kiit.nersentinel.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.model.IncidentReport
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

class HomeViewModel(
    repository: IncidentRepository
) : ViewModel() {

    val reports: StateFlow<List<IncidentReport>> =
        repository
            .getAllIncidents()
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = emptyList()
            )
}
