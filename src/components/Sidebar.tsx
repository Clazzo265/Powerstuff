import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  LayoutDashboard,
  Users,
  Calculator,
  CreditCard,
  Zap,
  BarChart3,
  Scale,
  Bell,
  Settings,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, currentRole, notifications, residents, payments, currentMonth } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Unpaid residents count for badge
  const paidResidentIds = new Set(
    payments.filter((p) => p.month === currentMonth && p.amountPaid > 0).map((p) => p.residentId)
  );
  const unpaidCount = residents.filter((r) => r.isActive && !paidResidentIds.has(r.id)).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'residents', label: 'Residents', icon: Users, badge: `${residents.length}` },
    { id: 'contributions', label: 'Contributions', icon: Calculator },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: unpaidCount > 0 ? `${unpaidCount} due` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'expenses', label: 'Electricity Expenses', icon: Zap },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'transparency', label: 'Transparency', icon: Scale },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1 overflow-y-auto">
          {/* Active Role Banner */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Active Mode:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                  currentRole === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-cyan-100 text-cyan-800'
                }`}
              >
                {currentRole === 'admin' ? 'Administrator' : 'Resident Portal'}
              </span>
            </div>
            {currentRole === 'resident' && (
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                Read-only transparency view. Financial edits restricted.
              </p>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navigation
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Malawi Kwacha (MWK)</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Stove (MK10k) vs Non-Stove (MK5k) fair utility division.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
