'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { PaymentRecord } from '@/lib/types';
import { formatCurrency, formatDate, calculateFeeSummary } from '@/lib/utils';
import { CreditCard, Receipt, CheckCircle2, AlertCircle, Smartphone, Banknote, Building } from 'lucide-react';

export default function StudentFeesPage() {
  const { user } = useAuth();
  const student = user?.student;

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!student) return;
      setLoading(true);
      const data = await db.getPaymentsForStudent(student.id);
      setPayments(data);
      setLoading(false);
    };
    load();
  }, [student]);

  if (!student) {
    return <div className="py-16 text-center text-slate-400">Please sign in as a student.</div>;
  }

  const feeSummary = calculateFeeSummary(student, payments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-red-500" />
          <span>My Fee Summary & Receipts</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparent accounting of monthly club fees and digital receipts.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Monthly Fee</span>
          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(student.monthly_fee)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Per training month</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Total Paid to Date</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {formatCurrency(feeSummary.totalPaid)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{payments.length} payments recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Outstanding Due</span>
          <div
            className={`text-2xl font-bold mt-1 ${
              feeSummary.currentDue > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(feeSummary.currentDue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {feeSummary.currentDue > 0 ? 'Please clear with instructor' : 'Fully cleared'}
          </p>
        </div>
      </div>

      {/* Receipts Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Payment Receipts Ledger</span>
          </h3>
          <span className="text-xs text-slate-400">{payments.length} Transactions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No payments have been recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {payments.map((p) => (
              <div
                key={p.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      {formatDate(p.payment_date)}
                    </span>
                    {p.receipt_number && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {p.receipt_number}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mode: <span className="capitalize font-medium text-slate-300">{p.payment_method.replace('_', ' ')}</span>
                    {p.notes ? ` • ${p.notes}` : ''}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="font-extrabold text-base text-emerald-400">
                    +{formatCurrency(p.amount)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Verified by Club Admin</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
