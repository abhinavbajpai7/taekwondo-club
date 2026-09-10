'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/db';
import { Student, PaymentRecord, PaymentMethod } from '@/lib/types';
import { formatCurrency, formatDate, calculateFeeSummary, getTodayDateString } from '@/lib/utils';
import {
  CreditCard,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Banknote,
  Smartphone,
  Building,
} from 'lucide-react';

export default function FeesManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'students' | 'history'>('students');
  const [dueFilter, setDueFilter] = useState<'all' | 'dueOnly'>('dueOnly');

  // New Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('1000');
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [stus, pays] = await Promise.all([db.getStudents(), db.getAllPayments()]);
    setStudents(stus);
    setPayments(pays);
    if (stus.length > 0 && !selectedStudentId) {
      setSelectedStudentId(stus[0].id);
      setPaymentAmount(String(stus[0].monthly_fee || 1000));
    }
    setLoading(false);
  }, [selectedStudentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute student summaries
  const studentSummaries = useMemo(() => {
    return students.map((s) => calculateFeeSummary(s, payments));
  }, [students, payments]);

  // Aggregate stats
  const totalCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount), 0);
  }, [payments]);

  const totalDuesPending = useMemo(() => {
    return studentSummaries
      .filter((s) => s.student.active)
      .reduce((sum, s) => sum + s.currentDue, 0);
  }, [studentSummaries]);

  const dueStudentsCount = useMemo(() => {
    return studentSummaries.filter((s) => s.student.active && s.currentDue > 0).length;
  }, [studentSummaries]);

  // Filtered Students
  const filteredSummaries = useMemo(() => {
    return studentSummaries.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.student.name.toLowerCase().includes(q) ||
        item.student.student_code.toLowerCase().includes(q) ||
        item.student.parent_phone.includes(q);

      if (!matchSearch) return false;
      if (dueFilter === 'dueOnly') return item.student.active && item.currentDue > 0;
      return true;
    });
  }, [studentSummaries, searchQuery, dueFilter]);

  // Handle open modal for specific student
  const handleOpenPaymentFor = (student: Student) => {
    setSelectedStudentId(student.id);
    const summary = calculateFeeSummary(student, payments);
    // suggest current due if greater than 0, otherwise monthly fee
    const suggested = summary.currentDue > 0 ? summary.currentDue : student.monthly_fee;
    setPaymentAmount(String(suggested));
    setReceiptNumber(`REC-${Date.now().toString().slice(-4)}`);
    setNotes(`Fee payment for ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`);
    setIsModalOpen(true);
  };

  // Submit payment
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setModalError('Payment amount must be greater than zero.');
      return;
    }

    setModalSaving(true);
    try {
      await db.recordPayment({
        student_id: selectedStudentId,
        amount: amt,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        receipt_number: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setModalSaving(false);
    }
  };

  const getMethodIcon = (m: PaymentMethod) => {
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
            <span>Fees & Payment Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track student monthly dues, record incoming payments, and maintain payment history.
          </p>
        </div>

        <button
          onClick={() => {
            if (students.length > 0) {
              handleOpenPaymentFor(students[0]);
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Fees Collected</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {formatCurrency(totalCollected)}
            </div>
            <span className="text-[11px] text-slate-500">{payments.length} transactions recorded</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Outstanding Dues</span>
            <div className="text-2xl font-extrabold text-red-400 mt-1">
              {formatCurrency(totalDuesPending)}
            </div>
            <span className="text-[11px] text-slate-500">{dueStudentsCount} students with balance due</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Students Paying</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {students.filter((s) => s.active).length}
            </div>
            <span className="text-[11px] text-slate-500">
              Avg fee: {formatCurrency(1000)}/mo
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setTab('students')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            tab === 'students'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Student Fee Status ({studentSummaries.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            tab === 'history'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Payment Ledger History ({payments.length})
        </button>
      </div>

      {tab === 'students' ? (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name or code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDueFilter('dueOnly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  dueFilter === 'dueOnly'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                With Dues Only ({dueStudentsCount})
              </button>
              <button
                onClick={() => setDueFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  dueFilter === 'all'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Students ({students.length})
              </button>
            </div>
          </div>

          {/* Student Summaries Cards */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading fee balances...</div>
          ) : filteredSummaries.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">All cleared!</p>
              <p className="text-xs text-slate-400 mt-1">No outstanding dues matching current criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSummaries.map((item) => (
                <div
                  key={item.student.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-red-400 border border-slate-700">
                        {item.student.student_code}
                      </span>
                      {item.currentDue > 0 ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                          Due: {formatCurrency(item.currentDue)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid Up
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white">{item.student.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">Parent: {item.student.parent_name}</p>

                    {/* Breakdown */}
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1 mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>Monthly Plan:</span>
                        <span className="text-slate-200 font-medium">{formatCurrency(item.monthlyFee)}/mo</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total Paid to Date:</span>
                        <span className="text-emerald-400 font-semibold">{formatCurrency(item.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Last Payment:</span>
                        <span className="text-slate-300">
                          {item.payments[0] ? formatDate(item.payments[0].payment_date) : 'No payments yet'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentFor(item.student)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* History Ledger Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="hidden sm:grid sm:grid-cols-12 px-6 py-3 bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="col-span-2">Date</span>
            <span className="col-span-4">Student</span>
            <span className="col-span-2">Method</span>
            <span className="col-span-2">Receipt</span>
            <span className="col-span-2 text-right">Amount</span>
          </div>

          <div className="divide-y divide-slate-800/70">
            {payments.map((pay) => {
              const student = students.find((s) => s.id === pay.student_id);

              return (
                <div
                  key={pay.id}
                  className="px-4 sm:px-6 py-3.5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-0 hover:bg-slate-800/30 transition"
                >
                  <div className="sm:col-span-2 text-xs font-mono text-slate-400">
                    {formatDate(pay.payment_date)}
                  </div>

                  <div className="sm:col-span-4">
                    <p className="font-semibold text-sm text-white">{student?.name || 'Unknown'}</p>
                    <p className="text-[11px] font-mono text-red-400">{student?.student_code}</p>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-1.5 text-xs text-slate-300 capitalize">
                    {getMethodIcon(pay.payment_method)}
                    <span>{pay.payment_method.replace('_', ' ')}</span>
                  </div>

                  <div className="sm:col-span-2 text-xs font-mono text-slate-500">
                    {pay.receipt_number || '—'}
                  </div>

                  <div className="sm:col-span-2 text-left sm:text-right font-bold text-sm text-emerald-400">
                    +{formatCurrency(pay.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-500" />
                <span>Record Fee Payment</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSavePayment} className="space-y-4">
              {/* Student Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Student *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const found = students.find((s) => s.id === e.target.value);
                    if (found) {
                      const summary = calculateFeeSummary(found, payments);
                      setPaymentAmount(String(summary.currentDue > 0 ? summary.currentDue : found.monthly_fee));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.student_code} — {s.name} ({s.active ? 'Active' : 'Inactive'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Payment Method
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
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition ${
                        paymentMethod === m.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipt & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Receipt # (Optional)
                  </label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="REC-001"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. September fee"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{modalSaving ? 'Saving...' : 'Record Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
