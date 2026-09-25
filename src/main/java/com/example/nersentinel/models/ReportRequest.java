package com.example.nersentinel.models;

public class ReportRequest {
    private String device_id;
    private double lat;
    private double lng;
    private String report_type;
    private long timestamp;
    private boolean offline_synced;
    private String image_url;

    public ReportRequest() {
    }

    public ReportRequest(String device_id, double lat, double lng, String report_type, long timestamp, boolean offline_synced) {
        this.device_id = device_id;
        this.lat = lat;
        this.lng = lng;
        this.report_type = report_type;
        this.timestamp = timestamp;
        this.offline_synced = offline_synced;
    }

    public String getDevice_id() {
        return device_id;
    }

    public void setDevice_id(String device_id) {
        this.device_id = device_id;
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

    public String getReport_type() {
        return report_type;
    }

    public void setReport_type(String report_type) {
        this.report_type = report_type;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isOffline_synced() {
        return offline_synced;
    }

    public void setOffline_synced(boolean offline_synced) {
        this.offline_synced = offline_synced;
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }
}