# CivicConnect — Project Structure ??

> Last updated: June 2026  
> Monorepo containing four sub-projects: **backend**, **admin-dashboard**, **mobile**, and **ai_service**.

---

## Root Directory

```text
CivicConnect/
+-- .agents/                 # Workspace-scoped agent rules (AGENTS.md)
+-- .github/                 # GitHub Actions CI/CD workflows
+-- AI-Related-Files/        # AI model documentation and training assets
+-- admin-dashboard/         # React + Vite admin panel (web)
+-- ai_service/              # Python FastAPI AI inference service
+-- backend/                 # Node.js + Express + TypeScript REST API
+-- docs/                    # Project documentation
¦   +-- FOLDER_STRUCTURE.md  # ? This file
¦   +-- API_TESTING.md       # Postman / curl API reference
+-- mobile/                  # Flutter mobile application
+-- scripts/                 # Root-level utility scripts
+-- supabase/                # Supabase edge functions and config
¦   +-- functions/
¦       +-- classify-report/ # Edge function: AI issue classification
¦           +-- index.ts
+-- .gitignore
+-- package.json             # Root: concurrently scripts to run all services
+-- README.md
```

---

## 1. Backend (`backend/`)

Express + TypeScript REST API. Connects to PostgreSQL (PostGIS + pgvector via Sequelize) and Supabase Auth.

```text
backend/
+-- src/
¦   +-- config/
¦   ¦   +-- associations.ts  # All Sequelize model relationships
¦   ¦   +-- connect.ts       # DB connect, sync, migrations, seeding orchestration
¦   ¦   +-- database.ts      # Sequelize instance initialization
¦   ¦   +-- db.ts            # Central re-export of all models
¦   ¦   +-- firebase.ts      # Firebase Admin SDK setup (push notifications)
¦   ¦   +-- supabase.ts      # Supabase client setup
¦   ¦
¦   +-- controllers/
¦   ¦   +-- report/                        # Issue/report domain (split by concern)
¦   ¦   ¦   +-- index.ts                   # Re-exports all report controllers
¦   ¦   ¦   +-- report.admin.controller.ts # Admin-specific report operations
¦   ¦   ¦   +-- report.ai.controller.ts    # AI processing endpoints
¦   ¦   ¦   +-- report.audit.controller.ts # Audit trail endpoints
¦   ¦   ¦   +-- report.create.controller.ts# Issue creation and file upload
¦   ¦   ¦   +-- report.query.controller.ts # Listing, filtering, GeoJSON export
¦   ¦   ¦   +-- report.query.utils.ts      # Query building helpers
¦   ¦   ¦   +-- report.utils.ts            # Shared report utilities
¦   ¦   ¦   +-- report.workflow.authority.ts  # Authority workflow actions
¦   ¦   ¦   +-- report.workflow.citizen.ts    # Citizen workflow actions
¦   ¦   ¦   +-- report.workflow.controller.ts # Workflow entry re-export
¦   ¦   ¦   +-- report.workflow.staff.ts      # Staff workflow actions
¦   ¦   ¦
¦   ¦   +-- user/                          # User domain (split by concern)
¦   ¦   ¦   +-- index.ts
¦   ¦   ¦   +-- user.admin.controller.ts   # Admin user management
¦   ¦   ¦   +-- user.profile.controller.ts # Profile CRUD, avatar upload
¦   ¦   ¦   +-- user.utils.ts              # Shared user helpers
¦   ¦   ¦
¦   ¦   +-- analyticsController.ts         # Dashboard analytics aggregations
¦   ¦   +-- authController.ts              # Login, token verification
¦   ¦   +-- departmentController.ts        # Department CRUD
¦   ¦   +-- notificationController.ts      # Push notification management
¦   ¦   +-- systemController.ts            # System admin (data wipe, etc.)
¦   ¦   +-- ulbController.ts               # ULB (city) boundary CRUD
¦   ¦   +-- wardController.ts              # Ward boundary CRUD + ST_Within check
¦   ¦   +-- whatsappController.ts          # WhatsApp webhook handler
¦   ¦   +-- zoneController.ts             # Zone boundary CRUD
¦   ¦
¦   +-- cron/                # Scheduled tasks (e.g. issue deduplication)
¦   ¦
¦   +-- jobs/                # Background worker definitions
¦   ¦
¦   +-- middleware/
¦   ¦   +-- authMiddleware.ts # Supabase JWT verification
¦   ¦   +-- rbacMiddleware.ts # Permission-based route guards
¦   ¦
¦   +-- models/              # Sequelize model definitions (one file per table)
¦   ¦   +-- AIFeedback.ts
¦   ¦   +-- AuditLog.ts
¦   ¦   +-- Department.ts
¦   ¦   +-- Issue.ts
¦   ¦   +-- Notification.ts
¦   ¦   +-- Permission.ts
¦   ¦   +-- ProcessingJob.ts
¦   ¦   +-- Repair.ts
¦   ¦   +-- Role.ts
¦   ¦   +-- RolePermission.ts
¦   ¦   +-- UlbBoundary.ts   # Urban Local Body (city) spatial boundary
¦   ¦   +-- User.ts
¦   ¦   +-- UserDevice.ts
¦   ¦   +-- UserRole.ts
¦   ¦   +-- Ward.ts          # Ward spatial boundary (child of Zone)
¦   ¦   +-- Zone.ts          # Administrative zone boundary (child of ULB)
¦   ¦
¦   +-- routes/
¦   ¦   +-- analyticsRoutes.ts
¦   ¦   +-- auditRoutes.ts
¦   ¦   +-- authRoutes.ts
¦   ¦   +-- departmentRoutes.ts
¦   ¦   +-- notificationRoutes.ts
¦   ¦   +-- reportRoutes.ts
¦   ¦   +-- systemRoutes.ts   # /wards, /zones, /ulb-boundaries, /wipe-data
¦   ¦   +-- uploadRoutes.ts
¦   ¦   +-- userRoutes.ts
¦   ¦   +-- whatsappRoutes.ts
¦   ¦
¦   +-- scripts/             # One-off utility scripts
¦   ¦
¦   +-- seed/
¦   ¦   +-- seedAll.ts       # Orchestrates all seed scripts
¦   ¦   +-- seedUsers.ts     # Seeds demo users per role
¦   ¦   +-- ulbBoundaries.ts # Seeds SMC ULB + 9 zones + representative wards
¦   ¦
¦   +-- services/            # External integrations and business logic
¦   ¦   +-- aiService.ts            # AI classification + analysis API calls
¦   ¦   +-- auditService.ts         # Audit log writes
¦   ¦   +-- gamificationService.ts  # Citizen points and badges
¦   ¦   +-- geoIntelligenceService.ts # Spatial clustering and hotspot analysis
¦   ¦   +-- notificationService.ts  # Firebase push + WhatsApp notifications
¦   ¦   +-- priorityService.ts      # Issue priority scoring
¦   ¦   +-- ragService.ts           # RAG (vector search) for AI context
¦   ¦   +-- routingService.ts       # Auto-assignment routing logic
¦   ¦   +-- spatialService.ts       # PostGIS spatial query helpers
¦   ¦   +-- storageService.ts       # Supabase Storage file uploads
¦   ¦   +-- triageService.ts        # Issue triage and deduplication
¦   ¦
¦   +-- utils/               # Pure server-side helpers (no Express/DB deps)
¦   +-- index.ts             # Server entry point: middleware, routes, startup
¦
+-- uploads/                 # Local file upload storage (dev only)
```

### Spatial Hierarchy

```
UlbBoundary (city)
    +-- Zone  (administrative zone, e.g. West Zone, Central Zone)
            +-- Ward  (sub-zone; must pass ST_Within check inside its Zone)
                    +-- Department  (optional zone/ward assignment)
```

All boundaries use PostGIS `GEOMETRY('POLYGON', 4326)`. Ward creation enforces `ST_Within` containment (ward must lie inside its parent zone boundary). Zone `?` Ward `?` Department associations use `constraints: false` to avoid Sequelize sync ordering issues.

---

## 2. Admin Dashboard (`admin-dashboard/`)

React 18 + Vite SPA. Role-based dashboards for Super Admin, Commissioner, Authority, and Staff.

```text
admin-dashboard/
+-- public/
+-- src/
    +-- App.jsx              # Root: router, layout composition
    +-- main.jsx             # Entry point
    +-- index.css            # Global styles and design tokens
    ¦
    +-- assets/              # Static images and icons
    ¦
    +-- components/          # Shared, atomic UI elements (no business logic)
    ¦   +-- ProtectedRoute.jsx  # Auth guard wrapper
    ¦   +-- RoleGuard.jsx       # RBAC permission guard
    ¦   +-- Sidebar.jsx         # Navigation sidebar (role-adaptive)
    ¦
    +-- config/              # App-wide constants and API base URL
    ¦
    +-- context/             # React Context providers
    ¦   +-- AuthContext.jsx  # Supabase session and user state
    ¦
    +-- features/            # Domain-driven feature modules
    ¦   +-- issues/
    ¦   ¦   +-- components/
    ¦   ¦   ¦   +-- IssueActions.jsx         # Bulk action toolbar
    ¦   ¦   ¦   +-- IssueAIFusion.jsx        # AI fusion view panel
    ¦   ¦   ¦   +-- IssueAIReport.jsx        # AI analysis report panel
    ¦   ¦   ¦   +-- IssueAuditComparison.jsx # Before/after audit view
    ¦   ¦   ¦   +-- IssueFilters.jsx         # Zone/Ward/status filter bar
    ¦   ¦   ¦   +-- IssueMetadata.jsx        # Issue metadata display
    ¦   ¦   ¦   +-- IssueRow.jsx             # Single row in issue table
    ¦   ¦   ¦   +-- IssueTable.jsx           # Issues table wrapper
    ¦   ¦   ¦   +-- IssueVisuals.jsx         # Photo/media display
    ¦   ¦   ¦   +-- IssueWorkflowActions.jsx # Status workflow buttons
    ¦   ¦   +-- hooks/
    ¦   ¦       +-- useIssueDetails.js       # Single issue data + actions
    ¦   ¦       +-- useIssueList.js          # Paginated list + zone/ward filters
    ¦   ¦
    ¦   +-- jurisdictions/
    ¦   ¦   +-- components/
    ¦   ¦   ¦   +-- JurisdictionForm.jsx     # Create/edit form for Ward/Zone/ULB
    ¦   ¦   ¦   +-- JurisdictionMap.jsx      # Leaflet drawing map + zone overlay
    ¦   ¦   +-- hooks/
    ¦   ¦       +-- useAdminJurisdictions.js # State + CRUD for all boundary types
    ¦   ¦
    ¦   +-- departments/     # Department management components and hooks
    ¦   +-- settings/        # Admin settings components and hooks
    ¦   +-- users/           # User management components and hooks
    ¦
    +-- layouts/
    ¦   +-- DashboardLayout.jsx # Shared layout shell (sidebar + outlet)
    ¦
    +-- pages/               # Route-level page components (thin wrappers)
    ¦   +-- Login.jsx
    ¦   +-- Dashboard.jsx                # Super Admin dashboard
    ¦   +-- CommissionerDashboard.jsx
    ¦   +-- AuthorityDashboard.jsx
    ¦   +-- StaffDashboard.jsx
    ¦   +-- AdminIssueList.jsx
    ¦   +-- AdminIssueDetails.jsx
    ¦   +-- AdminJurisdictions.jsx       # Zones / Wards / ULBs management
    ¦   +-- AdminMapView.jsx             # Full-screen issue + jurisdiction map
    ¦   +-- AdminUsers.jsx
    ¦   +-- AdminSettings.jsx
    ¦   +-- AIRetraining.jsx
    ¦   +-- AuditLogViewer.jsx
    ¦   +-- AuthorityIssueDetails.jsx
    ¦   +-- AuthorityIssueList.jsx
    ¦   +-- AuthorityMapView.jsx
    ¦   +-- AuthoritySettings.jsx
    ¦   +-- Departments.jsx
    ¦   +-- ExecutiveAnalytics.jsx
    ¦   +-- Leaderboard.jsx
    ¦
    +-- services/            # Axios API call functions (one file per domain)
    ¦   +-- adminApi.js
    ¦   +-- analyticsApi.js
    ¦   +-- auditApi.js
    ¦   +-- departmentsApi.js
    ¦   +-- notificationsApi.js
    ¦   +-- reportsApi.js
    ¦   +-- systemApi.js     # /wards, /zones, /ulb-boundaries
    ¦   +-- usersApi.js
    ¦
    +-- utils/               # Pure frontend helpers (date formatting, etc.)
```

---

## 3. Mobile Application (`mobile/`)

Flutter app targeting Android and iOS. Citizens file and track civic issues.

```text
mobile/
+-- lib/
¦   +-- main.dart                  # App entry point, providers, theme
¦   +-- main_navigation.dart       # Bottom nav and root navigation scaffold
¦   +-- firebase_options.dart      # FlutterFire generated Firebase config
¦   ¦
¦   +-- config/                    # Global themes, colors, route constants
¦   ¦
¦   +-- modules/                   # Feature-first module organization
¦   ¦   +-- auth/
¦   ¦   ¦   +-- screens/           # Login, registration screens
¦   ¦   ¦   +-- services/          # Supabase auth service
¦   ¦   ¦
¦   ¦   +-- notifications/         # Push notification list screen and handler
¦   ¦   ¦
¦   ¦   +-- reports/               # Issue reporting (primary citizen feature)
¦   ¦       +-- models/            # Report data model (fromJson / toJson)
¦   ¦       +-- screens/           # Report list, detail, create screens
¦   ¦       +-- services/
¦   ¦       ¦   +-- location_service.dart # Device GPS + reverse geocoding
¦   ¦       ¦   +-- report_service.dart   # API calls for issue CRUD
¦   ¦       +-- widgets/           # Report-specific reusable widgets
¦   ¦
¦   +-- shared/
¦       +-- providers/             # Riverpod / Provider global state
¦       +-- utils/                 # Shared helpers (validators, formatters)
¦
+-- pubspec.yaml                   # Flutter dependencies
+-- pubspec.lock
```

---

## 4. AI Service (`ai_service/`)

Lightweight Python FastAPI service. Called by the backend to classify and analyze issue images/text.

```text
ai_service/
+-- main.py              # FastAPI entry: /classify and /analyze endpoints
+-- model_utils.py       # ML model loading, preprocessing, inference
+-- test_ai.py           # Unit tests for classification logic
+-- requirements.txt     # Python dependencies (fastapi, transformers, Pillow)
+-- README.md
```

---

## 5. Supabase (`supabase/`)

```text
supabase/
+-- config.toml          # Supabase project configuration
+-- functions/
    +-- classify-report/     # Deno edge function: lightweight AI classification
        +-- index.ts
```

---

## Key Architectural Patterns

| Pattern | Where Used |
|---|---|
| **MVC** | Backend: Routes ? Controllers ? Services ? Models |
| **Feature-First / Domain-Driven** | Frontend `features/` — each domain owns components + hooks |
| **PostGIS Spatial Containment** | `ST_Within`: Ward boundary must lie inside its parent Zone |
| **RBAC** | `rbacMiddleware.ts` + `requirePermission()` guard per route |
| **Supabase Auth** | JWT issued by Supabase, verified in `authMiddleware.ts` |
| **`constraints: false`** | Zone associations skip FK DDL to prevent sync ordering crash |
| **Concurrently** | Root `package.json` starts backend + admin-dashboard together |
| **RAG / pgvector** | Issue deduplication via vector embeddings in PostgreSQL |
