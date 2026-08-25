package com.kiit.nersentinel.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.kiit.nersentinel.model.IncidentReport
import kotlinx.coroutines.flow.Flow

@Dao
interface IncidentDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIncident(report: IncidentReport)

    @Query("SELECT * FROM incident_reports ORDER BY timestamp DESC")
    fun getAllIncidents(): Flow<List<IncidentReport>>

    @Query(
        """
        SELECT * FROM incident_reports
        WHERE offlineSynced = 0
        ORDER BY timestamp ASC
        """
    )
    suspend fun getUnsyncedIncidents(): List<IncidentReport>

    @Query(
        """
        UPDATE incident_reports
        SET offlineSynced = 1
        WHERE id = :incidentId
        """
    )
    suspend fun markAsSynced(incidentId: Long)
}
