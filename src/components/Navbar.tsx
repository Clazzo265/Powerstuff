import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Zap,
  Bell,
  RotateCcw,
  User,
  Shield,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const {
    settings,
    currentRole,
    setCurrentRole,
    residents,
    selectedResidentId,
    setSelectedResidentId,
    currentMonth,
    setCurrentMonth,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    resetToDemoData,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentResident = residents.find((r) => r.id === selectedResidentId) || residents[0];

  return (
    <header className="sticky top-0 z-40 bg-[#071426] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  PowerShare <span className="text-cyan-400">MW</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Malawi Electricity Contribution
                </span>
              </div>
            </button>

            {/* Demo Data Tag */}
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO DATA
            </span>
          </div>

          {/* Right Controls: Month Selector, Role Toggle, Resident Picker, Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Month Picker */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 hidden sm:block" />
              <select
                aria-label="Select billing month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="2026-11" className="bg-slate-900 text-white">Nov 2026</option>
                <option value="2026-10" className="bg-slate-900 text-white">Oct 2026</option>
                <option value="2026-09" className="bg-slate-900 text-white">Sep 2026</option>
              </select>
            </div>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                  currentRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Administrator role with full management permissions"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => setCurrentRole('resident')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                  currentRole === 'resident'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Resident role (read-only personal view)"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Resident</span>
              </button>
            </div>

            {/* Resident Selector (Visible when in Resident Role) */}
            {currentRole === 'resident' && (
              <div className="relative">
                <select
                  aria-label="Select resident profile to view"
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="bg-slate-800 border border-cyan-500/50 text-cyan-300 font-medium rounded-xl px-2 py-1.5 text-xs max-w-[130px] sm:max-w-[180px] truncate focus:outline-hidden"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      {r.name} ({r.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Notifications: ${unreadCount} unread`}
                className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-100">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
                    <span className="font-semibold text-xs tracking-wide">Notifications & Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.actionTab) setActiveTab(n.actionTab);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            !n.read ? 'bg-blue-50/60 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900 text-xs">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-1 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifications(false);
                      }}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View all alerts & WhatsApp generator →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset application state back to initial 10 residents and demo records?')) {
                  resetToDemoData();
                }
              }}
              title="Reset to initial 10-resident DEMO DATA"
              aria-label="Reset to initial 10-resident demo data"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
