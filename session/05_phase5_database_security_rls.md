# Phase 5: Database Security & Row Level Security (RLS)

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Security Philosophy
Security is enforced at the database level using PostgreSQL Row Level Security (RLS). Relying solely on client-side UI visibility or button toggles is insecure; RLS ensures that even if a student inspects network calls or attempts manual SQL/API requests, the database refuses to yield other students' data or modify attendance.

## 2. Row Level Security Policies Enforced

### Helper Security Definer Functions
- `is_admin()`: Returns `true` only if the authenticated user's ID exists in `profiles` with `role = 'admin'`.
- `get_auth_student_id()`: Returns the linked `student_id` for the authenticated student.

### Policy Rules Matrix

| Table | Operation | Admin Access | Student Access |
|---|---|:---:|:---:|
| `profiles` | SELECT | All profiles | Own profile only (`auth.uid() = id`) |
| `profiles` | INSERT / UPDATE | Allowed | Denied |
| `students` | SELECT | All students | Own record only (`id = get_auth_student_id()`) |
| `students` | INSERT / UPDATE / DELETE | Allowed | Denied |
| `attendance`| SELECT | All records | Own records only (`student_id = get_auth_student_id()`) |
| `attendance`| INSERT / UPDATE / DELETE | Allowed | **Strictly Denied** |
| `payments`  | SELECT | All records | Own records only (`student_id = get_auth_student_id()`) |
| `payments`  | INSERT / UPDATE / DELETE | Allowed | **Strictly Denied** |

## 3. Verification
These policies guarantee that students cannot:
1. Mark themselves or others present/absent.
2. Edit their own or any other attendance history.
3. Forge fee payment entries.
4. Access addresses, phone numbers, or records of fellow club members.
