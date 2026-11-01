'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, DashboardStats } from '@/lib/types';
import {
  formatDate,
  getTodayDateString,
} from '@/lib/utils';
import {
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  UserPlus,
  PlusCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayMarked, setTodayMarked] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const [st, stus, todayAtt] = await Promise.all([
      db.getDashboardStats(),
      db.getStudents(),
      db.getAttendanceByDate(getTodayDateString()),
    ]);

    setStats(st);
    setStudents(stus);
    setTodayMarked(todayAtt.length > 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Find top students with pending fee status
  const studentsWithDues = students
    .filter((s) => s.active && (s.fee_status === 'pending' || !s.fee_status))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-900 border border-red-900/30 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dojang Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Taekwondo Master Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Today is{' '}
            <strong className="text-slate-200">
              {formatDate(getTodayDateString(), { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </strong>
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/attendance"
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Take Today&apos;s Attendance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Active Students */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.activeStudents ?? '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats?.totalStudents ?? 0} registered total
            </p>
          </div>
        </div>

        {/* Present Today */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Present Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats?.presentToday ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats?.absentToday ?? 0} absent • {todayMarked ? 'Recorded' : 'Not taken yet'}
            </p>
          </div>
        </div>

        {/* Fees Paid */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fees Paid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats?.feesPaidCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Students up to date</p>
          </div>
        </div>

        {/* Fees Pending */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fees Pending</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-red-400">
              {stats?.feesPendingCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Avg club attendance: {stats?.averageAttendanceRate ?? 85}%
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/attendance"
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Mark Attendance</p>
            <p className="text-[10px] text-slate-400">Date-wise register</p>
          </div>
        </Link>

        <Link
          href="/admin/students/new"
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Add Student</p>
            <p className="text-[10px] text-slate-400">New registration</p>
          </div>
        </Link>

        <Link
          href="/admin/fees"
          className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Record Fee</p>
            <p className="text-[10px] text-slate-400">UPI / Cash ledger</p>
          </div>
        </Link>
      </div>

      {/* Pending Fee Dues Focus Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pending Fee Dues</h3>
              <p className="text-[11px] text-slate-400">Students awaiting fee submission or within 4-day due window</p>
            </div>
          </div>
          <Link
            href="/admin/fees"
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 transition"
          >
            <span>Manage All Fees</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {studentsWithDues.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
            All active students are marked Paid!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {studentsWithDues.map((student) => (
              <div key={student.id} className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {student.student_code}
                    </span>
                    <span className="font-semibold text-sm text-white">{student.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    Next Due: {student.next_fee_due_date ? formatDate(student.next_fee_due_date) : 'Pending assignment'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-xs">
                    Pending
                  </span>
                  <Link
                    href="/admin/fees"
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    Mark Paid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
