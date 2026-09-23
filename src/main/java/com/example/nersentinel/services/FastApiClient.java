package com.example.nersentinel.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class FastApiClient {

    @Value("${fastapi.url:http://localhost:8000/api/v1/analyze}")
    private String fastApiUrl;

    private final RestTemplate restTemplate;

    public FastApiClient() {
        // Enforce 3-second connection and 4-second read timeouts
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(4000);
        this.restTemplate = new RestTemplate(factory);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> callFastApiLlm(String reportId, String reportType, Double lat, Double lng, String imageUrl) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("report_id", reportId);
            payload.put("report_type", reportType);
            payload.put("latitude", lat);
            payload.put("longitude", lng);
            payload.put("image_url", imageUrl != null ? imageUrl : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(fastApiUrl, requestEntity, Map.class);
            return response.getBody();

        } catch (Exception e) {
            System.err.println("FastAPI unreachable (" + e.getMessage() + "). Generating default fallback risk payload.");
            return createFallbackResponse(reportId, reportType);
        }
    }

    /**
     * Fallback response to prevent downstream NullPointerExceptions 
     * if the Python AI service is offline or unreachable.
     */
    private Map<String, Object> createFallbackResponse(String reportId, String reportType) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("report_id", reportId);
        fallback.put("risk_score", 0.5);
        fallback.put("risk_level", "MODERATE");
        fallback.put("summary", "Risk assessed with baseline heuristic fallback (" + reportType + ").");
        fallback.put("status", "FALLBACK_PROCESSED");
        return fallback;
    }
}