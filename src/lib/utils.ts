import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Student, PaymentRecord, StudentFeeSummary } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat('en-IN', options || defaultOptions).format(date);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateAttendancePercentage(present: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((present / total) * 10000) / 100;
}

export function calculateFeeSummary(student: Student, payments: PaymentRecord[]): StudentFeeSummary {
  const studentPayments = payments.filter((p) => p.student_id === student.id);
  const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Calculate months active from joining date to today
  const joinDate = new Date(student.joining_date + 'T00:00:00');
  const today = new Date();

  let monthsActive = 1;
  if (!isNaN(joinDate.getTime())) {
    const diffYears = today.getFullYear() - joinDate.getFullYear();
    const diffMonths = today.getMonth() - joinDate.getMonth();
    monthsActive = Math.max(1, diffYears * 12 + diffMonths + 1);
  }

  const monthlyFee = Number(student.monthly_fee) || 0;
  const totalExpected = monthlyFee * monthsActive;
  const currentDue = Math.max(0, totalExpected - totalPaid);

  return {
    student,
    monthlyFee,
    totalPaid,
    monthsActive,
    totalExpected,
    currentDue,
    feeStatus: student.fee_status || (currentDue > 0 ? 'pending' : 'paid'),
    nextDueDate: student.next_fee_due_date || addDays(getTodayDateString(), 30),
    lastPaymentMode: student.last_payment_mode || (studentPayments[0]?.payment_method ?? null),
    payments: studentPayments.sort((a, b) => (b.payment_date > a.payment_date ? 1 : -1)),
  };
}

export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          if (val === null || val === undefined) return '""';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
