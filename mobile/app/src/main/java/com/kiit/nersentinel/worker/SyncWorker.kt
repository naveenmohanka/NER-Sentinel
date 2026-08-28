package com.kiit.nersentinel.worker

import android.content.Context
import android.util.Log
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

    companion object {
        private const val TAG = "NER_SYNC"
    }

    override suspend fun doWork(): Result {

        Log.d(TAG, "========== SYNC WORKER STARTED ==========")

        return try {

            val database =
                DatabaseProvider.getDatabase(applicationContext)

            val repository =
                IncidentRepository(database.incidentDao())

            val unsyncedReports =
                repository.getUnsyncedIncidents()

            val pendingCount = unsyncedReports.size

            Log.d(
                TAG,
                "Pending reports found: $pendingCount"
            )

            if (unsyncedReports.isEmpty()) {

                Log.d(
                    TAG,
                    "No pending reports. Sync completed."
                )

                return Result.success()
            }

            unsyncedReports.forEach { report ->

                Log.d(
                    TAG,
                    "Syncing report ID: ${report.id}"
                )

                Log.d(
                    TAG,
                    "Report type: ${report.reportType}"
                )

                Log.d(
                    TAG,
                    "Has image: ${!report.imageUri.isNullOrBlank()}"
                )

                val response =
                    if (!report.imageUri.isNullOrBlank()) {

                        Log.d(
                            TAG,
                            "Uploading report as MULTIPART"
                        )

                        val reportData =
                            createMultipartReportData(
                                report = report,
                                offlineSynced = true
                            )

                        val imagePart =
                            MultipartUtils.createImagePart(
                                applicationContext,
                                report.imageUri
                            )

                        ApiClient.apiService.submitReportWithImage(
                            reportData = reportData,
                            image = imagePart
                        )

                    } else {

                        Log.d(
                            TAG,
                            "Uploading report as JSON"
                        )

                        val request =
                            buildReportRequest(
                                report = report,
                                offlineSynced = true
                            )

                        ApiClient.apiService.submitReport(request)
                    }

                Log.d(
                    TAG,
                    "Backend response for report ${report.id}: HTTP ${response.code()}"
                )

                if (response.isSuccessful) {

                    repository.markIncidentAsSynced(report.id)

                    Log.d(
                        TAG,
                        "Report ${report.id} marked as SYNCED"
                    )

                } else {

                    Log.e(
                        TAG,
                        "Sync failed with HTTP ${response.code()}. Retrying later."
                    )

                    return Result.retry()
                }
            }

            Log.d(
                TAG,
                "========== ALL REPORTS SYNCED =========="
            )

            if (pendingCount > 0) {
                SyncStatusManager.showSuccess()

                Log.d(
                    TAG,
                    "Sync success message sent to UI"
                )
            }

            Result.success()

        } catch (e: Exception) {

            Log.e(
                TAG,
                "SYNC WORKER FAILED: ${e.message}",
                e
            )

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
