package com.kiit.nersentinel.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.model.IncidentReport
import kotlinx.coroutines.launch

class ReportViewModel(
    private val repository: IncidentRepository
) : ViewModel() {

    fun saveIncident(
        report: IncidentReport
    ) {
        viewModelScope.launch {
            repository.saveIncident(report)
        }
    }
}
