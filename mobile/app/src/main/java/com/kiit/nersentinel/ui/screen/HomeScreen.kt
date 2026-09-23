package com.kiit.nersentinel.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.kiit.nersentinel.ui.components.OfficialAlertCard
import com.kiit.nersentinel.viewmodel.AlertViewModel
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.kiit.nersentinel.data.local.DatabaseProvider
import com.kiit.nersentinel.data.repository.IncidentRepository
import com.kiit.nersentinel.viewmodel.HomeViewModel
import com.kiit.nersentinel.viewmodel.HomeViewModelFactory
import androidx.compose.foundation.clickable
@Composable
fun HomeScreen(
    onReportIncident: () -> Unit = {},
    onSeeAllAlerts: () -> Unit = {},
    alertViewModel: AlertViewModel = viewModel()
) {
    val context = LocalContext.current

    val database = remember {
        DatabaseProvider.getDatabase(context)
    }

    val repository = remember {
        IncidentRepository(database.incidentDao())
    }

    val homeFactory = remember {
        HomeViewModelFactory(repository)
    }

    val homeViewModel: HomeViewModel = viewModel(
        factory = homeFactory
    )

    val reports by homeViewModel.reports.collectAsState()
    val groundReportCount = reports.size
    val alerts = alertViewModel.alerts.collectAsState().value
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF6F7F9))
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp)
    ) {

        // ─────────────────────────────────────────
        // HEADER
        // ─────────────────────────────────────────

        Spacer(modifier = Modifier.height(26.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "NER Sentinel",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold
                )

                Text(
                    text = "Disaster Intelligence",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF777777)
                )
            }

            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(
                        width = 1.dp,
                        color = Color(0xFFE4E5E8),
                        shape = CircleShape
                    )
                    .clickable {
                        onSeeAllAlerts()
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Notifications,
                    contentDescription = "Alerts",
                    tint = Color(0xFF202124),
                    modifier = Modifier.size(23.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            SectionTitle("OFFICIAL ALERTS")

            Text(
                text = "See All →",
                color = Color(0xFFD92D20),
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.clickable {
                    onSeeAllAlerts()
                }
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (alerts.isNotEmpty()) {
            OfficialAlertCard(
                alert = alerts.first()
            )
        } else {
            Text(
                text = "No active official alerts",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )
        }
        Spacer(modifier = Modifier.height(20.dp))

        // ─────────────────────────────────────────
        // REPORT INCIDENT
        // ─────────────────────────────────────────

        Card(
            onClick = onReportIncident,
            modifier = Modifier
                .fillMaxWidth()
                .height(158.dp),
            shape = RoundedCornerShape(26.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.Transparent
            ),
            elevation = CardDefaults.cardElevation(
                defaultElevation = 9.dp
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFFE93425),
                                Color(0xFFD92117)
                            )
                        ),
                        shape = RoundedCornerShape(26.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {

                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(
                                Color.White.copy(alpha = 0.18f)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "🚨",
                            style = MaterialTheme.typography.titleLarge
                        )
                    }

                    Spacer(modifier = Modifier.height(7.dp))

                    Text(
                        text = "REPORT AN INCIDENT",
                        color = Color.White,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.ExtraBold
                    )

                    Spacer(modifier = Modifier.height(3.dp))

                    Text(
                        text = "Landslide • Road Block • Ground Crack • Flood",
                        color = Color.White.copy(alpha = 0.88f),
                        style = MaterialTheme.typography.bodySmall,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(23.dp))

        // ─────────────────────────────────────────
        // AREA RISK
        // ─────────────────────────────────────────

        SectionTitle("YOUR AREA")

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFFE7E9F2)
            )
        ) {
            Column(
                modifier = Modifier.padding(17.dp)
            ) {

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {

                    Box(
                        modifier = Modifier
                            .size(13.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFFA000))
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    Column(
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = "MODERATE RISK",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.ExtraBold
                        )

                        Text(
                            text = "Risk conditions are being monitored",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF777777)
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Risk details",
                        tint = Color(0xFF333333)
                    )
                }

                Spacer(modifier = Modifier.height(13.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    RiskSignal(
                        value = "Rainfall",
                        status = "Elevated"
                    )

                    RiskSignal(
                        value = "Ground",
                        status = "$groundReportCount reports"
                    )

                    RiskSignal(
                        value = "Terrain",
                        status = "Monitored"
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(23.dp))

        // ─────────────────────────────────────────
        // RECENT REPORTS
        // ─────────────────────────────────────────

        SectionTitle("RECENT REPORTS")

        Spacer(modifier = Modifier.height(8.dp))

        if (reports.isEmpty()) {

            Text(
                text = "No reports submitted yet.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                modifier = Modifier.padding(vertical = 12.dp)
            )

        } else {

            reports
                .take(5)
                .forEach { report ->

                    RecentReportCard(
                        title = formatReportType(report.reportType),
                        time = formatReportTime(report.timestamp),
                        status = if (report.offlineSynced) {
                            "SYNCED"
                        } else {
                            "PENDING"
                        }
                    )

                    Spacer(
                        modifier = Modifier.height(8.dp)
                    )
                }
        }

        Spacer(modifier = Modifier.height(18.dp))
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.ExtraBold,
        color = Color(0xFF222222)
    )
}

@Composable
private fun RiskSignal(
    value: String,
    status: String
) {
    Column {
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall,
            color = Color(0xFF777777)
        )

        Text(
            text = status,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun RecentReportCard(
    title: String,
    time: String,
    status: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(17.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 15.dp, vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF0F1F4)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = Color(0xFF333333),
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(11.dp))

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = time,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFF888888)
                )
            }

            Text(
                text = "✓ $status",
                color = Color(0xFF2E7D32),
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
private fun formatReportType(
    reportType: String
): String {
    return reportType
        .replace("_", " ")
        .split(" ")
        .joinToString(" ") { word ->
            word.replaceFirstChar {
                it.uppercase()
            }
        }
}

private fun formatReportTime(
    timestamp: Long
): String {
    val formatter =
        java.text.SimpleDateFormat(
            "dd MMM • HH:mm",
            java.util.Locale.getDefault()
        )

    return formatter.format(
        java.util.Date(timestamp)
    )
}
