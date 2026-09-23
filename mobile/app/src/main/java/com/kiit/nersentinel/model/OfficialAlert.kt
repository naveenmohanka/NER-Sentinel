package com.kiit.nersentinel.model

data class OfficialAlert(
    val id: String,
    val title: String,
    val message: String,
    val severity: AlertSeverity,
    val source: String,
    val issuedAt: String,
    val location: String? = null,
    val isActive: Boolean = true
)

enum class AlertSeverity {
    LOW,
    MODERATE,
    HIGH,
    CRITICAL
}
