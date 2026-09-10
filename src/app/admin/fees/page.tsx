'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/db';
import { Student, PaymentMethod, FeeStatus } from '@/lib/types';
import { formatDate, getTodayDateString, addDays } from '@/lib/utils';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Banknote,
  Building,
  Check,
  Clock,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export default function FeesManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Mark Paid Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('upi');
  const [nextDueDate, setNextDueDate] = useState(addDays(getTodayDateString(), 30));
  const [modalSaving, setModalSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const stus = await db.getStudents();
    setStudents(stus);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active students only for fees
  const activeStudents = useMemo(() => students.filter((s) => s.active), [students]);

  const paidCount = useMemo(
    () => activeStudents.filter((s) => s.fee_status === 'paid').length,
    [activeStudents]
  );
  const pendingCount = useMemo(
    () => activeStudents.filter((s) => s.fee_status !== 'paid').length,
    [activeStudents]
  );

  // Filtered List
  const filteredStudents = useMemo(() => {
    return activeStudents.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.student_code.toLowerCase().includes(q) ||
        s.parent_phone.includes(q);

      if (!matchSearch) return false;
      if (statusFilter === 'pending') return s.fee_status !== 'paid';
      if (statusFilter === 'paid') return s.fee_status === 'paid';
      return true;
    });
  }, [activeStudents, searchQuery, statusFilter]);

  // Open Mark Paid Modal
  const handleOpenMarkPaid = (student: Student) => {
    setSelectedStudent(student);
    setPaymentMode(student.last_payment_mode || 'upi');
    setNextDueDate(addDays(getTodayDateString(), 30));
    setModalOpen(true);
  };

  // Submit Mark Paid
  const handleConfirmPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setModalSaving(true);

    try {
      await db.updateStudentFeeStatus(selectedStudent.id, 'paid', paymentMode, nextDueDate);
      await db.recordPayment({
        student_id: selectedStudent.id,
        amount: selectedStudent.monthly_fee || 1000,
        payment_date: getTodayDateString(),
        payment_method: paymentMode,
        notes: `Marked paid via ${paymentMode.toUpperCase()}`,
      });

      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setModalSaving(false);
    }
  };

  // Toggle back to Pending
  const handleMarkPending = async (student: Student) => {
    await db.updateStudentFeeStatus(student.id, 'pending', student.last_payment_mode || undefined);
    await loadData();
  };

  const getMethodIcon = (m?: PaymentMethod | null) => {
    switch (m) {
      case 'upi':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-400" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
      case 'bank_transfer':
        return <Building className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-red-500" />
            <span>Fees & Payment Status</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track paid vs pending student fees, assign next due dates, and record payment modes.
          </p>
        </div>
      </div>

      {/* KPI Cards (No Amounts, Clean Status Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Active Students</span>
            <div className="text-3xl font-extrabold text-white mt-1">{activeStudents.length}</div>
            <span className="text-[11px] text-slate-500">Enrolled practitioners</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Fees Paid</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{paidCount}</div>
            <span className="text-[11px] text-slate-500">Marked paid by instructor</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Fees Pending</span>
            <div className="text-3xl font-extrabold text-red-400 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-slate-500">Action required</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, student code, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({activeStudents.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'pending'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'paid'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paid ({paidCount})
          </button>
        </div>
      </div>

      {/* Roster Fee Table (No Amount Columns) */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Loading fee roster...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
          <p className="text-white font-semibold text-sm">No students matching filter.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 px-6 py-3 bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="col-span-4">Student</span>
            <span className="col-span-2">Fee Status</span>
            <span className="col-span-2">Payment Mode</span>
            <span className="col-span-2">Next Due Date</span>
            <span className="col-span-2 text-right">Action</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-800/80">
            {filteredStudents.map((student) => {
              const isPaid = student.fee_status === 'paid';

              return (
                <div
                  key={student.id}
                  className="px-4 sm:px-6 py-3.5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-0 hover:bg-slate-800/20 transition"
                >
                  {/* Student Info */}
                  <div className="sm:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-red-400 border border-slate-800">
                        {student.student_code}
                      </span>
                      <span className="font-semibold text-sm text-white">{student.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Phone: {student.parent_phone}</p>
                  </div>

                  {/* Fee Status Badge */}
                  <div className="sm:col-span-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        isPaid
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" /> Paid
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 stroke-[2.5]" /> Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Payment Mode */}
                  <div className="sm:col-span-2 text-xs text-slate-300 flex items-center gap-1.5 capitalize">
                    {student.last_payment_mode ? (
                      <>
                        {getMethodIcon(student.last_payment_mode)}
                        <span>{student.last_payment_mode.replace('_', ' ')}</span>
                      </>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>

                  {/* Next Due Date */}
                  <div className="sm:col-span-2 text-xs font-medium text-slate-300">
                    {student.next_fee_due_date ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(student.next_fee_due_date)}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not set</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-1 sm:pt-0">
                    {isPaid ? (
                      <button
                        onClick={() => handleMarkPending(student)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                      >
                        Set Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenMarkPaid(student)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Mark Paid</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Mark Fee as Paid</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Marking fee paid for <strong className="text-white">{selectedStudent.name}</strong> (
              <span className="font-mono text-red-400">{selectedStudent.student_code}</span>).
            </p>

            <form onSubmit={handleConfirmPaid} className="space-y-4">
              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'upi', label: 'UPI' },
                    { id: 'cash', label: 'Cash' },
                    { id: 'bank_transfer', label: 'Bank' },
                    { id: 'other', label: 'Other' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMode(m.id as PaymentMethod)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition ${
                        paymentMode === m.id
                          ? 'bg-red-600 text-white border-red-500 shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Fee Due Date (Decided by Admin) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Next Fee Due Date (Decided by Admin) *
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This deadline date will be displayed on the student&apos;s personal portal.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{modalSaving ? 'Saving...' : 'Confirm Paid'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
