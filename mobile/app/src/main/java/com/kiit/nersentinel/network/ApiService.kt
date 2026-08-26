package com.kiit.nersentinel.network

import com.google.gson.JsonObject
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("api/v1/reports")
    suspend fun submitReport(
        @Body report: ReportRequest
    ): Response<JsonObject>
}
