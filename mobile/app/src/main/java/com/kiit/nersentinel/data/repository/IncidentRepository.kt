package com.kiit.nersentinel.data.repository

import com.kiit.nersentinel.data.local.IncidentDao
import com.kiit.nersentinel.model.IncidentReport
import kotlinx.coroutines.flow.Flow

class IncidentRepository(
    private val incidentDao: IncidentDao
) {

    suspend fun saveIncident(
        report: IncidentReport
    ) {
        incidentDao.insertIncident(report)
    }

    fun getAllIncidents(): Flow<List<IncidentReport>> {
        return incidentDao.getAllIncidents()
    }

    suspend fun getUnsyncedIncidents(): List<IncidentReport> {
        return incidentDao.getUnsyncedIncidents()
    }

    suspend fun markIncidentAsSynced(
        incidentId: Long
    ) {
        incidentDao.markAsSynced(incidentId)
    }
}
