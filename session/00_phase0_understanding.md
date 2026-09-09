# Phase 0: Understanding the App & System Architecture

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Goal & Requirements
The goal is to build a Progressive Web App (PWA) for a personal Taekwondo club with two distinct user personas:

### User Role 1: Club Admin (Teacher / Master)
- Access: Full access (`/admin`)
- Responsibilities:
  - Register new students with automatic student code generation (`STU001`, `STU002`...).
  - Edit student details or deactivate students (preserving records, no destructive deletion).
  - Daily attendance register: Select any date, quickly toggle Present [P] / Absent [A] with large touch-friendly buttons, and save safely.
  - Record fee payments (Amount, Date, Method: Cash/UPI/Bank, Receipt number, Notes).
  - View club statistics: Total active students, attendance counts today, fees collected vs due, average attendance rate.
  - Export data (CSV) for safe backups.

### User Role 2: Student (Member)
- Access: Read-only personal view (`/student`)
- Restrictions:
  - Can only view their own attendance history, percentage, and fee balance/receipts.
  - Cannot mark attendance or edit fee records.
  - Cannot view any other student's data.

---

## 2. Core Architectural Principles
1. **Single Source of Truth**: Student identity and contact information are entered and stored once in the `students` table.
2. **Normalized Relationships**:
   - One Student $\rightarrow$ Many Attendance records (unique constraint on `student_id + attendance_date`).
   - One Student $\rightarrow$ Many Payment records.
3. **Defense-in-Depth Security**:
   - Supabase Auth handles identity.
   - Postgres Row Level Security (RLS) ensures students can never query other students' rows, even if frontend requests are tampered with.
4. **Resilient Data Layer**:
   - Works natively with Supabase PostgreSQL & Auth.
   - Includes local storage / in-memory demo provider for zero-friction local development when API keys are not yet configured.
