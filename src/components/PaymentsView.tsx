import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Payment, PaymentMethod } from '../types/index.ts';
import {
  formatMWK,
  calculateExpectedCollection,
  calculateTotalCollected,
  calculateOutstandingAmount,
  calculateOverpaymentAmount,
  calculateResidentBalance,
} from '../utils/calculations.ts';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Receipt,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  X,
  Share2,
  Trash2,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal.tsx';

interface PaymentsViewProps {
  isRecordModalOpen?: boolean;
  prefillResidentId?: string;
  onCloseRecordModal?: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  isRecordModalOpen = false,
  prefillResidentId,
  onCloseRecordModal,
}) => {
  const {
    residents,
    payments,
    settings,
    currentMonth,
    currentRole,
    selectedResidentId,
    recordPayment,
    deletePayment,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // Modal states
  const [showRecordModal, setShowRecordModal] = useState(isRecordModalOpen);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  // Form states
  const [formResidentId, setFormResidentId] = useState(prefillResidentId || residents[0]?.id || '');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('Airtel Money');
  const [formRef, setFormRef] = useState('');
  const [formMonth, setFormMonth] = useState(currentMonth);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Selected resident calculation for form
  const selectedFormResident = residents.find((r) => r.id === formResidentId) || residents[0];
  const formResidentBalance = selectedFormResident
    ? calculateResidentBalance(selectedFormResident, payments, formMonth)
    : null;

  // Filter payments
  const filteredPayments = payments.filter((pay) => {
    // If resident mode, only show current resident's payments
    if (currentRole === 'resident' && pay.residentId !== selectedResidentId) {
      return false;
    }

    const matchesSearch =
      pay.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.transactionReference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMonth = filterMonth === 'all' || pay.month === filterMonth;
    const matchesMethod = filterMethod === 'all' || pay.paymentMethod === filterMethod;

    return matchesSearch && matchesMonth && matchesMethod;
  });

  // Calculate totals for active filter month
  const activeResidents = residents.filter((r) => r.isActive);
  const expectedMonth = calculateExpectedCollection(activeResidents);
  const collectedMonth = calculateTotalCollected(payments, filterMonth === 'all' ? undefined : filterMonth);
  const outstandingMonth = calculateOutstandingAmount(expectedMonth, collectedMonth);
  const overpaidMonth = calculateOverpaymentAmount(expectedMonth, collectedMonth);

  // Unpaid residents for the filter month
  const unpaidForMonth = activeResidents
    .map((r) => calculateResidentBalance(r, payments, filterMonth === 'all' ? currentMonth : filterMonth))
    .filter((b) => b.status === 'Unpaid' || b.status === 'Partial');

  const handleOpenRecord = (resId?: string) => {
    const targetId = resId || residents[0]?.id || '';
    setFormResidentId(targetId);
    const targetResident = residents.find((r) => r.id === targetId);
    if (targetResident) {
      const bal = calculateResidentBalance(targetResident, payments, currentMonth);
      setFormAmount(bal.remainingDue > 0 ? bal.remainingDue : targetResident.monthlyContribution);
    } else {
      setFormAmount('');
    }
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMethod('Airtel Money');
    setFormRef(`AIR-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormMonth(currentMonth);
    setFormNotes('');
    setFormError('');
    setShowRecordModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formResidentId) {
      setFormError('Please select a resident.');
      return;
    }
    const numAmount = Number(formAmount);
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than MK 0.');
      return;
    }
    if (!formRef.trim()) {
      setFormError('Please provide a transaction reference number or code.');
      return;
    }

    const res = residents.find((r) => r.id === formResidentId);
    if (!res) return;

    // Determine status
    const previousPaid = payments
      .filter((p) => p.residentId === res.id && p.month === formMonth)
      .reduce((sum, p) => sum + p.amountPaid, 0);
    const newTotalPaid = previousPaid + numAmount;
    const due = res.monthlyContribution;

    let status: 'Paid' | 'Partial' | 'Overpaid' = 'Paid';
    if (newTotalPaid > due) status = 'Overpaid';
    else if (newTotalPaid === due) status = 'Paid';
    else status = 'Partial';

    const newPayment = recordPayment({
      residentId: res.id,
      residentName: res.name,
      amountPaid: numAmount,
      paymentDate: formDate,
      paymentMethod: formMethod,
      transactionReference: formRef.trim(),
      month: formMonth,
      status,
      notes: formNotes.trim() || undefined,
      recordedBy: settings.adminName,
    });

    setShowRecordModal(false);
    if (onCloseRecordModal) onCloseRecordModal();
    // Open receipt modal right away
    setActiveReceipt(newPayment);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Payment Tracking & Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record electricity contributions via Airtel Money, TNM Mpamba, Cash, or Bank Transfer with instant receipts.
          </p>
        </div>

        {currentRole === 'admin' ? (
          <button
            onClick={() => handleOpenRecord()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Payment</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
            Viewing as Resident (Personal Receipts)
          </div>
        )}
      </div>

      {/* Summary KPI Cards for payments */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Collected ({filterMonth === 'all' ? 'All Time' : filterMonth})
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {formatMWK(collectedMonth)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {filteredPayments.length} recorded payments
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Outstanding Due
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {formatMWK(outstandingMonth)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {unpaidForMonth.length} pending resident(s)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Surplus / Overpayments
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {formatMWK(overpaidMonth)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Credited toward electricity fund
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search resident, receipt, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            aria-label="Filter payment month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Months</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026</option>
          </select>

          <select
            aria-label="Filter payment method"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Methods</option>
            <option value="Airtel Money">Airtel Money</option>
            <option value="TNM Mpamba">TNM Mpamba</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          <span className="text-xs text-slate-400 pl-2 shrink-0">
            {filteredPayments.length} payments
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Date & Month</th>
                <th className="py-3 px-4">Payment Method & Reference</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => {
                  const res = residents.find((r) => r.id === pay.residentId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {pay.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{pay.residentName}</div>
                        <div className="text-[11px] text-slate-500">
                          {res?.roomNumber || 'Room'} •{' '}
                          <span className="text-blue-600">
                            {res?.category === 'electric_stove' ? 'Stove (10k)' : 'Non-Stove (5k)'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{pay.paymentDate}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{pay.month}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium text-[11px]">
                          {pay.paymentMethod}
                        </span>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          {pay.transactionReference}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-extrabold text-emerald-600">
                          {formatMWK(pay.amountPaid)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            pay.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pay.status === 'Overpaid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveReceipt(pay)}
                            title="View & Print Official Receipt"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold transition"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>

                          {currentRole === 'admin' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete payment record ${pay.receiptNumber}?`)) {
                                  deletePayment(pay.id);
                                }
                              }}
                              title="Delete Payment"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm tracking-wide">Record Resident Payment</h3>
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  if (onCloseRecordModal) onCloseRecordModal();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Resident select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resident Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formResidentId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setFormResidentId(id);
                    const r = residents.find((x) => x.id === id);
                    if (r) {
                      const bal = calculateResidentBalance(r, payments, formMonth);
                      setFormAmount(bal.remainingDue > 0 ? bal.remainingDue : r.monthlyContribution);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  required
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.roomNumber}) — {r.category === 'electric_stove' ? 'Stove (MK10k)' : 'Non-Stove (MK5k)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resident Balance Info Pill */}
              {formResidentBalance && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block">Monthly Contribution:</span>
                    <span className="font-bold text-slate-800">
                      {formatMWK(formResidentBalance.monthlyContribution)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Current Status:</span>
                    <span className="font-bold text-blue-700">
                      {formResidentBalance.status} (Remaining: {formatMWK(formResidentBalance.remainingDue)})
                    </span>
                  </div>
                </div>
              )}

              {/* Amount with quick fill */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Amount Paid (MWK) <span className="text-rose-500">*</span>
                  </label>
                  {formResidentBalance && formResidentBalance.remainingDue > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormAmount(formResidentBalance.remainingDue)}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Fill Due: {formatMWK(formResidentBalance.remainingDue)}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">MK</span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    placeholder="e.g. 10000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => {
                      const method = e.target.value as PaymentMethod;
                      setFormMethod(method);
                      if (method === 'Airtel Money') setFormRef(`AIR-${Math.floor(1000000 + Math.random() * 9000000)}`);
                      else if (method === 'TNM Mpamba') setFormRef(`MPA-${Math.floor(1000000 + Math.random() * 9000000)}`);
                      else if (method === 'Bank Transfer') setFormRef(`NBM-${Math.floor(1000000 + Math.random() * 9000000)}`);
                      else if (method === 'Cash') setFormRef(`CSH-${Date.now().toString().slice(-4)}`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="TNM Mpamba">TNM Mpamba</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Transaction Ref & Month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Reference <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AIR-8829102"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Month
                  </label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="2026-11">November 2026</option>
                    <option value="2026-10">October 2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid first installment via agent"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecordModal(false);
                    if (onCloseRecordModal) onCloseRecordModal();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                >
                  Save & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          payment={activeReceipt}
          resident={residents.find((r) => r.id === activeReceipt.residentId)}
          propertyName={settings.propertyName}
          meterNumber={settings.meterNumber}
          adminName={settings.adminName}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
