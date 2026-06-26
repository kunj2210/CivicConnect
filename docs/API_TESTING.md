# CivicConnect — Postman API Testing Guide

A complete reference for testing every backend API endpoint using Postman.

---

## 🚀 Quick Setup

### 1. Environment Variables (Postman Environment)

Create a **Postman Environment** named `CivicConnect Local` with these variables:

| Variable | Initial Value | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:5000/api` | Backend base URL |
| `TOKEN` | _(empty)_ | Auto-filled after login |
| `USER_ID` | _(empty)_ | Auto-filled after login |
| `REPORT_ID` | _(empty)_ | Fill after creating a report |
| `DEPT_ID` | _(empty)_ | Fill after creating a department |
| `WARD_ID` | _(empty)_ | Fill after creating a ward |
| `USER_TARGET_ID` | _(empty)_ | Fill after creating a user |

### 2. Auto-Token Script

In the **Login** request → **Tests** tab, paste this to auto-save the token:

```javascript
const res = pm.response.json();
if (res.token) {
    pm.environment.set("TOKEN", res.token);
    pm.environment.set("USER_ID", res.id);
    console.log("✅ Token saved to environment");
}
```

### 3. Auth Header (Global)

For **all authenticated requests**, add this header:

| Key | Value |
|---|---|
| `Authorization` | `Bearer {{TOKEN}}` |
| `Content-Type` | `application/json` |

---

## ✅ Health Check

### `GET /health`
> No auth required. Confirms the server is running.

```
GET http://localhost:5000/health
```

**Expected Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-26T06:30:00.000Z"
}
```

---

## 🔐 Auth APIs — `/api/auth`

### 1. Login (Email + Password)
> No auth required. Returns a JWT token for all subsequent requests.

```
POST {{BASE_URL}}/auth/login
```

**Body (JSON):**
```json
{
  "email": "commissioner@civicconnect.gov",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "id": "<uuid>",
  "token": "<jwt-access-token>",
  "user": {
    "id": "<uuid>",
    "role": "super_admin",
    "green_credits": 0
  }
}
```

> ⚠️ Run the **Tests** script above to auto-save `TOKEN` and `USER_ID`.

---

### 2. Login — Other Roles

| Role | Email | Password |
|---|---|---|
| Admin | `controlroom@civicconnect.gov` | `password123` |
| Authority | `authority.pwd@civicconnect.gov` | `password123` |
| Staff | `staff.pwd@civicconnect.gov` | `password123` |
| Mayor | _(create via Users API)_ | _(temp password from list)_ |
| Councilor | _(create via Users API)_ | _(temp password from list)_ |

---

### 3. Register (Mobile Citizen)
> Public endpoint for mobile app citizen registration.

```
POST {{BASE_URL}}/auth/register
```

**Body (JSON):**
```json
{
  "phone": "+919876543210",
  "password": "citizen123",
  "role": "citizen"
}
```

---

### 4. Update Profile (Ward Assignment)
> Sets a citizen's ward after registration. No auth guard on this route.

```
PATCH {{BASE_URL}}/auth/update-profile/{{USER_ID}}
```

**Body (JSON):**
```json
{
  "ward_id": "993dc994-ea01-4ac1-adad-a42251e2331b"
}
```

---

### 5. Change Password
> 🔒 Requires: Auth token of the logged-in user.

```
POST {{BASE_URL}}/auth/change-password
Authorization: Bearer {{TOKEN}}
```

**Body (JSON):**
```json
{
  "currentPassword": "password123",
  "newPassword": "newSecurePass456!"
}
```

**Expected Response (200):**
```json
{ "message": "Password updated successfully" }
```

---

## 👤 User Management APIs — `/api/users`

> 🔒 All routes require `Authorization: Bearer {{TOKEN}}`

### 1. Get All Users
> Required Permission: `users:manage` (Super Admin / Admin)

```
GET {{BASE_URL}}/users
```

**Expected Response (200):** Array of user objects with roles, departments, temp passwords.

---

### 2. Create New User (Admin-provisioned)
> Required Permission: `users:manage`
> Generates a secure temp password stored as `temp_password_cleartext`.

```
POST {{BASE_URL}}/users
```

**Body (JSON):**
```json
{
  "name": "Test Mayor",
  "email": "mayor.test@civicconnect.gov",
  "role": "mayor",
  "designation": "Elected Mayor",
  "phone": "+919111111199",
  "ulb_id": "<ulb-uuid-from-system-api>"
}
```

**Expected Response (201):**
```json
{
  "id": "<uuid>",
  "name": "Test Mayor",
  "email": "mayor.test@civicconnect.gov",
  "role": "mayor",
  "temp_password_cleartext": "Xk7#mP9qR2"
}
```

> 💡 Save the `id` to `USER_TARGET_ID` in your environment.

---

### 3. Reset User Password
> Required Permission: `users:manage`
> Regenerates credentials in both Supabase Auth and PostgreSQL.

```
POST {{BASE_URL}}/users/{{USER_TARGET_ID}}/reset-password
```

**No Body Required.**

**Expected Response (200):**
```json
{
  "message": "Password reset successfully",
  "temp_password_cleartext": "newGeneratedPass"
}
```

---

### 4. Get My Profile
```
GET {{BASE_URL}}/users/me
```

---

### 5. Update User Profile
```
PATCH {{BASE_URL}}/users/{{USER_TARGET_ID}}
```

**Body (JSON):**
```json
{
  "name": "Updated Name",
  "designation": "Senior Inspector"
}
```

---

### 6. Get Assignable Staff
> Required Permission: `report:assign`

```
GET {{BASE_URL}}/users/staff
```

---

### 7. Get Leaderboard
```
GET {{BASE_URL}}/users/leaderboard
```

---

### 8. Update Device Token (Mobile Push Notifications)
```
POST {{BASE_URL}}/users/device-token
```

**Body (JSON):**
```json
{
  "device_token": "firebase-fcm-device-token-here"
}
```

---

## 📋 Reports / Issues APIs — `/api/reports`

> 🔒 All routes require Auth token.

### 1. Create Report (with Image)
> Required Permission: `report:create`
> Use **form-data** body (not JSON) for file uploads.

```
POST {{BASE_URL}}/reports
Content-Type: multipart/form-data
```

**Form-Data Fields:**

| Key | Type | Value |
|---|---|---|
| `category` | Text | `Road/Potholes` |
| `description` | Text | `Large pothole on main road` |
| `latitude` | Text | `28.6139` |
| `longitude` | Text | `77.2090` |
| `ward_id` | Text | `993dc994-ea01-4ac1-adad-a42251e2331b` |
| `image` | File | _(select any .jpg file)_ |

**Expected Response (201):** Report object with `fusion_final_category: "processing"` (AI classification pending).

> 💡 Save the returned `id` as `REPORT_ID` in your environment.

---

### 2. Get All Reports
> Scoped automatically by role (super_admin sees all; authority sees their ward; staff sees assigned).

```
GET {{BASE_URL}}/reports
```

**Optional Query Params:**
```
?ward_id=<uuid>
?assigned_staff_id=<uuid>
?status=Pending
```

---

### 3. Get Report by ID
```
GET {{BASE_URL}}/reports/{{REPORT_ID}}
```

---

### 4. Update Report Status
> Required Permission: `report:update_status`

```
PATCH {{BASE_URL}}/reports/{{REPORT_ID}}
```

**Body (JSON):**
```json
{
  "status": "In Progress",
  "assigned_staff_id": "<staff-user-uuid>"
}
```

---

### 5. Bulk Update Reports
> Required Permission: `report:bulk_update`

```
PATCH {{BASE_URL}}/reports/bulk-update
```

**Body (JSON):**
```json
{
  "ids": ["<uuid1>", "<uuid2>"],
  "status": "Resolved"
}
```

---

### 6. Delete Report
> Required Permission: `report:delete`

```
DELETE {{BASE_URL}}/reports/{{REPORT_ID}}
```

---

### 7. Get Report Stats
> Required Permission: `report:view_all`

```
GET {{BASE_URL}}/reports/stats
```

**Expected Response:**
```json
{
  "total": 120,
  "pending": 45,
  "inProgress": 30,
  "resolved": 45
}
```

---

### 8. Get GeoJSON Reports (Map)
> Required Permission: `report:view_area`

```
GET {{BASE_URL}}/reports/geojson
```

**Optional Query Params:**
```
?ward_id=<uuid>
?ulb_id=<uuid>
```

---

### 9. Get Nearby Reports
> Required Permission: `report:view_area`

```
GET {{BASE_URL}}/reports/nearby?lat=28.6139&lng=77.2090&radius=2000
```

---

### 10. Get Authority KPIs
> Required Permission: `report:view_all`

```
GET {{BASE_URL}}/reports/kpi
```

---

### 11. Propose Resolution (with Photo Proof)
> Required Permission: `report:propose_resolution`
> Use **form-data** for image upload.

```
POST {{BASE_URL}}/reports/{{REPORT_ID}}/propose-resolution
Content-Type: multipart/form-data
```

| Key | Type | Value |
|---|---|---|
| `notes` | Text | `Road repaired and surface levelled` |
| `image` | File | _(resolution proof photo)_ |

---

### 12. Confirm Resolution (Authority)
> Required Permission: `report:confirm_resolution`

```
POST {{BASE_URL}}/reports/{{REPORT_ID}}/confirm-resolution
```

**Body (JSON):**
```json
{ "notes": "Verified on-site. Work is complete." }
```

---

### 13. Reject Resolution
> Required Permission: `report:reject_resolution`

```
POST {{BASE_URL}}/reports/{{REPORT_ID}}/reject-resolution
```

**Body (JSON):**
```json
{ "notes": "Work is incomplete. Pothole still visible." }
```

---

### 14. Citizen Confirm Resolution
```
POST {{BASE_URL}}/reports/{{REPORT_ID}}/citizen-confirm
```

---

### 15. Citizen Dispute Resolution
```
POST {{BASE_URL}}/reports/{{REPORT_ID}}/citizen-dispute
```

**Body (JSON):**
```json
{ "reason": "Problem has not been fixed." }
```

---

### 16. Upvote Report
```
POST {{BASE_URL}}/reports/{{REPORT_ID}}/upvote
```

---

### 17. Get Report Audit Trail
```
GET {{BASE_URL}}/reports/{{REPORT_ID}}/audit
```

---

### 18. Ask CivicAI (Natural Language Query)
> Required Permission: `report:view_all`

```
GET {{BASE_URL}}/reports/ask?q=How many potholes were reported this month in Ward 01?
```

---

### 19. Get AI Retraining Queue
> Required Permission: `ai:manage`

```
GET {{BASE_URL}}/reports/retraining-queue
```

---

### 20. Export Retraining Data (CSV)
> Required Permission: `ai:manage`

```
GET {{BASE_URL}}/reports/retraining-queue/export
```

---

### 21. Update Feedback Status in Queue
> Required Permission: `ai:manage`

```
PATCH {{BASE_URL}}/reports/retraining-queue/{{REPORT_ID}}
```

**Body (JSON):**
```json
{ "feedback_status": "approved" }
```

---

### 22. Test Audio Prediction
> Required Permission: `report:create`

```
POST {{BASE_URL}}/reports/test-audio
Content-Type: multipart/form-data
```

| Key | Type | Value |
|---|---|---|
| `audio` | File | _(any .m4a or .wav file)_ |

---

### 23. Get Job Status (AI Processing)
```
GET {{BASE_URL}}/reports/status/{{JOB_ID}}
```

---

## 🏢 Department APIs — `/api/departments`

> 🔒 All routes require Auth token.

### 1. Get All Departments
```
GET {{BASE_URL}}/departments
```

---

### 2. Get Department by ID
```
GET {{BASE_URL}}/departments/{{DEPT_ID}}
```

---

### 3. Create Department
> Required Permission: `users:manage`

```
POST {{BASE_URL}}/departments
```

**Body (JSON):**
```json
{
  "name": "Road Safety Division",
  "head": "Suresh Gupta",
  "staff_count": 12,
  "status": "Active",
  "contact_email": "roadsafety@civicconnect.gov",
  "handled_categories": ["Road/Potholes", "Street Light"]
}
```

> 💡 Save the returned `id` as `DEPT_ID`.

---

### 4. Update Department
> Required Permission: `users:manage`

```
PATCH {{BASE_URL}}/departments/{{DEPT_ID}}
```

**Body (JSON):**
```json
{
  "head": "Vijay Kumar",
  "status": "Inactive"
}
```

---

### 5. Delete Department
> Required Permission: `users:manage`

```
DELETE {{BASE_URL}}/departments/{{DEPT_ID}}
```

---

## 🗺️ System / Jurisdictions APIs — `/api/system`

> 🔒 All routes require Auth token.

### 1. Get All Wards
```
GET {{BASE_URL}}/system/wards
```

---

### 2. Create Ward
> Required Permission: `users:manage`

```
POST {{BASE_URL}}/system/wards
```

**Body (JSON):**
```json
{
  "name": "Ward 05 - South Zone",
  "ulb_id": "<ulb-uuid>",
  "dept_id": "<dept-uuid>",
  "boundary": {
    "type": "Polygon",
    "coordinates": [
      [[77.1, 28.5], [77.3, 28.5], [77.3, 28.7], [77.1, 28.7], [77.1, 28.5]]
    ]
  }
}
```

> 💡 Save the returned `id` as `WARD_ID`.

---

### 3. Get All ULB Boundaries (Cities)
```
GET {{BASE_URL}}/system/ulb-boundaries
```

---

### 4. Create ULB (City / Municipality)
> Required Permission: `users:manage`

```
POST {{BASE_URL}}/system/ulb-boundaries
```

**Body (JSON):**
```json
{
  "name": "Pune Municipal Corporation",
  "boundary": {
    "type": "Polygon",
    "coordinates": [
      [[73.7, 18.4], [74.0, 18.4], [74.0, 18.7], [73.7, 18.7], [73.7, 18.4]]
    ]
  }
}
```

---

### 5. ⚠️ Wipe All System Data (DANGER)
> Required Permission: `users:manage` (Super Admin only)
> **Irreversible.** Deletes all reports, departments, wards, ULBs, and non-admin users.

```
POST {{BASE_URL}}/system/wipe-data
```

---

## 🔔 Notification APIs — `/api/notifications`

### 1. Get My Notifications
```
GET {{BASE_URL}}/notifications
```

---

### 2. Create Notification (Internal)
```
POST {{BASE_URL}}/notifications
```

**Body (JSON):**
```json
{
  "user_id": "<target-user-uuid>",
  "title": "Your report has been resolved",
  "body": "Ward 01 - Delhi Central: Road fixed.",
  "type": "resolution"
}
```

---

### 3. Mark Notification as Read
```
PATCH {{BASE_URL}}/notifications/<notification-id>/read
```

---

## 📊 Analytics APIs — `/api/analytics`

> Required Permission: `analytics:query` (Mayor, Councilor, Super Admin)

### 1. Query Executive Analytics (Natural Language)
```
POST {{BASE_URL}}/analytics/query
```

**Body (JSON):**
```json
{
  "question": "What are the top 3 complaint categories this month?"
}
```

---

### 2. Reindex Vector Database
> Required Permission: `ai:manage` (Super Admin only)

```
POST {{BASE_URL}}/analytics/reindex
```

---

## 📜 Audit Log APIs — `/api/audit-logs`

> Required Permission: `audit:view`

### 1. Get Audit Logs (with Filters)
```
GET {{BASE_URL}}/audit-logs
```

**Optional Query Params:**

| Param | Example | Description |
|---|---|---|
| `resource` | `issue` | Filter by resource type |
| `resource_id` | `<uuid>` | Filter by specific entity |
| `actor_id` | `<uuid>` | Filter by user who acted |
| `event_type` | `STATUS_UPDATED` | Filter by event type |
| `from` | `2026-01-01` | Start date (ISO) |
| `to` | `2026-06-30` | End date (ISO) |
| `limit` | `50` | Max records (default 100, max 500) |

**Example:**
```
GET {{BASE_URL}}/audit-logs?resource=issue&limit=20
```

---

## 📁 File Upload APIs — `/api/uploads`

### 1. Get Presigned S3 Upload URL
```
POST {{BASE_URL}}/uploads/signed-url
```

**Body (JSON):**
```json
{
  "filename": "pothole-photo.jpg",
  "fileType": "image"
}
```

**Expected Response (200):**
```json
{
  "upload_url": "https://s3.amazonaws.com/...",
  "s3_key": "raw/2026/06/26/images/<uuid>.jpg"
}
```

> Use `upload_url` to `PUT` the file directly from the client to S3.

---

## 🧪 Suggested Testing Order

Follow this order to test with real data dependencies:

```
1.  POST /auth/login              → get TOKEN
2.  GET  /users                   → verify users exist
3.  POST /users                   → create Mayor/Councilor
4.  GET  /system/ulb-boundaries   → get ULB id
5.  GET  /system/wards            → get Ward id
6.  POST /departments             → create department, get DEPT_ID
7.  POST /reports (multipart)     → create report, get REPORT_ID
8.  GET  /reports                 → verify report appears
9.  GET  /reports/stats           → verify counters
10. GET  /reports/geojson         → verify map data
11. PATCH /reports/{{REPORT_ID}}  → update status
12. POST /reports/{{REPORT_ID}}/propose-resolution
13. POST /reports/{{REPORT_ID}}/confirm-resolution
14. GET  /reports/{{REPORT_ID}}/audit  → verify audit trail
15. GET  /audit-logs              → verify global log
16. POST /analytics/query         → test AI query
17. GET  /reports/ask             → test CivicAI
18. GET  /users/leaderboard       → verify green credits
```

---

## ❌ Common Error Responses

| Status | Meaning | Fix |
|---|---|---|
| `401 Unauthorized` | Missing or expired token | Re-login, update `TOKEN` in environment |
| `403 Forbidden` | Insufficient permissions for your role | Login as Super Admin |
| `404 Not Found` | Resource UUID does not exist | Check your `REPORT_ID`, `DEPT_ID`, etc. |
| `400 Bad Request` | Missing required field | Check request body against docs above |
| `500 Internal Server Error` | Server-side crash | Check backend terminal logs |

---

## 📦 Import as Postman Collection

You can recreate all requests above as a Postman Collection. Use the structure:

```
CivicConnect API/
├── 🔐 Auth/
├── 👤 Users/
├── 📋 Reports/
├── 🏢 Departments/
├── 🗺️ System (Wards & ULBs)/
├── 🔔 Notifications/
├── 📊 Analytics/
├── 📜 Audit Logs/
└── 📁 File Uploads/
```

Set the `CivicConnect Local` environment as the active environment before running any request.
