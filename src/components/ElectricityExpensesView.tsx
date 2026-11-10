import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ElectricityExpense } from '../types/index.ts';
import {
  formatMWK,
  calculateTotalCollected,
  calculateTotalElectricityExpense,
  calculateTotalUnitsKwh,
  calculateRemainingFunds,
} from '../utils/calculations.ts';
import {
  Zap,
  Plus,
  Copy,
  Check,
  Calendar,
  DollarSign,
  TrendingUp,
  Gauge,
  ArrowRight,
  ShieldAlert,
  Trash2,
  X,
  Share2,
} from 'lucide-react';

interface ElectricityExpensesViewProps {
  isRecordModalOpen?: boolean;
  onCloseRecordModal?: () => void;
}

export const ElectricityExpensesView: React.FC<ElectricityExpensesViewProps> = ({
  isRecordModalOpen = false,
  onCloseRecordModal,
}) => {
  const {
    expenses,
    payments,
    settings,
    currentMonth,
    currentRole,
    recordExpense,
    deleteExpense,
    updateSettings,
  } = useApp();

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(isRecordModalOpen);
  const [filterMonth, setFilterMonth] = useState(currentMonth);

  // Form states
  const [amount, setAmount] = useState<number | ''>(25000);
  const [unitsKwh, setUnitsKwh] = useState<number | ''>(107.5);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tokenNumber, setTokenNumber] = useState('');
  const [vendor, setVendor] = useState('Airtel Money ESCOM Token');
  const [meterReadingBefore, setMeterReadingBefore] = useState<number | ''>(14398.0);
  const [meterReadingAfter, setMeterReadingAfter] = useState<number | ''>(14505.5);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Calculations for current month
  const totalCollected = calculateTotalCollected(payments, currentMonth);
  const totalExpensesMonth = calculateTotalElectricityExpense(expenses, currentMonth);
  const totalUnitsMonth = calculateTotalUnitsKwh(expenses, currentMonth);
  const remainingFunds = calculateRemainingFunds(
    settings.openingBalance,
    totalCollected,
    totalExpensesMonth
  );

  const filteredExpenses = expenses.filter(
    (e) => filterMonth === 'all' || e.month === filterMonth
  );

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token.replace(/-/g, ' '));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleOpenAdd = () => {
    // Generate realistic 20-digit ESCOM token
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    const part4 = Math.floor(1000 + Math.random() * 9000);
    const part5 = Math.floor(1000 + Math.random() * 9000);

    setTokenNumber(`${part1}-${part2}-${part3}-${part4}-${part5}`);
    setAmount(20000);
    const estimatedKwh = Math.round((20000 / (settings.tariffPerKwh || 232.5)) * 10) / 10;
    setUnitsKwh(estimatedKwh);
    setDate(new Date().toISOString().split('T')[0]);
    setVendor('Airtel Money ESCOM Token');
    setNotes('');
    setFormError('');
    setShowModal(true);
  };

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    if (newAmount > 0) {
      const estimatedKwh = Math.round((newAmount / (settings.tariffPerKwh || 232.5)) * 10) / 10;
      setUnitsKwh(estimatedKwh);
    }
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    const numKwh = Number(unitsKwh);

    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid purchase amount in MWK.');
      return;
    }
    if (!numKwh || numKwh <= 0) {
      setFormError('Please enter valid electricity units (kWh).');
      return;
    }
    if (!tokenNumber.trim()) {
      setFormError('Please provide the 20-digit ESCOM prepaid token number.');
      return;
    }

    recordExpense({
      date,
      amount: numAmount,
      unitsKwh: numKwh,
      tokenNumber: tokenNumber.trim(),
      vendor,
      month: currentMonth,
      meterReadingBefore: meterReadingBefore !== '' ? Number(meterReadingBefore) : undefined,
      meterReadingAfter: meterReadingAfter !== '' ? Number(meterReadingAfter) : undefined,
      notes: notes.trim() || undefined,
    });

    setShowModal(false);
    if (onCloseRecordModal) onCloseRecordModal();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-600" />
            Electricity Expenditure Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track actual ESCOM prepaid token purchases, meter kWh loaded, and monthly surplus carryforward.
          </p>
        </div>

        {currentRole === 'admin' ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Log ESCOM Token Purchase</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
            Resident Mode (Audit View)
          </div>
        )}
      </div>

      {/* Critical Equation Display Banner */}
      {/* Total contributions - Actual electricity expenditure = Remaining funds */}
      <div className="bg-[#071426] text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
          Monthly Electricity Balance Equation
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Inflow */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              1. Total Collected
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {formatMWK(totalCollected)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">From resident payments</span>
          </div>

          {/* Plus Opening Balance */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              2. Opening Balance
            </span>
            <div className="text-xl font-black text-cyan-300 mt-0.5">
              +{formatMWK(settings.openingBalance)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Surplus from prior month</span>
          </div>

          {/* Minus Actual ESCOM Purchases */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              3. ESCOM Purchases
            </span>
            <div className="text-xl font-black text-rose-400 mt-0.5">
              -{formatMWK(totalExpensesMonth)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{totalUnitsMonth} kWh loaded</span>
          </div>

          {/* Equals Remaining Reserve */}
          <div className="p-3.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl border border-cyan-400/40 text-white shadow-md">
            <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-100 block">
              = Remaining Funds
            </span>
            <div className="text-2xl font-black text-white mt-0.5 tracking-tight">
              {formatMWK(remainingFunds)}
            </div>
            <span className="text-[10px] text-cyan-100 block mt-0.5">
              {settings.autoCarryForward ? 'Carried forward to Dec 2026' : 'Available reserve'}
            </span>
          </div>
        </div>
      </div>

      {/* Meter Stats & Prepaid Hardware Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              ESCOM Meter Number
            </span>
            <div className="font-mono font-bold text-sm text-slate-900 mt-0.5">
              {settings.meterNumber}
            </div>
            <span className="text-[11px] text-slate-500">
              Domestic Tariff: MK {settings.tariffPerKwh} / kWh
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              Total Energy Loaded ({currentMonth})
            </span>
            <div className="font-bold text-sm text-slate-900 mt-0.5">
              {totalUnitsMonth} kWh
            </div>
            <span className="text-[11px] text-slate-500">
              Avg daily consumption: ~{(totalUnitsMonth / 10).toFixed(1)} kWh/day
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              Surplus Rollover Policy
            </span>
            <div className="font-bold text-xs text-slate-900 mt-0.5">
              {settings.autoCarryForward ? 'Auto Carry-Forward: Active' : 'Reset at month end'}
            </div>
            <span className="text-[11px] text-slate-500">
              Surplus never gets lost or pocketed
            </span>
          </div>

          {currentRole === 'admin' && (
            <button
              onClick={() => updateSettings({ autoCarryForward: !settings.autoCarryForward })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                settings.autoCarryForward
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {settings.autoCarryForward ? 'Enabled' : 'Disabled'}
            </button>
          )}
        </div>
      </div>

      {/* Filter and ESCOM Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-sm text-slate-900">
              ESCOM Prepaid Purchase Records & Tokens
            </h2>
            <span className="text-xs text-slate-400">({filteredExpenses.length} transactions)</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter expenses by month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Months</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-10">October 2026</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date & Vendor</th>
                <th className="py-3 px-4">ESCOM 20-Digit Token Number</th>
                <th className="py-3 px-4">Units (kWh)</th>
                <th className="py-3 px-4">Purchase Amount</th>
                <th className="py-3 px-4">Meter Readings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No electricity purchase records found for this period.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exp.date}</div>
                      <div className="text-[11px] text-slate-500">{exp.vendor}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {exp.tokenNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(exp.tokenNumber)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                          title="Copy token code for keypad entry"
                        >
                          {copiedToken === exp.tokenNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 mt-1 italic">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-700">
                      +{exp.unitsKwh} kWh
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatMWK(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {exp.meterReadingBefore !== undefined && exp.meterReadingAfter !== undefined ? (
                        <span>
                          {exp.meterReadingBefore} → {exp.meterReadingAfter}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not recorded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {currentRole === 'admin' ? (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this electricity purchase record?')) {
                              deleteExpense(exp.id);
                            }
                          }}
                          title="Delete Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Audited</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log ESCOM Token Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm tracking-wide">Record ESCOM Electricity Purchase</h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (onCloseRecordModal) onCloseRecordModal();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Purchase Amount & Units kWh */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Paid (MWK) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">MK</span>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      value={amount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Units (kWh) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={unitsKwh}
                    onChange={(e) => setUnitsKwh(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-cyan-700 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 20-digit token number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ESCOM Prepaid Token Number (20 Digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4829-1029-4821-3902-1847"
                  value={tokenNumber}
                  onChange={(e) => setTokenNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              {/* Vendor & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchased Via
                  </label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Airtel Money ESCOM Token">Airtel Money</option>
                    <option value="TNM Mpamba ESCOM Token">TNM Mpamba</option>
                    <option value="National Bank Mo626">National Bank Mo626</option>
                    <option value="Standard Bank 247">Standard Bank 247</option>
                    <option value="ESCOM Service Center">ESCOM Service Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Meter readings before & after (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meter Reading Before (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14312.0"
                    value={meterReadingBefore}
                    onChange={(e) => setMeterReadingBefore(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meter Reading After (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14398.0"
                    value={meterReadingAfter}
                    onChange={(e) => setMeterReadingAfter(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reloaded after low meter warning"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (onCloseRecordModal) onCloseRecordModal();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs"
                >
                  Save ESCOM Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
