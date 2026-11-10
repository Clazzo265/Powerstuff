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
  Users,
  Flame,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  Receipt,
  Plus,
  Share2,
} from 'lucide-react';
import { Payment } from '../types/index.ts';
import { ReceiptModal } from './ReceiptModal.tsx';

interface DashboardViewProps {
  onOpenRecordPayment: (prefillResidentId?: string) => void;
  onOpenRecordExpense: () => void;
  onOpenAddResident: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRecordPayment,
  onOpenRecordExpense,
  onOpenAddResident,
}) => {
  const {
    residents,
    payments,
    expenses,
    rates,
    settings,
    currentMonth,
    currentRole,
    selectedResidentId,
    setActiveTab,
  } = useApp();

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);

  // Calculations for current month
  const activeResidents = residents.filter((r) => r.isActive);
  const stoveUsers = activeResidents.filter((r) => r.category === 'electric_stove');
  const nonStoveUsers = activeResidents.filter((r) => r.category === 'non_electric_stove');

  const expectedCollection = calculateExpectedCollection(activeResidents);
  const totalCollected = calculateTotalCollected(payments, currentMonth);
  const outstandingAmount = calculateOutstandingAmount(expectedCollection, totalCollected);
  const overpaidTotal = calculateOverpaymentAmount(expectedCollection, totalCollected);
  const collectionPct = calculateCollectionPercentage(totalCollected, expectedCollection);

  const electricityExpense = calculateTotalElectricityExpense(expenses, currentMonth);
  const totalUnitsKwh = calculateTotalUnitsKwh(expenses, currentMonth);
  const remainingFunds = calculateRemainingFunds(
    settings.openingBalance,
    totalCollected,
    electricityExpense
  );

  // Individual resident statuses for current month
  const residentBalances = activeResidents.map((r) =>
    calculateResidentBalance(r, payments, currentMonth)
  );

  const unpaidResidents = residentBalances.filter(
    (b) => b.status === 'Unpaid' || b.status === 'Partial'
  );
  const paidResidents = residentBalances.filter(
    (b) => b.status === 'Paid' || b.status === 'Overpaid'
  );

  // Current resident status (for Resident role view)
  const currentResident = residents.find((r) => r.id === selectedResidentId) || residents[0];
  const currentResidentBalance = currentResident
    ? calculateResidentBalance(currentResident, payments, currentMonth)
    : null;

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token.replace(/-/g, ' '));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Resident Mode Announcement Card */}
      {currentRole === 'resident' && currentResidentBalance && (
        <div className="bg-gradient-to-r from-[#071426] via-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-blue-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Resident Personal Portal
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">
                Moni, {currentResident.name} ({currentResident.roomNumber})
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Your usage category:{' '}
                <span className="font-semibold text-cyan-200">
                  {currentResident.category === 'electric_stove'
                    ? 'Electric Stove User (MK 10,000/mo)'
                    : 'Non-Electric Stove User (MK 5,000/mo)'}
                </span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 min-w-[200px]">
              <div className="text-[11px] text-slate-300 font-medium">November 2026 Status:</div>
              <div className="flex items-center justify-between mt-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentResidentBalance.status === 'Paid'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                      : currentResidentBalance.status === 'Overpaid'
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40'
                      : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  }`}
                >
                  {currentResidentBalance.status.toUpperCase()}
                </span>
                <span className="text-base font-extrabold text-white">
                  Paid: {formatMWK(currentResidentBalance.amountPaid)}
                </span>
              </div>
              {currentResidentBalance.remainingDue > 0 && (
                <div className="text-xs text-rose-300 mt-1 font-semibold">
                  Remaining Due: {formatMWK(currentResidentBalance.remainingDue)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Property & Month Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Electricity Contribution Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {settings.propertyName} • ESCOM Meter: <span className="font-mono font-medium text-slate-700">{settings.meterNumber}</span>
          </p>
        </div>

        {/* Action Buttons (Admin Only) */}
        {currentRole === 'admin' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenRecordPayment()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
            <button
              onClick={onOpenRecordExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Buy ESCOM Units</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Expected Collection */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Expected Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              MWK
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatMWK(expectedCollection)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {stoveUsers.length} stove ({formatMWK(stoveUsers.length * rates.electric_stove)}) + {nonStoveUsers.length} non-stove ({formatMWK(nonStoveUsers.length * rates.non_electric_stove)})
            </span>
          </div>
        </div>

        {/* Card 2: Total Collected */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 tracking-tight">
            {formatMWK(totalCollected)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>{paidResidents.length} of {activeResidents.length} settled</span>
            <span className="font-semibold text-emerald-600">{collectionPct}% complete</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(collectionPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Outstanding Payments */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Amount
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 tracking-tight">
            {formatMWK(outstandingAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>{unpaidResidents.length} resident(s) pending</span>
            {overpaidTotal > 0 && (
              <span className="text-blue-600 font-medium text-[11px]">+{formatMWK(overpaidTotal)} buffer</span>
            )}
          </div>
        </div>

        {/* Card 4: ESCOM Spent & Remaining Funds */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-cyan-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Electricity Remaining
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-cyan-700 tracking-tight">
            {formatMWK(remainingFunds)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Spent: {formatMWK(electricityExpense)}</span>
            <span className="font-semibold text-slate-700">{totalUnitsKwh} kWh loaded</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Visual Breakdown & ESCOM Meter Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Flow & Category Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Financial Breakdown & Inflow / Outflow</h3>
              <p className="text-xs text-slate-500">
                Transparent view of collected contributions versus ESCOM prepaid purchases
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transparency')}
              className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Full Transparency →
            </button>
          </div>

          {/* Interactive Stacked Bar Visual */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-700">Monthly Contribution Collection Progress</span>
                <span className="text-slate-900 font-bold">{formatMWK(totalCollected)} / {formatMWK(expectedCollection)}</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${Math.min((totalCollected / (expectedCollection || 1)) * 100, 100)}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Collected: ${formatMWK(totalCollected)}`}
                />
                <div
                  style={{ width: `${Math.max(0, 100 - (totalCollected / (expectedCollection || 1)) * 100)}%` }}
                  className="bg-amber-200 transition-all duration-500"
                  title={`Outstanding: ${formatMWK(outstandingAmount)}`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Collected ({formatMWK(totalCollected)})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block"></span>
                  Unpaid ({formatMWK(outstandingAmount)})
                </span>
              </div>
            </div>

            {/* Inflow vs Expenditure comparison */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-700">Funds Utilization vs Actual ESCOM Power Tokens</span>
                <span className="text-slate-900 font-bold">
                  {formatMWK(electricityExpense)} spent • {formatMWK(remainingFunds)} reserve
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${Math.min((electricityExpense / (totalCollected + settings.openingBalance || 1)) * 100, 100)}%` }}
                  className="bg-blue-600 transition-all duration-500"
                  title={`ESCOM Purchases: ${formatMWK(electricityExpense)}`}
                />
                <div
                  style={{ width: `${Math.max(0, 100 - (electricityExpense / (totalCollected + settings.openingBalance || 1)) * 100)}%` }}
                  className="bg-cyan-400 transition-all duration-500"
                  title={`Remaining Reserve: ${formatMWK(remainingFunds)}`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  ESCOM Purchases ({formatMWK(electricityExpense)})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                  Current Reserve ({formatMWK(remainingFunds)})
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                Electric Stove Users ({stoveUsers.length})
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                {formatMWK(stoveUsers.length * rates.electric_stove)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formatMWK(rates.electric_stove)} / resident • Consumes ~80% of units
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                Non-Stove Users ({nonStoveUsers.length})
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                {formatMWK(nonStoveUsers.length * rates.non_electric_stove)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formatMWK(rates.non_electric_stove)} / resident • Lights, phone, laptop only
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: ESCOM Token & Meter Status Box */}
        <div className="bg-[#071426] text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-cyan-300">ESCOM Meter Unit</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Prepaid Meter Number
              </div>
              <div className="font-mono text-base font-bold text-white tracking-widest mt-0.5">
                {settings.meterNumber}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tariff: <span className="text-cyan-300 font-semibold">{settings.tariffPerKwh} MWK / kWh</span>
              </div>
            </div>

            {/* Latest Token Purchased */}
            {expenses.length > 0 && (
              <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span className="font-semibold text-cyan-400">Latest Loaded Token</span>
                  <span className="text-[10px] text-slate-400">{expenses[0].date}</span>
                </div>
                <div className="font-mono text-xs font-bold text-white tracking-wider bg-black/40 p-2 rounded-lg break-all">
                  {expenses[0].tokenNumber}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-300">
                    +{expenses[0].unitsKwh} kWh ({formatMWK(expenses[0].amount)})
                  </span>
                  <button
                    onClick={() => handleCopyToken(expenses[0].tokenNumber)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-white transition"
                  >
                    {copiedToken === expenses[0].tokenNumber ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('expenses')}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View ESCOM History & Readings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Unpaid Residents Alerts & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments Alert List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Pending Contributions ({unpaidResidents.length})
              </h3>
            </div>
            <span className="text-xs text-amber-600 font-semibold">
              Total Due: {formatMWK(outstandingAmount)}
            </span>
          </div>

          {unpaidResidents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All active residents have fully settled their electricity contributions for {currentMonth}!
            </div>
          ) : (
            <div className="space-y-2.5">
              {unpaidResidents.map((item) => (
                <div
                  key={item.residentId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{item.residentName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Due: {formatMWK(item.monthlyContribution)}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-medium">
                        Balance: {formatMWK(item.remainingDue)}
                      </span>
                    </div>
                  </div>

                  {currentRole === 'admin' ? (
                    <button
                      onClick={() => onOpenRecordPayment(item.residentId)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                    >
                      Record Payment
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {item.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Confirmed Payments Feed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Payments</h3>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View All ({payments.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {payments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{pay.residentName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {pay.paymentMethod}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {pay.paymentDate} • Ref: {pay.transactionReference}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <div className="font-extrabold text-xs text-emerald-600">
                      +{formatMWK(pay.amountPaid)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {pay.receiptNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingReceipt(pay)}
                    title="View & Print Official Receipt"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200 transition"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {viewingReceipt && (
        <ReceiptModal
          payment={viewingReceipt}
          resident={residents.find((r) => r.id === viewingReceipt.residentId)}
          propertyName={settings.propertyName}
          meterNumber={settings.meterNumber}
          adminName={settings.adminName}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};
