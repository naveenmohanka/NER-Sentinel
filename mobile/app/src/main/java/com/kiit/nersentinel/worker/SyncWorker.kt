package com.kiit.nersentinel.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.kiit.nersentinel.data.local.DatabaseProvider
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.network.ApiClient
import com.kiit.nersentinel.network.ReportRequest

class SyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {

        return try {

            val database =
                DatabaseProvider.getDatabase(applicationContext)

            val repository =
                IncidentRepository(database.incidentDao())

            val unsyncedReports =
                repository.getUnsyncedIncidents()

            unsyncedReports.forEach { report ->

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
                    repository.markIncidentAsSynced(report.id)
                } else {
                    return Result.retry()
                }
            }

            Result.success()

        } catch (exception: Exception) {

            Result.retry()
        }
    }
}
