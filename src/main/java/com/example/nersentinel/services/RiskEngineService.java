package com.example.nersentinel.services;

import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.models.Zone;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RiskEngineService {

    private final Map<String, Zone> zoneMap = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> reportsList = new ArrayList<>();
    private final AtomicInteger reportCounter = new AtomicInteger(1);

    public RiskEngineService() {
        initializeZones();
    }

    private void initializeZones() {
        Zone zoneA = new Zone(
                "ZONE-A",
                70.0,
                80.0,
                70.0,
                0,
                0,
                "HIGH",
                Map.of("lat", 27.3314, "lng", 88.6138),
                List.of(
                        Map.of("lat", 27.3400, "lng", 88.6000),
                        Map.of("lat", 27.3400, "lng", 88.6250),
                        Map.of("lat", 27.3200, "lng", 88.6250),
                        Map.of("lat", 27.3200, "lng", 88.6000)
                ),
                new ArrayList<>(List.of(
                        "Baseline susceptibility: 70.0",
                        "Rainfall trigger score: 80.0",
                        "Total field reports: 0"
                )),
                System.currentTimeMillis() / 1000
        );

        Zone zoneB = new Zone(
                "ZONE-B",
                55.0,
                60.0,
                55.0,
                0,
                0,
                "MEDIUM",
                Map.of("lat", 27.3250, "lng", 88.6050),
                List.of(),
                new ArrayList<>(List.of("Baseline susceptibility: 55.0", "Rainfall trigger score: 60.0")),
                System.currentTimeMillis() / 1000
        );

        Zone zoneC = new Zone(
                "ZONE-C",
                30.0,
                40.0,
                30.0,
                0,
                0,
                "LOW",
                Map.of("lat", 27.3100, "lng", 88.5900),
                List.of(),
                new ArrayList<>(List.of("Baseline susceptibility: 30.0", "Rainfall trigger score: 40.0")),
                System.currentTimeMillis() / 1000
        );

        zoneMap.put(zoneA.getZone_id(), zoneA);
        zoneMap.put(zoneB.getZone_id(), zoneB);
        zoneMap.put(zoneC.getZone_id(), zoneC);
    }

    public List<Zone> getAllZones() {
        return new ArrayList<>(zoneMap.values());
    }

    public Zone getZoneById(String zoneId) {
        return zoneMap.get(zoneId);
    }

    public List<Map<String, Object>> getAllReports() {
        return reportsList;
    }

    public Map<String, Object> processReport(ReportRequest request, String uploadedImageUrl) {
        String reportId = String.format("RPT-%03d", reportCounter.getAndIncrement());

        // Target zone mapping (default ZONE-A for prototype)
        String zoneId = "ZONE-A";
        Zone zone = zoneMap.get(zoneId);

        if (zone != null) {
            int newReportsCount = zone.getCommunity_reports() + 1;
            zone.setCommunity_reports(newReportsCount);

            // Dynamic Evidence Confidence calculation
            int newConfidence;
            if (newReportsCount == 1) {
                newConfidence = 40;
            } else if (newReportsCount == 2) {
                newConfidence = 65;
            } else if (newReportsCount == 3) {
                newConfidence = 85;
            } else {
                newConfidence = 95;
            }
            zone.setEvidence_confidence(newConfidence);

            // Dynamic Hazard Risk calculation
            double dynamicHazard = (zone.getBaseline_susceptibility() * 0.4)
                    + (zone.getRainfall_risk() * 0.4)
                    + (newConfidence * 0.2);
            zone.setHazard_risk(Math.round(dynamicHazard * 10.0) / 10.0);

            // Dynamic Operational Priority determination
            if (zone.getHazard_risk() >= 80.0 && newConfidence >= 85) {
                zone.setOperational_priority("CRITICAL");
            } else if (zone.getHazard_risk() >= 65.0) {
                zone.setOperational_priority("HIGH");
            } else if (zone.getHazard_risk() >= 45.0) {
                zone.setOperational_priority("MEDIUM");
            } else {
                zone.setOperational_priority("LOW");
            }

            zone.setUpdated_at(System.currentTimeMillis() / 1000);
            zone.setReasoning(List.of(
                    "Baseline susceptibility: " + zone.getBaseline_susceptibility(),
                    "Rainfall trigger score: " + zone.getRainfall_risk(),
                    "Total field reports: " + newReportsCount,
                    "Dynamic evidence confidence: " + newConfidence + "%",
                    "Calculated hazard score: " + zone.getHazard_risk()
            ));
        }

        Map<String, Object> storedReport = new HashMap<>();
        storedReport.put("report_id", reportId);
        storedReport.put("device_id", request.getDevice_id());
        storedReport.put("lat", request.getLat());
        storedReport.put("lng", request.getLng());
        storedReport.put("report_type", request.getReport_type());
        storedReport.put("timestamp", request.getTimestamp());
        storedReport.put("offline_synced", request.isOffline_synced());
        storedReport.put("zone_id", zoneId);
        storedReport.put("image_url", uploadedImageUrl);

        reportsList.add(storedReport);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("report_id", reportId);
        response.put("zone_id", zoneId);
        response.put("sync_status", "synced");
        response.put("message", uploadedImageUrl != null ? "Report and image uploaded successfully" : "Report received successfully");
        if (uploadedImageUrl != null) {
            response.put("image_url", uploadedImageUrl);
        }

        return response;
    }
}