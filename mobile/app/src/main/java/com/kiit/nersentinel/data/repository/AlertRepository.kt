package com.kiit.nersentinel.repository

import com.kiit.nersentinel.model.AlertSeverity
import com.kiit.nersentinel.model.OfficialAlert

class AlertRepository {

    fun getOfficialAlerts(): List<OfficialAlert> {
        return listOf(
            OfficialAlert(
                id = "alert_001",
                title = "Heavy Rainfall Warning",
                message = "Heavy rainfall may increase landslide risk in vulnerable areas.",
                severity = AlertSeverity.HIGH,
                source = "District Authority",
                issuedAt = "18:42",
                location = "Vulnerable hill areas",
                isActive = true
            ),

            OfficialAlert(
                id = "alert_002",
                title = "Landslide Advisory",
                message = "Residents near unstable slopes are advised to remain alert.",
                severity = AlertSeverity.MODERATE,
                source = "State Disaster Authority",
                issuedAt = "17:20",
                location = "Hill districts",
                isActive = true
            ),

            OfficialAlert(
                id = "alert_003",
                title = "Road Condition Advisory",
                message = "Temporary disruption reported on a vulnerable hill road.",
                severity = AlertSeverity.LOW,
                source = "District Control Room",
                issuedAt = "16:50",
                location = "Hill road network",
                isActive = true
            ),

            // Testing inactive/expired alert
            OfficialAlert(
                id = "alert_004",
                title = "Old Rainfall Advisory",
                message = "This alert is no longer active.",
                severity = AlertSeverity.LOW,
                source = "District Authority",
                issuedAt = "Yesterday",
                location = null,
                isActive = false
            )
        )
    }
}
