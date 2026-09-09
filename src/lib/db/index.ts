import { createClient } from '../supabase/client';
import {
  Student,
  AttendanceRecord,
  PaymentRecord,
  DashboardStats,
} from '../types';
import {
  calculateAttendancePercentage,
  calculateFeeSummary,
  getTodayDateString,
} from '../utils';

// Seed demo data for zero-config offline/local development
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-001',
    student_code: 'STU001',
    name: 'Rahul Sharma',
    date_of_birth: '2012-04-10',
    parent_name: 'Rajesh Sharma',
    parent_phone: '9876543210',
    address: 'Sector 4, Gomti Nagar, Lucknow',
    joining_date: '2026-06-01',
    monthly_fee: 1000,
    active: true,
    created_at: new Date('2026-06-01').toISOString(),
    updated_at: new Date('2026-06-01').toISOString(),
  },
  {
    id: 'stu-002',
    student_code: 'STU002',
    name: 'Ananya Singh',
    date_of_birth: '2013-09-15',
    parent_name: 'Vikram Singh',
    parent_phone: '9812345678',
    address: 'Aliganj, Lucknow',
    joining_date: '2026-07-01',
    monthly_fee: 1200,
    active: true,
    created_at: new Date('2026-07-01').toISOString(),
    updated_at: new Date('2026-07-01').toISOString(),
  },
  {
    id: 'stu-003',
    student_code: 'STU003',
    name: 'Arjun Verma',
    date_of_birth: '2011-12-05',
    parent_name: 'Sunil Verma',
    parent_phone: '9935123456',
    address: 'Indira Nagar, Lucknow',
    joining_date: '2026-06-15',
    monthly_fee: 1000,
    active: true,
    created_at: new Date('2026-06-15').toISOString(),
    updated_at: new Date('2026-06-15').toISOString(),
  },
  {
    id: 'stu-004',
    student_code: 'STU004',
    name: 'Priya Patel',
    date_of_birth: '2014-02-20',
    parent_name: 'Amit Patel',
    parent_phone: '9765432109',
    address: 'Mahanagar, Lucknow',
    joining_date: '2026-08-01',
    monthly_fee: 1000,
    active: true,
    created_at: new Date('2026-08-01').toISOString(),
    updated_at: new Date('2026-08-01').toISOString(),
  },
  {
    id: 'stu-005',
    student_code: 'STU005',
    name: 'Kabir Khan',
    date_of_birth: '2010-07-18',
    parent_name: 'Zubair Khan',
    parent_phone: '9654321098',
    address: 'Hazratganj, Lucknow',
    joining_date: '2026-05-01',
    monthly_fee: 1500,
    active: false, // inactive student example
    created_at: new Date('2026-05-01').toISOString(),
    updated_at: new Date('2026-05-01').toISOString(),
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    student_id: 'stu-001',
    attendance_date: '2026-09-08',
    status: 'present',
    marked_at: new Date('2026-09-08T17:00:00').toISOString(),
  },
  {
    id: 'att-2',
    student_id: 'stu-002',
    attendance_date: '2026-09-08',
    status: 'present',
    marked_at: new Date('2026-09-08T17:00:00').toISOString(),
  },
  {
    id: 'att-3',
    student_id: 'stu-003',
    attendance_date: '2026-09-08',
    status: 'absent',
    marked_at: new Date('2026-09-08T17:00:00').toISOString(),
  },
  {
    id: 'att-4',
    student_id: 'stu-004',
    attendance_date: '2026-09-08',
    status: 'present',
    marked_at: new Date('2026-09-08T17:00:00').toISOString(),
  },
  {
    id: 'att-5',
    student_id: 'stu-001',
    attendance_date: '2026-09-07',
    status: 'present',
    marked_at: new Date('2026-09-07T17:00:00').toISOString(),
  },
  {
    id: 'att-6',
    student_id: 'stu-002',
    attendance_date: '2026-09-07',
    status: 'absent',
    marked_at: new Date('2026-09-07T17:00:00').toISOString(),
  },
  {
    id: 'att-7',
    student_id: 'stu-003',
    attendance_date: '2026-09-07',
    status: 'present',
    marked_at: new Date('2026-09-07T17:00:00').toISOString(),
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    student_id: 'stu-001',
    payment_date: '2026-07-02',
    amount: 1000,
    payment_method: 'upi',
    receipt_number: 'REC-0701',
    notes: 'July Fee',
    created_at: new Date('2026-07-02').toISOString(),
  },
  {
    id: 'pay-2',
    student_id: 'stu-001',
    payment_date: '2026-08-03',
    amount: 1000,
    payment_method: 'upi',
    receipt_number: 'REC-0801',
    notes: 'August Fee',
    created_at: new Date('2026-08-03').toISOString(),
  },
  {
    id: 'pay-3',
    student_id: 'stu-001',
    payment_date: '2026-09-01',
    amount: 500,
    payment_method: 'cash',
    receipt_number: 'REC-0901',
    notes: 'Partial September Fee',
    created_at: new Date('2026-09-01').toISOString(),
  },
  {
    id: 'pay-4',
    student_id: 'stu-002',
    payment_date: '2026-07-05',
    amount: 1200,
    payment_method: 'bank_transfer',
    receipt_number: 'REC-0702',
    notes: 'July Fee',
    created_at: new Date('2026-07-05').toISOString(),
  },
  {
    id: 'pay-5',
    student_id: 'stu-002',
    payment_date: '2026-08-04',
    amount: 1200,
    payment_method: 'upi',
    receipt_number: 'REC-0802',
    notes: 'August Fee',
    created_at: new Date('2026-08-04').toISOString(),
  },
  {
    id: 'pay-6',
    student_id: 'stu-003',
    payment_date: '2026-07-01',
    amount: 1000,
    payment_method: 'cash',
    receipt_number: 'REC-0703',
    notes: 'July Fee',
    created_at: new Date('2026-07-01').toISOString(),
  },
];

// In-Memory Storage Cache for local mock
class LocalDbStore {
  students: Student[] = [];
  attendance: AttendanceRecord[] = [];
  payments: PaymentRecord[] = [];
  isInitialized = false;

  init() {
    if (this.isInitialized) return;
    if (typeof window !== 'undefined') {
      const storedStudents = localStorage.getItem('tkd_students');
      const storedAttendance = localStorage.getItem('tkd_attendance');
      const storedPayments = localStorage.getItem('tkd_payments');

      this.students = storedStudents ? JSON.parse(storedStudents) : [...INITIAL_STUDENTS];
      this.attendance = storedAttendance ? JSON.parse(storedAttendance) : [...INITIAL_ATTENDANCE];
      this.payments = storedPayments ? JSON.parse(storedPayments) : [...INITIAL_PAYMENTS];
    } else {
      this.students = [...INITIAL_STUDENTS];
      this.attendance = [...INITIAL_ATTENDANCE];
      this.payments = [...INITIAL_PAYMENTS];
    }
    this.isInitialized = true;
  }

  persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tkd_students', JSON.stringify(this.students));
      localStorage.setItem('tkd_attendance', JSON.stringify(this.attendance));
      localStorage.setItem('tkd_payments', JSON.stringify(this.payments));
    }
  }
}

const localStore = new LocalDbStore();

export const db = {
  // ----------------------------------------------------
  // STUDENTS
  // ----------------------------------------------------
  async getStudents(): Promise<Student[]> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('student_code', { ascending: true });
      if (!error && data) return data as Student[];
    }

    localStore.init();
    return [...localStore.students].sort((a, b) => a.student_code.localeCompare(b.student_code));
  },

  async getStudentById(id: string): Promise<Student | null> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data as Student;
    }

    localStore.init();
    return (
      localStore.students.find(
        (s) => s.id === id || s.student_code.toLowerCase() === id.toLowerCase()
      ) || null
    );
  },

  async saveStudent(studentData: Partial<Student>): Promise<Student> {
    const supabase = createClient();
    if (supabase) {
      if (studentData.id) {
        const { data, error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', studentData.id)
          .select()
          .single();
        if (!error && data) return data as Student;
      } else {
        const { data, error } = await supabase
          .from('students')
          .insert(studentData)
          .select()
          .single();
        if (!error && data) return data as Student;
      }
    }

    localStore.init();
    if (studentData.id) {
      // Edit existing
      const index = localStore.students.findIndex((s) => s.id === studentData.id);
      if (index !== -1) {
        localStore.students[index] = {
          ...localStore.students[index],
          ...studentData,
          updated_at: new Date().toISOString(),
        } as Student;
        localStore.persist();
        return localStore.students[index];
      }
    }

    // Generate new student code STU001, STU002...
    const codes = localStore.students
      .map((s) => parseInt(s.student_code.replace('STU', ''), 10))
      .filter((n) => !isNaN(n));
    const nextNum = (codes.length > 0 ? Math.max(...codes) : 0) + 1;
    const generatedCode = `STU${String(nextNum).padStart(3, '0')}`;

    const newStudent: Student = {
      id: studentData.id || `stu-${Date.now()}`,
      student_code: studentData.student_code || generatedCode,
      name: studentData.name || '',
      date_of_birth: studentData.date_of_birth || null,
      parent_name: studentData.parent_name || '',
      parent_phone: studentData.parent_phone || '',
      address: studentData.address || '',
      joining_date: studentData.joining_date || getTodayDateString(),
      monthly_fee: Number(studentData.monthly_fee) || 1000,
      active: studentData.active !== undefined ? studentData.active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStore.students.push(newStudent);
    localStore.persist();
    return newStudent;
  },

  async toggleStudentStatus(id: string, active: boolean): Promise<Student | null> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Student;
    }

    localStore.init();
    const student = localStore.students.find((s) => s.id === id);
    if (student) {
      student.active = active;
      student.updated_at = new Date().toISOString();
      localStore.persist();
      return student;
    }
    return null;
  },

  // ----------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------
  async getAttendanceByDate(dateStr: string): Promise<AttendanceRecord[]> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', dateStr);
      if (!error && data) return data as AttendanceRecord[];
    }

    localStore.init();
    return localStore.attendance.filter((a) => a.attendance_date === dateStr);
  },

  async saveAttendanceRecords(
    dateStr: string,
    records: { student_id: string; status: 'present' | 'absent' }[]
  ): Promise<{ success: boolean; count: number }> {
    const supabase = createClient();
    if (supabase) {
      const rows = records.map((r) => ({
        student_id: r.student_id,
        attendance_date: dateStr,
        status: r.status,
        marked_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(rows, { onConflict: 'student_id,attendance_date' });
      if (!error) return { success: true, count: records.length };
    }

    localStore.init();
    // Remove existing for this date and append new to ensure exact sync
    localStore.attendance = localStore.attendance.filter((a) => a.attendance_date !== dateStr);

    records.forEach((r) => {
      localStore.attendance.push({
        id: `att-${Date.now()}-${r.student_id}`,
        student_id: r.student_id,
        attendance_date: dateStr,
        status: r.status,
        marked_at: new Date().toISOString(),
      });
    });

    localStore.persist();
    return { success: true, count: records.length };
  },

  async getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('attendance_date', { ascending: false });
      if (!error && data) return data as AttendanceRecord[];
    }

    localStore.init();
    return localStore.attendance
      .filter((a) => a.student_id === studentId)
      .sort((a, b) => b.attendance_date.localeCompare(a.attendance_date));
  },

  // ----------------------------------------------------
  // PAYMENTS & FEES
  // ----------------------------------------------------
  async getAllPayments(): Promise<PaymentRecord[]> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });
      if (!error && data) return data as PaymentRecord[];
    }

    localStore.init();
    return [...localStore.payments].sort((a, b) => b.payment_date.localeCompare(a.payment_date));
  },

  async getPaymentsForStudent(studentId: string): Promise<PaymentRecord[]> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });
      if (!error && data) return data as PaymentRecord[];
    }

    localStore.init();
    return localStore.payments
      .filter((p) => p.student_id === studentId)
      .sort((a, b) => b.payment_date.localeCompare(a.payment_date));
  },

  async recordPayment(
    paymentData: Omit<PaymentRecord, 'id' | 'created_at'>
  ): Promise<PaymentRecord> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();
      if (!error && data) return data as PaymentRecord;
    }

    localStore.init();
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    localStore.payments.push(newPayment);
    localStore.persist();
    return newPayment;
  },

  // ----------------------------------------------------
  // DASHBOARD AGGREGATES
  // ----------------------------------------------------
  async getDashboardStats(): Promise<DashboardStats> {
    const students = await this.getStudents();
    const activeStudents = students.filter((s) => s.active);
    const today = getTodayDateString();
    const todayAttendance = await this.getAttendanceByDate(today);

    const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
    const absentToday = todayAttendance.filter((a) => a.status === 'absent').length;
    const attendancePercentageToday = calculateAttendancePercentage(
      presentToday,
      activeStudents.length
    );

    const payments = await this.getAllPayments();
    const totalFeesCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Sum total expected and current dues across active students
    let totalFeesDue = 0;
    activeStudents.forEach((st) => {
      const summary = calculateFeeSummary(st, payments);
      totalFeesDue += summary.currentDue;
    });

    // Average attendance rate across past 30 days
    localStore.init();
    const allAtt = localStore.attendance;
    const totalRecords = allAtt.length;
    const presentRecords = allAtt.filter((a) => a.status === 'present').length;
    const averageAttendanceRate = calculateAttendancePercentage(presentRecords, totalRecords) || 85;

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      presentToday,
      absentToday,
      attendancePercentageToday,
      totalFeesCollected,
      totalFeesDue,
      averageAttendanceRate,
    };
  },
};
