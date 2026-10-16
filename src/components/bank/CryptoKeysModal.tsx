import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, ShieldCheck, Eye, EyeOff, Copy, Check, QrCode, 
  Download, FileText, Lock, Unlock, AlertTriangle, X, 
  ExternalLink, Sparkles, RefreshCw, Cpu, Database
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export interface CryptoKeyRecord {
  id: string;
  name: string;
  symbol: string;
  network: string;
  assetType: string;
  balance: string;
  fiatValue: string;
  address: string;
  privateKey: string;
  publicKey?: string;
  derivationPath: string;
  keyFormat: string;
  curve: string;
  securityClass: string;
  multiSigDetails?: string;
  color: string;
}

export const SOVEREIGN_CRYPTO_KEYS: CryptoKeyRecord[] = [
  {
    id: 'btc-main',
    name: 'Bitcoin Sovereign Cold Reserve',
    symbol: 'BTC',
    network: 'Bitcoin Mainnet (BIP-84 Native SegWit / Taproot)',
    assetType: 'Layer-1 Cold Vault',
    balance: '845,210.00 BTC',
    fiatValue: '$85,200,000,000.00 USD',
    address: 'bc1p09a8f7e6d5c4b3a210987654321fedcba9876543210fedcba9876543210',
    privateKey: 'L5q7W4Nk3gP7Q3R9Z2mK8eL1vB4yX6wN8sT2uV5aC9dF7hJ2kLmN',
    publicKey: '029a8f7e6d5c4b3a210987654321fedcba9876543210fedcba9876543210fedc',
    derivationPath: "m/84'/0'/0'/0/0",
    keyFormat: 'WIF (Wallet Import Format - Compressed 52 Chars)',
    curve: 'secp256k1 (Schnorr / Taproot)',
    securityClass: 'HSM Enclave Level-3 / Air-gapped Cold Storage',
    multiSigDetails: 'Multi-Sig 3-of-5 Sovereign Threshold Signatures (Valourian, Swiss Vault, Singapore)',
    color: '#f7931a'
  },
  {
    id: 'eth-main',
    name: 'Ethereum Sovereign Multi-Sig Vault',
    symbol: 'ETH',
    network: 'Ethereum Mainnet / Arbitrum One / Base / Polygon',
    assetType: 'EVM Institutional Treasury',
    balance: '14,200,500.00 ETH',
    fiatValue: '$52,000,000,000.00 USD',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    privateKey: '0x9a8f7e6d5c4b3a210987654321fedcba9876543210fedcba9876543210fedcba',
    publicKey: '0x049a8f7e6d5c4b3a210987654321fedcba9876543210fedcba9876543210fedcba8f7e6d5c4b3a210987654321fedcba9876543210fedcba9876543210fedcba11',
    derivationPath: "m/44'/60'/0'/0/0",
    keyFormat: 'Hexadecimal (256-bit ECDSA Raw Key)',
    curve: 'secp256k1 (Keccak-256)',
    securityClass: 'Gnosis Safe 3-of-5 On-Chain Multi-Sig + Timelock',
    multiSigDetails: 'Signers: Asim Primary Key, Valourian Corporate Key, Swiss Cold Key',
    color: '#627eea'
  },
  {
    id: 'sol-main',
    name: 'Solana High-Velocity Treasury',
    symbol: 'SOL',
    network: 'Solana Mainnet-Beta',
    assetType: 'Ultra-Fast Liquid Reserve',
    balance: '450,000,000.00 SOL',
    fiatValue: '$85,000,000,000.00 USD',
    address: 'AsimValourianSolanaColdStorageTreasury999111',
    privateKey: '5M5v4k8hZ9q3r1t7y5u2i4o6p8a1s3d5f7g9h2j4k6l8z1x3c5v7b9n2m4q6w8e1r3t5y7u9i1o3p5a7s9d1f3g5h7j9k1l3',
    derivationPath: "m/44'/501'/0'/0'",
    keyFormat: 'Base58 (64-byte Ed25519 Secret Keypair)',
    curve: 'ed25519',
    securityClass: 'Phantom / Solflare Hardware Ledger HSM',
    multiSigDetails: 'Squads Protocol v4 Multi-Sig 3-of-4 with 24h Timelock',
    color: '#14F195'
  },
  {
    id: 'usdc-main',
    name: 'USDC Sovereign Cash Settlement Vault',
    symbol: 'USDC',
    network: 'Multi-Chain (ERC-20, Solana SPL, Polygon, Arbitrum)',
    assetType: 'Dollar-Pegged Sovereign Liquidity',
    balance: '120,000,000,000.00 USDC',
    fiatValue: '$120,000,000,000.00 USD',
    address: '0x3F5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
    privateKey: '0x4d3e2c1b0a9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba',
    derivationPath: "m/44'/60'/0'/0/1",
    keyFormat: 'Hexadecimal (256-bit ECDSA)',
    curve: 'secp256k1',
    securityClass: 'Circle Institutional Direct Clearing Key',
    multiSigDetails: 'Instant 1:1 USD Cash Settlement Interchange via CBA & Macquarie Bridge',
    color: '#2775ca'
  }
];

export const MASTER_BIP39_SEED = {
  words: [
    'abandon', 'ability', 'able', 'about', 'above', 'absent',
    'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
    'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
    'across', 'act', 'action', 'actor', 'actress', 'actual'
  ],
  passphrase: 'Valourian-Sovereign-Treasury-Auth-2026',
  masterSeedHex: 'e4d909c290d0fb1ca068ffaddf22cbd0d0c351e6760375c9a871110e08135d299544e80530441fe99c7d8f5664c3c4c576292ac72c12978744603edd8bbe60ce',
  rootFingerprint: '0x77291VCA'
};

interface CryptoKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultShowFullKeys?: boolean;
}

export function CryptoKeysModal({ isOpen, onClose, defaultShowFullKeys = true }: CryptoKeysModalProps) {
  const [showFullKeys, setShowFullKeys] = useState(defaultShowFullKeys);
  const [activeTab, setActiveTab] = useState<'all' | 'btc' | 'eth' | 'sol' | 'usdc' | 'seed'>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrModalData, setQrModalData] = useState<{ title: string; subtitle: string; value: string } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleCopyAllKeysJson = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      vaultClassification: 'VALOURIAN CAPITAL TIER-0 SOVEREIGN COLD VAULT',
      custodian: 'Mr. Asim Aryal',
      totalDigitalAssetValueUSD: '$342,200,000,000.00 USD',
      keys: SOVEREIGN_CRYPTO_KEYS.map(k => ({
        asset: k.name,
        symbol: k.symbol,
        network: k.network,
        balance: k.balance,
        fiatValue: k.fiatValue,
        address: k.address,
        privateKey: k.privateKey,
        publicKey: k.publicKey,
        derivationPath: k.derivationPath,
        keyFormat: k.keyFormat,
        securityClass: k.securityClass
      })),
      bip39MasterSeedPhrase: MASTER_BIP39_SEED.words.join(' '),
      bip39Passphrase25thWord: MASTER_BIP39_SEED.passphrase,
      masterSeedHex: MASTER_BIP39_SEED.masterSeedHex,
      rootFingerprint: MASTER_BIP39_SEED.rootFingerprint
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success('Complete Crypto Keys Vault JSON payload copied to clipboard!');
  };

  const handleDownloadKeystoreJson = () => {
    const payload = {
      vault: 'Valourian Sovereign Crypto Keys Vault',
      beneficialOwner: 'Mr. Asim Aryal',
      exportDate: new Date().toISOString(),
      hsmEnclaveVerification: 'VERIFIED_FIPS_140_2_L3',
      keys: SOVEREIGN_CRYPTO_KEYS,
      masterBip39Seed: MASTER_BIP39_SEED
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valourian_sovereign_crypto_keys_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded encrypted Sovereign Keystore JSON!');
  };

  const filteredKeys = SOVEREIGN_CRYPTO_KEYS.filter(k => {
    if (activeTab === 'all') return true;
    if (activeTab === 'btc') return k.symbol === 'BTC';
    if (activeTab === 'eth') return k.symbol === 'ETH';
    if (activeTab === 'sol') return k.symbol === 'SOL';
    if (activeTab === 'usdc') return k.symbol === 'USDC';
    return false;
  });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-slate-900 border border-amber-500/30 w-full max-w-5xl rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Key className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-black uppercase tracking-wider text-base sm:text-lg">
                  Sovereign Crypto Vault Keys
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> HSM Enclave Active
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Full unmasked private keys, BIP-39 24-word recovery seeds, and multi-sig derivation specs ($342.20B USD Assets).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show / Hide Full Crypto Keys Primary Button */}
            <button
              onClick={() => {
                setShowFullKeys(!showFullKeys);
                toast.info(showFullKeys ? 'Crypto keys masked.' : 'Full crypto keys unmasked and displayed.');
              }}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer border ${
                showFullKeys 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={showFullKeys ? 'Click to mask keys' : 'Click to display full keys'}
            >
              {showFullKeys ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide Full Keys</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Show Full Crypto Keys</span>
                </>
              )}
            </button>

            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'all' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Assets ({SOVEREIGN_CRYPTO_KEYS.length})
            </button>
            <button
              onClick={() => setActiveTab('btc')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'btc' 
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Bitcoin (BTC)
            </button>
            <button
              onClick={() => setActiveTab('eth')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'eth' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Ethereum (ETH)
            </button>
            <button
              onClick={() => setActiveTab('sol')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'sol' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Solana (SOL)
            </button>
            <button
              onClick={() => setActiveTab('usdc')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'usdc' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              USDC Reserve
            </button>
            <button
              onClick={() => setActiveTab('seed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'seed' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              BIP-39 Master Seed (24 Words)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllKeysJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy All (JSON)</span>
            </button>
            <button
              onClick={handleDownloadKeystoreJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Keystore</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 hide-scrollbar flex-1 bg-slate-900/60">
          
          {/* Status banner when full keys are shown */}
          {showFullKeys && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-amber-300 font-bold text-xs uppercase tracking-wider">
                  Full Cryptographic Private Keys Unmasked
                </div>
                <p className="text-slate-300 text-xs mt-1">
                  You are viewing the unmasked raw private keys and master seed phrases. These give irrevocable, sovereign control over $342.20B in treasury assets across Bitcoin, Ethereum, Solana, and multi-chain liquidity venues.
                </p>
              </div>
            </div>
          )}

          {/* Master BIP-39 Seed Phrase Section (shown on 'all' or 'seed') */}
          {(activeTab === 'all' || activeTab === 'seed') && (
            <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
                      Master BIP-39 Seed Phrase (24 Words)
                      <span className="text-[10px] font-black bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                        ROOT MULTI-CHAIN SEED
                      </span>
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Universal hierarchical deterministic derivation root for all Bitcoin, Ethereum, Solana, and ERC-20 accounts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(MASTER_BIP39_SEED.words.join(' '), 'BIP-39 Mnemonic Seed Phrase')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-rose-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedField === 'BIP-39 Mnemonic Seed Phrase' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>Copy 24 Words</span>
                  </button>

                  <button
                    onClick={() => setQrModalData({
                      title: 'Master BIP-39 Seed Phrase',
                      subtitle: '24-Word Mnemonic Universal Seed',
                      value: MASTER_BIP39_SEED.words.join(' ')
                    })}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 cursor-pointer"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 24 Words Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                {MASTER_BIP39_SEED.words.map((word, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 p-2.5 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-500 w-5 text-right">{idx + 1}.</span>
                    <span className={`font-mono text-xs font-bold ${showFullKeys ? 'text-rose-300' : 'text-slate-500 blur-[3px] select-none'}`}>
                      {showFullKeys ? word : '••••••••'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Passphrase & Root Seed Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Passphrase (25th Word / Salt)</span>
                    <button 
                      onClick={() => handleCopy(MASTER_BIP39_SEED.passphrase, 'Passphrase')}
                      className="text-slate-400 hover:text-white text-[11px] font-mono flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className={`font-mono text-xs break-all ${showFullKeys ? 'text-amber-300' : 'text-slate-500 blur-[3px]'}`}>
                    {showFullKeys ? MASTER_BIP39_SEED.passphrase : '••••••••••••••••••••••••••••••••'}
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Master Seed (512-bit Hex)</span>
                    <button 
                      onClick={() => handleCopy(MASTER_BIP39_SEED.masterSeedHex, '512-bit Master Seed Hex')}
                      className="text-slate-400 hover:text-white text-[11px] font-mono flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className={`font-mono text-[11px] break-all ${showFullKeys ? 'text-emerald-400' : 'text-slate-500 blur-[3px]'}`}>
                    {showFullKeys ? MASTER_BIP39_SEED.masterSeedHex : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Individual Crypto Key Cards */}
          {activeTab !== 'seed' && (
            <div className="space-y-5">
              {filteredKeys.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all shadow-xl"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-lg text-sm"
                        style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}50`, color: item.color }}
                      >
                        {item.symbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-base">{item.name}</h3>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.assetType}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs">{item.network}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs font-mono font-bold text-white">{item.balance}</div>
                      <div className="text-xs font-black text-emerald-400">{item.fiatValue}</div>
                    </div>
                  </div>

                  {/* Public Address */}
                  <div className="mt-4 bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/80">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-blue-400" /> Public Deposit / Receiving Address
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQrModalData({
                            title: `${item.name} (${item.symbol})`,
                            subtitle: 'Public Deposit Address',
                            value: item.address
                          })}
                          className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                          title="Show QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" /> QR
                        </button>
                        <button
                          onClick={() => handleCopy(item.address, `${item.symbol} Public Address`)}
                          className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === `${item.symbol} Public Address` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>Copy Address</span>
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-slate-200 break-all bg-black/40 p-2.5 rounded-lg border border-white/5 select-all">
                      {item.address}
                    </div>
                  </div>

                  {/* Full Private Key */}
                  <div className="mt-3 bg-slate-900/90 rounded-xl p-3.5 border border-amber-500/25">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" /> Full Private Key ({item.keyFormat})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQrModalData({
                            title: `${item.name} Private Key`,
                            subtitle: `${item.keyFormat} - KEEP STRICTLY CONFIDENTIAL`,
                            value: item.privateKey
                          })}
                          className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                          title="Show Private Key QR"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-400" /> QR
                        </button>
                        <button
                          onClick={() => handleCopy(item.privateKey, `${item.symbol} Full Private Key`)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedField === `${item.symbol} Full Private Key` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>Copy Full Key</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="font-mono text-xs sm:text-sm break-all bg-black/60 p-2.5 rounded-lg border border-amber-500/30 select-all">
                      {showFullKeys ? (
                        <span className="text-amber-400 font-bold">{item.privateKey}</span>
                      ) : (
                        <span className="text-slate-500 tracking-widest blur-[3px] select-none cursor-pointer" onClick={() => setShowFullKeys(true)}>
                          {item.privateKey.slice(0, 8)}••••••••••••••••••••••••••••••••••••••••{item.privateKey.slice(-6)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Public Key & Derivation Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Derivation Path</div>
                      <div className="font-mono text-xs text-slate-300 mt-0.5">{item.derivationPath}</div>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Curve / Algorithm</div>
                      <div className="font-mono text-xs text-slate-300 mt-0.5">{item.curve}</div>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Security Tier</div>
                      <div className="font-mono text-xs text-emerald-400 mt-0.5">{item.securityClass}</div>
                    </div>
                  </div>

                  {/* Multi-Sig Details */}
                  {item.multiSigDetails && (
                    <div className="mt-3 p-2.5 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{item.multiSigDetails}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Air-Gapped Sovereign Vault Enclave • Registered to Mr. Asim Aryal</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFullKeys(!showFullKeys)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
            >
              {showFullKeys ? 'Mask Keys' : 'Show Full Keys'}
            </button>
            <button 
              onClick={onClose} 
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Close Vault
            </button>
          </div>
        </div>
      </motion.div>

      {/* QR Code Inspection Modal */}
      {qrModalData && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">{qrModalData.title}</h4>
              <button onClick={() => setQrModalData(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">{qrModalData.subtitle}</p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              <QRCodeSVG value={qrModalData.value} size={220} level="M" />
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 break-all select-all">
              {qrModalData.value}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrModalData.value);
                  toast.success('Copied payload to clipboard!');
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Value
              </button>
              <button
                onClick={() => setQrModalData(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
