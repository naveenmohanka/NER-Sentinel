package com.kiit.nersentinel.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.kiit.nersentinel.model.IncidentReport

@Database(
    entities = [IncidentReport::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun incidentDao(): IncidentDao
}
