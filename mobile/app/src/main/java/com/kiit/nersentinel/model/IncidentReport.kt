package com.kiit.nersentinel.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "incident_reports")
data class IncidentReport(

    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    val deviceId: String,

    val lat: Double,

    val lng: Double,

    val reportType: String,

    val reporterType: String = "citizen",

    val timestamp: Long = System.currentTimeMillis(),

    val offlineSynced: Boolean = false
)
