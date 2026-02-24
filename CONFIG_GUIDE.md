# CivicConnect Configuration Guide

This guide outlines the steps required to set up and run the three main components of the CivicConnect project: Backend, Admin Dashboard, and Mobile Application.

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v18 or higher
- **MongoDB**: Local instance or remote URI
- **PostgreSQL**: v14 or higher with the **PostGIS** extension
- **Flutter SDK**: Latest stable version
- **Git**

---

## 1. Backend Setup

The backend is built with Express.js, TypeScript, and handles data management through MongoDB and PostgreSQL.

### Step 1: Environment Variables
1. Navigate to the `backend/` directory.
2. Create a `.env` file based on `.env.example`:
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/civicconnect
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=postgres
   PG_PASSWORD=your_password
   PG_DB=civicconnect
   FIREBASE_SERVICE_ACCOUNT_PATH=../civicconnect-7c316-firebase-adminsdk-fbsvc-32969f9a65.json
   FIREBASE_STORAGE_BUCKET=civicconnect-7c316.appspot.com
   ```
   > [!IMPORTANT]
   > Ensure the `FIREBASE_SERVICE_ACCOUNT_PATH` points to the JSON file located in the root of the project.

### Step 2: Database Configuration
1. Start your **MongoDB** and **PostgreSQL** services.
2. In PostgreSQL, ensure you have a database named `civicconnect`.
3. Enable the **PostGIS** extension in your database:
   ```sql
   CREATE EXTENSION postgis;
   ```

### Step 3: Local Uploads Folder
Ensure an `uploads` folder exists in the `backend/` directory:
```bash
mkdir backend/uploads
```

### Step 4: Run the Backend
```bash
cd backend
npm install
npm run dev
```
The server will start at `http://localhost:5000`. It will automatically sync Sequelize models and seed ULB boundaries.

### Step 5: Seed Admin/Authority Users
Run the following command to create the default accounts:
```bash
npm run seed:users
```
**Default Credentials:**
- Admin: `admin@civicconnect.gov` / `admin123`
- Authority: `authority@civicconnect.gov` / `auth123`

---

## 2. Admin Dashboard Setup

The admin dashboard is a React application powered by Vite and Tailwind CSS.

### Step 1: Install Dependencies
```bash
cd admin-dashboard
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```
The dashboard will be available at the URL shown in your terminal (usually `http://localhost:5173`).

---

## 3. Mobile Application Setup

The mobile app is built with Flutter and requires a configured development environment.

### Step 1: Environment Configuration
1. Navigate to the `mobile/` directory. Update the `.env` file.
2. Update `API_BASE_URL` to point to your machine's IP address if you are running on a physical device or emulator.
   ```bash
   API_BASE_URL=http://<YOUR_IP_ADDRESS>:5000/api
   ```

### Step 2: Fetch Dependencies
```bash
cd mobile
flutter pub get
```

### Step 3: Run the App
Ensure an emulator is active or a device is connected:
```bash
flutter run
```
