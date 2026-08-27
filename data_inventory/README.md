# 📊 NER-Sentinel Data Inventory & Quality Assurance Report

This directory contains the comprehensive audit and machine-readable data inventory for all geospatial, hydro-meteorological, and satellite datasets powering **NER-Sentinel**.

---

## 📁 Directory Structure

```text
data_inventory/
├── 📄 complete_data_inventory.csv  # Full inventory listing of all 7 datasets
├── 📑 data_quality_report.csv       # Quality metrics, completeness & validation checks
├── ⚙️ dataset_schema.json          # Standardized JSON Schema definition & physical units
└── 📖 README.md                     # Data lineage documentation
```

---

## 🛰️ Dataset Classification Matrix

| Category | Dataset Name | Records | Spatial Resolution | Pipeline Role | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **🌧️ Precipitation** | IMD / CWC Observations | 54,138 | Station / 0.25° | Multi-day runoff triggering | ✅ `Complete` |
| **🌊 Flood History** | CWC Inundation Records | 5,138 Flood Events | River Basin | Supervised ML classification target | ✅ `Complete` |
| **🗺️ Topography** | NASA SRTM 30m DEM | Full Coverage | 30m (1 arc-sec) | Elevation, slope, and aspect extraction | ✅ `Complete` |
| **💧 Soil Moisture** | NASA SMAP L3 Radiometer | 49,919 | 9km EASE-Grid | Ground pore-pressure saturation index | ✅ `Complete` |
| **⛰️ Landslides** | Sikkim Geological Survey | 438 Hotspots | GPS Polygons | Slope-stability & Dijkstra avoidance | ✅ `Complete` |
| **☁️ Weather** | NASA POWER Point API | Live Daily | 0.5° Grid | Humidity, pressure & temp forcing | ✅ `Complete` |
| **🧠 Fusion Matrix** | Merged Multi-Satellite Master | 49,919 | Fused Grid | Model training & real-time inference | ✅ `Complete` |

---

## 🔬 Validation Summary
- **Null Value Rate:** `0.0%` across all active training features.
- **Duplicate Records:** `0.0%` verified via station-date indexing.
- **Model Discriminatory Performance:** **ROC-AUC: 0.8940 (~89.4% accuracy)** across Assam, Meghalaya, and Sikkim sectors.
