package com.kiit.nersentinel.network

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.webkit.MimeTypeMap
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.IOException

object MultipartUtils {

    fun createImagePart(
        context: Context,
        imageUri: String
    ): MultipartBody.Part {
        val uri = Uri.parse(imageUri)
        val resolver = context.contentResolver
        val mimeType = resolver.getType(uri) ?: "image/jpeg"
        val extension = MimeTypeMap.getSingleton()
            .getExtensionFromMimeType(mimeType)
            ?.let { ".${it}" }
            ?: ".jpg"

        val inputStream = resolver.openInputStream(uri)
            ?: throw IOException("Unable to open image URI: $imageUri")

        val fileName = resolveDisplayName(context, uri)
        val tempPrefix = fileName
            .substringBeforeLast('.', "incident_image")
            .replace(Regex("[^A-Za-z0-9._-]"), "_")
            .ifBlank { "incident_image" }
            .let { prefix -> if (prefix.length >= 3) prefix else "incident_image" }

        val tempFile = File.createTempFile(
            tempPrefix,
            extension,
            context.cacheDir
        )

        inputStream.use { input ->
            tempFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }

        val requestBody: RequestBody = tempFile.asRequestBody(mimeType.toMediaTypeOrNull())

        return MultipartBody.Part.createFormData(
            "image",
            fileName,
            requestBody
        )
    }

    private fun resolveDisplayName(
        context: Context,
        uri: Uri
    ): String {
        if (uri.scheme == "content") {
            context.contentResolver.query(
                uri,
                arrayOf(OpenableColumns.DISPLAY_NAME),
                null,
                null,
                null
            )?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0 && cursor.moveToFirst()) {
                    val displayName = cursor.getString(nameIndex)
                    if (!displayName.isNullOrBlank()) {
                        return displayName
                    }
                }
            }
        }

        return uri.lastPathSegment?.substringAfterLast('/')?.takeIf { it.isNotBlank() }
            ?: "incident_image.jpg"
    }
}
