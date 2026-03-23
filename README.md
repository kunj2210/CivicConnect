# CivicConnect 🏙️

**CivicConnect** is an enterprise-grade platform designed to streamline civic engagement and urban management. It provides a multi-tenant solution for citizens to report issues and for authorities to track, manage, and resolve them efficiently.

---

## 🚀 Key Features

- **Multi-Tenancy**: Strict data isolation using Supabase Row Level Security (RLS).
- **Intelligent Reporting**: Citizens can report civic issues (e.g., potholes, streetlights) with GPS verification.
- **AI Fusion Engine**: Multimodal AI fusion for accurate priority scoring of reports.
- **Enterprise Dashboard**: A robust admin interface for ULB (Urban Local Body) authorities to manage reports and staff.
- **Deduplication**: Automated nightly deduplication jobs using PostGIS to prevent redundant reports.
- **Real-time Notifications**: Instant updates for status changes on reported issues.

---

## 🏗️ Architecture

The project is divided into four main components:

1.  **Backend**: Express.js + TypeScript server handling business logic and data persistence.
2.  **Admin Dashboard**: React + Vite + Tailwind CSS for authority management.
3.  **Mobile App**: Flutter application for citizens and field staff.
4.  **AI Service**: Python-based service for multimodal analysis and priority scoring.

---

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS
-   **Mobile**: Flutter (Dart)
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: MongoDB (Reports & Metadata), PostgreSQL + PostGIS (Geospatial data & Boundaries)
-   **Auth & Security**: Supabase (RLS)
-   **AI**: Python, FastAPI/Flask (AI Service)

---

## ⚙️ Setup & Installation

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18+
- **MongoDB**: Local or Remote
- **Postgres**: v14+ with **PostGIS** extension
- **Flutter SDK**: Latest stable
- **Python**: 3.9+ (for AI Service)

### 1. Backend Setup

1.  Navigate to `backend/`.
2.  Create `.env` (refer to `.env.example`).
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Ensure **MongoDB** and **PostgreSQL** are running.
5.  Enable PostGIS: `CREATE EXTENSION postgis;`
6.  Run the server:
    ```bash
    npm run dev
    ```
7.  Seed default users:
    ```bash
    npm run seed:users
    ```
    - **Admin**: `admin@civicconnect.gov` / `admin123`
    - **Authority**: `authority@civicconnect.gov` / `auth123`

### 2. Admin Dashboard Setup

1.  Navigate to `admin-dashboard/`.
2.  Install & Run:
    ```bash
    npm install
    ```
    ```bash
    npm run dev
    ```

### 3. Mobile Application Setup

1.  Navigate to `mobile/`.
2.  Update `.env` with your base API URL.
3.  Fetch dependencies:
    ```bash
    flutter pub get
    ```
4.  Run:
    ```bash
    flutter run
    ```

### 4. AI Service Setup

1.  Navigate to `ai_service/`.
2.  Set up a virtual environment and install `requirements.txt`.
3.  Run:
    ```bash
    python main.py
    ```

---

## 📖 Development Scripts

The root `package.json` contains several helper scripts:

-   `npm run install:all`: Install dependencies for all components.
-   `npm run dev`: Start Backend, Admin Dashboard, and AI Service concurrently.
-   `npm run seed:users`: Seed initial admin and authority accounts.
-   `npm run dev:mobile-android`: Run mobile app on Android.
-   `npm run dev:mobile-chrome`: Run mobile app on Web (Chrome).

---

## 📄 License

This project is private and intended for enterprise use.
