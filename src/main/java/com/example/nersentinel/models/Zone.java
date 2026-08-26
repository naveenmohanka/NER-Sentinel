package com.example.nersentinel.models;

import java.util.List;
import java.util.Map;

public class Zone {
    private String zone_id;
    private Map<String, Double> center;
    private double baseline_susceptibility;
    private double rainfall_risk;
    private double hazard_risk;
    private int evidence_confidence;
    private int community_reports;
    private String operational_priority;
    private long updated_at;
    private List<String> reasoning;

    public Zone(String zone_id, double lat, double lng, double baseline, double rainfall) {
        this.zone_id = zone_id;
        this.center = Map.of("lat", lat, "lng", lng);
        this.baseline_susceptibility = baseline;
        this.rainfall_risk = rainfall;
        this.hazard_risk = 0.0;
        this.evidence_confidence = 0;
        this.community_reports = 0;
        this.operational_priority = "LOW";
        this.updated_at = System.currentTimeMillis() / 1000;
    }

    public String getZone_id() { return zone_id; }
    public Map<String, Double> getCenter() { return center; }
    public double getBaseline_susceptibility() { return baseline_susceptibility; }
    public double getRainfall_risk() { return rainfall_risk; }
    public double getHazard_risk() { return hazard_risk; }
    public void setHazard_risk(double hazard_risk) { this.hazard_risk = hazard_risk; }
    public int getEvidence_confidence() { return evidence_confidence; }
    public void setEvidence_confidence(int evidence_confidence) { this.evidence_confidence = evidence_confidence; }
    public int getCommunity_reports() { return community_reports; }
    public void setCommunity_reports(int community_reports) { this.community_reports = community_reports; }
    public String getOperational_priority() { return operational_priority; }
    public void setOperational_priority(String operational_priority) { this.operational_priority = operational_priority; }
    public long getUpdated_at() { return updated_at; }
    public void setUpdated_at(long updated_at) { this.updated_at = updated_at; }
    public List<String> getReasoning() { return reasoning; }
    public void setReasoning(List<String> reasoning) { this.reasoning = reasoning; }
}