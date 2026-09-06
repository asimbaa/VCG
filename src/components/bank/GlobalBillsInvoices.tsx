import React, { useState } from 'react';
import { CreditCard, ArrowRight, ShieldCheck, DollarSign, Globe, CheckCircle2, Loader2, Building, Building2, Zap, Send } from 'lucide-react';
import { toast } from 'sonner';

export function GlobalBillsInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingInvoices = [
    { id: "INV-AWS-883", vendor: "Amazon Web Services", amount: 45000, currency: "USD", due: "2026-10-15", type: "Infrastructure", region: "USA" },
    { id: "INV-ATO-001", vendor: "Australian Taxation Office", amount: 1250000, currency: "AUD", due: "2026-10-21", type: "Tax Settlement", region: "AUSTRALIA" },
    { id: "INV-APPL-992", vendor: "Apple Inc (Corporate)", amount: 120000, currency: "USD", due: "2026-09-30", type: "Hardware Procurement", region: "GLOBAL" },
    { id: "INV-STR-552", vendor: "Stripe Issuing Fees", amount: 12500, currency: "USD", due: "2026-10-01", type: "Financial", region: "GLOBAL" }
  ];

  const handlePayInvoice = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    toast.loading(`Processing ${selectedInvoice.vendor} payment via Stripe...`, { id: 'stripe-pay' });
    
    try {
      const res = await fetch("/api/stripe/pay-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedInvoice.amount,
          currency: selectedInvoice.currency,
          vendor: selectedInvoice.vendor,
          invoiceId: selectedInvoice.id
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Payment to ${selectedInvoice.vendor} successful!`, { id: 'stripe-pay' });
        setSelectedInvoice(null);
      } else {
        toast.error(`Payment failed: ${data.error}`, { id: 'stripe-pay' });
      }
    } catch (e) {
      toast.error("Network error during payment processing.", { id: 'stripe-pay' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h4 className="text-3xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-400" />
              Global Stripe Settlements
            </h4>
            <p className="text-slate-400 font-mono text-sm mt-2 max-w-xl">
              Process external vendor bills, corporate invoices, and tax settlements across USA, AUSTRALIA, and GLOBAL jurisdictions instantly using Sovereign Stripe Issuing & Treasury ledgers.
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shrink-0 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Stripe Treasury Balance</div>
            <div className="text-2xl font-black text-white">$100,000,000.00</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Building className="w-4 h-4" /> Pending Vendor Invoices
          </h3>
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2">
            {pendingInvoices.map(inv => (
              <button
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                  selectedInvoice?.id === inv.id
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : 'bg-slate-50 border-slate-100 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded">
                      {inv.region}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">{inv.id}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-lg">{inv.vendor}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Due: {inv.due} • {inv.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {inv.amount.toLocaleString('en-US', { style: 'currency', currency: inv.currency })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center justify-end gap-1">
                    <CreditCard className="w-3 h-3" /> Stripe Ready
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          {selectedInvoice ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl sticky top-24">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Settlement Authorization
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payee</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.vendor}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</span>
                  <span className="font-black text-slate-900 text-xl font-mono">
                    {selectedInvoice.amount.toLocaleString('en-US', { style: 'currency', currency: selectedInvoice.currency })}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Route</span>
                  <span className="font-bold text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
                    Stripe B2B Global Connect
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayInvoice}
                disabled={isProcessing}
                className="w-full bg-slate-900 hover:bg-black text-white p-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing Route...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Execute Payment</>
                )}
              </button>
              
              <div className="text-center mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Encrypted by Valourian Capital OS
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
              <DollarSign className="w-16 h-16 text-slate-300 mb-4" />
              <p className="font-bold text-slate-500 text-sm uppercase tracking-widest">Select Invoice</p>
              <p className="text-xs text-slate-400 mt-2">Choose an invoice to process via Stripe Global Treasury</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
