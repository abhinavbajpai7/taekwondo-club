# Phase 9: Build the Daily Date-Wise Attendance Register

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Core Feature Specification
The Attendance Register is the heart of daily club operations, accessible at `/admin/attendance`.

### Architectural Rules Enforced:
1. **Date Isolation**: Attendance is strictly keyed by `attendance_date`. Saving attendance for `2026-09-10` updates only records for September 10th and does not touch or overwrite September 9th.
2. **Active Student Roster**: Only currently active students are loaded into the register. Deactivated students are automatically excluded to keep the list clean and fast.
3. **Date Navigation**:
   - `< Prev Day` and `Next Day >` buttons for quick day-to-day flipping.
   - HTML5 date picker for jumping directly to any past or future training date.
   - `Today` shortcut button for instant jump.
4. **Fast Touch Controls**:
   - Large, ergonomic **Present [P]** (Emerald) and **Absent [A]** (Red) toggle buttons designed for mobile thumbs.
   - **Mark All Present** utility for fast one-tap batch initialization during busy dojang classes.
   - Live visual counter of Present, Absent, and Unmarked students.
