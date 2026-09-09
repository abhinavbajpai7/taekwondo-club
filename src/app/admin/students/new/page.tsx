'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getTodayDateString } from '@/lib/utils';
import { ArrowLeft, UserPlus, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nextCode, setNextCode] = useState('STU001');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    parent_name: '',
    parent_phone: '',
    address: '',
    joining_date: getTodayDateString(),
    monthly_fee: 1000,
  });

  useEffect(() => {
    // Estimate next code preview
    const calculateCode = async () => {
      const all = await db.getStudents();
      const codes = all
        .map((s) => parseInt(s.student_code.replace('STU', ''), 10))
        .filter((n) => !isNaN(n));
      const nextNum = (codes.length > 0 ? Math.max(...codes) : 0) + 1;
      setNextCode(`STU${String(nextNum).padStart(3, '0')}`);
    };
    calculateCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Student name is required.');
      return;
    }
    if (!formData.parent_name.trim()) {
      setError('Parent / Guardian name is required.');
      return;
    }
    if (!formData.parent_phone.trim()) {
      setError('Parent phone number is required.');
      return;
    }
    if (formData.monthly_fee < 0) {
      setError('Monthly fee cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      await db.saveStudent({
        ...formData,
        student_code: nextCode,
        active: true,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/students');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register student');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/students"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-red-500" />
            <span>Register New Student</span>
          </h1>
          <p className="text-xs text-slate-400">
            Student details are recorded once and linked to all future attendance & payments.
          </p>
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
          <span>Student successfully registered! Redirecting to roster...</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
        {/* Auto Generated Code Banner */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Assigned Student Code</span>
            <span className="text-xs text-slate-500">Auto-generated sequence</span>
          </div>
          <span className="font-mono text-base font-extrabold px-3 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
            {nextCode}
          </span>
        </div>

        {/* Student Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Student Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        {/* Date of Birth & Joining Date */}
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
              Joining Date *
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

        {/* Parent Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parent / Guardian Name *
            </label>
            <input
              type="text"
              required
              value={formData.parent_name}
              onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parent Phone / WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={formData.parent_phone}
              onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Residential Address / Locality
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Gomti Nagar, Lucknow"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        {/* Monthly Fee */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Monthly Fee (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="100"
            required
            value={formData.monthly_fee}
            onChange={(e) => setFormData({ ...formData, monthly_fee: Number(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Used to automatically calculate monthly outstanding dues for fee tracking.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <Link
            href="/admin/students"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Register Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
