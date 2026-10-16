import React, { useState } from "react";
import { 
  Printer, 
  QrCode, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Sparkles,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface VoucherItem {
  id: string;
  code: string;
  amount: number;
  currency: string;
  recipient: string;
  expiry: string;
  redeemed: boolean;
}

export function VouchersPrintTab() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    {
      id: "vch-1",
      code: "VAL-VCH-8829-01",
      amount: 50000,
      currency: "AUD",
      recipient: "Mr. Asim Aryal (Executive Allocation)",
      expiry: "2027-12-31",
      redeemed: false
    },
    {
      id: "vch-2",
      code: "VAL-VCH-1948-02",
      amount: 10000,
      currency: "AUD",
      recipient: "Australia Post St Leonards Cash Redemption Counter",
      expiry: "2026-12-31",
      redeemed: false
    },
    {
      id: "vch-3",
      code: "VAL-VCH-7721-03",
      amount: 1000000,
      currency: "AUD",
      recipient: "Valourian Sovereign Treasury Cold Reserve",
      expiry: "2030-12-31",
      redeemed: false
    }
  ]);

  const [chequePayee, setChequePayee] = useState("ASIM ARYAL");
  const [chequeAmount, setChequeAmount] = useState("1000000.00");
  const [chequeMemo, setChequeMemo] = useState("Sovereign Executive Tranche & Liquidity Guarantee");

  const handlePrintCheque = () => {
    window.print();
    toast.success("Print dialog opened for Sovereign Corporate Cheque");
  };

  const handleRedeemVoucher = (id: string) => {
    setVouchers(prev => prev.map(v => {
      if (v.id === id) {
        toast.success(`✓ Voucher ${v.code} for $${v.amount.toLocaleString()} ${v.currency} redeemed and credited!`);
        return { ...v, redeemed: true };
      }
      return v;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Printer className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Sovereign Vouchers & Cheque Station
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                  CRYPTOGRAPHIC WATERMARK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Printable bank cheques, offline bearer certificates, and QR vouchers redeemable across Australia Post & CommBank.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Print Protocol</span>
              <span className="text-xl font-black font-mono text-amber-400">HIGH FIDELITY</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cheque Designer & Printable Canvas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h4 className="text-base font-black text-slate-900">Sovereign Treasury Digital Cheque Generator</h4>
          </div>
          <button
            type="button"
            onClick={handlePrintCheque}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Cheque</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payee Name</label>
            <input
              type="text"
              value={chequePayee}
              onChange={(e) => setChequePayee(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Amount (AUD)</label>
            <input
              type="text"
              value={chequeAmount}
              onChange={(e) => setChequeAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Memo / Purpose</label>
            <input
              type="text"
              value={chequeMemo}
              onChange={(e) => setChequeMemo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Printable Cheque Mockup */}
        <div className="p-8 rounded-3xl bg-amber-50/50 border-2 border-amber-300 shadow-md relative overflow-hidden font-serif">
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <ShieldCheck className="w-72 h-72 text-amber-900" />
          </div>

          <div className="flex justify-between items-start border-b-2 border-amber-200 pb-4">
            <div>
              <h3 className="text-xl font-black text-amber-950 font-sans tracking-tight">VALOURIAN CAPITAL PTY LTD</h3>
              <p className="text-[11px] font-mono text-amber-800">ABN 88 168 900 288 • Artarmon / Clontarf Hub NSW 2064</p>
              <p className="text-[10px] font-mono text-slate-500">Drawn on: Commonwealth Bank of Australia (062-140 • 11680690)</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-amber-900 font-bold block">CHEQUE NO: 004829</span>
              <span className="text-[11px] text-slate-600">DATE: {new Date().toLocaleDateString('en-AU')}</span>
            </div>
          </div>

          <div className="my-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-sans font-bold uppercase text-amber-900">PAY TO THE ORDER OF:</span>
              <span className="flex-1 border-b-2 border-dotted border-amber-400 font-sans font-black text-lg text-slate-900 px-2">
                {chequePayee}
              </span>
              <div className="bg-white border-2 border-amber-400 px-4 py-2 rounded-xl font-mono font-black text-xl text-amber-950">
                ${parseFloat(chequeAmount || "0").toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-sans font-bold uppercase text-amber-900">MEMO:</span>
              <span className="flex-1 border-b-2 border-dotted border-amber-400 text-xs text-slate-700 px-2 font-sans italic">
                {chequeMemo}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t-2 border-amber-200">
            <div className="font-mono text-xs text-amber-900 tracking-widest">
              ⑆062140⑆ 11680690⑈ 004829⑈
            </div>
            <div className="text-right">
              <div className="font-serif italic font-black text-xl text-amber-950">Mr. Asim Aryal</div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest border-t border-amber-300 pt-1">
                Authorized Executive Signature
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Vouchers Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-base font-black text-slate-900">Active Bearer Vouchers</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vouchers.map((v, idx) => (
            <div
              key={`voucher-${v.id}-${idx}`}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {v.code}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  v.redeemed ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {v.redeemed ? "REDEEMED" : "VALID"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG value={`https://valourian.com/v/${v.code}`} size={72} />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-slate-900">${v.amount.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-bold">{v.currency}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono space-y-1">
                <div>Recipient: <strong className="text-slate-800">{v.recipient}</strong></div>
                <div>Expiry: {v.expiry}</div>
              </div>

              {!v.redeemed && (
                <button
                  type="button"
                  onClick={() => handleRedeemVoucher(v.id)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Redeem Into Vault
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
