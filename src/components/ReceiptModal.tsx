import React, { useRef } from 'react';
import { Payment, Resident } from '../types/index.ts';
import { formatMWK } from '../utils/calculations.ts';
import { X, Printer, Share2, CheckCircle2, Zap } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  resident?: Resident;
  propertyName: string;
  meterNumber: string;
  adminName: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  resident,
  propertyName,
  meterNumber,
  adminName,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    const text = `🧾 *POWERSHARE MW — RESITI YA MALIPILO A MAGETSI*
━━━━━━━━━━━━━━━━━━━━
*Resiti Na.:* ${payment.receiptNumber}
*Malo:* ${propertyName}
*Dzina:* ${payment.residentName} (${resident?.roomNumber || 'Room'})
*Gulu:* ${resident?.category === 'electric_stove' ? 'Electric Stove User' : 'Non-Electric Stove User'}

*Ndalama Zolipidwa:* ${formatMWK(payment.amountPaid)}
*Njira:* ${payment.paymentMethod} (Ref: ${payment.transactionReference})
*Tsiku:* ${payment.paymentDate}
*Mwezi:* ${payment.month}
*Chitsimikizo:* ${payment.status.toUpperCase()} ✅
━━━━━━━━━━━━━━━━━━━━
_Yosungidwa kudzera mu PowerShare MW_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm tracking-wide">Official Digital Receipt</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close receipt modal"
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-5 md:p-7 space-y-5 bg-white text-slate-800 overflow-y-auto flex-1 print-card">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-200 pb-5">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">PowerShare MW</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">{propertyName}</p>
            <p className="text-xs text-slate-400">ESCOM Meter: <span className="font-mono text-slate-600">{meterNumber}</span></p>
            
            <div className="mt-3 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
              CONFIRMED PAYMENT
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Receipt Number</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{payment.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Payment Date</span>
              <span className="font-medium text-slate-800">{payment.paymentDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Resident Name</span>
              <span className="font-semibold text-slate-900">{payment.residentName}</span>
              <span className="text-slate-500 text-[11px] block">{resident?.roomNumber || 'Shared Unit'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Usage Category</span>
              <span className="font-medium text-blue-700">
                {resident?.category === 'electric_stove' ? 'Electric Stove User' : 'Non-Electric Stove'}
              </span>
            </div>
          </div>

          {/* Amount Paid Highlight */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Amount Received</span>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">
              {formatMWK(payment.amountPaid)}
            </div>
            <div className="mt-2 text-xs text-slate-600 flex items-center justify-center gap-2">
              <span className="font-medium">Method:</span>
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700 font-mono text-[11px]">
                {payment.paymentMethod}
              </span>
              <span>• Ref:</span>
              <span className="font-mono text-slate-700 text-[11px]">{payment.transactionReference}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="border-t border-b border-slate-100 py-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Billing Period / Month:</span>
              <span className="font-medium text-slate-800">{payment.month}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Standard Monthly Due:</span>
              <span className="font-medium text-slate-800">
                {formatMWK(resident?.monthlyContribution || payment.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status:</span>
              <span className={`font-semibold ${payment.status === 'Paid' ? 'text-emerald-600' : payment.status === 'Overpaid' ? 'text-blue-600' : 'text-amber-600'}`}>
                {payment.status}
              </span>
            </div>
            {payment.notes && (
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                <span className="font-medium text-slate-600">Notes: </span>
                {payment.notes}
              </div>
            )}
          </div>

          {/* Signoff & Verification Block */}
          <div className="flex items-end justify-between pt-2">
            <div>
              <div className="w-16 h-16 border border-slate-200 rounded-lg p-1 bg-slate-50 flex items-center justify-center">
                <div className="text-[9px] font-mono text-slate-400 text-center leading-tight">
                  [VERIFIED]<br/>
                  POWERSHARE<br/>
                  MW-ESCOM
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Digital Verification</span>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-300 w-36 mb-1 text-center pb-0.5">
                <span className="font-serif italic text-xs text-slate-700">Chikondi P.</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">{adminName}</span>
              <span className="text-[9px] text-slate-400 block">Hostel Representative</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            PowerShare MW — Shared Electricity Transparency System • Malawi Kwacha (MWK)
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <button
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-95 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Copied WhatsApp Message!' : 'Share to WhatsApp'}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
