package com.kiit.nersentinel.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.model.IncidentReport
import com.kiit.nersentinel.network.ApiClient
import com.kiit.nersentinel.network.MultipartUtils
import com.kiit.nersentinel.network.ReportRequest
import com.kiit.nersentinel.worker.SyncScheduler
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

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

                // 1. Always save locally first
                val incidentId =
                    repository.saveIncident(report)

                val response =
                    if (report.imageUri != null) {

                        // 2A. Image attached → multipart upload
                        val reportData =
                            createMultipartReportData(report)

                        val imagePart =
                            MultipartUtils.createImagePart(
                                context,
                                report.imageUri
                            )

                        ApiClient.apiService.submitReportWithImage(
                            reportData = reportData,
                            image = imagePart
                        )

                    } else {

                        // 2B. No image → existing JSON API
                        val request = ReportRequest(
                            deviceId = report.deviceId,
                            lat = report.lat,
                            lng = report.lng,
                            reportType = report.reportType,
                            timestamp = report.timestamp,
                            offlineSynced = report.offlineSynced
                        )

                        ApiClient.apiService.submitReport(request)
                    }

                // 3. Mark synced only after backend success
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

            } catch (_: Exception) {

                SyncScheduler.schedule(context)

                onResult(
                    "Saved offline. Will sync automatically."
                )
            }
        }
    }

    private fun createMultipartReportData(
        report: IncidentReport
    ): Map<String, okhttp3.RequestBody> {

        val mediaType =
            "text/plain".toMediaTypeOrNull()

        return mapOf(
            "device_id" to report.deviceId
                .toRequestBody(mediaType),

            "lat" to report.lat
                .toString()
                .toRequestBody(mediaType),

            "lng" to report.lng
                .toString()
                .toRequestBody(mediaType),

            "report_type" to report.reportType
                .toRequestBody(mediaType),

            "timestamp" to report.timestamp
                .toString()
                .toRequestBody(mediaType),

            "offline_synced" to report.offlineSynced
                .toString()
                .toRequestBody(mediaType)
        )
    }
}
