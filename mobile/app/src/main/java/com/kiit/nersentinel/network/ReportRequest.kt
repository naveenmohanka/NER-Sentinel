package com.kiit.nersentinel.network

import com.google.gson.annotations.SerializedName

data class ReportRequest(
    @SerializedName("device_id")
    val deviceId: String,

    val lat: Double,

    val lng: Double,

    @SerializedName("report_type")
    val reportType: String,

    val timestamp: Long,

    @SerializedName("offline_synced")
    val offlineSynced: Boolean
)
