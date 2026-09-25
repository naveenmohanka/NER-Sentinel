package com.kiit.nersentinel.network

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.IOException

object LocalImageStorage {

    fun copyToAppStorage(
        context: Context,
        sourceUri: Uri
    ): Uri {

        val imageDirectory = File(
            context.filesDir,
            "incident_images"
        )

        if (!imageDirectory.exists()) {
            imageDirectory.mkdirs()
        }

        val file = File(
            imageDirectory,
            "incident_${System.currentTimeMillis()}.jpg"
        )

        context.contentResolver
            .openInputStream(sourceUri)
            ?.use { input ->

                file.outputStream().use { output ->
                    input.copyTo(output)
                }

            } ?: throw IOException(
            "Unable to read selected image"
        )

        return Uri.fromFile(file)
    }
}
