package com.kiit.nersentinel

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.kiit.nersentinel.ui.screen.ReportIncidentScreen
import com.kiit.nersentinel.ui.theme.NERSentinelTheme
import com.kiit.nersentinel.worker.NetworkMonitor
import com.kiit.nersentinel.worker.SyncScheduler

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        SyncScheduler.schedule(applicationContext)

        NetworkMonitor(applicationContext).start()

        enableEdgeToEdge()

        setContent {
            NERSentinelTheme {
                ReportIncidentScreen()
            }
        }
    }
}