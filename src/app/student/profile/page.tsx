'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  User,
  Shield,
  Phone,
  Calendar,
  MapPin,
  Award,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, updateStudentProfile } = useAuth();
  const student = user?.student;

  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize fields from student session
  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setParentName(student.parent_name || '');
      setParentPhone(student.parent_phone || '');
      setDateOfBirth(student.date_of_birth ? student.date_of_birth.slice(0, 10) : '');
      setAddress(student.address || '');
    }
  }, [student]);

  if (!student) {
    return (
      <div className="py-16 text-center text-slate-400">
        Please sign in as a student to access your profile.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Student name cannot be empty.');
      return;
    }
    if (!parentName.trim()) {
      setErrorMessage('Parent / Guardian name cannot be empty.');
      return;
    }
    if (!parentPhone.trim()) {
      setErrorMessage('Parent contact phone number is required.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 3) {
        setErrorMessage('Password must be at least 3 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
    }

    try {
      setSaving(true);

      const updatePayload = {
        ...student,
        name: name.trim(),
        parent_name: parentName.trim(),
        parent_phone: parentPhone.trim(),
        date_of_birth: dateOfBirth ? dateOfBirth.trim() : null,
        address: address ? address.trim() : null,
        password: newPassword ? newPassword.trim() : (student.password || '1234'),
      };

      const saved = await db.saveStudent(updatePayload);

      // Update auth session so changes take effect immediately
      updateStudentProfile(saved);

      setSuccessMessage('Your profile and personal details have been updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Failed to update student profile:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-red-500" />
          <span>My Profile & Security</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal contact details, parent information, and student portal password.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Official Membership Credentials Card (Read-only Admin Record) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-red-600/30 shrink-0">
              🥋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{student.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                  {student.student_code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Member since {formatDate(student.joining_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                student.fee_status === 'paid'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}
            >
              Fee: {student.fee_status === 'paid' ? 'Paid' : 'Pending'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {formatCurrency(student.monthly_fee)}/mo
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>
            Student Code & fee subscription are verified official club records managed by the Dojo administration.
          </span>
        </div>
      </div>

      {/* Editable Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Contact Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-red-500" />
            <span>Personal & Contact Information</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Student Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Parent / Guardian Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Father/Mother/Guardian"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Parent Contact Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="10-digit Phone"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition font-mono min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Residential Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City / Area / Colony"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Password & Login Credentials */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Change Portal Password</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Current: {student.password || '1234'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            You can set a personal password for your student login. The head instructor (Admin) can also access your portal at any time using their master admin credentials.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition min-h-[44px]"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Leave these password fields blank if you wish to keep your existing password.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile & Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
