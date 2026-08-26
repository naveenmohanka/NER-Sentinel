package com.example.nersentinel.controllers;

import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.models.Zone;
import com.example.nersentinel.services.RiskEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ApiController {

    private final RiskEngineService riskService;

    public ApiController(RiskEngineService riskService) {
        this.riskService = riskService;
    }

    @PostMapping("/reports")
    public ResponseEntity<Map<String, Object>> createReport(@RequestBody ReportRequest request) {
        return ResponseEntity.ok(riskService.processReport(request));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Map<String, Object>>> getReports() {
        return ResponseEntity.ok(riskService.getAllReports());
    }

    @GetMapping("/zones")
    public ResponseEntity<List<Zone>> getZones() {
        return ResponseEntity.ok(riskService.getAllZones());
    }

    @GetMapping("/zones/{zone_id}")
    public ResponseEntity<?> getZoneById(@PathVariable("zone_id") String zoneId) {
        Zone zone = riskService.getZone(zoneId);
        if (zone == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(zone);
    }
}