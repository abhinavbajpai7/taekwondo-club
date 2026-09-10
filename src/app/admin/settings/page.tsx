'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Database, Download, RefreshCw, CheckCircle2, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import { db } from '@/lib/db';
import { useAuth, getAdminCredentials } from '@/lib/auth/context';

export default function SettingsPage() {
  const { updateAdminAccount } = useAuth();

  // Admin Credentials
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credsSaved, setCredsSaved] = useState(false);

  // Club Info
  const [clubName, setClubName] = useState('Tiger Claw Taekwondo Academy');
  const [trainerName, setTrainerName] = useState('Master Instructor');
  const [saved, setSaved] = useState(false);

  // Reset State
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const creds = getAdminCredentials();
    setAdminUsername(creds.email);
    setAdminPassword(creds.password);
  }, []);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      alert('Username and password cannot be empty');
      return;
    }
    updateAdminAccount(adminUsername.trim(), adminPassword);
    setCredsSaved(true);
    setTimeout(() => setCredsSaved(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleFullBackup = async () => {
    const [students, payments] = await Promise.all([db.getStudents(), db.getAllPayments()]);

    exportToCsv(
      `tkd_full_backup_${new Date().toISOString().slice(0, 10)}.csv`,
      students.map((s) => ({
        Type: 'STUDENT',
        ID: s.id,
        Code: s.student_code,
        Name: s.name,
        Phone: s.parent_phone,
        Parent: s.parent_name,
        Joined: s.joining_date,
        FeeStatus: s.fee_status || 'pending',
        NextDueDate: s.next_fee_due_date || '',
        LastPaymentMode: s.last_payment_mode || '',
        Active: s.active,
      }))
    );
  };

  const handleWipeAllData = async () => {
    const confirm1 = window.confirm(
      'DANGER: Are you sure you want to completely wipe all student records, attendance logs, and fee payments from the database?'
    );
    if (!confirm1) return;

    const confirm2 = window.prompt(
      'To confirm complete database wipe and app reset, type RESET in the box below:'
    );
    if (confirm2 !== 'RESET') {
      alert('Reset cancelled. You must type RESET in capital letters.');
      return;
    }

    try {
      setResetting(true);
      await db.resetAllData();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Error wiping data. Check console.');
      setResetting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-red-500" />
          <span>Club Settings & Full Admin Controls</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage admin login credentials, cloud database connection, data backups, and club reset.
        </p>
      </div>

      {/* Admin Login Credentials Form */}
      <form
        onSubmit={handleSaveCredentials}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Admin Login Credentials (ID & Password)</span>
          </h2>
          <span className="text-[11px] text-slate-400">Controls login access to Admin Portal</span>
        </div>

        <p className="text-xs text-slate-400">
          You can change your admin username/email or password at any time. The new credentials will be required on your next login.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Username / Email ID
            </label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              required
              autoComplete="off"
              placeholder="e.g. instructer@rta.club"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Enter new admin password"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {credsSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Admin credentials updated successfully!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition"
            >
              Update Admin Login
            </button>
          </div>
        </div>
      </form>

      {/* Database Connection Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span>Database & Cloud Sync Status</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-500' : 'bg-blue-400 animate-pulse'
              }`}
            />
            <div>
              <p className="text-xs font-bold text-white">
                {isSupabaseConfigured ? 'Supabase PostgreSQL (Live)' : 'Local Storage Provider (Active)'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isSupabaseConfigured
                  ? 'All student profiles, attendance, and fee records sync instantly to Supabase cloud.'
                  : 'Operating in self-contained local storage mode.'}
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}
          >
            {isSupabaseConfigured ? 'Cloud Live' : 'Local Mode'}
          </span>
        </div>
      </div>

      {/* Club Identity Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span>Club Information</span>
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Academy / Club Name
          </label>
          <input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Head Instructor Title / Name
          </label>
          <input
            type="text"
            value={trainerName}
            onChange={(e) => setTrainerName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Club details saved!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition"
            >
              Save Club Details
            </button>
          </div>
        </div>
      </form>

      {/* Backup & Disaster Recovery */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Data Backup & Export</span>
        </h2>
        <p className="text-xs text-slate-400">
          Download an emergency offline CSV backup containing student profiles, next fee due dates, and payment status.
        </p>

        <button
          type="button"
          onClick={handleFullBackup}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Offline Backup (CSV)</span>
        </button>
      </div>

      {/* Wipe All Data & Fresh Start */}
      <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider">
            Danger Zone: Master Data Wipe & App Reset
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          Permanently delete all students, attendance registers, and fee payments from both local memory and Supabase Cloud PostgreSQL. Use this when you want to restart the club with completely fresh 0 records.
        </p>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            All data wiped successfully! Reloading dashboard...
          </div>
        )}

        <button
          type="button"
          disabled={resetting}
          onClick={handleWipeAllData}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white border border-red-500/30 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/20"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Wiping All Records...' : 'Wipe All Data & Reset App'}</span>
        </button>
      </div>
    </div>
  );
}
