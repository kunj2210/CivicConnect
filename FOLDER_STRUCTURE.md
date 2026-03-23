# CivicConnect Project Structure 📂

This document provides a high-level overview of the `CivicConnect` codebase and its directory structure.

## Root Directory

```text
CivicConnect/
├── admin-dashboard/     # React + Vite Admin Panel
├── ai_service/          # Python-based AI Service
├── backend/             # Express + TypeScript Backend
├── mobile/              # Flutter Mobile Application
├── AI-Related-Files/    # Documentation and assets for AI
├── package.json         # Root configuration and cross-component scripts
└── README.md            # Main project documentation
```

---

## 1. Backend (`backend/`)

The backend follows a standard Express/TypeScript architecture.

```text
backend/
├── src/
│   ├── config/          # Database and service configurations
│   ├── controllers/     # Request handlers
│   ├── cron/            # Scheduled tasks (e.g., deduplication)
│   ├── jobs/            # Background worker definitions
│   ├── middleware/      # Auth and validation middlewares
│   ├── models/          # Sequelize (Postgres) and Mongoose (Mongo) models
│   ├── routes/          # API route definitions
│   ├── seed/            # Data seeding scripts
│   ├── services/        # Business logic layer
│   └── utils/           # Helper functions
└── uploads/             # Local storage for file uploads
```

---

## 2. Admin Dashboard (`admin-dashboard/`)

A modern React application for authority management.

```text
admin-dashboard/
├── src/
│   ├── assets/          # Static assets (images, fonts)
│   ├── components/      # Reusable UI components
│   ├── config/          # App constants and API config
│   ├── context/         # React Context providers (Auth, Theme)
│   ├── data/            # Static data or mockups
│   ├── layouts/         # Page layout wrappers
│   ├── pages/           # Screen/Page components
│   └── utils/           # Frontend helper functions
```

---

## 3. Mobile Application (`mobile/`)

Built with Flutter, organized into logical modules.

```text
mobile/
├── lib/
│   ├── config/          # Global configurations and themes
│   ├── core/            # Core utilities and base classes
│   ├── modules/         # Feature-based modules (reports, auth, etc.)
│   │   └── reports/     # Issue reporting logic and screens
│   ├── shared/          # Shared widgets and services
│   └── main.dart        # Application entry point
```

---

## 4. AI Service (`ai_service/`)

A specialized Python service for image and text analysis.

```text
ai_service/
├── logs/                # Runtime logs
├── main.py              # FastAPI/Flask entry point
├── model_utils.py       # ML model loading and inference logic
├── requirements.txt     # Python dependencies
└── test_ai.py           # Unit tests for AI logic
```
