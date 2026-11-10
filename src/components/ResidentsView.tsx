import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Resident, ResidentCategory } from '../types/index.ts';
import { formatMWK, calculateResidentBalance } from '../utils/calculations.ts';
import {
  Users,
  Search,
  Plus,
  Flame,
  Zap,
  Phone,
  DoorOpen,
  Calendar,
  Edit2,
  Trash2,
  Receipt,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  History,
  ShieldAlert,
} from 'lucide-react';

interface ResidentsViewProps {
  onOpenRecordPayment: (residentId: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const ResidentsView: React.FC<ResidentsViewProps> = ({
  onOpenRecordPayment,
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const {
    residents,
    payments,
    rates,
    currentMonth,
    currentRole,
    addResident,
    updateResident,
    deleteResident,
    toggleResidentCategory,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | ResidentCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Paid' | 'Partial' | 'Unpaid'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(isAddModalOpen);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [selectedHistoryResident, setSelectedHistoryResident] = useState<Resident | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    roomNumber: string;
    phone: string;
    category: ResidentCategory;
    notes: string;
  }>({
    name: '',
    roomNumber: '',
    phone: '',
    category: 'non_electric_stove',
    notes: '',
  });

  const [formError, setFormError] = useState('');

  // Handle open add modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      roomNumber: '',
      phone: '',
      category: 'non_electric_stove',
      notes: '',
    });
    setFormError('');
    setShowAddModal(true);
  };

  // Handle open edit
  const handleOpenEdit = (res: Resident) => {
    setFormData({
      name: res.name,
      roomNumber: res.roomNumber,
      phone: res.phone || '',
      category: res.category,
      notes: res.notes || '',
    });
    setEditingResident(res);
    setFormError('');
  };

  // Form submit
  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter resident full name.');
      return;
    }
    if (!formData.roomNumber.trim()) {
      setFormError('Please enter room number (e.g. Room 3A).');
      return;
    }

    if (editingResident) {
      updateResident(editingResident.id, {
        name: formData.name.trim(),
        roomNumber: formData.roomNumber.trim(),
        phone: formData.phone.trim() || undefined,
        category: formData.category,
        notes: formData.notes.trim() || undefined,
      });
      setEditingResident(null);
    } else {
      addResident({
        name: formData.name.trim(),
        roomNumber: formData.roomNumber.trim(),
        phone: formData.phone.trim() || undefined,
        category: formData.category,
        monthlyContribution: formData.category === 'electric_stove' ? rates.electric_stove : rates.non_electric_stove,
        joinDate: new Date().toISOString().split('T')[0],
        notes: formData.notes.trim() || undefined,
        isActive: true,
      });
      setShowAddModal(false);
      if (onCloseAddModal) onCloseAddModal();
    }
  };

  // Filtered residents list
  const filteredResidents = residents.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.phone && res.phone.includes(searchTerm));

    const matchesCategory = filterCategory === 'all' || res.category === filterCategory;

    const balance = calculateResidentBalance(res, payments, currentMonth);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'Paid' && (balance.status === 'Paid' || balance.status === 'Overpaid')) ||
      (filterStatus === 'Partial' && balance.status === 'Partial') ||
      (filterStatus === 'Unpaid' && balance.status === 'Unpaid');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Resident Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track room assignments, electric stove usage classification, and individual payment status for {currentMonth}.
          </p>
        </div>

        {currentRole === 'admin' ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Resident</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
            Resident Mode (Read-Only)
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, room, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            aria-label="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="electric_stove">Electric Stove (MK 10,000)</option>
            <option value="non_electric_stove">Non-Stove (MK 5,000)</option>
          </select>

          <select
            aria-label="Filter by payment status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partial">Partial Payment</option>
            <option value="Unpaid">Unpaid Debt</option>
          </select>

          <span className="text-xs text-slate-400 pl-2 shrink-0">
            {filteredResidents.length} found
          </span>
        </div>
      </div>

      {/* Residents List Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Resident & Room</th>
                <th className="py-3 px-4">Electricity Category</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4">Current Status ({currentMonth})</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No residents match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((res) => {
                  const balance = calculateResidentBalance(res, payments, currentMonth);
                  const isStove = res.category === 'electric_stove';

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Room */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{res.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <DoorOpen className="w-3 h-3 text-slate-400" />
                            {res.roomNumber}
                          </span>
                          {res.phone && (
                            <span className="flex items-center gap-1 text-slate-500 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {res.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Usage Category & Toggle Switch */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isStove
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isStove ? (
                              <>
                                <Flame className="w-3 h-3 text-amber-600" />
                                Electric Stove
                              </>
                            ) : (
                              <>
                                <Zap className="w-3 h-3 text-blue-600" />
                                Non-Stove User
                              </>
                            )}
                          </span>

                          {/* Quick Category Toggle Button (Admin only) */}
                          {currentRole === 'admin' && (
                            <button
                              onClick={() => toggleResidentCategory(res.id)}
                              title={`Switch to ${isStove ? 'Non-Stove (MK5,000)' : 'Electric Stove (MK10,000)'}`}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition"
                            >
                              Toggle
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Monthly Contribution */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {formatMWK(res.monthlyContribution)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            balance.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : balance.status === 'Overpaid'
                              ? 'bg-blue-100 text-blue-800'
                              : balance.status === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {balance.status === 'Paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {balance.status === 'Overpaid' && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                          {balance.status === 'Partial' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                          {balance.status === 'Unpaid' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {balance.status} ({formatMWK(balance.amountPaid)})
                        </span>
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 font-medium">
                        {balance.remainingDue > 0 ? (
                          <span className="text-rose-600 font-bold">
                            {formatMWK(balance.remainingDue)}
                          </span>
                        ) : balance.overpaidAmount > 0 ? (
                          <span className="text-blue-600 font-semibold text-[11px]">
                            +{formatMWK(balance.overpaidAmount)} credit
                          </span>
                        ) : (
                          <span className="text-slate-400">MK 0</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Payment history */}
                          <button
                            onClick={() => setSelectedHistoryResident(res)}
                            title="View Payment History"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Quick record payment (admin only) */}
                          {currentRole === 'admin' && balance.remainingDue > 0 && (
                            <button
                              onClick={() => onOpenRecordPayment(res.id)}
                              title="Record Payment"
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs"
                            >
                              Pay
                            </button>
                          )}

                          {/* Edit / Delete (admin only) */}
                          {currentRole === 'admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(res)}
                                title="Edit Resident"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove ${res.name}?`)) {
                                    deleteResident(res.id);
                                  }
                                }}
                                title="Remove Resident"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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

      {/* Add / Edit Resident Modal */}
      {(showAddModal || editingResident) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm tracking-wide">
                {editingResident ? 'Edit Resident Profile' : 'Register New Resident'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingResident(null);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kondwani Phiri"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 3B"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+265 99... / 88..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Electricity Usage Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'electric_stove' })}
                    className={`p-3 rounded-xl border text-left transition ${
                      formData.category === 'electric_stove'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-400/40'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Flame className="w-4 h-4 text-amber-600" />
                      Electric Stove
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Rate: <span className="font-bold text-slate-800">{formatMWK(rates.electric_stove)}</span>/mo
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'non_electric_stove' })}
                    className={`p-3 rounded-xl border text-left transition ${
                      formData.category === 'non_electric_stove'
                        ? 'border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-400/40'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Non-Stove User
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Rate: <span className="font-bold text-slate-800">{formatMWK(rates.non_electric_stove)}</span>/mo
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Cooking appliances / arrangement)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Uses gas for cooking, room fan & phone only..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingResident(null);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                >
                  {editingResident ? 'Update Resident' : 'Register Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resident Payment History Drawer/Modal */}
      {selectedHistoryResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm tracking-wide">
                  Payment History — {selectedHistoryResident.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedHistoryResident(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500">Room:</span>{' '}
                  <span className="font-bold text-slate-800">{selectedHistoryResident.roomNumber}</span>
                  <div className="text-slate-500 mt-0.5">
                    Category:{' '}
                    <span className="font-semibold text-blue-600">
                      {selectedHistoryResident.category === 'electric_stove'
                        ? 'Electric Stove (MK10k)'
                        : 'Non-Stove (MK5k)'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block">Monthly Rate</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatMWK(selectedHistoryResident.monthlyContribution)}
                  </span>
                </div>
              </div>

              {/* Payments table for this resident */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recorded Transactions
                </h4>
                {payments.filter((p) => p.residentId === selectedHistoryResident.id).length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No payment transactions recorded yet.
                  </div>
                ) : (
                  payments
                    .filter((p) => p.residentId === selectedHistoryResident.id)
                    .map((pay) => (
                      <div
                        key={pay.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{pay.month} Contribution</div>
                          <div className="text-[11px] text-slate-500">
                            {pay.paymentDate} via {pay.paymentMethod} • Ref: {pay.transactionReference}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-emerald-600">{formatMWK(pay.amountPaid)}</div>
                          <span className="font-mono text-[10px] text-slate-400">{pay.receiptNumber}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedHistoryResident(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
