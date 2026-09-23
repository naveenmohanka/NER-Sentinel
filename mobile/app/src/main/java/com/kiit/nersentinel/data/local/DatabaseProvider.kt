package com.kiit.nersentinel.data.local

import android.content.Context
import androidx.room.Room

object DatabaseProvider {

    @Volatile
    private var INSTANCE: AppDatabase? = null

    fun getDatabase(context: Context): AppDatabase {
        return INSTANCE ?: synchronized(this) {

            val instance = Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                "ner_sentinel_database"
            )
                .fallbackToDestructiveMigration(true)
                .build()

            INSTANCE = instance

            instance
        }
    }
}
