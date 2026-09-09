# Phase 17: Validation, Error Handling & User Feedback

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Input Validation Rules
1. **Student Registration**:
   - `name`: Required non-empty string.
   - `parent_name`: Required non-empty string.
   - `parent_phone`: Required contact string (compatible with standard 10-digit mobile numbers and country codes).
   - `monthly_fee`: Enforced non-negative number (`>= 0`).
2. **Attendance Register**:
   - `attendance_date`: Mandatory ISO YYYY-MM-DD date.
   - `status`: Strictly constrained to `'present'` or `'absent'`.
   - Prevent duplicate entries via PostgreSQL unique constraint `(student_id, attendance_date)`.
3. **Fee Payments**:
   - `amount`: Strictly positive number (`amount > 0`).
   - `payment_date`: Required valid date string.
   - `payment_method`: Checked against permitted set (`'cash'`, `'upi'`, `'bank_transfer'`, `'other'`).

## 2. Feedback Mechanisms
- **Confirmation Prompts**: Confirmation modal before committing batch attendance writes.
- **Unsaved Changes Alerts**: Pulsing badge when attendance marks have been altered but not yet saved to disk/cloud.
- **Visual Status Banners**: Non-intrusive dismissible banners for success notifications and actionable error explanations.
- **Empty States**: Helpful instructional messages when lists or ledgers have no matching search results.
