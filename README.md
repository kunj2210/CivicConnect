# CivicConnect 🏙️

**CivicConnect** is an enterprise-grade platform designed to automate civic engagement and urban management. It provides a multi-tenant solution for citizens to report issues and for authorities to track, manage, and resolve them efficiently with AI-backed verification.

---

## 🚀 Key Features

- **Multi-Tenancy**: Strict data isolation using **Supabase Row Level Security (RLS)**.
- **Intelligent Reporting**: Citizens report civic issues with **GPS verification** and image capture.
- **AI Fusion Engine**: Multimodal AI fusion (Computer Vision + LLM) for automated data-driven priority scoring.
- **Enterprise Dashboard**: A robust admin interface for ULB (Urban Local Body) authorities to manage reports, staff, and heatmaps.
- **Spatial Intelligence**: Automated nightly deduplication jobs using **PostGIS** to cluster and resolve redundant reports.
- **Gamification**: Green Credits and XP-based leaderboard for citizen engagement.
- **Real-time Notifications**: Custom broadcast channels for live updates on issues.

---

## 🏗️ Architecture & Tech Stack

The architecture is highly modular, separating concerns into four core areas:

1.  **Backend**: Node.js + Express + TypeScript + **Sequelize (PostgreSQL)**
2.  **Admin Dashboard**: React + Vite + Tailwind CSS + Lucide Icons
3.  **Mobile App**: Flutter (Dart) for Android, iOS, and Web
4.  **AI Service**: Python + FastAPI + Groq (Llama 3.1) + MobileNetV2

---

## 📋 Prerequisites
Ensure the following are installed:
1. **Git** (for version control)
2. **Node.js** (v18+) & **npm**
3. **Flutter SDK** (Android Studio / VS Code)
4. **Python 3.10+** (for AI services)
5. **PostgreSQL** (Port 5432) or access to the **Supabase Cloud** project
6. **Docker Desktop** (for MinIO Object Storage)

---

## 📂 1. Repository Setup
```bash
git clone https://github.com/kunj2210/CivicConnect.git
cd CivicConnect
git checkout main
```

### 🌐 Networking & IP Discovery
For the mobile app to communicate with the backend, you must use your machine's **Local IP Address**, not `localhost`.

1. **Find your IP**: Open Terminal/PowerShell and type `ipconfig`. Look for "IPv4 Address" (e.g., `192.168.1.5`).
2. **Set Backend BASE_URL**: In `backend/.env`, set `BASE_URL=http://192.168.1.5:5000`.
3. **Set Mobile API_BASE_URL**: In `mobile/.env`, set `API_BASE_URL=http://192.168.1.5:5000/api`.
4. **Set MINIO_ENDPOINT**: In `backend/.env`, set `MINIO_ENDPOINT=192.168.1.5`.

---

## 🛠️ 2. Environment Configuration
You must create `.env` files for each component by copying the `.env.example` templates.

### Backend (`/backend/.env`)
```bash
cp .env.example .env
# Edit .env with your Supabase credentials, Groq API Key, and Machine IP
```

### Admin Dashboard (`/admin-dashboard/.env`)
```bash
cp .env.example .env
# Edit .env with your Supabase credentials and Local API URL
```

### Mobile App (`/mobile/.env`)
```bash
cp .env.example .env
# Set API_BASE_URL to your Machine's Local IP
```

---

## ⚙️ 3. Detailed Component Setup

### ✅ Backend (Node.js)
For start the backend server run the following commands:
```bash
cd backend
npm install
npm run dev
```
For seed the database run the following command in root directory:
```bash
npm run seed:users
```

### ✅ AI Microservice (Python)
Ensure `CivicConnect_Production_Model.pth` is in the `AI-Related-Files/` directory.
```bash
cd ai_service
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py
```

### ✅ MinIO Object Storage (Docker Desktop)
1. Open **Docker Desktop**.
2. Run the MinIO container:
```powershell
docker run -p 9000:9000 -p 9001:9001 `
  --name minio `
  -e "MINIO_ROOT_USER=admin" `
  -e "MINIO_ROOT_PASSWORD=M@nthan1528" `
  -v D:\minio_data:/data `
  minio/minio server /data --console-address ":9001"
```
3. Set policy using MinIO Client (mc) inside Docker:
```powershell
docker exec minio mc alias set local http://localhost:9000 admin M@nthan1528
docker exec minio mc anonymous set download local/civic-connect
```
4. Note: You have to run this commands only one time after that you can directly run the minio server using docker desktop (start button).

### ✅ Admin Dashboard (React)
```bash
cd admin-dashboard
npm install
npm run dev
```

### ✅ Mobile App (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🧪 4. Final Sanity Check
- Verify that `check_db.js` in the backend folder returns valid Supabase users.
- Ensure the **Supabase RLS Policies** (apply_rls.ts) are active in the database.
- Use the **Manual Deployment Map** artifact for deep file-level architecture details.

**Project is now ready for launch!** 🚀
