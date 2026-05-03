# Lab 12: Testing, Debugging & QA Report - StitchCraft

**Student Name:** [Your Name]  
**Roll No:** [Your Roll No]  
**Date:** April 4, 2026

---

## 1. Test Case Document (STEP 1 & 2)

| TC ID | Scenario | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | User Login | 1. Open App<br>2. Enter Email & Password<br>3. Click "Login" | Navigate to Dashboard showing tailor's profile. | User logged in successfully. | **Pass** |
| **TC02** | Create Khata Entry | 1. Go to Khata<br>2. Click "Add Entry"<br>3. Fill details<br>4. Click "Save" | New entry should appear in the list immediately. | Entry added to local DB. | **Pass** |
| **TC03** | API Fetching | 1. Open Posts screen<br>2. Wait for loading | List of posts from JSONPlaceholder should be displayed. | Posts visible in ListView. | **Pass** |
| **TC04** | Image Upload | 1. Open Design Studio<br>2. Click "Gallery"<br>3. Select an image | Selected image should show in the preview horizontal list. | Image preview visible. | **Pass** |
| **TC05** | QR Scan | 1. Open Smart Tools<br>2. Click "Start Scan"<br>3. Point at QR code | Scanned result should be displayed under the scanner. | "Result: XYZ" showed. | **Pass** |
| **TC06** | Scheduled Notify | 1. Set notification timer<br>2. Wait 10 seconds | Notification banner appears on device top. | Received alert "Design Ready!" | **Pass** |
| **TC07** | Delete Order | 1. Swipe left on an order<br>2. Confirm deletion | Order is removed from UI and Firestore. | Order deleted. | **Pass** |
| **TC08** | Navigation | 1. Click "Lab 11" from Dashboard drawer | Screen with Charts and Scanner opens without delay. | Navigated smoothly. | **Pass** |
| **TC09** | UI Consistency | 1. Rotate device to landscape | Layout should adapt without pixel overflows. | Flowed correctly. | **Pass** |
| **TC10** | Session Check | 1. Lock app<br>2. Reopen after 30 mins | App stays logged in (Token persistency). | Dashboard appeared. | **Pass** |

---

## 2. Bug Report Table (STEP 5 & 6)

| Bug ID | Description | Steps to Reproduce | Severity | Fix Status |
| :--- | :--- | :--- | :--- | :--- |
| **BG01** | Crash on Image Pick | 1. Revoke camera permission<br>2. Click "Camera" in app | **High** | **Resolved** (Added Permission check & Try-Catch) |
| **BG02** | Infinite Loader | 1. Disable Internet<br>2. Open API Screen | **Medium** | **Resolved** (Added Timeout and Error Widget) |
| **BG03** | UI Overflow | 1. Use 4-inch display<br>2. Open Analytics screen | **Low** | **Resolved** (Wrapped charts in `Flexible`/`FittedBox`) |
| **BG04** | Memory Leak | 1. Open Scanner screen<br>2. Go back repeatedly | **High** | **Resolved** (Controller manually disposed in `dispose()`) |
| **BG05** | Null Error | 1. Open Empty Khata for first time | **Medium** | **Resolved** (Added null check for empty list empty state) |

---

## 3. QA Summary
The StitchCraft application underwent rigorous functional and UI testing. Major bugs related to hardware permissions and network failures were identified and resolved using robust error-handling mechanisms. The app now maintains stability across different device states.
