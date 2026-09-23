package com.example.nersentinel.services;

import com.example.nersentinel.models.ReportEntity;
import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class RiskEngineService {

    private final FastApiClient fastApiClient;
    private final ReportRepository reportRepository;

    public RiskEngineService(FastApiClient fastApiClient, ReportRepository reportRepository) {
        this.fastApiClient = fastApiClient;
        this.reportRepository = reportRepository;
    }

    public Map<String, Object> processReport(ReportRequest request, String imageUrl) {
        String reportId = UUID.randomUUID().toString();

        // 1. Send telemetry to FastAPI / LLM service
        Map<String, Object> aiResult = fastApiClient.callFastApiLlm(
                reportId,
                request.getReportType(),
                request.getLat(),
                request.getLng(),
                imageUrl
        );

        // 2. Parse AI telemetry values safely with fallbacks
        Double riskScore = 0.5;
        String riskLevel = "MODERATE";
        String summary = "Telemetry ingested and logged.";

        if (aiResult != null) {
            if (aiResult.get("risk_score") != null) {
                try {
                    riskScore = Double.valueOf(aiResult.get("risk_score").toString());
                } catch (NumberFormatException ignored) {}
            }
            if (aiResult.get("risk_level") != null) {
                riskLevel = aiResult.get("risk_level").toString();
            }
            if (aiResult.get("summary") != null) {
                summary = aiResult.get("summary").toString();
            }
        }

        // 3. Persist entity to Supabase PostgreSQL database
        ReportEntity entity = new ReportEntity();
        entity.setReportId(reportId);
        entity.setDeviceId(request.getDeviceId());
        entity.setReportType(request.getReportType());
        entity.setLatitude(request.getLat());
        entity.setLongitude(request.getLng());
        entity.setImageUrl(imageUrl);
        entity.setRiskScore(riskScore);
        entity.setRiskLevel(riskLevel);
        entity.setSummary(summary);
        entity.setCreatedAt(LocalDateTime.now());

        reportRepository.save(entity);

        // 4. Return full JSON payload to the app
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("report_id", reportId);
        response.put("risk_score", riskScore);
        response.put("risk_level", riskLevel);
        response.put("summary", summary);
        response.put("image_url", imageUrl);
        response.put("telemetry", aiResult);

        return response;
    }
}