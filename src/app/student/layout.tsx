'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { LayoutDashboard, CalendarCheck, CreditCard, User, LogOut } from 'lucide-react';

const STUDENT_NAV = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
  { name: 'Fees', href: '/student/fees', icon: CreditCard },
  { name: 'Profile', href: '/student/profile', icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-8">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-base text-white shadow-md">
            🥋
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide">
              {user?.student?.name || 'Student Portal'}
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              {user?.student?.student_code || 'STU'} • Student View
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1 mr-3">
            {STUDENT_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/student'
                  ? pathname === '/student'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">{children}</main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2.5 px-2 z-40">
        {STUDENT_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/student' ? pathname === '/student' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition ${
                isActive ? 'text-red-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
