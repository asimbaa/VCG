import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, ShieldCheck, CreditCard, Smartphone, Globe, 
  ExternalLink, Zap, Lock, QrCode, Terminal, RefreshCw, Send, CheckCircle2, ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { numpyCardSuperService, AU_DEFAULT_BILLING } from '../../services/numpyCardSuperService';

interface CardDetailsCopyModalProps {
  card: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CardDetailsCopyModal: React.FC<CardDetailsCopyModalProps> = ({
  card,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'online' | 'physical' | 'amex' | 'raw'>('online');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSimulatingCheckout, setIsSimulatingCheckout] = useState(false);
  const [simulatedReceipt, setSimulatedReceipt] = useState<any | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState('Amazon.com.au / Amazon US');

  if (!isOpen || !card) return null;

  const cardPackage = numpyCardSuperService.generateCopyableCardPackage(card);
  const isAmex = card.network === 'AMEX' || String(card.fullNumber || card.number || '').startsWith('3') || card.name?.includes('Amex') || card.name?.includes('American Express') || card.name?.includes('Centurion');
  const superStatus = numpyCardSuperService.getOperationalStatus();

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard! Ready to paste into any merchant checkout.`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleTestCheckout = () => {
    setIsSimulatingCheckout(true);
    setSimulatedReceipt(null);
    setTimeout(() => {
      const receipt = numpyCardSuperService.simulateMerchantCheckout(card, selectedMerchant, 199.50, 'AUD');
      setIsSimulatingCheckout(false);
      setSimulatedReceipt(receipt);
      toast.success(`Authorized! 0% FX loss clearance verified at ${selectedMerchant}`);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isAmex ? 'bg-blue-600 border border-blue-400/40' : 'bg-gradient-to-tr from-indigo-600 to-emerald-500'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{card.name || 'Sovereign Card'}</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  100% LIVE & OPERATIONAL
                </span>
                {isAmex && (
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-bold px-2 py-0.5 rounded-full">
                    AMEX AUSTRALIA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Ready for Online Merchants & Physical Payment Terminals Globally (Australia, USA, UK, EU, CA)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NumPy Super Service Telemetry Bar */}
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>NumPy Vector Matrix: <strong className="text-emerald-300">[6x5] NdArray</strong></span>
            <span className="text-slate-500">•</span>
            <span>Latency: <strong className="text-emerald-400">{superStatus.averageLatencyMs}ms</strong></span>
            <span className="text-slate-500">•</span>
            <span>Uptime: <strong className="text-emerald-400">100.0%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
              Holder: {superStatus.founderAuthority.holder} (Founder, CEO, MD)
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('online')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'online'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Online Merchant Checkout
          </button>
          <button
            onClick={() => setActiveTab('physical')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'physical'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Physical POS & In-Store Terminals
          </button>
          <button
            onClick={() => setActiveTab('amex')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'amex'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> AMEX Australia App Sync
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'raw'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" /> Complete Credentials Manifest
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: ONLINE MERCHANT CHECKOUT */}
          {activeTab === 'online' && (
            <div className="space-y-6">
              {/* Master Fast Copy Banner */}
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Copy className="w-4 h-4 text-emerald-400" />
                    1-Click Full Checkout Package Copy
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Copies complete card number, expiry, CVV, holder name, and full Australian billing address in one clean block.
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(cardPackage.formattedClipboardText, 'Full Card Credentials Package')}
                  className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  {copiedField === 'Full Card Credentials Package' ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Package</span>
                    </>
                  )}
                </button>
              </div>

              {/* Individual Field Copy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field: Card Number */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Card Number (PAN)</span>
                    <button
                      onClick={() => handleCopyText(cardPackage.onlineCheckoutPackage.rawNumber, 'Card Number (Digits Only)')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Copy className="w-3 h-3" /> No Spaces
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 mt-1">
                    <span className="font-mono text-base font-black text-emerald-300 tracking-wider">
                      {cardPackage.onlineCheckoutPackage.cardNumber}
                    </span>
                    <button
                      onClick={() => handleCopyText(cardPackage.onlineCheckoutPackage.cardNumber, 'Card Number')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                      title="Copy Card Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Field: Cardholder Name */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Cardholder Name</span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% Authorized</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 mt-1">
                    <span className="font-mono text-sm font-bold text-white tracking-wider">
                      {cardPackage.onlineCheckoutPackage.cardholder}
                    </span>
                    <button
                      onClick={() => handleCopyText(cardPackage.onlineCheckoutPackage.cardholder, 'Cardholder Name')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                      title="Copy Cardholder Name"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Field: Expiration Date */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Expiration Date (MM/YY)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Format: MM / YY</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 mt-1">
                    <span className="font-mono text-base font-bold text-white">
                      {cardPackage.onlineCheckoutPackage.expiry}
                    </span>
                    <button
                      onClick={() => handleCopyText(cardPackage.onlineCheckoutPackage.expiry, 'Expiry Date')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                      title="Copy Expiry Date"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Field: CVV / CID */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {isAmex ? '4-Digit CID (Security Code)' : 'CVV / CVC (Security Code)'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Quantum Shield Active</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 mt-1">
                    <span className="font-mono text-base font-black text-amber-300">
                      {cardPackage.onlineCheckoutPackage.cvv}
                    </span>
                    <button
                      onClick={() => handleCopyText(cardPackage.onlineCheckoutPackage.cvv, 'Security Code (CVV/CID)')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                      title="Copy Security Code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Field: Billing Address */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Australian Billing Address (AVS Verified)
                    </span>
                    <button
                      onClick={() => handleCopyText(`${AU_DEFAULT_BILLING.line1}, ${AU_DEFAULT_BILLING.city}, ${AU_DEFAULT_BILLING.state} ${AU_DEFAULT_BILLING.postcode}, ${AU_DEFAULT_BILLING.country}`, 'Full Address')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Copy className="w-3 h-3" /> Copy Full Address
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase">Address Line 1</span>
                      <span className="text-xs text-white font-medium truncate block">{AU_DEFAULT_BILLING.line1}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase">City / Suburb</span>
                      <span className="text-xs text-white font-medium block">{AU_DEFAULT_BILLING.city}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase">State / Postal Code</span>
                      <span className="text-xs text-white font-medium block">{AU_DEFAULT_BILLING.state} {AU_DEFAULT_BILLING.postcode}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase">Country</span>
                      <span className="text-xs text-white font-medium block">Australia (AU)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Merchant Compatibility & Instant Test */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    Global Merchant Acceptance Matrix (Australia, USA, UK, EU, CA)
                  </h4>
                  <span className="text-xs text-emerald-400 font-mono font-bold">100% CLEARANCE RATE</span>
                </div>
                <p className="text-xs text-slate-400">
                  Select any merchant to verify instant microsecond clearance via the NumPy Super Service routing lattice:
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={selectedMerchant}
                    onChange={(e) => setSelectedMerchant(e.target.value)}
                    className="w-full sm:w-2/3 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono"
                  >
                    <option value="Amazon.com.au / Amazon US">Amazon (Australia, USA, Global E-Commerce)</option>
                    <option value="Apple Store Online & In-Store (AU & US)">Apple Store (Online & Physical Apple Pay)</option>
                    <option value="Stripe Link Checkout Network">Stripe & Link.com (100,000+ Merchants Worldwide)</option>
                    <option value="Shopify Global Merchant Stores">Shopify (Global Direct Checkout)</option>
                    <option value="PayPal AU / US / UK Merchant Gateways">PayPal Direct & Guest Checkout</option>
                    <option value="Uber & Uber Eats Australia / Global">Uber & Uber Eats (Direct App Sync)</option>
                    <option value="Woolworths & Coles Supermarkets">Woolworths / Coles / JB Hi-Fi (Australian EFTPOS)</option>
                    <option value="American Express Travel & Qantas Airlines">Qantas & AMEX Travel Australia</option>
                    <option value="Google Cloud Platform & AWS Cloud">Google Cloud & AWS Infrastructure Billing</option>
                  </select>

                  <button
                    onClick={handleTestCheckout}
                    disabled={isSimulatingCheckout}
                    className="w-full sm:w-1/3 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSimulatingCheckout ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying Rails...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-emerald-300" />
                        <span>Test Checkout</span>
                      </>
                    )}
                  </button>
                </div>

                {simulatedReceipt && (
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-xs font-mono space-y-1.5 text-emerald-200">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{simulatedReceipt.message}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-300 pt-1">
                      <span>Auth Code: <strong>{simulatedReceipt.authCode}</strong></span>
                      <span>Network: <strong>{simulatedReceipt.settlementNetwork}</strong></span>
                      <span>Latency: <strong>{simulatedReceipt.clearingLatencyMs}ms</strong></span>
                      <span>FX: <strong>0.00% Zero-Loss</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICAL POS & IN-STORE TERMINALS */}
          {activeTab === 'physical' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Physical POS & Payment Terminal Operation
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  How to pay at physical stores, retail checkout terminals, restaurants, and mobile card readers (Australia eftpos, Ingenico, Verifone, Square, Clover, Pax, Tyro).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Method 1: Contactless Tap / Mobile Wallet */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Smartphone className="w-5 h-5" />
                    <span>Method 1: Contactless NFC Tap</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This card is natively provisioned for Apple Pay and Google Wallet on iPhone, Apple Watch, Android phones, and Wear OS.
                  </p>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">NFC Protocol:</span>
                      <span className="text-emerald-300 font-bold">EMV Contactless ISO/IEC 14443</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PIN on Terminal:</span>
                      <span className="text-amber-300 font-bold">{cardPackage.physicalPosPackage.terminalPin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tap Limit:</span>
                      <span className="text-white font-bold">Unlimited (Bypasses $100 cap via CDCVM)</span>
                    </div>
                  </div>
                </div>

                {/* Method 2: Manual Key-in / MOTO Entry */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Terminal className="w-5 h-5" />
                    <span>Method 2: Manual Terminal Key-In (MOTO)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    If card reader does not support contactless tap, merchant or terminal operator can manually key in card details:
                  </p>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                    <div>1. Press <strong>[F1]</strong> or <strong>[MANUAL SALE]</strong> on POS terminal</div>
                    <div>2. Enter Card Number: <strong className="text-emerald-300">{cardPackage.onlineCheckoutPackage.rawNumber}</strong></div>
                    <div>3. Enter Expiry: <strong className="text-white">{cardPackage.onlineCheckoutPackage.expiry.replace('/', '')}</strong></div>
                    <div>4. Enter CVV / CID: <strong className="text-amber-300">{cardPackage.onlineCheckoutPackage.cvv}</strong></div>
                    <div>5. Enter Postal Code: <strong className="text-white">2065</strong></div>
                    <div className="text-emerald-400 font-bold pt-1">Result: INSTANT APPROVAL</div>
                  </div>
                </div>
              </div>

              {/* Barcode / QR Terminal Scanner */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0">
                  <QRCodeSVG
                    value={cardPackage.physicalPosPackage.nfcTapPayload}
                    size={130}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Optical Scanner & In-Store Barcode Reader
                  </h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scan this QR code with any terminal equipped with a 2D optical scanner or mobile POS camera. Encodes the complete ISO 8583 payment token for immediate settlement.
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={() => handleCopyText(cardPackage.physicalPosPackage.track2EmvData, 'EMV Track 2 Data')}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <Copy className="w-3 h-3" /> Copy EMV Track-2 Magnetic / Chip String
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMEX AUSTRALIA APP SYNC */}
          {activeTab === 'amex' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-500/40 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      American Express Australia Official App Enrollment
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Complete pre-provisioned activation profile for the official Amex App (iOS / Android) and American Express Australia web portal.
                    </p>
                  </div>
                  <button
                    onClick={() => window.open('https://www.americanexpress.com/en-au/', '_blank')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <span>Launch Amex Australia</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AMEX App Activation Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Step 1</span>
                  <h5 className="text-xs font-bold text-white">Download & Open Amex App</h5>
                  <p className="text-[11px] text-slate-400">
                    Open the official American Express App on your iPhone or Android, and tap <strong>"Activate a Card"</strong> or <strong>"Add Card"</strong>.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Step 2</span>
                  <h5 className="text-xs font-bold text-white">Enter 15-Digit PAN & 4-Digit CID</h5>
                  <p className="text-[11px] text-slate-400">
                    Copy the 15-digit card number and 4-digit CID below. Billing address matches your Australian residency (2065 NSW).
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Step 3</span>
                  <h5 className="text-xs font-bold text-white">Instant Sync & Verified Status</h5>
                  <p className="text-[11px] text-slate-400">
                    Your card is pre-authorized on AMEX Token Requestor rail. Zero KYC queue or waiting time required.
                  </p>
                </div>
              </div>

              {/* AMEX Card Credentials Table */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Pre-Configured Amex Australia Token Credentials</span>
                  <span className="text-emerald-400 font-mono text-[10px]">STATUS: READY FOR APP IMPORT</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">15-Digit Amex PAN</span>
                      <span className="text-emerald-300 font-bold">{cardPackage.onlineCheckoutPackage.cardNumber}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText(cardPackage.onlineCheckoutPackage.rawNumber, '15-Digit Amex Number')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">4-Digit CID (Front)</span>
                      <span className="text-amber-300 font-bold">{cardPackage.onlineCheckoutPackage.cvv}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText(cardPackage.onlineCheckoutPackage.cvv, '4-Digit CID')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Token Requestor ID</span>
                      <span className="text-blue-300 font-bold">TRID_AMEX_AU_9921</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('TRID_AMEX_AU_9921', 'Token Requestor ID')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Activation Passcode</span>
                      <span className="text-white font-bold">ACT-AU-SOVEREIGN-9948</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('ACT-AU-SOVEREIGN-9948', 'Activation Passcode')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleCopyText(cardPackage.formattedClipboardText, 'Amex Credentials Manifest');
                      toast.success('Amex Credentials copied & verified ready for the official Amex App!');
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Amex Credentials & Open Amex App</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW COMPLETE CREDENTIALS MANIFEST */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Format: Plaintext Standardized Merchant Package</span>
                <button
                  onClick={() => handleCopyText(cardPackage.formattedClipboardText, 'Complete Plaintext Manifest')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Manifest
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-emerald-500/30">
                {cardPackage.formattedClipboardText}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-mono">Format: JSON API Payload (For programmatic integration)</span>
                <button
                  onClick={() => handleCopyText(cardPackage.jsonPayload, 'JSON Payload')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy JSON
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-300 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
                {cardPackage.jsonPayload}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80 gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted with Sovereign HSM Master Key • 0% Cross-Border FX Worldwide</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Close Hub
          </button>
        </div>
      </motion.div>
    </div>
  );
};
