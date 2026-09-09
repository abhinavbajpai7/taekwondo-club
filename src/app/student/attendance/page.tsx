'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { AttendanceRecord } from '@/lib/types';
import { formatDate, calculateAttendancePercentage } from '@/lib/utils';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Filter,
  Award,
} from 'lucide-react';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const student = user?.student;

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!student) return;
      setLoading(true);
      const data = await db.getAttendanceForStudent(student.id);
      setAttendance(data);
      setLoading(false);
    };
    load();
  }, [student]);

  // Extract unique available months from attendance data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    attendance.forEach((a) => {
      // a.attendance_date format YYYY-MM-DD
      const ym = a.attendance_date.slice(0, 7); // YYYY-MM
      set.add(ym);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [attendance]);

  // Filtered records
  const filteredAttendance = useMemo(() => {
    if (selectedMonth === 'all') return attendance;
    return attendance.filter((a) => a.attendance_date.startsWith(selectedMonth));
  }, [attendance, selectedMonth]);

  const presentCount = filteredAttendance.filter((a) => a.status === 'present').length;
  const absentCount = filteredAttendance.filter((a) => a.status === 'absent').length;
  const totalCount = filteredAttendance.length;
  const attendancePercentage = calculateAttendancePercentage(presentCount, totalCount);

  if (!student) {
    return <div className="py-16 text-center text-slate-400">Please sign in as a student.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-red-500" />
            <span>My Attendance Register</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track your class consistency, attendance records, and martial arts training milestones.
          </p>
        </div>

        {/* Month Filter Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <option value="all">All Months Combined</option>
            {availableMonths.map((ym) => {
              const [y, m] = ym.split('-');
              const date = new Date(parseInt(y), parseInt(m) - 1, 1);
              const label = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
              return (
                <option key={ym} value={ym}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Progress & Milestone Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {selectedMonth === 'all' ? 'All-Time Attendance Rate' : 'Selected Month Attendance'}
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {attendancePercentage}%
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">
                Present: <strong className="text-white">{presentCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-300">
                Absent: <strong className="text-white">{absentCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <span className="text-slate-400">
                Total: <strong className="text-slate-300">{totalCount}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${attendancePercentage}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Maintain at least 75% attendance to qualify for your next belt promotion grading.</span>
        </p>
      </div>

      {/* Attendance History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Daily Training Sessions Log</h3>
          <span className="text-xs text-slate-400">{filteredAttendance.length} Entries</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Loading attendance entries...</div>
        ) : filteredAttendance.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No attendance records found for this period.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredAttendance.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'present' ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(item.attendance_date, {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">{item.attendance_date}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.status === 'present'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {item.status === 'present' ? 'Present' : 'Absent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
