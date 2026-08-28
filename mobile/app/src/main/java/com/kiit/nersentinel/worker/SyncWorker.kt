package com.kiit.nersentinel.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.kiit.nersentinel.data.local.DatabaseProvider
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.model.IncidentReport
import com.kiit.nersentinel.network.ApiClient
import com.kiit.nersentinel.network.MultipartUtils
import com.kiit.nersentinel.network.ReportRequest
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody

class SyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            val database = DatabaseProvider.getDatabase(applicationContext)
            val repository = IncidentRepository(database.incidentDao())
            val unsyncedReports = repository.getUnsyncedIncidents()

            unsyncedReports.forEach { report ->
                val response =
                    if (!report.imageUri.isNullOrBlank()) {
                        val reportData = createMultipartReportData(
                            report = report,
                            offlineSynced = true
                        )

                        val imagePart = MultipartUtils.createImagePart(
                            applicationContext,
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
                                offlineSynced = true
                            )
                        )
                    }

                if (response.isSuccessful) {
                    repository.markIncidentAsSynced(report.id)
                } else {
                    return Result.retry()
                }
            }

            Result.success()
        } catch (_: Exception) {
            Result.retry()
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
        val mediaType = "text/plain".toMediaTypeOrNull()

        return mapOf(
            "device_id" to report.deviceId.toRequestBody(mediaType),
            "lat" to report.lat.toString().toRequestBody(mediaType),
            "lng" to report.lng.toString().toRequestBody(mediaType),
            "report_type" to report.reportType.toRequestBody(mediaType),
            "timestamp" to report.timestamp.toString().toRequestBody(mediaType),
            "offline_synced" to offlineSynced.toString().toRequestBody(mediaType)
        )
    }
}
