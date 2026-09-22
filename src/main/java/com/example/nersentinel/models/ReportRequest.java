package com.example.nersentinel.models;

public class ReportRequest {
    private String deviceId;
    private double lat;
    private double lng;
    private String reportType;
    private long timestamp;
    private boolean offlineSynced;

    public ReportRequest() {}

    public ReportRequest(String deviceId, double lat, double lng, String reportType, long timestamp, boolean offlineSynced) {
        this.deviceId = deviceId;
        this.lat = lat;
        this.lng = lng;
        this.reportType = reportType;
        this.timestamp = timestamp;
        this.offlineSynced = offlineSynced;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isOfflineSynced() {
        return offlineSynced;
    }

    public void setOfflineSynced(boolean offlineSynced) {
        this.offlineSynced = offlineSynced;
    }
}