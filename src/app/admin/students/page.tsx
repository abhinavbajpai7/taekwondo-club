'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Student } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Edit2,
  PowerOff,
  RefreshCw,
  Users,
} from 'lucide-react';

export default function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');

  const loadStudents = async () => {
    setLoading(true);
    const data = await db.getStudents();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleToggleStatus = async (student: Student) => {
    const updated = await db.toggleStudentStatus(student.id, !student.active);
    if (updated) {
      setStudents((prev) => prev.map((s) => (s.id === student.id ? updated : s)));
    }
  };

  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(query) ||
      s.student_code.toLowerCase().includes(query) ||
      s.parent_name.toLowerCase().includes(query) ||
      s.parent_phone.includes(query);

    if (!matchesSearch) return false;

    if (filterActive === 'active') return s.active;
    if (filterActive === 'inactive') return !s.active;
    return true;
  });

  const activeCount = students.filter((s) => s.active).length;
  const inactiveCount = students.filter((s) => !s.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-500" />
            <span>Student Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Total {students.length} students ({activeCount} active, {inactiveCount} inactive)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStudents}
            title="Refresh"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/students/new"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-600/20 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, student code (STU001), phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterActive === 'active'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterActive === 'inactive'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterActive === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({students.length})
          </button>
        </div>
      </div>

      {/* Student List Grid / Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm animate-pulse">
          Loading student roster...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800/80 p-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium text-sm">No students found matching filters.</p>
          <p className="text-slate-500 text-xs mt-1">Try another search term or register a new student.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                student.active
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-900/40 border-slate-800/50 opacity-75'
              }`}
            >
              <div>
                {/* Top Badge & Code */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-red-400 border border-slate-700">
                    {student.student_code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      student.active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {student.active ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Inactive
                      </>
                    )}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-white mb-1">{student.name}</h3>

                {/* Parent & Phone */}
                <div className="text-xs text-slate-400 space-y-1 mb-3">
                  <p>
                    <span className="text-slate-500">Parent:</span> {student.parent_name}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <a
                      href={`tel:${student.parent_phone}`}
                      className="hover:text-red-400 underline decoration-slate-700 underline-offset-2"
                    >
                      {student.parent_phone}
                    </a>
                  </p>
                  <p>
                    <span className="text-slate-500">Joined:</span> {formatDate(student.joining_date)}
                  </p>
                </div>
              </div>

              {/* Fee & Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    Monthly Fee
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(student.monthly_fee)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(student)}
                    title={student.active ? 'Deactivate student' : 'Reactivate student'}
                    className={`p-2 rounded-xl text-xs font-semibold border transition ${
                      student.active
                        ? 'text-slate-400 hover:text-amber-400 border-slate-800 hover:bg-slate-800'
                        : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/10'
                    }`}
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/admin/students/${student.id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
