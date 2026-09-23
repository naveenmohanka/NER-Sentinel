package com.kiit.nersentinel

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.kiit.nersentinel.ui.screen.HomeScreen
import com.kiit.nersentinel.ui.screen.OfficialAlertsScreen
import com.kiit.nersentinel.ui.screen.ReportIncidentScreen
import com.kiit.nersentinel.ui.theme.NERSentinelTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        setContent {
            NERSentinelTheme {

                var currentScreen by remember {
                    mutableStateOf("home")
                }

                when (currentScreen) {

                    "home" -> {

                        HomeScreen(
                            onReportIncident = {
                                currentScreen = "report"
                            },
                            onSeeAllAlerts = {
                                currentScreen = "alerts"
                            }
                        )
                    }

                    "report" -> {

                        BackHandler {
                            currentScreen = "home"
                        }

                        ReportIncidentScreen()
                    }

                    "alerts" -> {

                        BackHandler {
                            currentScreen = "home"
                        }

                        OfficialAlertsScreen(
                            onBack = {
                                currentScreen = "home"
                            }
                        )
                    }
                }
            }
        }
    }
}
