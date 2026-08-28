# 🤝 Contributing to NER Sentinel

Thank you for contributing to **NER Sentinel**.

NER Sentinel is an AI-enabled **Landslide Early Warning and Operational Intelligence Platform** for the North Eastern Region of India.

This project is being developed as a collaborative system consisting of multiple connected components:

- 📱 Android Offline-First Field Intelligence
- 🧠 Java Backend and Dynamic Risk Engine
- 🗺️ GIS Map and Route Intelligence
- 📊 Unified Command Dashboard
- 🎤 Pitch and Presentation

The goal of this document is to ensure that team members can work independently without breaking each other's work.

---

# 📌 Core Contribution Principle

Before making any contribution, follow this rule:

> **Do not break existing functionality. Extend the system in small, understandable, and testable changes.**

NER Sentinel is an integrated project. Changes made to one module can affect other modules.

For example:

```text
Android Report Format
        ↓
Backend API
        ↓
Risk Engine
        ↓
GIS / Dashboard
```

Therefore, changes to shared data formats and APIs must be communicated to the relevant team members.

---

# 🌿 Branch Strategy

The repository follows this workflow:

```text
main
  │
  └── develop
        │
        ├── feature/mobile-field-intelligence
        │
        └── feature/risk-engine
```

---

## `main`

The `main` branch represents the **stable and final version** of the project.

Rules:

- Do not directly develop on `main`.
- Do not push experimental code to `main`.
- Only tested and integrated changes should reach `main`.
- `main` should remain buildable and stable.

---

## `develop`

The `develop` branch is the shared integration branch.

This is where feature branches are combined before the final merge into `main`.

Rules:

- Pull the latest `develop` before starting major integration work.
- Resolve conflicts carefully.
- Do not merge incomplete features into `develop`.
- Verify that connected modules still work after integration.

---

## Feature Branches

Feature development should happen in dedicated branches.

Current branches include:

### Android Field Intelligence

```text
feature/mobile-field-intelligence
```

Responsible for:

- Incident reporting
- GPS capture
- Image handling
- Offline storage
- Background synchronization
- API integration
- Nearby device relay / mesh communication

Primary contributor:

**Naveen**

---

### Backend and Risk Engine

```text
feature/risk-engine
```

Responsible for:

- Spring Boot backend
- Report APIs
- Zone APIs
- Incident processing
- Dynamic risk logic
- Risk escalation
- Data processing

Primary contributor:

**Hridant**

---

# 🧑‍💻 Team Responsibilities

## Naveen — Android Field Intelligence

Primary responsibility:

- Android application development
- Jetpack Compose UI
- Incident reporting flow
- GPS capture
- Room database
- Offline-first workflow
- Retrofit API integration
- WorkManager synchronization
- Device-to-device report relay

Primary area:

```text
mobile/
```

---

## Hridant — Backend and Dynamic Risk Engine

Primary responsibility:

- Spring Boot backend
- REST APIs
- Report processing
- Zone intelligence
- Dynamic risk calculation
- Backend integration

Primary area:

```text
backend/
```

---

## Kalash — GIS and Route Intelligence

Primary responsibility:

- GIS map layers
- Terrain visualization
- Risk zone representation
- Route intelligence
- Dynamic route updates

Primary area:

```text
gis/
```

---

## Shreyas — Unified Command Dashboard

Primary responsibility:

- Command dashboard
- Incident visualization
- Risk status
- Operational intelligence display
- Backend data consumption

Primary area:

```text
dashboard/
```

---

## Mahi and Muskan — Pitch and Presentation

Primary responsibility:

- Problem explanation
- Solution narrative
- System architecture presentation
- Demo flow
- Impact and future scope
- Pitch preparation

Primary area:

```text
docs/
presentation/
```

---

# 🔄 Standard Development Workflow

Every contributor should follow the workflow below.

---

## Step 1: Check Your Current Branch

Before making changes:

```bash
git branch
```

Make sure you are not directly developing on:

```text
main
```

---

## Step 2: Get the Latest Changes

Before starting work:

```bash
git fetch origin
```

Then pull the latest changes for your branch:

```bash
git pull origin <your-branch-name>
```

For example:

```bash
git pull origin feature/mobile-field-intelligence
```

or:

```bash
git pull origin feature/risk-engine
```

---

## Step 3: Create or Continue Your Feature

Work only within the responsibility of your feature branch.

Avoid making unrelated changes to another team member's module.

For example:

```text
❌ Android developer directly changes Risk Engine logic

❌ Backend developer restructures Android UI

❌ GIS developer changes Android database models without coordination
```

Instead:

```text
Android needs backend API change
        ↓
Discuss API contract
        ↓
Update backend contract
        ↓
Update Android implementation
        ↓
Test integration
```

---

## Step 4: Test Before Committing

Before creating a commit:

### Android

Check:

- App builds successfully
- Existing screens still work
- Incident report saves correctly
- Offline fallback works
- API integration works where applicable

---

### Backend

Check:

- Application starts successfully
- API endpoints respond correctly
- Existing endpoints are not broken
- Request formats match agreed API contracts

---

### Shared Integration

Check:

- Android request reaches backend
- Backend accepts the expected format
- Response format is understood by the client
- Field names match exactly

---

# 📝 Commit Message Guidelines

Write meaningful commit messages.

Good examples:

```text
feat(android): add offline incident storage

feat(android): add background report synchronization

feat(api): add multipart incident report endpoint

fix(api): correct report upload content type

fix(android): handle backend sync failure

feat(risk): add community confidence signal
```

Avoid:

```text
update

changes

done

final

fix

asdf
```

A commit should explain what changed.

---

# 📦 Commit Format

Recommended format:

```text
type(scope): short description
```

Examples:

```text
feat(mobile): add GPS incident capture

fix(sync): prevent duplicate report upload

feat(backend): add zone details endpoint

fix(api): support multipart image upload

docs(readme): update system architecture
```

---

# 🔀 Pull Request Guidelines

Before creating a pull request:

1. Ensure your code builds.
2. Ensure the feature works.
3. Review your own changes.
4. Remove unnecessary debug code.
5. Check that you did not modify unrelated files.
6. Pull the latest relevant integration changes if needed.

A pull request should contain:

```markdown
## What Changed

- Added:
- Updated:
- Fixed:

## Testing

- [ ] Build successful
- [ ] Feature tested
- [ ] Existing functionality verified

## Integration Impact

- Android
- Backend
- GIS
- Dashboard

## Notes

Any required information for other contributors.
```

---

# 🔌 API Contract Rules

The API contract is a shared boundary between modules.

If Android sends:

```text
POST /api/v1/reports
```

the backend must agree on:

- Endpoint path
- HTTP method
- Content type
- Field names
- Field data types
- Optional fields
- Response format

---

## Current Report Fields

The current report structure includes:

| Field | Type |
|---|---|
| `device_id` | String |
| `lat` | Double |
| `lng` | Double |
| `report_type` | String |
| `timestamp` | Long |
| `offline_synced` | Boolean |
| `image` | File / Optional |

---

## Important Rule

Field names must match exactly.

For example:

```text
device_id
```

is different from:

```text
deviceId
```

Similarly:

```text
report_type
```

is different from:

```text
reportType
```

Do not silently change API field names.

If a contract change is required:

1. Discuss it.
2. Update the backend.
3. Update the Android client.
4. Test both sides.
5. Document the change if necessary.

---

# 📡 Content-Type Rules

NER Sentinel currently supports different report submission formats.

---

## JSON Report

```text
Content-Type: application/json
```

Example use case:

```text
Report metadata without an image.
```

---

## Multipart Report

```text
Content-Type: multipart/form-data
```

Example use case:

```text
Report metadata + image evidence.
```

The Android client must send the format expected by the backend.

A mismatch such as:

```text
Android → multipart/form-data
Backend → only application/json
```

will result in errors such as:

```text
415 Unsupported Media Type
```

Therefore, API integration must always be tested after changes.

---

# 📱 Android Contribution Guidelines

The Android application follows a modular structure.

Recommended flow:

```text
Screen
   ↓
ViewModel
   ↓
Repository
   ↓
Local / Remote Data Source
```

Use:

- ViewModel for screen-level state and business coordination
- Repository for data coordination
- Room for persistent offline storage
- Retrofit for backend communication
- WorkManager for background synchronization

---

## Android Code Rules

### Keep files reasonably small

Avoid creating one large file containing:

- UI
- Database
- Networking
- Business logic
- Synchronization logic

Instead, separate responsibilities.

---

### Prefer clear naming

Good:

```text
IncidentRepository
ReportViewModel
SyncWorker
ApiService
MeshConnectionManager
```

Avoid unclear names:

```text
Helper2
ManagerFinal
TestNew
UtilsEverything
```

---

### Offline-First Principle

For incident reporting:

```text
Create Report
      ↓
Save Locally
      ↓
Attempt Sync
      ↓
Success → Mark Synced
      ↓
Failure → Retry / Relay
```

Do not design the application so that a report disappears because internet connectivity is unavailable.

---

# 🌐 Backend Contribution Guidelines

The backend should maintain a clean separation between:

```text
Controller
   ↓
Service
   ↓
Risk Processing / Data Layer
```

Controllers should primarily handle:

- Request validation
- Request mapping
- Response generation

Business logic should remain in appropriate service or engine layers.

---

## Avoid Overloading Controllers

Avoid placing large risk calculations directly inside controllers.

Preferred structure:

```text
ApiController
      ↓
RiskEngineService
      ↓
Risk Calculation Logic
```

---

# 🧠 Risk Engine Contribution Guidelines

The Dynamic Risk Engine should follow the core concept:

```text
Risk = Susceptibility × Trigger × Confidence
```

Possible inputs include:

```text
Static Susceptibility
        +
Rainfall / Weather Trigger
        +
Community Reports
        +
GIS Context
        +
Satellite / Sensor Signals
```

Important:

> Community reports are not a replacement for official scientific landslide prediction.

They act as:

- Ground validation
- Operational confidence signals
- Real-time field intelligence
- Escalation indicators

---

# 🗺️ GIS Contribution Guidelines

GIS and route intelligence should consume the agreed risk and incident data.

Avoid duplicating backend risk calculations inside the GIS module unless explicitly required.

Focus on:

- Visualizing risk zones
- Terrain context
- Incident locations
- Route intelligence
- Dynamic operational changes

---

# 📊 Dashboard Contribution Guidelines

The dashboard should consume shared backend intelligence rather than maintaining an independent version of incident truth.

Dashboard responsibilities include:

- Incident monitoring
- Risk visualization
- Operational awareness
- Escalation display
- Command-level decision support

---

# 🚫 Do Not Commit These Files

Do not commit:

```text
.env
local.properties
*.keystore
*.jks
*.pem
*.key
```

Also avoid committing:

```text
.idea/
*.iml
build/
.gradle/
```

unless a specific project requirement makes a file necessary.

Always check:

```bash
git status
```

before committing.

---

# 🔍 Before Pushing

Run:

```bash
git status
```

Review the changed files.

Then:

```bash
git add .
```

Commit:

```bash
git commit -m "feat(scope): meaningful description"
```

Push:

```bash
git push origin <branch-name>
```

Example:

```bash
git push origin feature/mobile-field-intelligence
```

---

# ⚠️ Handling Merge Conflicts

If a merge conflict occurs:

```text
1. Stop.
2. Do not blindly accept all changes.
3. Understand what both versions changed.
4. Resolve the conflict carefully.
5. Build and test again.
```

For shared files such as:

```text
API models
configuration files
shared documentation
```

coordinate with the relevant contributor before resolving complex conflicts.

---

# 🧪 Integration Testing Checklist

Before merging connected features:

## Android

- [ ] Report can be created
- [ ] GPS is captured
- [ ] Report is saved locally
- [ ] Image is handled correctly
- [ ] Offline report remains stored
- [ ] Sync marks successful reports correctly

## Backend

- [ ] Server starts successfully
- [ ] `GET /api/v1/zones` works
- [ ] `GET /api/v1/reports` works
- [ ] `POST /api/v1/reports` works
- [ ] JSON requests work
- [ ] Multipart requests work

## Integration

- [ ] Android request reaches backend
- [ ] Backend accepts Android request format
- [ ] Image upload works
- [ ] Response is successful
- [ ] Offline fallback works

---

# 🚨 Breaking Changes

The following are considered breaking changes:

- Changing an API endpoint
- Renaming API fields
- Changing a data type
- Changing response structure
- Removing an existing model field
- Changing the risk result structure

Before making a breaking change:

```text
Notify affected team members
        ↓
Agree on the new contract
        ↓
Update connected modules
        ↓
Test the complete flow
```

Never make a breaking change silently.

---

# 🧹 Code Quality Rules

All contributors should aim for:

- Clear naming
- Small focused classes
- Minimal duplication
- No unrelated logic in one file
- Readable code over clever code
- Minimal unnecessary dependencies
- Working implementation before over-engineering

---

# 🏁 Definition of Done

A feature is considered complete when:

```text
Feature implemented
        ↓
Build succeeds
        ↓
Feature tested
        ↓
Existing features not broken
        ↓
Changes committed clearly
        ↓
Pushed to correct branch
        ↓
Integrated with dependent modules
```

---

# 🎯 NER Sentinel Development Philosophy

The project should always prioritize:

```text
Working MVP
    >
Over-engineered Architecture
```

```text
Real Integration
    >
Isolated Features
```

```text
Operational Intelligence
    >
Unverified Prediction Claims
```

```text
Resilient Field Reporting
    >
Internet-Dependent Workflow
```

---

# 🌍 Final Principle

NER Sentinel is successful only when the complete pipeline works:

```text
Field Incident
       ↓
Offline Storage
       ↓
Sync / Device Relay
       ↓
Backend Processing
       ↓
Risk Engine
       ↓
Risk Escalation
       ↓
GIS / Dashboard
       ↓
Actionable Operational Intelligence
```

Every contribution should strengthen this end-to-end flow.

---

**Build independently. Integrate carefully. Test the complete system.**
