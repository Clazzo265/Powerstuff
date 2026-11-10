export type ResidentCategory = 'electric_stove' | 'non_electric_stove';

export type PaymentMethod = 'Airtel Money' | 'TNM Mpamba' | 'Cash' | 'Bank Transfer' | 'Other';

export type PaymentStatus = 'Paid' | 'Partial' | 'Overpaid' | 'Unpaid';

export interface Resident {
  id: string;
  name: string;
  roomNumber: string;
  phone?: string;
  category: ResidentCategory;
  monthlyContribution: number;
  joinDate: string;
  notes?: string;
  isActive: boolean;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  residentId: string;
  residentName: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  month: string; // e.g. "2026-11"
  status: PaymentStatus;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface ElectricityExpense {
  id: string;
  date: string;
  amount: number; // in MWK
  unitsKwh: number;
  tokenNumber: string; // 20-digit ESCOM prepaid token
  meterReadingBefore?: number;
  meterReadingAfter?: number;
  vendor: string; // e.g. "Airtel Money ESCOM", "TNM Mpamba ESCOM", "National Bank App", "ESCOM Service Center"
  month: string; // e.g. "2026-11"
  notes?: string;
  receiptImage?: string;
}

export interface CategoryRates {
  electric_stove: number; // default MK 10,000
  non_electric_stove: number; // default MK 5,000
}

export interface PropertySettings {
  propertyName: string;
  location: string;
  meterNumber: string;
  tariffPerKwh: number; // ESCOM domestic tariff in MWK (e.g. ~MK 230/kWh)
  openingBalance: number; // funds brought forward
  currency: string; // "MWK"
  autoCarryForward: boolean;
  adminName: string;
  adminContact: string;
  whatsappGroupLink?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionTab?: string;
}

export type UserRole = 'admin' | 'resident';
