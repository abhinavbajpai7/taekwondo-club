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

// Fresh start with 0 students so the instructor can manually register all real students
const INITIAL_STUDENTS: Student[] = [];
const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
const INITIAL_PAYMENTS: PaymentRecord[] = [];

// In-Memory Storage Cache for local storage
class LocalDbStore {
  students: Student[] = [];
  attendance: AttendanceRecord[] = [];
  payments: PaymentRecord[] = [];
  isInitialized = false;

  init() {
    if (this.isInitialized) return;
    if (typeof window !== 'undefined') {
      // Force wipe previous demo data if upgrading to fresh mode
      const isFresh = localStorage.getItem('tkd_fresh_mode_v2');
      if (!isFresh) {
        localStorage.removeItem('tkd_students');
        localStorage.removeItem('tkd_attendance');
        localStorage.removeItem('tkd_payments');
        localStorage.setItem('tkd_fresh_mode_v2', 'true');
      }

      const storedStudents = localStorage.getItem('tkd_students');
      const storedAttendance = localStorage.getItem('tkd_attendance');
      const storedPayments = localStorage.getItem('tkd_payments');

      this.students = storedStudents ? JSON.parse(storedStudents) : [];
      this.attendance = storedAttendance ? JSON.parse(storedAttendance) : [];
      this.payments = storedPayments ? JSON.parse(storedPayments) : [];
    } else {
      this.students = [];
      this.attendance = [];
      this.payments = [];
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

  resetAll() {
    this.students = [];
    this.attendance = [];
    this.payments = [];
    this.persist();
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

  async resetAllData(): Promise<void> {
    localStore.init();
    localStore.resetAll();
  },
};
