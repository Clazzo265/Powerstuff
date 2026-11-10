import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Resident,
  Payment,
  ElectricityExpense,
  PropertySettings,
  CategoryRates,
  NotificationItem,
  UserRole,
} from '../types/index.ts';
import {
  INITIAL_RESIDENTS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_RATES,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
  CURRENT_MONTH,
} from '../data/initialData.ts';

interface AppContextType {
  // State
  residents: Resident[];
  payments: Payment[];
  expenses: ElectricityExpense[];
  rates: CategoryRates;
  settings: PropertySettings;
  notifications: NotificationItem[];
  currentRole: UserRole;
  selectedResidentId: string;
  currentMonth: string;
  activeTab: string;
  isDemoData: boolean;

  // Setters & Nav
  setCurrentRole: (role: UserRole) => void;
  setSelectedResidentId: (id: string) => void;
  setCurrentMonth: (month: string) => void;
  setActiveTab: (tab: string) => void;

  // Resident actions
  addResident: (residentData: Omit<Resident, 'id'>) => void;
  updateResident: (id: string, updates: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  toggleResidentCategory: (id: string) => void;

  // Rates actions
  updateCategoryRates: (newRates: CategoryRates) => void;

  // Payments actions
  recordPayment: (paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>) => Payment;
  deletePayment: (id: string) => void;

  // Expenses actions
  recordExpense: (expenseData: Omit<ElectricityExpense, 'id'>) => ElectricityExpense;
  deleteExpense: (id: string) => void;

  // Settings & notifications
  updateSettings: (updates: Partial<PropertySettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;

  // Reset
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RESIDENTS: 'powershare_mw_residents_v2',
  PAYMENTS: 'powershare_mw_payments_v2',
  EXPENSES: 'powershare_mw_expenses_v2',
  RATES: 'powershare_mw_rates_v2',
  SETTINGS: 'powershare_mw_settings_v2',
  NOTIFICATIONS: 'powershare_mw_notifications_v2',
  ROLE: 'powershare_mw_role_v2',
  RESIDENT_ID: 'powershare_mw_selected_resident_v2',
  MONTH: 'powershare_mw_month_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [residents, setResidents] = useState<Resident[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
    return saved ? JSON.parse(saved) : INITIAL_RESIDENTS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<ElectricityExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [rates, setRates] = useState<CategoryRates>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RATES);
    return saved ? JSON.parse(saved) : INITIAL_RATES;
  });

  const [settings, setSettings] = useState<PropertySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'admin';
  });

  const [selectedResidentId, setSelectedResidentId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESIDENT_ID);
    return saved || INITIAL_RESIDENTS[0].id;
  });

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MONTH);
    return saved || CURRENT_MONTH;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDemoData, setIsDemoData] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESIDENT_ID, selectedResidentId);
  }, [selectedResidentId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MONTH, currentMonth);
  }, [currentMonth]);

  // Resident handlers
  const addResident = (residentData: Omit<Resident, 'id'>) => {
    const newId = `res-${Date.now()}`;
    const newResident: Resident = {
      ...residentData,
      id: newId,
      monthlyContribution: residentData.category === 'electric_stove' ? rates.electric_stove : rates.non_electric_stove,
    };
    setResidents((prev) => [...prev, newResident]);
    addNotification({
      type: 'info',
      title: 'New Resident Registered',
      message: `${newResident.name} was added to ${newResident.roomNumber} (${newResident.category === 'electric_stove' ? 'Electric Stove' : 'Non-Electric Stove'}).`,
      actionTab: 'residents',
    });
  };

  const updateResident = (id: string, updates: Partial<Resident>) => {
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updatedCategory = updates.category !== undefined ? updates.category : r.category;
        const autoContrib =
          updates.monthlyContribution !== undefined
            ? updates.monthlyContribution
            : updatedCategory === 'electric_stove'
            ? rates.electric_stove
            : rates.non_electric_stove;

        return {
          ...r,
          ...updates,
          category: updatedCategory,
          monthlyContribution: autoContrib,
        };
      })
    );
  };

  const toggleResidentCategory = (id: string) => {
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newCategory = r.category === 'electric_stove' ? 'non_electric_stove' : 'electric_stove';
        const newContribution = newCategory === 'electric_stove' ? rates.electric_stove : rates.non_electric_stove;
        return {
          ...r,
          category: newCategory,
          monthlyContribution: newContribution,
        };
      })
    );
  };

  const deleteResident = (id: string) => {
    const resident = residents.find((r) => r.id === id);
    setResidents((prev) => prev.filter((r) => r.id !== id));
    if (resident) {
      addNotification({
        type: 'warning',
        title: 'Resident Removed',
        message: `${resident.name} (${resident.roomNumber}) was removed from the property.`,
        actionTab: 'residents',
      });
    }
  };

  // Rates handler
  const updateCategoryRates = (newRates: CategoryRates) => {
    setRates(newRates);
    // Update all existing residents to reflect new rates
    setResidents((prev) =>
      prev.map((r) => ({
        ...r,
        monthlyContribution: r.category === 'electric_stove' ? newRates.electric_stove : newRates.non_electric_stove,
      }))
    );
    addNotification({
      type: 'info',
      title: 'Contribution Rates Updated',
      message: `Electric Stove: MK ${newRates.electric_stove.toLocaleString()}, Non-Stove: MK ${newRates.non_electric_stove.toLocaleString()}`,
      actionTab: 'contributions',
    });
  };

  // Payment handlers
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>): Payment => {
    const receiptSeq = payments.length + 1;
    const cleanMonth = (paymentData.month || currentMonth).replace('-', '');
    const receiptNumber = `REC-${cleanMonth}-${String(receiptSeq).padStart(3, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    addNotification({
      type: 'success',
      title: 'Payment Recorded',
      message: `MK ${paymentData.amountPaid.toLocaleString()} recorded for ${paymentData.residentName} via ${paymentData.paymentMethod}. Ref: ${paymentData.transactionReference}`,
      actionTab: 'payments',
    });

    return newPayment;
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Expense handlers
  const recordExpense = (expenseData: Omit<ElectricityExpense, 'id'>): ElectricityExpense => {
    const newExpense: ElectricityExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    addNotification({
      type: 'success',
      title: 'ESCOM Electricity Purchase Recorded',
      message: `MK ${expenseData.amount.toLocaleString()} (${expenseData.unitsKwh} kWh) purchased via ${expenseData.vendor}. Token: ${expenseData.tokenNumber}`,
      actionTab: 'expenses',
    });

    return newExpense;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Settings & notifications
  const updateSettings = (updates: Partial<PropertySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setResidents(INITIAL_RESIDENTS);
    setPayments(INITIAL_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setRates(INITIAL_RATES);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentMonth(CURRENT_MONTH);
    setIsDemoData(true);
    addNotification({
      type: 'info',
      title: 'Demo Data Restored',
      message: 'Initial 10 residents (4 stove, 6 non-stove) and sample financial records restored.',
      actionTab: 'dashboard',
    });
  };

  return (
    <AppContext.Provider
      value={{
        residents,
        payments,
        expenses,
        rates,
        settings,
        notifications,
        currentRole,
        selectedResidentId,
        currentMonth,
        activeTab,
        isDemoData,
        setCurrentRole,
        setSelectedResidentId,
        setCurrentMonth,
        setActiveTab,
        addResident,
        updateResident,
        deleteResident,
        toggleResidentCategory,
        updateCategoryRates,
        recordPayment,
        deletePayment,
        recordExpense,
        deleteExpense,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
