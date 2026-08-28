package com.example.nersentinel.services;

import com.example.nersentinel.models.ReportEntity;
import com.example.nersentinel.models.ReportRequest;
import com.example.nersentinel.models.Zone;
import com.example.nersentinel.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class RiskEngineService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private FastApiClient fastApiClient;

    private final Map<String, Zone> zoneStore = new HashMap<>();

    public RiskEngineService() {
        zoneStore.put("ZONE-A", new Zone("ZONE-A", "High Risk Landslide Zone", 0.85, 27.3389, 88.6065));
        zoneStore.put("ZONE-B", new Zone("ZONE-B", "Moderate Flood Zone", 0.45, 27.3400, 88.6100));
    }

    public List<Zone> getAllZones() {
        return new ArrayList<>(zoneStore.values());
    }

    public Zone getZoneById(String zoneId) {
        return zoneStore.get(zoneId);
    }

    public List<ReportEntity> getAllReports() {
        return reportRepository.findAll();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> processReport(ReportRequest request, String imageUrl) {
        String reportId = "RPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Map<String, Object> llmResponse = fastApiClient.callFastApiLlm(
                reportId,
                request.getReportType(),
                request.getLat(),
                request.getLng(),
                imageUrl
        );

        double llmRiskScore = 0.5;
        String llmSummary = "Automated risk assessment processed.";

        if (llmResponse != null) {
            try {
                Object predObj = llmResponse.get("prediction");
                if (predObj instanceof Map) {
                    Map<String, Object> pred = (Map<String, Object>) predObj;
                    Object prob = pred.get("landslide_probability");
                    if (prob instanceof Number) {
                        llmRiskScore = ((Number) prob).doubleValue();
                    }
                }

                Object explObj = llmResponse.get("ai_explanation");
                if (explObj instanceof Map) {
                    Map<String, Object> expl = (Map<String, Object>) explObj;
                    Object sumObj = expl.get("summary");
                    if (sumObj != null) {
                        llmSummary = sumObj.toString();
                    }
                }
            } catch (Exception e) {
                System.err.println("Warning: Could not parse LLM fields, using fallbacks.");
            }
        }

        // Save to Supabase
        ReportEntity entity = new ReportEntity();
        entity.setId(reportId);
        entity.setDeviceId(request.getDeviceId());
        entity.setLatitude(request.getLat());
        entity.setLongitude(request.getLng());
        entity.setReportType(request.getReportType());
        entity.setTimestamp(request.getTimestamp());
        entity.setOfflineSynced(request.isOfflineSynced());
        entity.setImageUrl(imageUrl);
        entity.setLlmRiskScore(llmRiskScore);
        entity.setLlmSummary(llmSummary);

        reportRepository.save(entity);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("report_id", reportId);
        result.put("stored_in_supabase", true);
        result.put("image_url", imageUrl);
        result.put("llm_analysis", llmResponse);

        return result;
    }
}