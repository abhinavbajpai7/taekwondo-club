'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/db';
import { Student, AttendanceStatus } from '@/lib/types';
import { getTodayDateString, addDays, formatDate } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Save,
  Check,
  X,
  CheckCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';

export default function AttendanceRegisterPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [savedRecordsMap, setSavedRecordsMap] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Load students and attendance for the date
  const loadDataForDate = useCallback(async (dateStr: string) => {
    setLoading(true);
    setMessage(null);

    const allStudents = await db.getStudents();
    const activeStudents = allStudents.filter((s) => s.active);
    setStudents(activeStudents);

    const existingRecords = await db.getAttendanceByDate(dateStr);
    const map: Record<string, AttendanceStatus> = {};

    existingRecords.forEach((r) => {
      map[r.student_id] = r.status;
    });

    setAttendanceMap(map);
    setSavedRecordsMap(map); // Keep snapshot to detect changes
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate, loadDataForDate]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // Toggle P/A status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Quick Action: Mark All Present
  const handleMarkAllPresent = () => {
    const nextMap: Record<string, AttendanceStatus> = { ...attendanceMap };
    students.forEach((s) => {
      nextMap[s.id] = 'present';
    });
    setAttendanceMap(nextMap);
  };

  // Quick Action: Clear All
  const handleClearAll = () => {
    setAttendanceMap({});
  };

  // Detect Unsaved Changes
  const hasUnsavedChanges = useMemo(() => {
    const keys = Object.keys(attendanceMap);
    const savedKeys = Object.keys(savedRecordsMap);
    if (keys.length !== savedKeys.length) return true;
    return keys.some((k) => attendanceMap[k] !== savedRecordsMap[k]);
  }, [attendanceMap, savedRecordsMap]);

  // Calculate live stats for selected date
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;
  const unmarkedCount = students.length - (presentCount + absentCount);
  const isPreviouslySaved = Object.keys(savedRecordsMap).length > 0;

  // Execute Save
  const handleSaveAttendance = async () => {
    setSaving(true);
    setConfirmModalOpen(false);
    setMessage(null);

    try {
      const recordsToSave = Object.entries(attendanceMap).map(([student_id, status]) => ({
        student_id,
        status,
      }));

      const res = await db.saveAttendanceRecords(selectedDate, recordsToSave);
      if (res.success) {
        setSavedRecordsMap({ ...attendanceMap });
        setMessage({
          type: 'success',
          text: `Attendance saved successfully for ${formatDate(selectedDate)} (${recordsToSave.length} records updated).`,
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save attendance',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-500" />
            <span>Attendance Register</span>
          </h1>
          <p className="text-xs text-slate-400">
            Daily date-wise training attendance. Tap P for Present, A for Absent.
          </p>
        </div>

        {/* Date Jump Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Date Navigation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrevDay}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400 block">
              Selected Date
            </span>
            <span className="text-base sm:text-lg font-bold text-white">
              {formatDate(selectedDate, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold"
            title="Next Day"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date Picker Input & Status Banner */}
        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {isPreviouslySaved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <Check className="w-3 h-3" />
                Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
                <Clock className="w-3 h-3" />
                Not Recorded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Toolbar & Live Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            Total Active: <strong className="text-white">{students.length}</strong>
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Present: <strong>{presentCount}</strong>
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Absent: <strong>{absentCount}</strong>
          </span>
          {unmarkedCount > 0 && (
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Unmarked: <strong>{unmarkedCount}</strong>
            </span>
          )}
        </div>

        {/* Quick Fill Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={handleClearAll}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages / Alerts */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 shadow-md ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Attendance Roster Table / Card Rows */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm animate-pulse">
          Loading student attendance for {selectedDate}...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium text-sm">No active students registered.</p>
          <p className="text-slate-500 text-xs mt-1">Add students first from the Students menu.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid sm:grid-cols-12 px-6 py-3 bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="col-span-1">#</span>
            <span className="col-span-2">Code</span>
            <span className="col-span-5">Student Name</span>
            <span className="col-span-4 text-right">Attendance Mark</span>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-slate-800/80">
            {students.map((student, idx) => {
              const currentStatus = attendanceMap[student.id];

              return (
                <div
                  key={student.id}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-0 transition ${
                    currentStatus === 'present'
                      ? 'bg-emerald-500/[0.04]'
                      : currentStatus === 'absent'
                      ? 'bg-red-500/[0.04]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between sm:contents">
                    {/* Number & Student Code */}
                    <span className="hidden sm:inline col-span-1 text-xs text-slate-500 font-mono">
                      {idx + 1}
                    </span>
                    <div className="sm:col-span-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-red-400 border border-slate-700">
                        {student.student_code}
                      </span>
                    </div>

                    {/* Student Name */}
                    <div className="sm:col-span-5">
                      <p className="font-semibold text-sm text-white">{student.name}</p>
                      <p className="text-[11px] text-slate-400">Parent: {student.parent_name}</p>
                    </div>
                  </div>

                  {/* Present / Absent Touch Buttons (Phase 9 & 16 Mobile Friendly) */}
                  <div className="sm:col-span-4 flex items-center justify-end gap-2 pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleSetStatus(student.id, 'present')}
                      className={`flex-1 sm:flex-initial min-w-[75px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>P</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(student.id, 'absent')}
                      className={`flex-1 sm:flex-initial min-w-[75px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
                        currentStatus === 'absent'
                          ? 'bg-red-600 text-white shadow-red-600/30'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                      <span>A</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating / Sticky Save Bottom Bar */}
      <div className="sticky bottom-20 md:bottom-6 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">
              {formatDate(selectedDate)}
            </span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="Unsaved changes"></span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {presentCount} Present • {absentCount} Absent • {unmarkedCount} Unmarked
          </p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmModalOpen(true)}
          disabled={saving || students.length === 0}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition flex items-center gap-2 disabled:opacity-50 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
        </button>
      </div>

      {/* Confirmation Modal (Phase 10 Safety Feature) */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Confirm Attendance Submission</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              You are about to save attendance records for{' '}
              <strong className="text-white">{formatDate(selectedDate)}</strong>:
            </p>

            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Present:</span>
                <span className="font-bold text-emerald-400">{presentCount} students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Absent:</span>
                <span className="font-bold text-red-400">{absentCount} students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unmarked / Skipped:</span>
                <span className="font-bold text-slate-400">{unmarkedCount} students</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              This will update the database for this specific date while leaving all other training dates completely untouched.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
