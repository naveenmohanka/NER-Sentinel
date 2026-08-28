package com.kiit.nersentinel.network

import com.google.gson.JsonObject
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.PartMap

interface ApiService {

    // Existing JSON report submission
    @POST("api/v1/reports")
    suspend fun submitReport(
        @Body report: ReportRequest
    ): Response<JsonObject>

    // Image upload endpoint
    @Multipart
    @POST("api/v1/reports")
    suspend fun submitReportWithImage(
        @PartMap reportData: Map<String, @JvmSuppressWildcards RequestBody>,
        @Part image: MultipartBody.Part
    ): Response<JsonObject>
}
