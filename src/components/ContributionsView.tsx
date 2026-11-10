import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatMWK, calculateExpectedCollection } from '../utils/calculations.ts';
import {
  Calculator,
  Flame,
  Zap,
  Sliders,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Scale,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

export const ContributionsView: React.FC = () => {
  const { residents, rates, updateCategoryRates, currentRole, settings } = useApp();

  const activeResidents = residents.filter((r) => r.isActive);
  const stoveUsers = activeResidents.filter((r) => r.category === 'electric_stove');
  const nonStoveUsers = activeResidents.filter((r) => r.category === 'non_electric_stove');

  const stoveSubtotal = stoveUsers.length * rates.electric_stove;
  const nonStoveSubtotal = nonStoveUsers.length * rates.non_electric_stove;
  const expectedTotal = stoveSubtotal + nonStoveSubtotal;

  // Rate edit form states
  const [editingRates, setEditingRates] = useState(false);
  const [stoveRateInput, setStoveRateInput] = useState(rates.electric_stove);
  const [nonStoveRateInput, setNonStoveRateInput] = useState(rates.non_electric_stove);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // What-if simulator states
  const [simStoveCount, setSimStoveCount] = useState(stoveUsers.length);
  const [simNonStoveCount, setSimNonStoveCount] = useState(nonStoveUsers.length);
  const [simStoveRate, setSimStoveRate] = useState(rates.electric_stove);
  const [simNonStoveRate, setSimNonStoveRate] = useState(rates.non_electric_stove);
  const [simTariff, setSimTariff] = useState(settings.tariffPerKwh || 232.5);

  const simTotalExpected = simStoveCount * simStoveRate + simNonStoveCount * simNonStoveRate;
  const simAffordableKwh = Math.round((simTotalExpected / (simTariff || 1)) * 10) / 10;
  const simDailyKwh = Math.round((simAffordableKwh / 30) * 10) / 10;

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateCategoryRates({
      electric_stove: Number(stoveRateInput),
      non_electric_stove: Number(nonStoveRateInput),
    });
    setEditingRates(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Automatic Contribution Calculator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic calculation engine distributing utility expenses fairly between electric stove and non-stove residents.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Rates updated successfully!
          </div>
        )}
      </div>

      {/* Main Dynamic Calculation Engine Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Live Formula & Breakdown
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
              Current Expected Monthly Collection
            </h2>
          </div>

          {currentRole === 'admin' && (
            <button
              onClick={() => {
                setStoveRateInput(rates.electric_stove);
                setNonStoveRateInput(rates.non_electric_stove);
                setEditingRates(!editingRates);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs"
            >
              {editingRates ? 'Cancel Editing' : 'Adjust Category Rates'}
            </button>
          )}
        </div>

        {/* Live Formula Display */}
        <div className="p-5 rounded-2xl bg-[#071426] text-white border border-slate-800 shadow-inner">
          <div className="text-xs text-cyan-300 font-mono uppercase tracking-wider mb-2">
            System Formula: Expected Collection = Σ (Resident Category Contribution)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Stove Group */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Flame className="w-4 h-4" />
                Electric Stove Users
              </div>
              <div className="text-xl font-extrabold text-white mt-1">
                {stoveUsers.length} × {formatMWK(rates.electric_stove)}
              </div>
              <div className="text-xs text-amber-300/90 font-mono mt-0.5 font-bold">
                = {formatMWK(stoveSubtotal)}
              </div>
            </div>

            {/* Non-Stove Group */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Zap className="w-4 h-4" />
                Non-Stove Users
              </div>
              <div className="text-xl font-extrabold text-white mt-1">
                {nonStoveUsers.length} × {formatMWK(rates.non_electric_stove)}
              </div>
              <div className="text-xs text-cyan-300/90 font-mono mt-0.5 font-bold">
                = {formatMWK(nonStoveSubtotal)}
              </div>
            </div>

            {/* Total Result */}
            <div className="p-3.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/30 text-white shadow-md">
              <span className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">
                Total Expected Collection
              </span>
              <div className="text-2xl font-black text-white tracking-tight mt-0.5">
                {formatMWK(expectedTotal)}
              </div>
              <span className="text-[11px] text-blue-100/90 block mt-0.5">
                {activeResidents.length} Active Residents Combined
              </span>
            </div>
          </div>
        </div>

        {/* Rate Edit Form (Admin Only, shown when toggled) */}
        {editingRates && currentRole === 'admin' && (
          <form
            onSubmit={handleSaveRates}
            className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-blue-900">
                Configure Standard Contribution Rates
              </h3>
              <span className="text-xs text-blue-700">
                Changes apply immediately to all residents in that category
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Electric Stove User Monthly Rate (MWK)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">MK</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={stoveRateInput}
                    onChange={(e) => setStoveRateInput(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Non-Stove User Monthly Rate (MWK)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">MK</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={nonStoveRateInput}
                    onChange={(e) => setNonStoveRateInput(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRates(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
              >
                Save & Recalculate Now
              </button>
            </div>
          </form>
        )}
      </div>

      {/* "What-If" Scenario & Tariff Simulator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              "What-If" Scenario Simulator & Budget Planner
            </h2>
            <p className="text-xs text-slate-500">
              Test how changes in resident count, stove adoption, or ESCOM tariff price impact total pool and kWh purchasing power.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sliders Input Column */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Stove Users Count */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Electric Stove Users:</span>
                <span className="font-bold text-amber-600">{simStoveCount} residents</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={simStoveCount}
                onChange={(e) => setSimStoveCount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Non-Stove Users Count */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Non-Stove Users:</span>
                <span className="font-bold text-blue-600">{simNonStoveCount} residents</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={simNonStoveCount}
                onChange={(e) => setSimNonStoveCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Stove Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Stove Contribution Rate:</span>
                <span className="font-bold text-slate-900">{formatMWK(simStoveRate)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="1000"
                value={simStoveRate}
                onChange={(e) => setSimStoveRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Non-Stove Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Non-Stove Contribution Rate:</span>
                <span className="font-bold text-slate-900">{formatMWK(simNonStoveRate)}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="15000"
                step="500"
                value={simNonStoveRate}
                onChange={(e) => setSimNonStoveRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* ESCOM Tariff Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>ESCOM Tariff Rate (MWK/kWh):</span>
                <span className="font-bold text-cyan-700">MK {simTariff} / kWh</span>
              </div>
              <input
                type="range"
                min="150"
                max="450"
                step="5"
                value={simTariff}
                onChange={(e) => setSimTariff(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Simulator Results Output Card */}
          <div className="bg-gradient-to-br from-[#071426] to-slate-900 text-white rounded-xl p-5 flex flex-col justify-between border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Simulated Projection
              </span>
              <div className="mt-2">
                <span className="text-xs text-slate-300">Projected Monthly Pool:</span>
                <div className="text-3xl font-extrabold text-white mt-0.5 tracking-tight">
                  {formatMWK(simTotalExpected)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
                <div className="p-3 bg-slate-800/80 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Affordable Energy</span>
                  <span className="text-xl font-bold text-cyan-300">{simAffordableKwh} kWh</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Per month at MK {simTariff}/unit</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Daily Energy Budget</span>
                  <span className="text-xl font-bold text-emerald-400">{simDailyKwh} kWh/day</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Safe hostel burn rate</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Residents: {simStoveCount + simNonStoveCount} total</span>
              <button
                onClick={() => {
                  setSimStoveCount(stoveUsers.length);
                  setSimNonStoveCount(nonStoveUsers.length);
                  setSimStoveRate(rates.electric_stove);
                  setSimNonStoveRate(rates.non_electric_stove);
                  setSimTariff(settings.tariffPerKwh || 232.5);
                }}
                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Simulator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
