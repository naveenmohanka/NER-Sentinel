# ⛰️ NER Sentinel

### AI-Enabled Landslide Early Warning & Operational Intelligence Platform for North East India

NER Sentinel is an AI-enabled operational intelligence platform designed to strengthen landslide preparedness and response across the North Eastern Region of India.

The platform does **not attempt to replace official landslide forecasting or scientific models** developed by agencies such as the Geological Survey of India (GSI). Instead, NER Sentinel acts as a **Unified Operational Intelligence Layer** that combines fragmented signals from static susceptibility, dynamic weather triggers, community reports, GIS context, and available sensor or satellite data.

> **Risk = Susceptibility × Trigger × Confidence**

The goal is to transform fragmented environmental and ground-level information into actionable operational intelligence.

---

## 🌍 The Problem

The North Eastern Region of India faces recurring landslides due to:

- Intense and prolonged rainfall
- Complex mountainous terrain
- Road cutting and infrastructure development
- Remote and difficult-to-reach locations
- Fragmented environmental and disaster information
- Delayed ground-level incident reporting
- Poor connectivity in high-risk regions

Existing information often exists across multiple systems.

For example:

- Susceptibility maps may identify vulnerable areas
- Rainfall data may indicate increasing triggers
- Community members may observe fresh slope movement
- Field teams may report incidents from the ground
- GIS systems may provide route and terrain context

However, these signals are not always available together in a single operational view.

NER Sentinel addresses this gap by combining these signals into a unified risk intelligence workflow.

---

# 🎯 Core Vision

NER Sentinel is **not a better landslide prediction model**.

It is a:

> ## Unified Operational Intelligence Layer

The system combines multiple layers of information to support operational decision-making:

1. **Static Landslide Susceptibility**
2. **Dynamic Rainfall and Weather Triggers**
3. **Community Ground Intelligence**
4. **GIS and Terrain Context**
5. **Satellite or Sensor Data where available**

The platform converts these fragmented signals into:

- Dynamic risk intelligence
- Confidence-based escalation
- Field incident visibility
- Route awareness
- Unified command monitoring

---

# ⚠️ Risk Model

NER Sentinel uses a hybrid operational risk model:

## Risk = Susceptibility × Trigger × Confidence

### 1. Susceptibility

Represents the underlying vulnerability of an area.

Example factors:

- Terrain slope
- Geological conditions
- Historical landslide zones
- Soil and terrain characteristics

For the current MVP, this can be represented using GSI-style or mock susceptibility data.

---

### 2. Trigger

Represents dynamic environmental conditions that may increase the likelihood of operational concern.

Example triggers:

- Heavy rainfall
- Continuous rainfall
- Sudden weather events
- Extreme precipitation conditions

The MVP supports IMD-style, mock, or API-based weather/rainfall inputs.

---

### 3. Confidence

Represents how strongly available evidence supports operational escalation.

Confidence can increase when:

- A field incident report is received
- Multiple reports originate from nearby locations
- Reports align with high rainfall conditions
- Reports occur in high-susceptibility zones

> Community intelligence does not replace official landslide science.  
> It acts as a real-time ground-validation signal that can increase confidence and trigger operational escalation.

---

# 🧠 System Architecture

```text
                    ┌─────────────────────────┐
                    │   Field Intelligence    │
                    │     Android App         │
                    └────────────┬────────────┘
                                 │
                   Incident Reports / GPS / Images
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Offline-First Data    │
                    │        Storage          │
                    └────────────┬────────────┘
                                 │
                     Internet Available?
                         │           │
                      YES │           │ NO
                         ▼           ▼
                  ┌────────────┐  ┌─────────────────┐
                  │   Backend  │  │ Nearby Device   │
                  │     API    │  │   via Mesh      │
                  └─────┬──────┘  └────────┬────────┘
                        │                  │
                        │                  ▼
                        │           Device with Internet
                        │                  │
                        └──────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────┐
                    │    Hybrid Risk Engine   │
                    │                         │
                    │ Susceptibility          │
                    │ × Rainfall Trigger      │
                    │ × Ground Confidence     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      GIS Intelligence   │
                    │                         │
                    │ Risk Zones              │
                    │ Incident Locations      │
                    │ Route Awareness         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Unified Command       │
                    │       Dashboard         │
                    └─────────────────────────┘

🚀 Key Features
📱 1. Offline-First Field Intelligence

The Android application allows field users to report incidents even without internet connectivity.

Users can:

Select incident type
Capture GPS location
Attach an incident image
Submit the report
Store reports locally when offline

Reports remain available on the device until synchronization becomes possible.

📡 2. Offline Synchronization

NER Sentinel uses a local-first approach.

Create Report
      ↓
Save Locally
      ↓
Try Backend Sync
      ↓
┌───────────────┬─────────────────┐
│ Sync Success  │ Sync Failed     │
│       ↓       │        ↓        │
│ Mark Synced   │ Keep Pending    │
└───────────────┴────────┬────────┘
                         ↓
                   Retry Later

Background synchronization is handled using Android's background work architecture.

🔗 3. Device-to-Device Mesh Intelligence

NER Sentinel explores resilient reporting through nearby-device communication.

If:

Phone A
❌ No Internet

but:

Phone B
✅ Internet Available

and both devices can establish a nearby communication link:

Phone A
   │
   │ Nearby Device Communication
   ▼
Phone B
   │
   │ Internet
   ▼
NER Sentinel Backend

This enables an offline field report to potentially reach the backend through another nearby connected device.

The field report is still treated as community intelligence, and the backend processes it through the normal risk and confidence workflow.

📍 4. GPS-Based Incident Intelligence

Every field report can contain:

Latitude
Longitude
Device identifier
Report type
Timestamp
Synchronization status

Example:

{
  "device_id": "field-device-01",
  "lat": 20.354,
  "lng": 85.819,
  "report_type": "LANDSLIDE",
  "timestamp": 1750000000,
  "offline_synced": false
}
📷 5. Incident Image Intelligence

Users can attach images with field reports.

Images are:

Selected or captured by the field user
Persisted locally
Associated with the incident report
Uploaded to the backend using multipart requests
Stored for operational reference
🧠 6. Hybrid Dynamic Risk Engine

The backend processes incoming reports together with risk context.

Example conceptual workflow:

New Incident Report
        ↓
Identify Zone
        ↓
Retrieve Susceptibility
        ↓
Retrieve Dynamic Trigger
        ↓
Analyze Community Evidence
        ↓
Calculate Confidence
        ↓
Update Operational Risk
        ↓
Generate Escalation

The purpose is not to claim exact scientific prediction.

Instead, the engine answers an operational question:

Given the currently available evidence, should this area receive increased attention or escalation?

🗺️ 7. GIS and Route Intelligence

NER Sentinel integrates location intelligence to provide:

Risk zone visualization
Incident locations
Geographic context
Terrain awareness
Dynamic route awareness
Potentially affected operational routes
📊 8. Unified Command Dashboard

The dashboard provides a centralized view of:

Active incidents
Risk zones
Risk escalation
Field intelligence
Synchronization status
Operational alerts
Geographic context

The dashboard serves as the final operational layer where fragmented information becomes easier to interpret.

🔄 End-to-End Demo Flow

The intended NER Sentinel demonstration is:

1. Field User detects incident
              ↓
2. Opens Android application
              ↓
3. Selects incident type
              ↓
4. Captures GPS location
              ↓
5. Attaches evidence image
              ↓
6. Submits report
              ↓
7. Report saved locally
              ↓
8. Attempt backend synchronization
              ↓
      ┌───────┴────────┐
      │                │
   ONLINE            OFFLINE
      │                │
      ▼                ▼
 Backend Sync     Store Locally
      │                │
      │         Send to Nearby Device
      │                │
      └───────┬────────┘
              ↓
      Backend Receives Report
              ↓
       Dynamic Risk Engine
              ↓
       Risk / Confidence Update
              ↓
         GIS Layer Updated
              ↓
       Command Dashboard Updated
🛠️ Technology Stack
Android Field Intelligence
Kotlin
Jetpack Compose
Android ViewModel
Room Database
Retrofit
OkHttp
WorkManager
GPS / Location APIs
Android Photo Picker
Nearby device communication / mesh layer
Backend and Risk Engine
Java
Spring Boot
REST APIs
Maven
Multipart file handling
Dynamic Risk Engine
GIS Intelligence
GIS-based map layers
Geographic incident visualization
Terrain context
Dynamic route intelligence
Dashboard
Unified command and monitoring interface
Live incident visibility
Risk intelligence visualization
📁 Project Structure

The project is organized into modular components.

NER-Sentinel/
│
├── mobile/
│   │
│   └── app/
│       └── src/
│           └── main/
│               ├── java/
│               │   └── com/
│               │       └── kiit/
│               │           └── nersentinel/
│               │
│               │               ├── data/
│               │               │   ├── local/
│               │               │   └── repository/
│               │               │
│               │               ├── model/
│               │               │   └── IncidentReport.kt
│               │               │
│               │               ├── network/
│               │               │   ├── ApiClient.kt
│               │               │   ├── ApiService.kt
│               │               │   ├── MultipartUtils.kt
│               │               │   └── mesh/
│               │               │
│               │               ├── ui/
│               │               │   ├── components/
│               │               │   └── screen/
│               │               │
│               │               ├── viewmodel/
│               │               │   ├── ReportViewModel.kt
│               │               │   └── ReportViewModelFactory.kt
│               │               │
│               │               ├── worker/
│               │               │   ├── SyncWorker.kt
│               │               │   └── SyncScheduler.kt
│               │               │
│               │               └── MainActivity.kt
│               │
│               └── res/
│
├── backend/
│   │
│   └── src/
│       └── main/
│           └── java/
│               └── com/
│                   └── example/
│                       └── nersentinel/
│                           │
│                           ├── controller/
│                           │   └── ApiController.java
│                           │
│                           ├── models/
│                           │   ├── ReportRequest.java
│                           │   └── Zone.java
│                           │
│                           ├── services/
│                           │   └── RiskEngineService.java
│                           │
│                           └── DemoApplication.java
│
├── gis/
│
├── dashboard/
│
├── docs/
│
├── README.md
├── CONTRIBUTING.md
└── LICENSE

The structure may evolve as the Android, backend, GIS, and dashboard modules are integrated.

📱 Android Architecture

The Android application follows a clean, modular flow:

UI
 │
 ▼
ViewModel
 │
 ▼
Repository
 │
 ├──────────────► Room Database
 │
 └──────────────► Network API
                       │
                       ▼
                    Backend

Background synchronization:

Room Database
      │
      ▼
 Sync Worker
      │
      ▼
Pending Reports
      │
      ▼
 Backend Sync
      │
      ▼
Mark as Synced
🔌 Backend API
Base URL
http://<SERVER_IP>:8080/
Submit Incident Report
POST /api/v1/reports
Multipart Form Data
device_id
lat
lng
report_type
timestamp
offline_synced
image

Example:

curl -X POST http://localhost:8080/api/v1/reports \
  -F "device_id=test-device" \
  -F "lat=20.354" \
  -F "lng=85.819" \
  -F "report_type=LANDSLIDE" \
  -F "timestamp=1750000000" \
  -F "offline_synced=false" \
  -F "image=@incident.jpg"
Get All Reports
GET /api/v1/reports
Get All Zones
GET /api/v1/zones
Get Zone by ID
GET /api/v1/zones/{zoneId}
🌐 Branching Strategy

The repository follows a collaborative Git workflow.

main
 │
 └── Stable / Final Version
develop
 │
 └── Shared Integration Branch

Feature development:

feature/mobile-field-intelligence
        │
        └── Android Field Intelligence
feature/risk-engine
        │
        └── Java Backend and Risk Engine

Recommended workflow:

Feature Branch
      ↓
Push Changes
      ↓
Merge into develop
      ↓
Integration Testing
      ↓
Merge into main
👥 Team
Team Member	Responsibility
Naveen	Android app and offline-first field intelligence
Hridant	Java backend and Dynamic Risk Engine
Kalash	GIS map layers and dynamic routing
Shreyas	Unified command dashboard
Mahi	Pitch and presentation
Muskan	Pitch and presentation
🚧 Current Development Status
Android
 Incident selection
 GPS location capture
 Incident report model
 Local-first report saving
 Room database
 Offline report persistence
 Image attachment flow
 Background synchronization architecture
 Nearby-device mesh communication foundation
 Production-ready API integration
 Automatic image/report intelligence
Backend
 Spring Boot backend
 Incident report APIs
 Zone APIs
 Multipart image handling
 Risk Engine foundation
 Expanded dynamic trigger integration
 Full production risk data pipeline
GIS
 Final map integration
 Dynamic incident layers
 Risk visualization
 Route intelligence integration
Dashboard
 Command dashboard integration
 Live risk monitoring
 Incident visualization
 Operational alert interface
⚠️ Important Scientific Position

NER Sentinel should not be interpreted as an official landslide prediction system.

The platform does not claim to replace:

Geological Survey of India models
Government early warning systems
Scientific landslide forecasting systems

Instead, it provides:

A unified operational intelligence layer that combines official, environmental, geographic, and community signals.

Community reports are used as:

Ground Validation Signals
        +
Operational Evidence
        +
Confidence Signals

They are not treated as scientific proof by themselves.

🔮 Future Scope

Potential future improvements include:

Automated rainfall API integration
Official susceptibility datasets
Satellite imagery integration
Sensor-based slope monitoring
AI-assisted incident image classification
Duplicate report detection
Spatial clustering of community reports
Dynamic confidence scoring
Automated route closure recommendations
Advanced mesh networking
Emergency authority integration
Multi-language field reporting
Push alerts for risk escalation
🧪 MVP Philosophy

NER Sentinel is being developed as a hackathon-focused MVP.

The priority is:

Working End-to-End Intelligence Flow
        >
Over-Engineered Features

The strongest demonstration is:

Offline field report → local storage → mesh/direct synchronization → backend → dynamic risk update → GIS → command dashboard

Each component is designed to demonstrate how fragmented ground intelligence can be transformed into operationally useful risk information.

🤝 Contributing

The project uses feature branches and integration through the shared development branch.

Basic workflow:

git checkout develop

git pull origin develop

git checkout -b feature/your-feature-name

After completing the work:

git add .

git commit -m "feat: describe your change"

git push origin feature/your-feature-name

Do not directly push experimental work to:

main

Use:

Feature Branch
      ↓
develop
      ↓
main
📄 License

This project is currently developed for educational, research, innovation, and hackathon purposes.

🌄 NER Sentinel
From fragmented signals to actionable risk intelligence.
FIELD INTELLIGENCE
        +
ENVIRONMENTAL TRIGGERS
        +
GIS CONTEXT
        +
COMMUNITY VALIDATION
        +
DYNAMIC RISK ENGINE
        =
ACTIONABLE OPERATIONAL INTELLIGENCE

NER Sentinel — Observe. Validate. Escalate.
