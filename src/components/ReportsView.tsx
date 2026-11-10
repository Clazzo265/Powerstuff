import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  formatMWK,
  calculateExpectedCollection,
  calculateTotalCollected,
  calculateOutstandingAmount,
  calculateOverpaymentAmount,
  calculateCollectionPercentage,
  calculateTotalElectricityExpense,
  calculateTotalUnitsKwh,
  calculateRemainingFunds,
  calculateResidentBalance,
} from '../utils/calculations.ts';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Users,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { residents, payments, expenses, settings, currentMonth } = useApp();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const activeResidents = residents.filter((r) => r.isActive);
  const expectedNov = calculateExpectedCollection(activeResidents);
  const collectedNov = calculateTotalCollected(payments, '2026-11');
  const expensesNov = calculateTotalElectricityExpense(expenses, '2026-11');
  const unitsNov = calculateTotalUnitsKwh(expenses, '2026-11');
  const outstandingNov = calculateOutstandingAmount(expectedNov, collectedNov);
  const remainingNov = calculateRemainingFunds(settings.openingBalance, collectedNov, expensesNov);

  // October figures for MoM comparison
  const expectedOct = calculateExpectedCollection(activeResidents);
  const collectedOct = calculateTotalCollected(payments, '2026-10');
  const expensesOct = calculateTotalElectricityExpense(expenses, '2026-10');
  const unitsOct = calculateTotalUnitsKwh(expenses, '2026-10');
  const outstandingOct = calculateOutstandingAmount(expectedOct, collectedOct);
  const remainingOct = calculateRemainingFunds(0, collectedOct, expensesOct);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Resident Name', 'Room Number', 'Category', 'Monthly Due (MWK)', 'Paid (MWK)', 'Status', 'Payment Method', 'Ref', 'Date'];
    const rows = activeResidents.map((r) => {
      const bal = calculateResidentBalance(r, payments, selectedMonth);
      const pay = bal.payments[0];
      return [
        `"${r.name}"`,
        `"${r.roomNumber}"`,
        `"${r.category === 'electric_stove' ? 'Electric Stove' : 'Non-Stove'}"`,
        r.monthlyContribution,
        bal.amountPaid,
        `"${bal.status}"`,
        `"${pay ? pay.paymentMethod : 'N/A'}"`,
        `"${pay ? pay.transactionReference : 'N/A'}"`,
        `"${pay ? pay.paymentDate : 'N/A'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PowerShare_MW_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Financial Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official monthly reconciliations, resident reliability performance, and CSV / PDF data exports.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Monthly Report Card (Printable) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 print-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Monthly Statement of Account
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {settings.propertyName} — {selectedMonth}
            </h2>
            <p className="text-xs text-slate-500">
              ESCOM Meter: <span className="font-mono text-slate-700">{settings.meterNumber}</span> • Representative: {settings.adminName}
            </p>
          </div>

          <div className="no-print">
            <select
              aria-label="Select report month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="2026-11">November 2026</option>
              <option value="2026-10">October 2026</option>
            </select>
          </div>
        </div>

        {/* 6 Key Report Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected</span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block">
              {formatMWK(expectedNov)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Collected</span>
            <span className="text-base font-extrabold text-emerald-600 mt-1 block">
              {formatMWK(collectedNov)}
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Outstanding</span>
            <span className="text-base font-extrabold text-amber-600 mt-1 block">
              {formatMWK(outstandingNov)}
            </span>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">ESCOM Purchases</span>
            <span className="text-base font-extrabold text-rose-600 mt-1 block">
              {formatMWK(expensesNov)}
            </span>
          </div>

          <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200">
            <span className="text-[10px] uppercase font-bold text-cyan-700 block">Energy (kWh)</span>
            <span className="text-base font-extrabold text-cyan-700 mt-1 block">
              {unitsNov} kWh
            </span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">Remaining Funds</span>
            <span className="text-base font-extrabold text-blue-700 mt-1 block">
              {formatMWK(remainingNov)}
            </span>
          </div>
        </div>

        {/* Month-over-Month Comparison Table */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
            Month-over-Month Comparative Analytics
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                <tr className="border-b border-slate-200">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">October 2026</th>
                  <th className="py-2.5 px-3">November 2026</th>
                  <th className="py-2.5 px-3">Variance / Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">Expected Collection</td>
                  <td className="py-2.5 px-3">{formatMWK(expectedOct)}</td>
                  <td className="py-2.5 px-3 font-bold">{formatMWK(expectedNov)}</td>
                  <td className="py-2.5 px-3 text-slate-500">0% (Stable 10 residents)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">Actual Collections</td>
                  <td className="py-2.5 px-3 text-emerald-600">{formatMWK(collectedOct)} (100%)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">{formatMWK(collectedNov)} (80%)</td>
                  <td className="py-2.5 px-3 text-amber-600">2 residents pending</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">ESCOM Power Purchases</td>
                  <td className="py-2.5 px-3 text-rose-600">{formatMWK(expensesOct)} (279.5 kWh)</td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold">{formatMWK(expensesNov)} (215.0 kWh)</td>
                  <td className="py-2.5 px-3 text-emerald-600">-23% lower spending</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">Carried Forward Surplus</td>
                  <td className="py-2.5 px-3">{formatMWK(remainingOct)}</td>
                  <td className="py-2.5 px-3 text-blue-600 font-bold">{formatMWK(remainingNov)}</td>
                  <td className="py-2.5 px-3 text-emerald-600">+MK 6,000 reserve growth</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Resident Payment Performance Scorecard */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
            Resident Reliability & Payment Performance Scorecard
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                <tr className="border-b border-slate-200">
                  <th className="py-2.5 px-3">Resident & Room</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Monthly Due</th>
                  <th className="py-2.5 px-3">Amount Paid</th>
                  <th className="py-2.5 px-3">Nov Status</th>
                  <th className="py-2.5 px-3 text-right">Reliability Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeResidents.map((res) => {
                  const bal = calculateResidentBalance(res, payments, selectedMonth);
                  const isPaid = bal.status === 'Paid' || bal.status === 'Overpaid';

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {res.name} <span className="font-normal text-slate-500">({res.roomNumber})</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          res.category === 'electric_stove' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {res.category === 'electric_stove' ? 'Stove (10k)' : 'Non-Stove (5k)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {formatMWK(res.monthlyContribution)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">
                        {formatMWK(bal.amountPaid)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : bal.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {bal.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-bold text-slate-700">
                          {isPaid ? '100% ★★★★★' : bal.status === 'Partial' ? '50% ★★★☆☆' : '0% ★☆☆☆☆'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stamp & Authorized Signature */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-end text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Generated automatically by</div>
            <div className="font-bold text-slate-800 text-sm">PowerShare MW Audit Engine</div>
            <div className="text-[10px] text-slate-400">Currency: Malawi Kwacha (MWK)</div>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-300 w-44 pb-1 mb-1 text-center font-serif italic text-slate-600">
              Chikondi Phiri
            </div>
            <div className="text-[11px] font-bold text-slate-800">{settings.adminName}</div>
            <div className="text-[10px] text-slate-500">Hostel Electricity Representative</div>
          </div>
        </div>
      </div>
    </div>
  );
};
