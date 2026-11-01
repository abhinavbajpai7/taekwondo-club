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
} from '@/lib/utils';
import {
  CalendarCheck,
  CreditCard,
  Award,
  ChevronRight,
  User,
  Receipt,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const student = user?.student;

  const [currentStudent, setCurrentStudent] = useState(student);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [, setPayments] = useState<PaymentRecord[]>([]);
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

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Taekwondo Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {activeStudent.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Student Code: <span className="font-mono text-red-400 font-bold">{activeStudent.student_code}</span> •
            Member since {formatDate(activeStudent.joining_date)}
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
            Overall Attendance
          </span>
          <span className="text-3xl font-black text-emerald-400">{attendanceRate}%</span>
        </div>
      </div>

      {/* Featured Primary Card: Fee Status & Next Submission Due Date */}
      <div
        className={`rounded-2xl border p-5 sm:p-7 shadow-xl transition-all ${
          isPaid
            ? 'bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-800/40'
            : 'bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-900 border-red-800/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isPaid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isPaid ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Current Fee Status
              </span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isPaid
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPaid ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
                    }`}
                  />
                  {isPaid ? 'FEES PAID' : 'PAYMENT PENDING'}
                </span>
                {isPaid && activeStudent.last_payment_mode && (
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    via <strong className="text-slate-200 uppercase">{activeStudent.last_payment_mode}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/student/fees"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 shrink-0 min-h-[44px]"
          >
            <span>View All Fee Receipts</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Highlighted Fee Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Monthly Fee Amount</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(activeStudent.monthly_fee)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Standard academy subscription fee</p>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Next Submission Due Date</span>
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 truncate">
              {activeStudent.next_fee_due_date
                ? formatDate(activeStudent.next_fee_due_date)
                : 'Pending admin scheduling'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeStudent.next_fee_due_date
                ? 'Please ensure clearance on or before this date'
                : 'Date will be set by the Head Instructor'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards to Dedicated Detail Pages */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Personal Portals & Records
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Attendance Register */}
          <Link
            href="/student/attendance"
            className="group bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition">
                  Attendance Register
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  View your complete class attendance history, monthly filters, and consistency score.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-semibold text-red-400">
              <span>{presentCount} sessions attended</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Fee Details & Receipts */}
          <Link
            href="/student/fees"
            className="group bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition">
                  Fee Details & Receipts
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Inspect past transaction receipts, payment modes, receipt numbers, and status.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-semibold text-red-400">
              <span>View full receipt ledger</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Profile & Password */}
          <Link
            href="/student/profile"
            className="group bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition">
                  Profile & Password
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Update your contact details, parent info, address, and student login password.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-semibold text-red-400">
              <span>Edit profile details</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
