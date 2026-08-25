package com.kiit.nersentinel.model

data class IncidentReport(
    val deviceId: String,
    val lat: Double,
    val lng: Double,
    val reportType: String,
    val reporterType: String = "citizen",
    val timestamp: Long = System.currentTimeMillis(),
    val offlineSynced: Boolean = false
)
