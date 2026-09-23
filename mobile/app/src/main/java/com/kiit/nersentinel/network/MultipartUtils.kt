package com.kiit.nersentinel.network

import android.content.Context
import android.net.Uri
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

object MultipartUtils {

    fun createImagePart(
        context: Context,
        imageUri: String
    ): MultipartBody.Part {

        val uri = Uri.parse(imageUri)

        val inputStream =
            context.contentResolver.openInputStream(uri)

        val file =
            File.createTempFile(
                "incident_image_",
                ".jpg",
                context.cacheDir
            )

        inputStream?.use { input ->
            file.outputStream().use { output ->
                input.copyTo(output)
            }
        }

        val requestBody: RequestBody =
            file.asRequestBody(
                "image/jpeg".toMediaTypeOrNull()
            )

        return MultipartBody.Part.createFormData(
            "image",
            file.name,
            requestBody
        )
    }
}
