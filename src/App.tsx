import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ResidentsView } from './components/ResidentsView.tsx';
import { ContributionsView } from './components/ContributionsView.tsx';
import { PaymentsView } from './components/PaymentsView.tsx';
import { ElectricityExpensesView } from './components/ElectricityExpensesView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { TransparencyView } from './components/TransparencyView.tsx';
import { NotificationsView } from './components/NotificationsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

function MainLayout() {
  const { activeTab, setActiveTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global modal triggers
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [prefillResidentId, setPrefillResidentId] = useState<string | undefined>(undefined);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [addResidentModalOpen, setAddResidentModalOpen] = useState(false);

  const handleOpenRecordPayment = (residentId?: string) => {
    setPrefillResidentId(residentId);
    setPaymentModalOpen(true);
  };

  const handleOpenRecordExpense = () => {
    setExpenseModalOpen(true);
  };

  const handleOpenAddResident = () => {
    setAddResidentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenRecordPayment={handleOpenRecordPayment}
              onOpenRecordExpense={handleOpenRecordExpense}
              onOpenAddResident={handleOpenAddResident}
            />
          )}

          {activeTab === 'residents' && (
            <ResidentsView
              onOpenRecordPayment={handleOpenRecordPayment}
              isAddModalOpen={addResidentModalOpen}
              onCloseAddModal={() => setAddResidentModalOpen(false)}
            />
          )}

          {activeTab === 'contributions' && <ContributionsView />}

          {activeTab === 'payments' && (
            <PaymentsView
              isRecordModalOpen={paymentModalOpen}
              prefillResidentId={prefillResidentId}
              onCloseRecordModal={() => {
                setPaymentModalOpen(false);
                setPrefillResidentId(undefined);
              }}
            />
          )}

          {activeTab === 'expenses' && (
            <ElectricityExpensesView
              isRecordModalOpen={expenseModalOpen}
              onCloseRecordModal={() => setExpenseModalOpen(false)}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'transparency' && <TransparencyView />}

          {activeTab === 'notifications' && <NotificationsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <p>
          <strong className="text-slate-800 font-semibold">PowerShare MW</strong> — Malawi Shared Electricity Contribution System • Currency: MWK (Malawi Kwacha)
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
