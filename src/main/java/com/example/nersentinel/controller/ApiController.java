package com.example.nersentinel.controller;

import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.models.Zone;
import com.example.nersentinel.services.RiskEngineService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ApiController {

    private final RiskEngineService riskService;
    private final String UPLOAD_DIR = "uploads/";

    public ApiController(RiskEngineService riskService) {
        this.riskService = riskService;
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @GetMapping("/zones")
    public ResponseEntity<List<Zone>> getZones() {
        return ResponseEntity.ok(riskService.getAllZones());
    }

    @GetMapping("/zones/{zoneId}")
    public ResponseEntity<?> getZoneById(@PathVariable String zoneId) {
        Zone zone = riskService.getZoneById(zoneId);
        if (zone == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Zone not found: " + zoneId));
        }
        return ResponseEntity.ok(zone);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Map<String, Object>>> getReports() {
        return ResponseEntity.ok(riskService.getAllReports());
    }

    // JSON Payload Endpoint
    @PostMapping(value = "/reports", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createReportJson(@RequestBody ReportRequest request) {
        Map<String, Object> result = riskService.processReport(request, null);
        return ResponseEntity.ok(result);
    }

    // Multipart/Form-Data Endpoint (Image + Report Metadata)
    @PostMapping(value = "/reports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createReportMultipart(
            @RequestParam("device_id") String deviceId,
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam("report_type") String reportType,
            @RequestParam(value = "timestamp", required = false, defaultValue = "0") long timestamp,
            @RequestParam(value = "offline_synced", required = false, defaultValue = "false") boolean offlineSynced,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.write(filePath, image.getBytes());
                imageUrl = "/uploads/" + fileName;
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to save uploaded image"));
            }
        }

        if (timestamp == 0) {
            timestamp = System.currentTimeMillis() / 1000;
        }

        ReportRequest report = new ReportRequest(deviceId, lat, lng, reportType, timestamp, offlineSynced);
        Map<String, Object> result = riskService.processReport(report, imageUrl);
        return ResponseEntity.ok(result);
    }
}