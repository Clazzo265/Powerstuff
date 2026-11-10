import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  formatMWK,
  getApplianceBreakdown,
  calculateExpectedCollection,
  calculateTotalCollected,
  calculateTotalElectricityExpense,
  calculateRemainingFunds,
} from '../utils/calculations.ts';
import {
  Scale,
  Flame,
  Zap,
  HelpCircle,
  TrendingDown,
  Info,
  CheckCircle2,
  Printer,
  Share2,
  Users,
} from 'lucide-react';

export const TransparencyView: React.FC = () => {
  const { residents, payments, expenses, settings, rates, currentMonth } = useApp();

  const [copiedShare, setCopiedShare] = useState(false);

  const appliances = getApplianceBreakdown();
  const stoveAppliances = appliances.filter((a) => a.category === 'stove');
  const generalAppliances = appliances.filter((a) => a.category === 'general');

  const stoveKwhSum = stoveAppliances.reduce((s, a) => s + a.monthlyKwh, 0);
  const generalKwhSum = generalAppliances.reduce((s, a) => s + a.monthlyKwh, 0);

  const activeResidents = residents.filter((r) => r.isActive);
  const stoveUsers = activeResidents.filter((r) => r.category === 'electric_stove');
  const nonStoveUsers = activeResidents.filter((r) => r.category === 'non_electric_stove');

  const expectedTotal = calculateExpectedCollection(activeResidents);
  const totalCollected = calculateTotalCollected(payments, currentMonth);
  const totalExpenses = calculateTotalElectricityExpense(expenses, currentMonth);
  const remainingFunds = calculateRemainingFunds(
    settings.openingBalance,
    totalCollected,
    totalExpenses
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShare = () => {
    const shareText = `📊 *POWERSHARE MW — TRANSPARENCY & FAIRNESS SUMMARY*
🏠 *Property:* ${settings.propertyName} (${currentMonth})
━━━━━━━━━━━━━━━━━━━━
⚡ *WHY DO ELECTRIC STOVES PAY MORE?*
• Electric Hot Plate (1800W): ~135 kWh/month (~MK ${(135 * settings.tariffPerKwh).toFixed(0)})
• Non-Stove Room (Lights + Phone + Laptop): ~18 kWh/month (~MK ${(18 * settings.tariffPerKwh).toFixed(0)})
*Electric cooking draws ~80% of all hostel electricity!*

💰 *CONTRIBUTION STRUCTURE:*
• Electric Stove Users (${stoveUsers.length}): ${formatMWK(rates.electric_stove)}/mo = ${formatMWK(stoveUsers.length * rates.electric_stove)}
• Non-Stove Users (${nonStoveUsers.length}): ${formatMWK(rates.non_electric_stove)}/mo = ${formatMWK(nonStoveUsers.length * rates.non_electric_stove)}
• Total Expected: ${formatMWK(expectedTotal)}

📈 *CURRENT MONTH RECONCILIATION:*
• Total Inflow Collected: ${formatMWK(totalCollected)}
• Actual ESCOM Purchases: ${formatMWK(totalExpenses)}
• Remaining Reserve Carried Forward: ${formatMWK(remainingFunds)}
━━━━━━━━━━━━━━━━━━━━
_Verified open ledger on PowerShare MW_`;

    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            Fairness & Transparency Module
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Energy consumption science and complete open ledger eliminating payment disputes among residents.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleCopyShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? 'Copied Summary!' : 'Copy WhatsApp Audit'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Energy Science Explanation Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Energy Consumption Physics
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
            Why Electric Stove Users Contribute MK 10,000 vs MK 5,000
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Heating elements in electric spiral stoves, hot plates, and ovens convert high electrical resistance into thermal heat. A single hot plate consumes in 1 hour what basic room LED lights take 2 weeks to consume.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Electric Stove Profile */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Flame className="w-5 h-5 text-amber-600" />
                <span>Electric Cooking Profile</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                HIGH DRAIN
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {stoveAppliances.map((app) => (
                <div
                  key={app.name}
                  className="p-2.5 bg-white/80 rounded-xl border border-amber-200 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{app.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {app.typicalWatts} Watts • {app.dailyHours} hrs/day
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-800">{app.monthlyKwh} kWh</span>
                    <span className="text-[10px] text-slate-400 block">
                      ~{formatMWK(app.monthlyKwh * settings.tariffPerKwh)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-xs">
              <span className="font-bold text-amber-900">Total Cooking Draw:</span>
              <span className="font-extrabold text-amber-800 text-sm">
                ~{stoveKwhSum} kWh / month ({formatMWK(stoveKwhSum * settings.tariffPerKwh)})
              </span>
            </div>
          </div>

          {/* Non-Stove Profile */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Non-Stove Resident Profile</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900">
                LOW DRAIN
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {generalAppliances.map((app) => (
                <div
                  key={app.name}
                  className="p-2.5 bg-white/80 rounded-xl border border-blue-200 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{app.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {app.typicalWatts} Watts • {app.dailyHours} hrs/day
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-800">{app.monthlyKwh} kWh</span>
                    <span className="text-[10px] text-slate-400 block">
                      ~{formatMWK(app.monthlyKwh * settings.tariffPerKwh)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-xs">
              <span className="font-bold text-blue-900">Total General Room Draw:</span>
              <span className="font-extrabold text-blue-800 text-sm">
                ~{generalKwhSum} kWh / month ({formatMWK(generalKwhSum * settings.tariffPerKwh)})
              </span>
            </div>
          </div>
        </div>

        {/* Key Takeaway Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Fairness Conclusion: </span>
            A resident cooking with an electric stove consumes approximately <strong>8 to 10 times more kWh</strong> than a resident using gas/charcoal who only charges gadgets and uses room lighting. Setting a 2x rate (MK 10,000 vs MK 5,000) provides a highly subsidized cooking benefit while still preventing unfair cost burdens on non-cooking residents.
          </div>
        </div>
      </div>

      {/* Complete Open Ledger for Current Month */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Open Financial Reconciliation & Ledger ({currentMonth})
            </h3>
            <p className="text-xs text-slate-500">
              Accessible to all 10 residents to verify every transaction and prevent suspicion.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Balanced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Total Inflow</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{formatMWK(totalCollected)}</div>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Plus {formatMWK(settings.openingBalance)} brought forward
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Actual Outflow</span>
            <div className="text-xl font-bold text-rose-600 mt-1">{formatMWK(totalExpenses)}</div>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              100% verified ESCOM prepaid tokens
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Remaining Banked</span>
            <div className="text-xl font-bold text-cyan-700 mt-1">{formatMWK(remainingFunds)}</div>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Stored in electricity reserve account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
