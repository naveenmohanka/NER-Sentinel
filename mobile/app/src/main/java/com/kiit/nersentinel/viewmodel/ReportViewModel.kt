package com.kiit.nersentinel.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.model.IncidentReport
import com.kiit.nersentinel.network.ApiClient
import com.kiit.nersentinel.network.ReportRequest
import kotlinx.coroutines.launch
import android.content.Context
import com.kiit.nersentinel.worker.SyncScheduler
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn

class ReportViewModel(
    private val repository: IncidentRepository
) : ViewModel() {

    val reports = repository
        .getAllIncidents()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun saveIncident(
        context: Context,
        report: IncidentReport,
        onResult: (String) -> Unit
    ) {
        viewModelScope.launch {

            try {

                val incidentId =
                    repository.saveIncident(report)
                    SyncScheduler.schedule(context)
                val request = ReportRequest(
                    deviceId = report.deviceId,
                    lat = report.lat,
                    lng = report.lng,
                    reportType = report.reportType,
                    timestamp = report.timestamp,
                    offlineSynced = report.offlineSynced
                )

                val response =
                    ApiClient.apiService.submitReport(request)

                if (response.isSuccessful) {

                    repository.markIncidentAsSynced(incidentId)

                    onResult(
                        "Report submitted and synced successfully"
                    )

                } else {

                    SyncScheduler.schedule(context)

                    onResult(
                        "Saved offline. Sync scheduled."
                    )
                }

            } catch (exception: Exception) {

                SyncScheduler.schedule(context)

                onResult(
                    "Saved offline. Will sync automatically."
                )
            }
        }
    }
}
