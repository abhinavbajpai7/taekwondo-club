'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/context';
import { formatDate, formatCurrency } from '@/lib/utils';
import { User, Shield, Phone, Calendar, MapPin, Award, Lock } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const student = user?.student;

  if (!student) {
    return <div className="py-16 text-center text-slate-400">Please sign in as a student.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-red-500" />
          <span>My Student Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Your registered student card and martial arts academy membership details.
        </p>
      </div>

      {/* Profile ID Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background Dojo Watermark */}
        <div className="absolute right-4 -bottom-6 text-9xl text-slate-800/20 font-black select-none pointer-events-none">
          🥋
        </div>

        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-red-600/30">
              🥋
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{student.name}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20 mt-1">
                {student.student_code}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Member
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="py-6 space-y-4 relative z-10 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Date of Birth</span>
            </span>
            <span className="font-semibold text-white">
              {student.date_of_birth ? formatDate(student.date_of_birth) : 'Not specified'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span>Parent / Guardian</span>
            </span>
            <span className="font-semibold text-white">{student.parent_name}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>Contact Number</span>
            </span>
            <span className="font-mono text-white">{student.parent_phone}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Address</span>
            </span>
            <span className="font-medium text-white text-right max-w-[200px] truncate">
              {student.address || 'Lucknow Dojo'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-500" />
              <span>Club Joining Date</span>
            </span>
            <span className="font-semibold text-white">{formatDate(student.joining_date)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Monthly Subscription</span>
            </span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(student.monthly_fee)} / month
            </span>
          </div>
        </div>

        {/* Security Note */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 relative z-10">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Profile data is managed by the Head Instructor to maintain official records.</span>
        </div>
      </div>
    </div>
  );
}
