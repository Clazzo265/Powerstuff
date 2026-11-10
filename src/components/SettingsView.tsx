import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatMWK } from '../utils/calculations.ts';
import {
  Settings,
  Shield,
  User,
  RotateCcw,
  CheckCircle2,
  Building,
  MapPin,
  Gauge,
  DollarSign,
  Phone,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    currentRole,
    setCurrentRole,
    resetToDemoData,
    residents,
  } = useApp();

  const [formSettings, setFormSettings] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            System & Property Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure hostel details, ESCOM domestic meter tariff, user roles, and security access permissions.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings saved successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Property Profile & Meter Config */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-sm text-slate-900">
              Hostel / Property & ESCOM Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Information that appears on all digital receipts, PDF reports, and WhatsApp statements.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property / Hostel Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formSettings.propertyName}
                    onChange={(e) => setFormSettings({ ...formSettings, propertyName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Address (Malawi)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formSettings.location}
                    onChange={(e) => setFormSettings({ ...formSettings, location: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ESCOM Prepaid Meter Number
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formSettings.meterNumber}
                    onChange={(e) => setFormSettings({ ...formSettings, meterNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domestic Tariff Rate (MWK per kWh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">MK</span>
                  <input
                    type="number"
                    step="0.5"
                    value={formSettings.tariffPerKwh}
                    onChange={(e) => setFormSettings({ ...formSettings, tariffPerKwh: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator / Representative Name
                </label>
                <input
                  type="text"
                  value={formSettings.adminName}
                  onChange={(e) => setFormSettings({ ...formSettings, adminName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Phone Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formSettings.adminContact}
                    onChange={(e) => setFormSettings({ ...formSettings, adminContact: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Save Property Details
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Role & Security Access Permissions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                User Role & Permissions (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Toggle between administrative management and resident read-only mode.
              </p>
            </div>

            <div className="space-y-3">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => setCurrentRole('admin')}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  currentRole === 'admin'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/40'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Administrator Role</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Full write access: register residents, record payments, buy ESCOM units, adjust category rates, and export statements.
                  </p>
                </div>
              </button>

              {/* Resident Button */}
              <button
                type="button"
                onClick={() => setCurrentRole('resident')}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  currentRole === 'resident'
                    ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-400/40'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <User className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Resident Role</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Read-only transparency access: view personal contribution receipt, check outstanding balance, and view open ledger.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Reset Demo Data Card */}
          <div className="bg-amber-50/60 rounded-2xl p-6 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              Reset DEMO DATA
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              PowerShare MW comes preloaded with 10 fictional residents in Malawi (4 electric stove users at MK 10,000, 6 non-stove users at MK 5,000 = MK 70,000 expected).
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all records back to the initial 10-resident demo scenario?')) {
                  resetToDemoData();
                }
              }}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Restore 10-Resident Demo State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
