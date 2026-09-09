# Phase 11: Fee Tracking & Payment Ledger

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Relational Fee Model
In accordance with the roadmap, the application avoids storing "amount paid" as an un-auditable scalar column. Instead, every financial transaction is entered into the `payments` table with:
- `student_id`: Linked foreign key
- `payment_date`: Date of payment
- `amount`: Exact currency value paid
- `payment_method`: `'cash'`, `'upi'`, `'bank_transfer'`, `'other'`
- `receipt_number`: Optional voucher/receipt identifier
- `notes`: Specific notes (e.g. "Partial September fee", "Exam registration fee")

## 2. Dynamic Fee Calculation
The balance calculation engine computes:
$$\text{Months Active} = \max(1, (\text{Current Year} - \text{Join Year}) \times 12 + (\text{Current Month} - \text{Join Month}) + 1)$$
$$\text{Total Expected} = \text{Monthly Fee} \times \text{Months Active}$$
$$\text{Current Due} = \max(0, \text{Total Expected} - \sum \text{Payments})$$

## 3. Instructor Workflow
1. **At-a-Glance Overview**: Live cards display Total Fees Collected, Total Dues Pending, and Total Active Paying Members.
2. **Actionable Dues Filter**: Instantly isolates members with unpaid balances.
3. **One-Tap Payment Entry**: Tapping "Record Payment" pre-fills the student's expected due amount, date, and suggested receipt ID.
4. **Ledger Audit Trail**: Complete historical transaction log with date, student code, payment method, and receipts.
