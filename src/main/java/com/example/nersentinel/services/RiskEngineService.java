package com.example.nersentinel.services;

import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.models.Zone;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
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
        return processReportData(req.getDevice_id(), req.getLat(), req.getLng(), 
                                 req.getReport_type(), req.getTimestamp(), req.isOffline_synced(), null);
    }

    public synchronized Map<String, Object> processMultipartReport(
            String deviceId, double lat, double lng, String reportType, 
            Long timestamp, boolean offlineSynced, MultipartFile image) {
        
        long ts = (timestamp != null) ? timestamp : (System.currentTimeMillis() / 1000);
        String imageName = (image != null && !image.isEmpty()) ? image.getOriginalFilename() : null;
        return processReportData(deviceId, lat, lng, reportType, ts, offlineSynced, imageName);
    }

    private Map<String, Object> processReportData(
            String deviceId, double lat, double lng, String reportType, 
            long timestamp, boolean offlineSynced, String imageName) {
        
        String assignedZoneId = "ZONE-A";
        String reportId = "RPT-" + String.format("%03d", reportCounter++);

        Map<String, Object> storedReport = new HashMap<>();
        storedReport.put("report_id", reportId);
        storedReport.put("device_id", deviceId);
        storedReport.put("lat", lat);
        storedReport.put("lng", lng);
        storedReport.put("report_type", reportType);
        storedReport.put("timestamp", timestamp);
        storedReport.put("offline_synced", offlineSynced);
        storedReport.put("zone_id", assignedZoneId);
        if (imageName != null) {
            storedReport.put("image_name", imageName);
        }
        reports.add(storedReport);

        Zone zone = zones.get(assignedZoneId);
        if (zone != null) {
            zone.setCommunity_reports(zone.getCommunity_reports() + 1);
            recalculateZone(zone);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("report_id", reportId);
        response.put("zone_id", assignedZoneId);
        response.put("sync_status", "synced");
        response.put("message", "Report and image uploaded successfully");
        return response;
    }

    private void recalculateZone(Zone zone) {
        double mlProbability = 50.0;
        double hazardRisk = (0.40 * zone.getBaseline_susceptibility()) +
                            (0.40 * zone.getRainfall_risk()) +
                            (0.20 * mlProbability);
        zone.setHazard_risk(Math.round(hazardRisk * 100.0) / 100.0);

        int count = zone.getCommunity_reports();
        int confidence = (count >= 4) ? 95 : (count == 3) ? 85 : (count == 2) ? 65 : (count == 1) ? 40 : 0;
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