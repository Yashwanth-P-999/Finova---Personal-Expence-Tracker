import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  FileText,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.ts';
import { MonthlyReport } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [month, setMonth] = useState<number>(10);
  const [year, setYear] = useState<number>(2026);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMonthlyReport(month, year);
      setReport(res);
    } catch (err: any) {
      error(err.message || 'Failed to load monthly report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);
      const blob = await api.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartFin_Transactions_${year}_${String(month).padStart(2, '0')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      success('CSV statement downloaded successfully');
    } catch (err: any) {
      error(err.message || 'Export failed');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const blob = await api.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartFin_Spendings_Report_${year}_${String(month).padStart(2, '0')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      success('Excel spreadsheet workbook (.xlsx) downloaded successfully');
    } catch (err: any) {
      error(err.message || 'Excel export failed');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const currencySymbol = user?.currency || '₹';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Financial Statements & Exports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit-ready monthly statement and multi-tab Excel spreadsheet workbook downloads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="text-xs font-semibold text-slate-700 bg-transparent px-2 py-1 focus:outline-hidden"
            >
              {monthNames.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="text-xs font-semibold text-slate-700 bg-transparent px-2 py-1 focus:outline-hidden"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* Export Excel CTA */}
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? 'Generating Excel...' : 'Download Excel (.xlsx)'}</span>
          </button>

          {/* Export CSV CTA */}
          <button
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>{isExportingCsv ? 'Exporting...' : 'CSV'}</span>
          </button>
        </div>
      </div>

      {/* Official Monthly Statement Sheet */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="text-xs font-extrabold text-indigo-800 uppercase tracking-widest">
              SmartFin Statement
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {monthNames[month - 1]} {year} Summary
            </h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Account Holder: {user?.fullName || 'User'} · {user?.email}
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Generated: {new Date().toLocaleDateString('en-GB')}</div>
            <div>Status: Reconciled</div>
          </div>
        </div>

        {/* 3 Metrics Column */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50/75 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Inflow (Income)
            </span>
            <div className="mt-1 text-xl font-bold text-emerald-600">
              {formatCurrency(report?.income || 0, currencySymbol)}
            </div>
          </div>

          <div className="p-4 bg-slate-50/75 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Outflow (Expenses)
            </span>
            <div className="mt-1 text-xl font-bold text-red-600">
              {formatCurrency(report?.expenses || 0, currencySymbol)}
            </div>
          </div>

          <div className="p-4 bg-slate-50/75 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Net Savings (Surplus)
            </span>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(report?.savings || 0, currencySymbol)}{' '}
              <span className="text-xs font-semibold text-emerald-600">
                ({report?.savingsRate || 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Category Breakdown
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-right">Share of Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report?.categoryBreakdown && report.categoryBreakdown.length > 0 ? (
                  report.categoryBreakdown.map((cat) => (
                    <tr key={cat.categoryId}>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{cat.name}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(cat.amount, currencySymbol)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500">
                        {cat.percentage}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">
                      No expense data recorded for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Transactions */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Significant Transactions
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report?.topTransactions && report.topTransactions.length > 0 ? (
                  report.topTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2.5 px-4 text-slate-500">{formatDate(tx.date)}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{tx.description}</td>
                      <td className="py-2.5 px-4 text-slate-600">{tx.category}</td>
                      <td className="py-2.5 px-4 text-slate-600">{tx.account}</td>
                      <td
                        className={`py-2.5 px-4 text-right font-semibold ${
                          tx.type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatCurrency(tx.amount, currencySymbol)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
