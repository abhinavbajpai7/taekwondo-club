'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Shield, Users, CalendarCheck, CreditCard, ArrowRight, Smartphone } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/admin' : '/student');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-red-600/30">
            🥋
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">TKD CLUB</h1>
            <p className="text-xs text-slate-400">Attendance & Fees PWA</p>
          </div>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-6">
          <Shield className="w-3.5 h-3.5" />
          <span>Taekwondo Club Attendance Register & Fee Portal</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          One Tap Attendance. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500">
            Zero Paperwork.
          </span>
        </h2>

        <p className="text-slate-400 text-base sm:text-lg max-w-xl mb-8">
          Designed specifically for martial arts dojangs and clubs. Take date-wise attendance in seconds on your phone, track student fees, and allow students to view their progress.
        </p>

        {/* Quick Launch Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-10">
          <Link
            href="/login"
            className="flex-1 px-5 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
          >
            <span>Instructor Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex-1 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <span>Student Sign In</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left mt-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <CalendarCheck className="w-6 h-6 text-red-400 mb-2" />
            <h3 className="font-semibold text-white text-sm mb-1">Date-Wise Attendance</h3>
            <p className="text-xs text-slate-400">
              Large touch buttons for fast Present/Absent toggling with date persistence.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <CreditCard className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-semibold text-white text-sm mb-1">Fee & Due Tracking</h3>
            <p className="text-xs text-slate-400">
              Log payments by cash/UPI and automatically calculate outstanding dues.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <Smartphone className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-white text-sm mb-1">Installable PWA</h3>
            <p className="text-xs text-slate-400">
              Install directly on iOS & Android phones as a native standalone app.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        Taekwondo Club Attendance PWA • Built with Next.js, Supabase & Tailwind CSS
      </footer>
    </div>
  );
}
