'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { Student, AttendanceRecord, PaymentRecord } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  calculateAttendancePercentage,
  calculateFeeSummary,
  exportToCsv,
} from '@/lib/utils';
import { BarChart3, Download, Calendar, Users, CreditCard } from 'lucide-react';

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [stus, att, pays] = await Promise.all([
      db.getStudents(),
      db.getAttendanceByDate(''), // Loads all cached
      db.getAllPayments(),
    ]);
    setStudents(stus);
    setAttendance(att);
    setPayments(pays);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle CSV Exports
  const handleExportStudents = () => {
    exportToCsv(
      `tkd_students_${new Date().toISOString().slice(0, 10)}.csv`,
      students.map((s) => ({
        Code: s.student_code,
        Name: s.name,
        DOB: s.date_of_birth || '',
        Parent: s.parent_name,
        Phone: s.parent_phone,
        Address: s.address || '',
        Joined: s.joining_date,
        MonthlyFee: s.monthly_fee,
        Status: s.active ? 'Active' : 'Inactive',
      }))
    );
  };

  const handleExportPayments = () => {
    exportToCsv(
      `tkd_payments_${new Date().toISOString().slice(0, 10)}.csv`,
      payments.map((p) => {
        const student = students.find((s) => s.id === p.student_id);
        return {
          Date: p.payment_date,
          StudentCode: student?.student_code || '',
          StudentName: student?.name || '',
          Amount: p.amount,
          Method: p.payment_method,
          Receipt: p.receipt_number || '',
          Notes: p.notes || '',
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-red-500" />
          <span>Club Reports & Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Monthly breakdowns, attendance ratios, and exportable financial summaries.
        </p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Student Directory Export</h3>
            <p className="text-xs text-slate-400 mt-1">
              Download complete roster of all {students.length} students with contact info and registration dates.
            </p>
          </div>
          <button
            onClick={handleExportStudents}
            className="mt-4 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Students CSV</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Payment Ledger Export</h3>
            <p className="text-xs text-slate-400 mt-1">
              Download itemized ledger of {payments.length} fee transactions with receipt numbers and methods.
            </p>
          </div>
          <button
            onClick={handleExportPayments}
            className="mt-4 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Payments CSV</span>
          </button>
        </div>
      </div>

      {/* Student Performance Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Student Summary Matrix</h3>
          <span className="text-xs text-slate-400">{students.filter((s) => s.active).length} Active Students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Monthly Plan</th>
                <th className="px-4 py-3">Total Paid</th>
                <th className="px-4 py-3">Due Balance</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {students.map((student) => {
                const summary = calculateFeeSummary(student, payments);
                return (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-3 font-semibold text-white">{student.name}</td>
                    <td className="px-4 py-3 font-mono text-red-400">{student.student_code}</td>
                    <td className="px-4 py-3 text-slate-300">{formatCurrency(student.monthly_fee)}/mo</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">{formatCurrency(summary.totalPaid)}</td>
                    <td className="px-4 py-3">
                      {summary.currentDue > 0 ? (
                        <span className="font-bold text-red-400">{formatCurrency(summary.currentDue)}</span>
                      ) : (
                        <span className="text-slate-500">₹0</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          student.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
