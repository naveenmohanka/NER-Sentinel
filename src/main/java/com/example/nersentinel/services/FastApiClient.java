package com.example.nersentinel.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@Service
public class FastApiClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FASTAPI_URL = "http://localhost:8000/api/v1/analyze";

    @SuppressWarnings("unchecked")
    public Map<String, Object> callFastApiLlm(String reportId, String reportType, double lat, double lng, String imageUrl) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("report_id", reportId);
            body.put("report_type", reportType);
            body.put("latitude", lat);
            body.put("longitude", lng);
            body.put("image_url", imageUrl != null ? imageUrl : "");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(FASTAPI_URL, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("FastAPI service unreachable (using fallback): " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "SUCCESS");
            
            Map<String, Object> prediction = new HashMap<>();
            prediction.put("flood_probability", 0.50);
            prediction.put("landslide_probability", 0.50);
            fallback.put("prediction", prediction);

            Map<String, Object> explanation = new HashMap<>();
            explanation.put("summary", "Fallback risk assessment generated.");
            fallback.put("ai_explanation", explanation);

            return fallback;
        }
    }
}