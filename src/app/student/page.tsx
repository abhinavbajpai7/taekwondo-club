'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { AttendanceRecord, PaymentRecord } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  calculateAttendancePercentage,
  calculateFeeSummary,
} from '@/lib/utils';
import {
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Award,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Receipt,
  Sparkles,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const student = user?.student;

  const [currentStudent, setCurrentStudent] = useState(student);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    const [freshStudent, att, pays] = await Promise.all([
      db.getStudentById(student.id),
      db.getAttendanceForStudent(student.id),
      db.getPaymentsForStudent(student.id),
    ]);
    if (freshStudent) setCurrentStudent(freshStudent);
    setAttendance(att);
    setPayments(pays);
    setLoading(false);
  }, [student]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!student) {
    return (
      <div className="py-16 text-center text-slate-400">
        Please sign in with your student code to view your personal portal.
      </div>
    );
  }

  const activeStudent = currentStudent || student;
  const isPaid = activeStudent.fee_status === 'paid';
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const totalSessions = attendance.length;
  const attendanceRate = calculateAttendancePercentage(presentCount, totalSessions);
  const feeSummary = calculateFeeSummary(activeStudent, payments);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Taekwondo Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {student.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Student Code: <span className="font-mono text-red-400 font-bold">{student.student_code}</span> •
            Member since {formatDate(student.joining_date)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
            Overall Attendance Rate
          </span>
          <span className="text-3xl font-black text-emerald-400">{attendanceRate}%</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            Classes Attended
          </span>
          <div className="text-2xl font-bold text-white">{presentCount}</div>
          <p className="text-[10px] text-slate-500">Out of {totalSessions} sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            Missed Classes
          </span>
          <div className="text-2xl font-bold text-white">{absentCount}</div>
          <p className="text-[10px] text-slate-500">Absent days</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            Fee Amount
          </span>
          <div className="text-2xl font-bold text-white">{formatCurrency(activeStudent.monthly_fee)}</div>
          <p className="text-[10px] text-slate-500">Scheduled fee</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 mb-1 block">Fee Status</span>
          <div className="mt-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isPaid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isPaid ? 'Fees Paid' : 'Fee Pending'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {activeStudent.next_fee_due_date
              ? `Next Due: ${formatDate(activeStudent.next_fee_due_date)}`
              : 'Next date decided by admin'}
          </p>
        </div>
      </div>

      {/* Fee Status & Next Submission Deadline Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
          isPaid
            ? 'bg-emerald-950/30 border-emerald-800/40'
            : 'bg-red-950/30 border-red-800/40'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Fee Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPaid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {isPaid ? 'PAID' : 'PENDING'}
              </span>
              {isPaid && activeStudent.last_payment_mode && (
                <span className="text-[11px] text-slate-400">
                  via <strong className="text-slate-200 uppercase">{activeStudent.last_payment_mode}</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1.5">
              Fee Amount: <strong className="text-white font-extrabold">{formatCurrency(activeStudent.monthly_fee)}</strong>
              {' • '}
              Next Submission Due Date:{' '}
              <strong className="text-amber-400 font-extrabold">
                {activeStudent.next_fee_due_date
                  ? formatDate(activeStudent.next_fee_due_date)
                  : 'To be assigned by instructor'}
              </strong>
            </p>
          </div>
        </div>

        <Link
          href="/student/fees"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shrink-0 text-center border border-slate-700 shadow-sm"
        >
          View Fee Details & Receipts
        </Link>
      </div>

      {/* Two Column Layout: Recent Attendance & Fee History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-red-500" />
              <span>Recent Class Attendance</span>
            </h3>
            <Link
              href="/student/attendance"
              className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <span>Full History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {attendance.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No attendance records logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {attendance.slice(0, 5).map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {att.status === 'present' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-xs font-medium text-white">
                      {formatDate(att.attendance_date, {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      att.status === 'present'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {att.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Recent Payments & Receipts</span>
            </h3>
            <Link
              href="/student/fees"
              className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {payments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No payments recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {payments.slice(0, 5).map((pay) => (
                <div key={pay.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {formatDate(pay.payment_date)}
                      </span>
                      {pay.receipt_number && (
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {pay.receipt_number}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 capitalize">
                      Method: {pay.payment_method.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="font-bold text-sm text-emerald-400">
                    +{formatCurrency(pay.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
