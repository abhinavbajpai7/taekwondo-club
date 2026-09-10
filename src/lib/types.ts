export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string;
  role: UserRole;
  student_id: string | null;
  created_at: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';
export type FeeStatus = 'paid' | 'pending';

export interface Student {
  id: string;
  student_code: string; // Customizable by Admin
  password?: string; // Set by Admin for student login
  name: string;
  date_of_birth?: string | null;
  parent_name: string;
  parent_phone: string;
  address?: string | null;
  joining_date: string;
  monthly_fee: number;
  active: boolean;
  fee_status: FeeStatus; // 'paid' or 'pending'
  next_fee_due_date?: string | null; // Decided by Admin
  last_payment_mode?: PaymentMethod | null;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  marked_at: string;
  marked_by?: string | null;
}

export interface PaymentRecord {
  id: string;
  student_id: string;
  payment_date: string; // YYYY-MM-DD
  amount: number;
  payment_method: PaymentMethod;
  receipt_number?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface StudentFeeSummary {
  student: Student;
  monthlyFee: number;
  totalPaid: number;
  monthsActive: number;
  totalExpected: number;
  currentDue: number;
  feeStatus: FeeStatus;
  nextDueDate: string | null;
  lastPaymentMode: PaymentMethod | null;
  payments: PaymentRecord[];
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  presentToday: number;
  absentToday: number;
  attendancePercentageToday: number;
  feesPaidCount: number;
  feesPendingCount: number;
  averageAttendanceRate: number;
}
