# Password Update Implementation Plan

Currently, the backend does not have an endpoint to update user passwords. I will implement a `changePassword` endpoint that leverages Supabase Auth to securely update the password for the authenticated user.

## Proposed Changes

### [Backend]

#### [MODIFY] [authController.ts](file:///d:/Projects/CivicConnect/backend/src/controllers/authController.ts)
- Add `changePassword` controller function.
- It will expect `newPassword` in the request body.
- It will use the JWT from the request (attached by `verifySupabaseToken`) to call `supabase.auth.updateUser`.

#### [MODIFY] [authRoutes.ts](file:///d:/Projects/CivicConnect/backend/src/routes/authRoutes.ts)
- Import `verifySupabaseToken` middleware.
- Add `router.post('/change-password', verifySupabaseToken, changePassword)`.

## Postman Testing Steps

Once implemented, you can test it with these steps:

### 1. Login to get a Token
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "old_password"
  }
  ```
- **Action**: Copy the `token` from the response.

### 2. Update Password
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/change-password`
- **Headers**:
  - `Authorization`: `Bearer <PASTE_YOUR_TOKEN_HERE>`
  - `Content-Type`: `application/json`
- **Body** (JSON):
  ```json
  {
    "newPassword": "new_secure_password"
  }
  ```
- **Action**: Send the request. You should receive a `200 OK` with a success message.

### 3. Verify with New Password
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "new_secure_password"
  }
  ```
- **Action**: Check if login is successful.
