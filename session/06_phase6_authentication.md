# Phase 6: Authentication & Role-Based Access Control

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Authentication Architecture
We implemented a dual-login strategy tailored specifically for martial arts clubs:
1. **Club Admin / Instructor**:
   - Authenticates via email and password (`admin@tkd.com`).
   - Grants full access to `/admin` routes.
2. **Students / Parents**:
   - Authenticates via unique Student Code (`STU001`, `STU002`...).
   - Frictionless for young students and parents who do not need to memorize passwords.
   - Tied directly to their student ID record in the database.
   - Grants read-only access to `/student` routes.

## 2. Route Protection & Security
1. Unauthenticated users attempting to access `/admin` or `/student` are routed directly to `/login`.
2. Students attempting to manually visit `/admin` routes are bounced back to `/student`.
3. Passwords are never stored in the plaintext `students` table.
4. Logging out securely clears the session and returns the user to the login screen.
