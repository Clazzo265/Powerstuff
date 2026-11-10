import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  generateWhatsAppSummary,
  calculateExpectedCollection,
  calculateTotalCollected,
  calculateTotalElectricityExpense,
  calculateTotalUnitsKwh,
  calculateRemainingFunds,
} from '../utils/calculations.ts';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Share2,
  Copy,
  Check,
  Send,
  MessageSquare,
  Trash2,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    residents,
    payments,
    expenses,
    settings,
    currentMonth,
    setActiveTab,
  } = useApp();

  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const activeResidents = residents.filter((r) => r.isActive);
  const paidResidents = payments.filter((p) => p.month === currentMonth && p.amountPaid > 0);
  const paidCount = new Set(paidResidents.map((p) => p.residentId)).size;
  const unpaidCount = activeResidents.length - paidCount;

  const expected = calculateExpectedCollection(activeResidents);
  const collected = calculateTotalCollected(payments, currentMonth);
  const totalExpenses = calculateTotalElectricityExpense(expenses, currentMonth);
  const unitsKwh = calculateTotalUnitsKwh(expenses, currentMonth);
  const remaining = calculateRemainingFunds(settings.openingBalance, collected, totalExpenses);

  const whatsAppSummaryText = generateWhatsAppSummary({
    propertyName: settings.propertyName,
    monthName: 'November 2026',
    expected,
    collected,
    expenses: totalExpenses,
    remaining,
    paidCount,
    unpaidCount,
    totalResidents: activeResidents.length,
    unitsKwh,
  });

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsAppSummaryText);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications & WhatsApp Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time hostel alert feed, payment reminders, and one-click formatted messages for the hostel WhatsApp group.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition self-start sm:self-auto"
        >
          Mark All as Read
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: In-app Notification Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'unread', 'alert', 'warning', 'success', 'info'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  filterType === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab === 'all' ? 'All Alerts' : tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No notifications matching this filter.
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isAlert = notif.type === 'alert' || notif.type === 'warning';
                const isSuccess = notif.type === 'success';

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition ${
                      !notif.read
                        ? 'bg-white border-blue-300 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'alert'
                              ? 'bg-rose-100 text-rose-600'
                              : notif.type === 'warning'
                              ? 'bg-amber-100 text-amber-600'
                              : notif.type === 'success'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {notif.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                          {notif.type === 'warning' && <Clock className="w-4 h-4" />}
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                          {notif.type === 'info' && <Info className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-xs">{notif.title}</h3>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                            <span>{notif.date}</span>
                            {notif.actionTab && (
                              <button
                                onClick={() => setActiveTab(notif.actionTab!)}
                                className="text-blue-600 font-semibold hover:underline"
                              >
                                View Section →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 shrink-0 font-medium"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: WhatsApp Announcement Generator */}
        <div className="bg-[#071426] text-white rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400">
              <MessageSquare className="w-5 h-5" />
              <h2 className="font-bold text-sm tracking-wide">
                WhatsApp Group Message Generator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Formatted in English and Chichewa, ready to paste directly into your hostel or shared house WhatsApp group.
            </p>

            {/* Message Preview Box */}
            <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {whatsAppSummaryText}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleCopyWhatsApp}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
            >
              {copiedWhatsApp ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy WhatsApp Announcement</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              Sends polite Chichewa reminder to residents with outstanding balances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
