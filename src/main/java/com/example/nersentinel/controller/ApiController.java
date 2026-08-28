package com.example.nersentinel.controller;

import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.models.Zone;
import com.example.nersentinel.services.RiskEngineService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

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
    public ResponseEntity<?> getReports() {
        return ResponseEntity.ok(riskService.getAllReports());
    }

    // JSON Payload Endpoint
    @PostMapping(value = "/reports", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createReportJson(@RequestBody ReportRequest request) {
        Map<String, Object> result = riskService.processReport(request, null);
        return ResponseEntity.ok(result);
    }

    // Multipart/Form-Data Endpoint without strict media constraint (accepts charset / custom boundary formats)
    @PostMapping(value = "/reports", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/*", MediaType.ALL_VALUE})
    public ResponseEntity<Map<String, Object>> createReportMultipart(
            HttpServletRequest request,
            @RequestParam(value = "device_id", required = false, defaultValue = "unknown_device") String deviceId,
            @RequestParam(value = "lat", required = false, defaultValue = "0.0") double lat,
            @RequestParam(value = "lng", required = false, defaultValue = "0.0") double lng,
            @RequestParam(value = "report_type", required = false, defaultValue = "GENERAL") String reportType,
            @RequestParam(value = "timestamp", required = false, defaultValue = "0") long timestamp,
            @RequestParam(value = "offline_synced", required = false, defaultValue = "false") boolean offlineSynced,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        System.out.println(">>> [DEBUG] Incoming request Content-Type: " + request.getContentType());

        // Extract Multipart file if wrapped via HttpServletRequest
        if (image == null && request instanceof MultipartHttpServletRequest) {
            MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
            image = multipartRequest.getFile("image");
            if (image == null) {
                // Fallback check in case the client sent key name "file"
                image = multipartRequest.getFile("file");
            }
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            try {
                String originalName = image.getOriginalFilename() != null ? image.getOriginalFilename() : "report_img.jpg";
                String fileName = UUID.randomUUID() + "_" + originalName;
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.write(filePath, image.getBytes());
                imageUrl = "/uploads/" + fileName;
                System.out.println(">>> [DEBUG] Image saved to: " + imageUrl);
            } catch (IOException e) {
                System.err.println(">>> [ERROR] Failed to save image: " + e.getMessage());
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