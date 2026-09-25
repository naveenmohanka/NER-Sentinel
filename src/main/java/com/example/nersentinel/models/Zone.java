package com.example.nersentinel.models;

import java.util.List;
import java.util.Map;

public class Zone {
    private String zone_id;
    private double baseline_susceptibility;
    private double rainfall_risk;
    private double hazard_risk;
    private int community_reports;
    private int evidence_confidence;
    private String operational_priority;
    private Map<String, Double> center;
    private List<Map<String, Double>> polygon;
    private List<String> reasoning;
    private long updated_at;

    public Zone() {
    }

    public Zone(String zone_id, double baseline_susceptibility, double rainfall_risk, double hazard_risk,
                int community_reports, int evidence_confidence, String operational_priority,
                Map<String, Double> center, List<Map<String, Double>> polygon, List<String> reasoning, long updated_at) {
        this.zone_id = zone_id;
        this.baseline_susceptibility = baseline_susceptibility;
        this.rainfall_risk = rainfall_risk;
        this.hazard_risk = hazard_risk;
        this.community_reports = community_reports;
        this.evidence_confidence = evidence_confidence;
        this.operational_priority = operational_priority;
        this.center = center;
        this.polygon = polygon;
        this.reasoning = reasoning;
        this.updated_at = updated_at;
    }

    public String getZone_id() {
        return zone_id;
    }

    public void setZone_id(String zone_id) {
        this.zone_id = zone_id;
    }

    public double getBaseline_susceptibility() {
        return baseline_susceptibility;
    }

    public void setBaseline_susceptibility(double baseline_susceptibility) {
        this.baseline_susceptibility = baseline_susceptibility;
    }

    public double getRainfall_risk() {
        return rainfall_risk;
    }

    public void setRainfall_risk(double rainfall_risk) {
        this.rainfall_risk = rainfall_risk;
    }

    public double getHazard_risk() {
        return hazard_risk;
    }

    public void setHazard_risk(double hazard_risk) {
        this.hazard_risk = hazard_risk;
    }

    public int getCommunity_reports() {
        return community_reports;
    }

    public void setCommunity_reports(int community_reports) {
        this.community_reports = community_reports;
    }

    public int getEvidence_confidence() {
        return evidence_confidence;
    }

    public void setEvidence_confidence(int evidence_confidence) {
        this.evidence_confidence = evidence_confidence;
    }

    public String getOperational_priority() {
        return operational_priority;
    }

    public void setOperational_priority(String operational_priority) {
        this.operational_priority = operational_priority;
    }

    public Map<String, Double> getCenter() {
        return center;
    }

    public void setCenter(Map<String, Double> center) {
        this.center = center;
    }

    public List<Map<String, Double>> getPolygon() {
        return polygon;
    }

    public void setPolygon(List<Map<String, Double>> polygon) {
        this.polygon = polygon;
    }

    public List<String> getReasoning() {
        return reasoning;
    }

    public void setReasoning(List<String> reasoning) {
        this.reasoning = reasoning;
    }

    public long getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(long updated_at) {
        this.updated_at = updated_at;
    }
}