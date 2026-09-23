package com.example.nersentinel.services;

import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.models.Zone;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RiskEngineService {

    private final Map<String, Zone> zones = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> reports = new ArrayList<>();
    private int reportCounter = 1;

    public RiskEngineService() {
        zones.put("ZONE-A", new Zone("ZONE-A", 27.3314, 88.6138, 70.0, 80.0));
        zones.put("ZONE-B", new Zone("ZONE-B", 27.3400, 88.6200, 50.0, 60.0));
        zones.put("ZONE-C", new Zone("ZONE-C", 27.3500, 88.6300, 30.0, 40.0));
        zones.values().forEach(this::recalculateZone);
    }

    public synchronized Map<String, Object> processReport(ReportRequest req) {
        String assignedZoneId = "ZONE-A"; // Default mapping for prototype
        String reportId = "RPT-" + String.format("%03d", reportCounter++);

        Map<String, Object> storedReport = new HashMap<>();
        storedReport.put("report_id", reportId);
        storedReport.put("lat", req.getLat());
        storedReport.put("lng", req.getLng());
        storedReport.put("report_type", req.getReport_type());
        storedReport.put("timestamp", req.getTimestamp());
        storedReport.put("offline_synced", req.isOffline_synced());
        storedReport.put("zone_id", assignedZoneId);
        reports.add(storedReport);

        Zone zone = zones.get(assignedZoneId);
        if (zone != null) {
            zone.setCommunity_reports(zone.getCommunity_reports() + 1);
            recalculateZone(zone);
        }

        return Map.of(
            "success", true,
            "report_id", reportId,
            "zone_id", assignedZoneId,
            "sync_status", "synced",
            "message", "Report received successfully"
        );
    }

    private void recalculateZone(Zone zone) {
        double mlProbability = 50.0;
        double hazardRisk = (0.40 * zone.getBaseline_susceptibility()) +
                            (0.40 * zone.getRainfall_risk()) +
                            (0.20 * mlProbability);
        zone.setHazard_risk(Math.round(hazardRisk * 100.0) / 100.0);

        int count = zone.getCommunity_reports();
        int confidence = 0;
        if (count >= 4) confidence = 95;
        else if (count == 3) confidence = 85;
        else if (count == 2) confidence = 65;
        else if (count == 1) confidence = 40;
        zone.setEvidence_confidence(confidence);

        if (zone.getHazard_risk() >= 80 && zone.getEvidence_confidence() >= 70) {
            zone.setOperational_priority("CRITICAL");
        } else if (zone.getHazard_risk() >= 60) {
            zone.setOperational_priority("HIGH");
        } else if (zone.getHazard_risk() >= 40) {
            zone.setOperational_priority("MODERATE");
        } else {
            zone.setOperational_priority("LOW");
        }

        zone.setUpdated_at(System.currentTimeMillis() / 1000);
        zone.setReasoning(List.of(
            "Baseline susceptibility: " + zone.getBaseline_susceptibility(),
            "Rainfall trigger score: " + zone.getRainfall_risk(),
            "Total field reports: " + count
        ));
    }

    public List<Zone> getAllZones() { return new ArrayList<>(zones.values()); }
    public Zone getZone(String zoneId) { return zones.get(zoneId); }
    public List<Map<String, Object>> getAllReports() { return reports; }
}