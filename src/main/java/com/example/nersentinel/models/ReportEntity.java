package com.example.nersentinel.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "reports")
public class ReportEntity {

    @Id
    @Column(name = "id", length = 100, nullable = false)
    private String id;

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "report_type", length = 50)
    private String reportType;

    @Column(name = "timestamp")
    private Long timestamp;

    @Column(name = "offline_synced")
    private Boolean offlineSynced;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "llm_risk_score")
    private Double llmRiskScore;

    @Column(name = "llm_summary", columnDefinition = "TEXT")
    private String llmSummary;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public ReportEntity() {
    }

    public ReportEntity(String id, String deviceId, Double latitude, Double longitude, String reportType,
                        Long timestamp, Boolean offlineSynced, String imageUrl, Double llmRiskScore,
                        String llmSummary, Instant createdAt) {
        this.id = id;
        this.deviceId = deviceId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.reportType = reportType;
        this.timestamp = timestamp;
        this.offlineSynced = offlineSynced;
        this.imageUrl = imageUrl;
        this.llmRiskScore = llmRiskScore;
        this.llmSummary = llmSummary;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getOfflineSynced() {
        return offlineSynced;
    }

    public void setOfflineSynced(Boolean offlineSynced) {
        this.offlineSynced = offlineSynced;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getLlmRiskScore() {
        return llmRiskScore;
    }

    public void setLlmRiskScore(Double llmRiskScore) {
        this.llmRiskScore = llmRiskScore;
    }

    public String getLlmSummary() {
        return llmSummary;
    }

    public void setLlmSummary(String llmSummary) {
        this.llmSummary = llmSummary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}