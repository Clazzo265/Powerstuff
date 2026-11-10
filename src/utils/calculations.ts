import { Resident, Payment, ElectricityExpense } from '../types/index.ts';

/**
 * Format currency in Malawi Kwacha (MWK)
 */
export function formatMWK(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `MK ${Math.round(safeAmount).toLocaleString('en-US')}`;
}

/**
 * Calculate expected collection from active residents
 */
export function calculateExpectedCollection(residents: Resident[]): number {
  return residents
    .filter((r) => r.isActive)
    .reduce((total, r) => total + (r.monthlyContribution || 0), 0);
}

/**
 * Calculate total collected payments for a given month
 */
export function calculateTotalCollected(payments: Payment[], month?: string): number {
  return payments
    .filter((p) => (!month || p.month === month))
    .reduce((total, p) => total + (p.amountPaid || 0), 0);
}

/**
 * Calculate outstanding amount safely.
 * Outstanding = Expected collection - Confirmed payments.
 * Never returns negative number (overpayment is tracked separately).
 */
export function calculateOutstandingAmount(expected: number, collected: number): number {
  if (expected <= 0) return 0;
  const diff = expected - collected;
  return diff > 0 ? diff : 0;
}

/**
 * Calculate overpayment total if collections exceed expected
 */
export function calculateOverpaymentAmount(expected: number, collected: number): number {
  const diff = collected - expected;
  return diff > 0 ? diff : 0;
}

/**
 * Calculate collection completion percentage safely (0 - 100+)
 */
export function calculateCollectionPercentage(collected: number, expected: number): number {
  if (!expected || expected <= 0) return 0;
  const pct = (collected / expected) * 100;
  return Math.min(Math.round(pct * 10) / 10, 100);
}

/**
 * Calculate total electricity expenditure for a month or all time
 */
export function calculateTotalElectricityExpense(expenses: ElectricityExpense[], month?: string): number {
  return expenses
    .filter((e) => (!month || e.month === month))
    .reduce((total, e) => total + (e.amount || 0), 0);
}

/**
 * Calculate total units (kWh) purchased
 */
export function calculateTotalUnitsKwh(expenses: ElectricityExpense[], month?: string): number {
  return expenses
    .filter((e) => (!month || e.month === month))
    .reduce((total, e) => total + (e.unitsKwh || 0), 0);
}

/**
 * Calculate remaining electricity funds
 * Formula: Opening balance + Total collected - Actual electricity expenditure
 */
export function calculateRemainingFunds(
  openingBalance: number,
  totalCollected: number,
  electricityExpense: number
): number {
  return (openingBalance || 0) + (totalCollected || 0) - (electricityExpense || 0);
}

/**
 * Calculate resident payment status and balances for a given month
 */
export interface ResidentBalanceInfo {
  residentId: string;
  residentName: string;
  monthlyContribution: number;
  amountPaid: number;
  remainingDue: number;
  overpaidAmount: number;
  status: 'Paid' | 'Partial' | 'Overpaid' | 'Unpaid';
  payments: Payment[];
}

export function calculateResidentBalance(
  resident: Resident,
  payments: Payment[],
  month: string
): ResidentBalanceInfo {
  const residentPayments = payments.filter(
    (p) => p.residentId === resident.id && p.month === month
  );
  const amountPaid = residentPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const due = resident.monthlyContribution || 0;

  let status: 'Paid' | 'Partial' | 'Overpaid' | 'Unpaid' = 'Unpaid';
  let remainingDue = 0;
  let overpaidAmount = 0;

  if (amountPaid === 0) {
    status = 'Unpaid';
    remainingDue = due;
  } else if (amountPaid >= due) {
    if (amountPaid > due) {
      status = 'Overpaid';
      overpaidAmount = amountPaid - due;
    } else {
      status = 'Paid';
    }
    remainingDue = 0;
  } else {
    status = 'Partial';
    remainingDue = due - amountPaid;
  }

  return {
    residentId: resident.id,
    residentName: resident.name,
    monthlyContribution: due,
    amountPaid,
    remainingDue,
    overpaidAmount,
    status,
    payments: residentPayments,
  };
}

/**
 * Energy breakdown estimation model for fairness module
 */
export interface ApplianceEnergyProfile {
  name: string;
  typicalWatts: number;
  dailyHours: number;
  monthlyKwh: number;
  category: 'stove' | 'general';
}

export function getApplianceBreakdown(): ApplianceEnergyProfile[] {
  return [
    { name: 'Double Spiral Hot Plate / Electric Stove', typicalWatts: 1800, dailyHours: 2.5, monthlyKwh: 135, category: 'stove' },
    { name: 'Electric Oven / Grill', typicalWatts: 1500, dailyHours: 0.5, monthlyKwh: 22.5, category: 'stove' },
    { name: 'Electric Kettle / Water Heater', typicalWatts: 1500, dailyHours: 0.4, monthlyKwh: 18, category: 'general' },
    { name: 'Room LED Lighting (2 Bulbs)', typicalWatts: 20, dailyHours: 6, monthlyKwh: 3.6, category: 'general' },
    { name: 'Laptop & Smartphone Charging', typicalWatts: 65, dailyHours: 5, monthlyKwh: 9.75, category: 'general' },
    { name: 'Standing Fan / Sound System', typicalWatts: 45, dailyHours: 4, monthlyKwh: 5.4, category: 'general' },
  ];
}

/**
 * Generate formatted WhatsApp group summary message in English & Chichewa
 */
export function generateWhatsAppSummary(params: {
  propertyName: string;
  monthName: string;
  expected: number;
  collected: number;
  expenses: number;
  remaining: number;
  paidCount: number;
  unpaidCount: number;
  totalResidents: number;
  unitsKwh: number;
}): string {
  const { propertyName, monthName, expected, collected, expenses, remaining, paidCount, totalResidents, unitsKwh } = params;
  
  return `⚡ *POWERSHARE MW — RIPOTI YA MAGETSI (${monthName.toUpperCase()})* ⚡
🏠 *Malo:* ${propertyName}

💰 *CHIDZIDZO CHA CHUMA (FINANCIAL SUMMARY):*
• Ndalama Zoyenera Kusonkha (Expected): ${formatMWK(expected)}
• Ndalama Zosonkhedwa (Collected): ${formatMWK(collected)}
• Zogula Magetsi ESCOM (Expenditure): ${formatMWK(expenses)} (${unitsKwh} kWh)
• Ndalama Zotsalira m'T thumba (Balance): ${formatMWK(remaining)}

👥 *KAYENDEDWE KA MALIPILO (RESIDENTS STATUS):*
• Amene Alipira (Paid): ${paidCount} / ${totalResidents} residents
• Tikupempha onse amene asanalipire amalize mwamsanga!

Zikomo kwambiri chifukwa chothandizana!
_Yotulutsidwa kudzera mu PowerShare MW_`;
}
