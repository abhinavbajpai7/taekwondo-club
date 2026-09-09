# Phase 4: Design the Database (Schema & Tables)

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Relational Schema Design
We authored the primary migration file at `supabase/migrations/001_initial_schema.sql`.

### Core Principle
Student details are captured and stored **once** in the `students` table. Attendance and payments are child records referencing `students(id)` by foreign key.

```
       auth.users
           │ (1:1)
           ▼
        profiles
           │ (N:1, role: student)
           ▼
        students
        ├──< attendance (1:N, unique per student_id + attendance_date)
        └──< payments   (1:N)
```

### Table Definitions

#### 1. `profiles`
- `id`: UUID (FK to `auth.users(id)` ON DELETE CASCADE)
- `role`: TEXT (`'admin'` or `'student'`)
- `student_id`: UUID (FK to `students(id)` ON DELETE SET NULL, nullable)
- `created_at`: TIMESTAMPTZ

#### 2. `students`
- `id`: UUID (Primary Key, `gen_random_uuid()`)
- `student_code`: TEXT (Unique, auto-generated e.g. `STU001`, `STU002`)
- `name`: TEXT NOT NULL
- `date_of_birth`: DATE
- `parent_name`: TEXT NOT NULL
- `parent_phone`: TEXT NOT NULL
- `address`: TEXT
- `joining_date`: DATE DEFAULT CURRENT_DATE
- `monthly_fee`: NUMERIC(10,2) DEFAULT 1000
- `active`: BOOLEAN DEFAULT TRUE (used for soft-deactivation to preserve historical records)
- `created_at`, `updated_at`: TIMESTAMPTZ

#### 3. `attendance`
- `id`: UUID (Primary Key)
- `student_id`: UUID (FK to `students(id)` ON DELETE CASCADE)
- `attendance_date`: DATE NOT NULL
- `status`: TEXT (`'present'` or `'absent'`)
- `marked_at`: TIMESTAMPTZ
- `marked_by`: UUID (FK to `auth.users(id)`)
- **Constraint**: `CONSTRAINT unique_student_attendance_date UNIQUE (student_id, attendance_date)`
  - *Prevents duplicate attendance records for the same student on the same calendar day.*

#### 4. `payments`
- `id`: UUID (Primary Key)
- `student_id`: UUID (FK to `students(id)` ON DELETE CASCADE)
- `payment_date`: DATE NOT NULL DEFAULT CURRENT_DATE
- `amount`: NUMERIC(10,2) NOT NULL CHECK (amount > 0)
- `payment_method`: TEXT (`'cash'`, `'upi'`, `'bank_transfer'`, `'other'`)
- `receipt_number`: TEXT (Optional)
- `notes`: TEXT (Optional)
- `created_at`: TIMESTAMPTZ

## 2. Automated Triggers & Procedures
1. `generate_student_code()`: Automatically generates codes with sequential padding (`STU001`, `STU002`) before insert.
2. `handle_updated_at()`: Keeps `students.updated_at` synced with UTC timestamp on updates.
