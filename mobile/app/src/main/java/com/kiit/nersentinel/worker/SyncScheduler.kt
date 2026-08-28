package com.kiit.nersentinel.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

object SyncScheduler {

    fun schedule(context: Context) {

        val constraints = Constraints.Builder()
            .setRequiredNetworkType(
                NetworkType.CONNECTED
            )
            .build()

        val request =
            OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()

        WorkManager
            .getInstance(context.applicationContext)
            .enqueueUniqueWork(
                "incident_sync_work",
                ExistingWorkPolicy.REPLACE,
                request
            )
    }
}
