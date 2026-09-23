package com.example.nersentinel.controller;

import com.example.nersentinel.models.ReportRequest;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ApiController {

    private final RiskEngineService riskEngineService;
    private final String uploadDir = "uploads";

    public ApiController(RiskEngineService riskEngineService) {
        this.riskEngineService = riskEngineService;
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    @PostMapping(value = "/reports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> submitReport(
            @ModelAttribute ReportRequest request,
            @RequestParam(value = "image", required = false) MultipartFile file) {

        String imageUrl = "";

        if (file != null && !file.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.write(filePath, file.getBytes());
                imageUrl = "/uploads/" + fileName;
            } catch (IOException e) {
                System.err.println("File write failure: " + e.getMessage());
            }
        }

        Map<String, Object> responseData = riskEngineService.processReport(request, imageUrl);
        return ResponseEntity.ok(responseData);
    }
}