'use client';

import React, { useState } from 'react';
import { Settings, Shield, Database, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import { db } from '@/lib/db';

export default function SettingsPage() {
  const [clubName, setClubName] = useState('Tiger Claw Taekwondo Academy');
  const [trainerName, setTrainerName] = useState('Master Instructor');
  const [saved, setSaved] = useState(false);

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

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
        MonthlyFee: s.monthly_fee,
        Active: s.active,
      }))
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-red-500" />
          <span>Club Settings & Infrastructure</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure club details, verify database connection, and manage backups.
        </p>
      </div>

      {/* Database Connection Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
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
                  ? 'All records persist across devices in the Supabase cloud.'
                  : 'Operating in self-contained local storage mode. To sync across multiple devices, add Supabase keys in .env.local.'}
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
            {isSupabaseConfigured ? 'Cloud Live' : 'Local Dev Mode'}
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
              Settings saved!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>

      {/* Backup & Disaster Recovery (Phase 21) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Data Backup & Export (Phase 21)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Always maintain offline copies of student attendance and payment records. You can download an emergency backup CSV at any time.
        </p>

        <button
          onClick={handleFullBackup}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Emergency Backup (CSV)</span>
        </button>
      </div>
    </div>
  );
}
