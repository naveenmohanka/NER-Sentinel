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
import com.kiit.nersentinel.worker.SyncStatusManager
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody

class ReportViewModel(
    private val repository: IncidentRepository
) : ViewModel() {

    private val _syncMessage =
        MutableSharedFlow<String>(
            replay = 0,
            extraBufferCapacity = 1
        )

    val syncMessage: SharedFlow<String> =
        _syncMessage

    val reports = repository
        .getAllIncidents()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    init {
        viewModelScope.launch {
            SyncStatusManager.message.collectLatest { message ->

                if (message != null) {

                    _syncMessage.emit(message)

                    SyncStatusManager.clear()
                }
            }
        }
    }

    fun saveIncident(
        context: Context,
        report: IncidentReport,
        onResult: (String) -> Unit
    ) {
        viewModelScope.launch {

            try {

                val incidentId =
                    repository.saveIncident(report)

                val response =
                    if (!report.imageUri.isNullOrBlank()) {

                        val reportData =
                            createMultipartReportData(
                                report = report,
                                offlineSynced = false
                            )

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

                        ApiClient.apiService.submitReport(
                            buildReportRequest(
                                report = report,
                                offlineSynced = false
                            )
                        )
                    }

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

            } catch (e: Exception) {

                e.printStackTrace()

                SyncScheduler.schedule(context)

                onResult(
                    "Saved offline. Will sync automatically."
                )
            }
        }
    }

    private fun buildReportRequest(
        report: IncidentReport,
        offlineSynced: Boolean
    ): ReportRequest {

        return ReportRequest(
            deviceId = report.deviceId,
            lat = report.lat,
            lng = report.lng,
            reportType = report.reportType,
            timestamp = report.timestamp,
            offlineSynced = offlineSynced
        )
    }

    private fun createMultipartReportData(
        report: IncidentReport,
        offlineSynced: Boolean
    ): Map<String, RequestBody> {

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

            "offline_synced" to offlineSynced
                .toString()
                .toRequestBody(mediaType)
        )
    }
}
