package com.kiit.nersentinel.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.kiit.nersentinel.model.AlertSeverity
import com.kiit.nersentinel.model.OfficialAlert

@Composable
fun OfficialAlertCard(
    alert: OfficialAlert,
    modifier: Modifier = Modifier
) {
    val severityColor = when (alert.severity) {
        AlertSeverity.LOW -> Color(0xFF2E7D32)
        AlertSeverity.MODERATE -> Color(0xFFF57C00)
        AlertSeverity.HIGH -> Color(0xFFD92D20)
        AlertSeverity.CRITICAL -> Color(0xFF8B0000)
    }

    val backgroundColor = when (alert.severity) {
        AlertSeverity.LOW -> Color(0xFFE8F5E9)
        AlertSeverity.MODERATE -> Color(0xFFFFF3E0)
        AlertSeverity.HIGH -> Color(0xFFFFE6E3)
        AlertSeverity.CRITICAL -> Color(0xFFFFDAD6)
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor
        )
    ) {
        Column(
            modifier = Modifier.padding(17.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = severityColor,
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(
                            severityColor.copy(alpha = 0.12f)
                        )
                        .padding(7.dp)
                )

                Spacer(modifier = Modifier.width(10.dp))

                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = "${alert.severity.name} PRIORITY",
                        style = MaterialTheme.typography.labelSmall,
                        color = severityColor,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = alert.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.size(12.dp))

            Text(
                text = alert.message,
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.size(12.dp))

            Row(
                horizontalArrangement = Arrangement.Start,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = alert.source,
                    style = MaterialTheme.typography.labelMedium,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = "•",
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.width(8.dp))

                Icon(
                    imageVector = Icons.Default.AccessTime,
                    contentDescription = null,
                    tint = Color.Gray,
                    modifier = Modifier.size(14.dp)
                )

                Spacer(modifier = Modifier.width(3.dp))

                Text(
                    text = alert.issuedAt,
                    style = MaterialTheme.typography.labelMedium,
                    color = Color.Gray
                )
            }
        }
    }
}