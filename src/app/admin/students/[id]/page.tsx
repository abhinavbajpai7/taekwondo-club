'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student, AttendanceRecord, PaymentRecord, FeeStatus } from '@/lib/types';
import { formatDate, calculateAttendancePercentage } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  PowerOff,
  ShieldCheck,
  CalendarCheck,
  KeyRound,
  Check,
  Clock,
} from 'lucide-react';

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    student_code: '',
    password: '',
    name: '',
    date_of_birth: '',
    parent_name: '',
    parent_phone: '',
    address: '',
    joining_date: '',
    next_fee_due_date: '',
    monthly_fee: 1000,
    fee_status: 'pending' as FeeStatus,
    active: true,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await db.getStudentById(resolvedParams.id);
      if (data) {
        setStudent(data);
        setFormData({
          student_code: data.student_code,
          password: data.password || '1234',
          name: data.name,
          date_of_birth: data.date_of_birth || '',
          parent_name: data.parent_name,
          parent_phone: data.parent_phone,
          address: data.address || '',
          joining_date: data.joining_date,
          next_fee_due_date: data.next_fee_due_date || '',
          monthly_fee: data.monthly_fee,
          fee_status: data.fee_status || 'pending',
          active: data.active,
        });

        const att = await db.getAttendanceForStudent(data.id);
        const pays = await db.getPaymentsForStudent(data.id);
        setAttendance(att);
        setPayments(pays);
      } else {
        setError('Student not found');
      }
      setLoading(false);
    };
    load();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setError(null);
    setSaving(true);

    try {
      const updated = await db.saveStudent({
        ...formData,
        id: student.id,
        student_code: formData.student_code.trim().toUpperCase(),
      });

      setStudent(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!student) return;
    const updated = await db.toggleStudentStatus(student.id, !student.active);
    if (updated) {
      setStudent(updated);
      setFormData((prev) => ({ ...prev, active: updated.active }));
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500 text-sm">Loading student details...</div>;
  }

  if (!student) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-slate-300 font-semibold">Student record not found.</p>
        <Link href="/admin/students" className="text-red-400 underline text-xs">
          Back to Students
        </Link>
      </div>
    );
  }

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const attendanceRate = calculateAttendancePercentage(presentCount, attendance.length);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{student.name}</h1>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-800 text-red-400 border border-slate-700">
                {student.student_code}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Joined {formatDate(student.joining_date)} • Status:{' '}
              <span className={student.active ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                {student.active ? 'Active' : 'Deactivated'}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleActive}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
            student.active
              ? 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20'
              : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20'
          }`}
        >
          <PowerOff className="w-3.5 h-3.5" />
          <span>{student.active ? 'Deactivate' : 'Reactivate'}</span>
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-red-400" />
            Attendance
          </span>
          <span className="text-lg font-bold text-white">{attendanceRate}%</span>
          <p className="text-[10px] text-slate-500">{presentCount} of {attendance.length} sessions</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 mb-1 block">Fee Status</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              formData.fee_status === 'paid'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}
          >
            {formData.fee_status === 'paid' ? (
              <>
                <Check className="w-3 h-3" /> Paid
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" /> Pending
              </>
            )}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">
            Mode: <span className="capitalize">{student.last_payment_mode || 'None'}</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 mb-1 block">Next Fee Due Date</span>
          <span className="text-sm font-bold text-white">
            {formData.next_fee_due_date ? formatDate(formData.next_fee_due_date) : 'Not set'}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">Visible to student</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Student details updated successfully.</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <span>Student Credentials & Profile</span>
        </h2>

        {/* Credentials Editor */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
            <KeyRound className="w-4 h-4" />
            <span>Student Portal Login Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Student ID / Code *
              </label>
              <input
                type="text"
                required
                value={formData.student_code}
                onChange={(e) => setFormData({ ...formData, student_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Student Password *
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Admin can change this Student ID and Password at any time.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Student Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Joining Date
            </label>
            <input
              type="date"
              required
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parent Name *
            </label>
            <input
              type="text"
              required
              value={formData.parent_name}
              onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parent Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.parent_phone}
              onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Residential Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        {/* Fee Management Controls */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Fee Settings & Status (Admin Controls)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Fee Status
              </label>
              <select
                value={formData.fee_status}
                onChange={(e) => setFormData({ ...formData, fee_status: e.target.value as FeeStatus })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Next Fee Due Date
              </label>
              <input
                type="date"
                value={formData.next_fee_due_date}
                onChange={(e) => setFormData({ ...formData, next_fee_due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Fee Amount (₹) (Student View)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={formData.monthly_fee}
                onChange={(e) => setFormData({ ...formData, monthly_fee: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Student Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
