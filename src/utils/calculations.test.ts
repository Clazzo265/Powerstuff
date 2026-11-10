import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExpectedCollection,
  calculateTotalCollected,
  calculateOutstandingAmount,
  calculateOverpaymentAmount,
  calculateCollectionPercentage,
  calculateTotalElectricityExpense,
  calculateRemainingFunds,
  calculateResidentBalance,
  formatMWK,
} from './calculations.ts';
import { Resident, Payment, ElectricityExpense } from '../types/index.ts';

const mockResidents: Resident[] = [
  { id: '1', name: 'Kondwani Phiri', roomNumber: 'Room 1', category: 'electric_stove', monthlyContribution: 10000, joinDate: '2026-01-01', isActive: true },
  { id: '2', name: 'Chisomo Banda', roomNumber: 'Room 2', category: 'electric_stove', monthlyContribution: 10000, joinDate: '2026-01-01', isActive: true },
  { id: '3', name: 'Thokozani Mwale', roomNumber: 'Room 3', category: 'electric_stove', monthlyContribution: 10000, joinDate: '2026-01-01', isActive: true },
  { id: '4', name: 'Alinafe Nyirenda', roomNumber: 'Room 4', category: 'electric_stove', monthlyContribution: 10000, joinDate: '2026-01-01', isActive: true },
  { id: '5', name: 'Blessings Chirwa', roomNumber: 'Room 5', category: 'non_electric_stove', monthlyContribution: 5000, joinDate: '2026-01-01', isActive: true },
  { id: '6', name: 'Talandira Kaunda', roomNumber: 'Room 6', category: 'non_electric_stove', monthlyContribution: 5000, joinDate: '2026-01-01', isActive: true },
  { id: '7', name: 'Yamikani Gondwe', roomNumber: 'Room 7', category: 'non_electric_stove', monthlyContribution: 5000, joinDate: '2026-01-01', isActive: true },
  { id: '8', name: 'Mayamiko Kamanga', roomNumber: 'Room 8', category: 'non_electric_stove', monthlyContribution: 5000, joinDate: '2026-01-01', isActive: true },
  { id: '9', name: 'Tadala Chiumia', roomNumber: 'Room 9', category: 'non_electric_stove', monthlyContribution: 5000, joinDate: '2026-01-01', isActive: true },
  { id: '10', name: 'Fumbani Mtambo', roomNumber: 'Room 10', category: 'non_electric_stove', monthlyContribution: 5000, joinDate: '2026-01-01', isActive: true },
];

test('Automatic Contribution Calculator: 4 stove (10,000) and 6 non-stove (5,000) equals MK70,000', () => {
  const expected = calculateExpectedCollection(mockResidents);
  assert.equal(expected, 70000);
});

test('Automatic Contribution Calculator: dynamically updates if resident changes category', () => {
  const updatedResidents = mockResidents.map((r) =>
    r.id === '5' ? { ...r, category: 'electric_stove' as const, monthlyContribution: 10000 } : r
  );
  // Now 5 stove users (50,000) and 5 non-stove (25,000) = 75,000
  const expected = calculateExpectedCollection(updatedResidents);
  assert.equal(expected, 75000);
});

test('Payment Management: calculates total collected and outstanding amount safely', () => {
  const payments: Payment[] = [
    { id: 'p1', receiptNumber: 'REC-001', residentId: '1', residentName: 'Kondwani', amountPaid: 10000, paymentDate: '2026-11-01', paymentMethod: 'Airtel Money', transactionReference: 'AIR-9921', month: '2026-11', status: 'Paid', recordedBy: 'Admin', createdAt: '2026-11-01' },
    { id: 'p2', receiptNumber: 'REC-002', residentId: '5', residentName: 'Blessings', amountPaid: 3000, paymentDate: '2026-11-02', paymentMethod: 'TNM Mpamba', transactionReference: 'MPA-4412', month: '2026-11', status: 'Partial', recordedBy: 'Admin', createdAt: '2026-11-02' },
  ];

  const totalCollected = calculateTotalCollected(payments, '2026-11');
  assert.equal(totalCollected, 13000);

  const outstanding = calculateOutstandingAmount(70000, totalCollected);
  assert.equal(outstanding, 57000);

  // If collected exceeds expected, outstanding should be 0, not negative
  const overpaidDiff = calculateOutstandingAmount(70000, 80000);
  assert.equal(overpaidDiff, 0);
  assert.equal(calculateOverpaymentAmount(70000, 80000), 10000);
});

test('Collection percentage: handles edge cases and computes accurately', () => {
  assert.equal(calculateCollectionPercentage(35000, 70000), 50);
  assert.equal(calculateCollectionPercentage(70000, 70000), 100);
  assert.equal(calculateCollectionPercentage(0, 70000), 0);
  assert.equal(calculateCollectionPercentage(10000, 0), 0);
});

test('Electricity Expenditure: calculates remaining funds accurately', () => {
  const openingBalance = 5000;
  const totalCollected = 60000;
  const expenses: ElectricityExpense[] = [
    { id: 'e1', date: '2026-11-03', amount: 35000, unitsKwh: 152, tokenNumber: '4829-1029-4821-3902', vendor: 'Airtel Money', month: '2026-11' },
    { id: 'e2', date: '2026-11-15', amount: 15000, unitsKwh: 65, tokenNumber: '5812-3920-1123-9941', vendor: 'TNM Mpamba', month: '2026-11' },
  ];

  const totalExpenses = calculateTotalElectricityExpense(expenses, '2026-11');
  assert.equal(totalExpenses, 50000);

  const remaining = calculateRemainingFunds(openingBalance, totalCollected, totalExpenses);
  // 5000 + 60000 - 50000 = 15000
  assert.equal(remaining, 15000);
});

test('Resident balance calculation: identifies Paid, Partial, Overpaid, and Unpaid', () => {
  const residentStove = mockResidents[0]; // MK 10,000

  // Unpaid
  const resUnpaid = calculateResidentBalance(residentStove, [], '2026-11');
  assert.equal(resUnpaid.status, 'Unpaid');
  assert.equal(resUnpaid.remainingDue, 10000);

  // Partial
  const partialPayment: Payment[] = [
    { id: 'p1', receiptNumber: 'REC-001', residentId: '1', residentName: 'Kondwani', amountPaid: 6000, paymentDate: '2026-11-01', paymentMethod: 'Cash', transactionReference: 'CSH-01', month: '2026-11', status: 'Partial', recordedBy: 'Admin', createdAt: '2026-11-01' },
  ];
  const resPartial = calculateResidentBalance(residentStove, partialPayment, '2026-11');
  assert.equal(resPartial.status, 'Partial');
  assert.equal(resPartial.remainingDue, 4000);

  // Full Paid
  const fullPayment: Payment[] = [
    { id: 'p1', receiptNumber: 'REC-001', residentId: '1', residentName: 'Kondwani', amountPaid: 10000, paymentDate: '2026-11-01', paymentMethod: 'Cash', transactionReference: 'CSH-01', month: '2026-11', status: 'Paid', recordedBy: 'Admin', createdAt: '2026-11-01' },
  ];
  const resPaid = calculateResidentBalance(residentStove, fullPayment, '2026-11');
  assert.equal(resPaid.status, 'Paid');
  assert.equal(resPaid.remainingDue, 0);

  // Overpaid
  const overPayment: Payment[] = [
    { id: 'p1', receiptNumber: 'REC-001', residentId: '1', residentName: 'Kondwani', amountPaid: 12000, paymentDate: '2026-11-01', paymentMethod: 'Cash', transactionReference: 'CSH-01', month: '2026-11', status: 'Overpaid', recordedBy: 'Admin', createdAt: '2026-11-01' },
  ];
  const resOver = calculateResidentBalance(residentStove, overPayment, '2026-11');
  assert.equal(resOver.status, 'Overpaid');
  assert.equal(resOver.overpaidAmount, 2000);
});

test('Currency formatting: formats Malawi Kwacha properly', () => {
  assert.equal(formatMWK(10000), 'MK 10,000');
  assert.equal(formatMWK(70000), 'MK 70,000');
  assert.equal(formatMWK(0), 'MK 0');
});
