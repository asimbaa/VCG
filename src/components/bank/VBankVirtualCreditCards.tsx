import React, { useState, useEffect } from 'react';
import { repairLuhnPan } from '../../utils/luhn';
import { 
  CreditCard, ShieldCheck, Zap, ArrowRight, RefreshCw, Send, CheckCircle2, 
  Smartphone, Eye, EyeOff, Copy, QrCode, Wifi, Cloud, Lock, Unlock, Globe,
  Sparkles, ExternalLink, Flame, ShieldAlert, Cpu, ShoppingBag, TrendingUp,
  Leaf, Share2, Plus, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { useGlobalCurrency } from '../../contexts/CurrencyContext';
import { NFCTapModal } from '../pay/NFCTapModal';
import { LinkComManagerModal } from '../pay/LinkComManagerModal';
import { CrossPlatformCardWalletModal } from './CrossPlatformCardWalletModal';
import { CardDetailsCopyModal } from './CardDetailsCopyModal';
import { ClassicCardFeaturesModal } from './ClassicCardFeaturesModal';
import { CommBankPayIDFlow } from '../pay/CommBankPayIDFlow';
import { unifiedBankCardSync, UnifiedBankCard } from '../../services/unifiedBankCardSync';
import { AmexAuAppRegistrationModal } from './AmexAuAppRegistrationModal';
import { NumpySuperServiceWidget } from './NumpySuperServiceWidget';
import { numpyCardSuperService } from '../../services/numpyCardSuperService';
import { 
  TARGET_LINK_EMAIL, TARGET_LINK_HOLDER, LINK_COM_APP_URL, 
  getAllBankingCreditCards, syncAllCardsToLinkAccount, LinkComCard 
} from '../../services/linkComService';
import { smsEmailDispatchService } from '../../services/smsEmailDispatchService';
import { SectionWisdomTooltip } from '../shared/SectionWisdomTooltip';
import { SmartphoneNfcCardReaderModal } from '../pay/SmartphoneNfcCardReaderModal';
import { CardGeniusInnovationsModal } from './CardGeniusInnovationsModal';
import { ExternalAppAutoLoginModal } from './ExternalAppAutoLoginModal';
import { MassiveRateExpansionModal } from './MassiveRateExpansionModal';
import { GlobalMerchantPOSModal } from './GlobalMerchantPOSModal';
import { CardBenefitsShowcaseModal } from './CardBenefitsShowcaseModal';
import { LuxuryConciergeSection } from './LuxuryConciergeSection';
import { EasyPayPurchaseModal } from './EasyPayPurchaseModal';
import { IOSAppleWalletCardDeck } from './IOSAppleWalletCardDeck';
import { ShareCardModal } from './ShareCardModal';
import { IssueCardStudioModal } from './IssueCardStudioModal';
import toast from 'react-hot-toast';

export interface BankCard {
  id: string;
  name: string;
  number: string;
  fullNumber?: string;
  balance: number;
  currency: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'frozen' | 'processing';
  limit: number | 'unlimited';
  cvv?: string;
  dynamicCvv?: string;
  expiry?: string;
  network?: string;
  bsb?: string;
  accountNumber?: string;
  payId?: string;
  dualRouting?: 'eftpos_domestic' | 'global_credit';
  burnerMode?: boolean;
  appleGooglePayEnrolled?: boolean;
  pin?: string;
  cashbackRate?: number;
  accumulatedCashback?: number;
  apyInterestRate?: number;
  accruedInterest?: number;
  rewardsPoints?: number;
  dailySpendingLimit?: number;
  atmDailyLimit?: number;
  onlinePaymentsEnabled?: boolean;
  internationalPaymentsEnabled?: boolean;
  contactlessEnabled?: boolean;
  loungeAccess?: boolean;
  travelInsuranceCovered?: boolean;
  purchaseProtectionCovered?: boolean;
  cardCategory?: 'debit' | 'credit';
  formFactor?: 'virtual' | 'physical' | 'virtual_and_physical';
  vipPerks?: string[];
  shareable?: boolean;
}

const INITIAL_CARDS: BankCard[] = [
  { 
    id: 'c1', 
    type: 'virtual', 
    name: 'VBank Sovereign Global Virtual Black', 
    number: '5119 3988 4562 4829', 
    fullNumber: '5119 3988 4562 4829',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '482', 
    dynamicCvv: '482',
    expiry: '12/28',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210045',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c2', 
    type: 'virtual', 
    name: 'VBank AuraDrive Business Virtual', 
    number: '5119 3988 4562 8291', 
    fullNumber: '5119 3988 4562 8291',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 940000000, 
    cvv: '119', 
    dynamicCvv: '119',
    expiry: '09/27',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210046',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c3', 
    type: 'virtual', 
    name: 'VBank Sovereign Logistics Virtual', 
    number: '5119 3988 4562 1023', 
    fullNumber: '5119 3988 4562 1023',
    balance: 9400000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 9400000000, 
    cvv: '741', 
    dynamicCvv: '741',
    expiry: '04/29',
    network: 'Mastercard',
    bsb: '182-512',
    accountNumber: '8499210047',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c4', 
    type: 'virtual', 
    name: 'Commonwealth Bank (CBA) Diamond Business Virtual', 
    number: '5163 9201 4419 8208', 
    fullNumber: '5163 9201 4419 8208',
    balance: 500000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 500000000, 
    cvv: '820', 
    dynamicCvv: '820',
    expiry: '10/30',
    network: 'Mastercard',
    bsb: '062-140',
    accountNumber: '10492810',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c5', 
    type: 'virtual', 
    name: 'Westpac Institutional Visa Infinite Virtual', 
    number: '4564 8192 3019 5524', 
    fullNumber: '4564 8192 3019 5524',
    balance: 750000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 750000000, 
    cvv: '552', 
    dynamicCvv: '552',
    expiry: '09/31',
    network: 'Visa',
    bsb: '032-000',
    accountNumber: '88291039',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c6', 
    type: 'virtual', 
    name: 'ANZ Black Premium Virtual Visa', 
    number: '4111 2948 1029 4816', 
    fullNumber: '4111 2948 1029 4816',
    balance: 600000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 600000000, 
    cvv: '481', 
    dynamicCvv: '481',
    expiry: '05/30',
    network: 'Visa',
    bsb: '012-003',
    accountNumber: '44928102',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c7', 
    type: 'virtual', 
    name: 'NAB Private Wealth Virtual Visa Infinite', 
    number: '4916 4892 3019 9945', 
    fullNumber: '4916 4892 3019 9945',
    balance: 1000000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 1000000000, 
    cvv: '994', 
    dynamicCvv: '994',
    expiry: '12/31',
    network: 'Visa',
    bsb: '082-001',
    accountNumber: '91028301',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c8', 
    type: 'virtual', 
    name: 'Macquarie Bank Platinum Virtual Mastercard', 
    number: '5424 9912 3810 6634', 
    fullNumber: '5424 9912 3810 6634',
    balance: 450000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 450000000, 
    cvv: '663', 
    dynamicCvv: '663',
    expiry: '07/28',
    network: 'Mastercard',
    bsb: '182-512',
    accountNumber: '99182371',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'amex_au_centurion_black', 
    type: 'virtual', 
    name: 'American Express Centurion Black Card (Australia)', 
    number: '3782 821910 17712', 
    fullNumber: '3782 821910 17712',
    balance: 1000000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '7712', 
    dynamicCvv: '7712',
    expiry: '06/32',
    network: 'AMEX',
    bsb: '021-000',
    accountNumber: '8499210050',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'global_credit',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'amex_au_platinum_business', 
    type: 'virtual', 
    name: 'American Express Platinum Business Card (Australia)', 
    number: '3760 918210 41006', 
    fullNumber: '3760 918210 41006',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 940000000, 
    cvv: '8819', 
    dynamicCvv: '8819',
    expiry: '08/29',
    network: 'AMEX',
    bsb: '021-000',
    accountNumber: '8499210051',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'global_credit',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'amex_au_explorer', 
    type: 'virtual', 
    name: 'American Express Explorer Credit Card (Australia)', 
    number: '3759 849210 62008', 
    fullNumber: '3759 849210 62008',
    balance: 500000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 500000000, 
    cvv: '4201', 
    dynamicCvv: '4201',
    expiry: '11/29',
    network: 'AMEX',
    bsb: '021-000',
    accountNumber: '8499210052',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'global_credit',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'amex_au_corp_black', 
    type: 'virtual', 
    name: 'American Express Corporate Black Diamond (Valourian Treasury AU)', 
    number: '3791 748210 03007', 
    fullNumber: '3791 748210 03007',
    balance: 2500000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 2500000000, 
    cvv: '9305', 
    dynamicCvv: '9305',
    expiry: '12/31',
    network: 'AMEX',
    bsb: '021-000',
    accountNumber: '8499210053',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'global_credit',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'amex_au_qantas_ult', 
    type: 'virtual', 
    name: 'American Express Qantas Ultimate Corporate Card (Australia)', 
    number: '3767 482910 84002', 
    fullNumber: '3767 482910 84002',
    balance: 1000000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '3102', 
    dynamicCvv: '3102',
    expiry: '09/30',
    network: 'AMEX',
    bsb: '021-000',
    accountNumber: '8499210054',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'global_credit',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'p1', 
    type: 'physical', 
    name: 'Valourian Physical Black Card (Primary Titanium)', 
    number: '5119 3988 4562 9992', 
    fullNumber: '5119 3988 4562 9992',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '999', 
    dynamicCvv: '999',
    expiry: '01/30',
    network: 'Mastercard',
    bsb: '182-512',
    accountNumber: '8499210048',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'diamond_infinity', 
    type: 'virtual', 
    name: 'Valourian Sovereign Diamond Infinity Reserve', 
    number: '5500 8821 4492 1199', 
    fullNumber: '5500 8821 4492 1199',
    balance: 10000000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '119', 
    dynamicCvv: '119',
    expiry: '04/35',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210099',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'apple_card_titanium', 
    type: 'virtual', 
    name: 'Apple Card Titanium Sovereign Edition', 
    number: '5521 7719 3019 4480', 
    fullNumber: '5521 7719 3019 4480',
    balance: 500000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '448', 
    dynamicCvv: '448',
    expiry: '10/33',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210060',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  {
    id: 'debit_valourian_platinum',
    type: 'physical',
    cardCategory: 'debit',
    formFactor: 'virtual_and_physical',
    name: 'Valourian Private Wealth Platinum Debit',
    number: '5241 8820 4419 7712',
    fullNumber: '5241 8820 4419 7712',
    balance: 2500000000,
    currency: 'AUD',
    status: 'active',
    limit: 'unlimited',
    cvv: '712',
    dynamicCvv: '712',
    expiry: '08/33',
    network: 'Mastercard',
    bsb: '182-512',
    accountNumber: '8499210101',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true,
    shareable: true
  },
  {
    id: 'debit_cba_sovereign',
    type: 'physical',
    cardCategory: 'debit',
    formFactor: 'virtual_and_physical',
    name: 'CBA Sovereign Everyday Access Debit',
    number: '5163 7200 4419 8815',
    fullNumber: '5163 7200 4419 8815',
    balance: 850000000,
    currency: 'AUD',
    status: 'active',
    limit: 850000000,
    cvv: '815',
    dynamicCvv: '815',
    expiry: '11/31',
    network: 'Mastercard',
    bsb: '062-140',
    accountNumber: '11680690',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true,
    shareable: true
  },
  {
    id: 'debit_valourian_business',
    type: 'virtual',
    cardCategory: 'debit',
    formFactor: 'virtual_and_physical',
    name: 'Valourian Global Multi-Currency Business Debit',
    number: '4532 9910 4419 2200',
    fullNumber: '4532 9910 4419 2200',
    balance: 1200000000,
    currency: 'AUD',
    status: 'active',
    limit: 'unlimited',
    cvv: '200',
    dynamicCvv: '200',
    expiry: '05/32',
    network: 'Visa',
    bsb: '182-512',
    accountNumber: '8499210102',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true,
    shareable: true
  },
  {
    id: 'debit_valourian_green',
    type: 'physical',
    cardCategory: 'debit',
    formFactor: 'virtual_and_physical',
    name: 'Valourian Green Impact Everyday Debit',
    number: '4111 8820 4419 5534',
    fullNumber: '4111 8820 4419 5534',
    balance: 450000000,
    currency: 'AUD',
    status: 'active',
    limit: 450000000,
    cvv: '534',
    dynamicCvv: '534',
    expiry: '09/32',
    network: 'Visa',
    bsb: '182-512',
    accountNumber: '8499210103',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true,
    shareable: true
  },
];

const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00,
  'AUD': 1.52,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 150.4,
  'SGD': 1.34
};

export const normalizeCard = (c: any): BankCard => {
  const rawSeed = String(c?.fullNumber || c?.number || '5119398845629968').trim();
  const repaired = repairLuhnPan(rawSeed, c?.network);
  const fullNum = repaired.formattedPan;
  const last4 = repaired.last4;
  const formattedNum = fullNum;

  return {
    id: String(c?.id || `card_${Math.random().toString(36).slice(2, 9)}`),
    name: String(c?.name || 'Valourian Global Virtual Card'),
    number: formattedNum,
    fullNumber: fullNum,
    balance: typeof c?.balance === 'number' ? c.balance : 940000000,
    currency: String(c?.currency || 'AUD'),
    type: c?.type === 'physical' ? 'physical' : 'virtual',
    status: c?.status === 'frozen' ? 'frozen' : 'active',
    limit: c?.limit || 'unlimited',
    cvv: String(c?.cvv || '843'),
    dynamicCvv: String(c?.dynamicCvv || c?.cvv || '843'),
    expiry: String(c?.expiry || '12/28'),
    network: String(c?.network || 'Mastercard'),
    bsb: String(c?.bsb || '021-000'),
    accountNumber: String(c?.accountNumber || '8499210045'),
    payId: String(c?.payId || TARGET_LINK_EMAIL),
    dualRouting: c?.dualRouting === 'global_credit' ? 'global_credit' : 'eftpos_domestic',
    appleGooglePayEnrolled: c?.appleGooglePayEnrolled !== false,
    burnerMode: Boolean(c?.burnerMode),
    cardCategory:
      c?.cardCategory === 'debit' || String(c?.id || '').startsWith('debit_') || String(c?.name || '').toLowerCase().includes('debit')
        ? 'debit'
        : 'credit',
    formFactor: c?.formFactor || 'virtual_and_physical',
    vipPerks: Array.isArray(c?.vipPerks) ? c.vipPerks : undefined,
    shareable: c?.shareable !== false,
  };
};

export const VBankVirtualCreditCards: React.FC = () => {
  const { formatConverted: format, currency, setCurrency } = useGlobalCurrency() as any;
  const [cards, setCards] = useState<BankCard[]>(() => {
    const unified = unifiedBankCardSync.getCards();
    if (unified.length > 0) return unified.map(normalizeCard);
    return INITIAL_CARDS.map(normalizeCard);
  });

  useEffect(() => {
    const unsub = unifiedBankCardSync.subscribe((nextUnified) => {
      setCards(nextUnified.map(normalizeCard));
    });
    return unsub;
  }, []);

  const [selectedCopyModalCard, setSelectedCopyModalCard] = useState<any | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isNfcReaderModalOpen, setIsNfcReaderModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedWalletCard, setSelectedWalletCard] = useState<any | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedClassicCard, setSelectedClassicCard] = useState<UnifiedBankCard | null>(null);
  const [isClassicModalOpen, setIsClassicModalOpen] = useState(false);
  const [classicModalInitialTab, setClassicModalInitialTab] = useState<"controls" | "payid" | "value" | "pin" | "limits" | "statements">("controls");
  const [isPayIdFlowOpen, setIsPayIdFlowOpen] = useState(false);
  const [payIdSelectedCardId, setPayIdSelectedCardId] = useState<string | null>(null);
  const [isAmexRegistrationModalOpen, setIsAmexRegistrationModalOpen] = useState(false);
  const [selectedGeniusCard, setSelectedGeniusCard] = useState<UnifiedBankCard | null>(null);
  const [isGeniusModalOpen, setIsGeniusModalOpen] = useState(false);
  const [isAutoLoginModalOpen, setIsAutoLoginModalOpen] = useState(false);
  const [isRateExpansionModalOpen, setIsRateExpansionModalOpen] = useState(false);
  const [rateExpansionInitialCardId, setRateExpansionInitialCardId] = useState<string | undefined>(undefined);
  const [isGlobalPOSModalOpen, setIsGlobalPOSModalOpen] = useState(false);
  const [posModalInitialCardId, setPosModalInitialCardId] = useState<string | undefined>(undefined);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [benefitsModalInitialTab, setBenefitsModalInitialTab] = useState<"cashback" | "aviation" | "concierge" | "lounge" | "immense">("cashback");
  const [isEasyPayModalOpen, setIsEasyPayModalOpen] = useState(false);
  const [selectedEasyPayCard, setSelectedEasyPayCard] = useState<BankCard | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareCard, setSelectedShareCard] = useState<BankCard | null>(null);
  const [isIssueStudioOpen, setIsIssueStudioOpen] = useState(false);
  const [showVaultToolsDrawer, setShowVaultToolsDrawer] = useState(false);
  const [expandedCardControls, setExpandedCardControls] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'Mastercard' | 'Visa' | 'AMEX'>('all');
  const [listCategoryFilter, setListCategoryFilter] = useState<'all' | 'debit' | 'credit'>('all');

  const handleRefillCard = (cardId: string) => {
    const existing = cards.find((c) => c.id === cardId);
    const refillAmt =
      cardId === 'diamond_infinity'
        ? 10000000000
        : existing?.limit === 'unlimited'
        ? 1000000000
        : typeof existing?.limit === 'number'
        ? Math.max(existing.limit, 940000000)
        : 940000000;
    unifiedBankCardSync.updateCard(cardId, (c) => ({ ...c, balance: refillAmt, status: 'active' }));
    setCards(prev => prev.map(c => (c.id === cardId ? { ...c, balance: refillAmt, status: 'active' as const } : c)));
    toast.success(`Replenished ${existing?.name || 'Card'} with institutional liquidity.`);
  };

  const handleCardBalanceUpdated = (cardId: string, newBalance: number) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, balance: newBalance } : c));
  };

  const openGeniusModal = (card: BankCard) => {
    const rawNum = card.fullNumber || card.number || "";
    const cleanNum = rawNum.replace(/\D/g, "");
    const last4 = (card as any).last4 || (cleanNum.length >= 4 ? cleanNum.slice(-4) : "4829");
    const unifiedCard = unifiedBankCardSync.getCards().find((c) => c.id === card.id || c.last4 === last4) || {
      id: card.id,
      name: card.name,
      number: card.number,
      fullNumber: card.fullNumber || card.number,
      last4,
      balance: card.balance,
      currency: card.currency || "AUD",
      type: card.type,
      status: card.status === "frozen" ? "frozen" : "active",
      limit: card.limit,
      cvv: card.cvv || "482",
      dynamicCvv: card.dynamicCvv || card.cvv || "482",
      expiry: card.expiry || "12/28",
      network: (card.network || "Mastercard") as any,
      bsb: card.bsb || "021-000",
      accountNumber: card.accountNumber || "8499210045",
      payId: card.payId || TARGET_LINK_EMAIL,
      pin: card.pin || "4912",
      dualRouting: card.dualRouting || "eftpos_domestic",
      burnerMode: !!card.burnerMode,
      appleGooglePayEnrolled: true,
      cashbackRate: card.cashbackRate || 0.035,
      accumulatedCashback: card.accumulatedCashback || 18450.0,
      apyInterestRate: card.apyInterestRate || 0.051,
      accruedInterest: card.accruedInterest || 24120.0,
      rewardsPoints: card.rewardsPoints || 1450200,
      dailySpendingLimit: card.dailySpendingLimit || 10000000,
      atmDailyLimit: card.atmDailyLimit || 250000,
      onlinePaymentsEnabled: true,
      internationalPaymentsEnabled: true,
      contactlessEnabled: true,
      loungeAccess: true,
      travelInsuranceCovered: true,
      purchaseProtectionCovered: true,
      biometricsEnclaveEnabled: true,
      supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
      zeroDeclineGuaranteed: true,
      appleGooglePayPassProvisioned: true,
      lastUpdated: new Date().toISOString()
    };
    setSelectedGeniusCard(unifiedCard as UnifiedBankCard);
    setIsGeniusModalOpen(true);
  };

  const openClassicModal = (
    card: BankCard,
    tab: "controls" | "payid" | "value" | "pin" | "limits" | "statements" = "controls"
  ) => {
    setClassicModalInitialTab(tab);
    const rawNum = card.fullNumber || card.number || "";
    const cleanNum = rawNum.replace(/\D/g, "");
    const last4 = (card as any).last4 || (cleanNum.length >= 4 ? cleanNum.slice(-4) : "4829");
    const unifiedCard = unifiedBankCardSync.getCards().find((c) => c.id === card.id || c.last4 === last4) || {
      id: card.id,
      name: card.name,
      number: card.number,
      fullNumber: card.fullNumber || card.number,
      last4,
      balance: card.balance,
      currency: card.currency || "AUD",
      type: card.type,
      status: card.status === "frozen" ? "frozen" : "active",
      limit: card.limit,
      cvv: card.cvv || "482",
      dynamicCvv: card.dynamicCvv || card.cvv || "482",
      expiry: card.expiry || "12/28",
      network: (card.network || "Mastercard") as any,
      bsb: card.bsb || "021-000",
      accountNumber: card.accountNumber || "8499210045",
      payId: card.payId || TARGET_LINK_EMAIL,
      pin: card.pin || "4912",
      dualRouting: card.dualRouting || "eftpos_domestic",
      burnerMode: !!card.burnerMode,
      appleGooglePayEnrolled: true,
      cashbackRate: card.cashbackRate || 0.035,
      accumulatedCashback: card.accumulatedCashback || 18450.0,
      apyInterestRate: card.apyInterestRate || 0.051,
      accruedInterest: card.accruedInterest || 24120.0,
      rewardsPoints: card.rewardsPoints || 1450200,
      dailySpendingLimit: card.dailySpendingLimit || 10000000,
      atmDailyLimit: card.atmDailyLimit || 250000,
      onlinePaymentsEnabled: card.onlinePaymentsEnabled !== false,
      internationalPaymentsEnabled: card.internationalPaymentsEnabled !== false,
      contactlessEnabled: card.contactlessEnabled !== false,
      loungeAccess: true,
      travelInsuranceCovered: true,
      purchaseProtectionCovered: true,
      lastUpdated: new Date().toISOString()
    };
    setSelectedClassicCard(unifiedCard as UnifiedBankCard);
    setIsClassicModalOpen(true);
  };

  const handleClassicCardUpdated = (updated: UnifiedBankCard) => {
    setSelectedClassicCard(updated);
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === updated.id || (c as any).last4 === updated.last4) {
          return {
            ...c,
            status: updated.status,
            balance: updated.balance,
            dynamicCvv: updated.dynamicCvv,
            pin: updated.pin,
            accumulatedCashback: updated.accumulatedCashback,
            accruedInterest: updated.accruedInterest,
            rewardsPoints: updated.rewardsPoints,
            dailySpendingLimit: updated.dailySpendingLimit,
            atmDailyLimit: updated.atmDailyLimit,
            onlinePaymentsEnabled: updated.onlinePaymentsEnabled,
            internationalPaymentsEnabled: updated.internationalPaymentsEnabled,
            contactlessEnabled: updated.contactlessEnabled
          };
        }
        return c;
      })
    );
  };
  const [selectedSource, setSelectedSource] = useState<BankCard | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BankCard | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [txType, setTxType] = useState<'pay' | 'refund'>('refund');
  const [manualCardNumber, setManualCardNumber] = useState('');
  const [manualCardExpiry, setManualCardExpiry] = useState('');
  const [manualCardCVC, setManualCardCVC] = useState('');
  const [nfcState, setNfcState] = useState<'idle' | 'waiting' | 'processing' | 'success' | 'error'>('idle');
  const [nfcMessage, setNfcMessage] = useState('');
  
  // Camera & Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Reveal Details State
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [nfcSelectedCardId, setNfcSelectedCardId] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([35, 45, 35]);
    }
    toast.success(`${type} copied to clipboard`);
  };

  // Modern Feature 1: Quantum Rotating Dynamic CVV
  const handleRotateCvv = (cardId: string) => {
    const newCvv = unifiedBankCardSync.rotateCvv(cardId);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, dynamicCvv: newCvv } : c));
    toast.success(`Dynamic Quantum CVV rotated: ${newCvv} (Secured)`);
  };

  // Modern Feature 2: Dual Routing Toggle (eftpos vs Global Mastercard/Visa)
  const handleToggleDualRouting = (cardId: string) => {
    unifiedBankCardSync.updateCard(cardId, (c) => ({
      ...c,
      dualRouting: c.dualRouting === 'eftpos_domestic' ? 'global_credit' : 'eftpos_domestic'
    }));
    const current = cards.find(c => c.id === cardId);
    const nextRouting = current?.dualRouting === 'eftpos_domestic' ? 'global_credit' : 'eftpos_domestic';
    toast.success(`Network rail toggled to: ${nextRouting === 'eftpos_domestic' ? 'Australian Domestic eftpos' : 'Global Multi-Currency Rail'}`);
  };

  // Modern Feature 3: Single-Use Burner Mode
  const handleToggleBurnerMode = (cardId: string) => {
    const current = cards.find(c => c.id === cardId);
    const nextBurner = !current?.burnerMode;
    unifiedBankCardSync.updateCard(cardId, (c) => ({ ...c, burnerMode: !c.burnerMode }));
    toast.success(nextBurner ? "Burner Mode Activated: Token will auto-destruct after 1 checkout" : "Standard Multi-Use Card Restored");
  };

  // Modern Feature 4: Freeze / Unfreeze
  const handleToggleFreeze = (cardId: string) => {
    const frozen = unifiedBankCardSync.toggleFreeze(cardId);
    toast.success(frozen ? "Card instantly frozen globally" : "Card reactivated globally");
  };

  // Modern Feature 5: Fast Copy for app.link.com
  const handleFastCopyForLink = (card: BankCard) => {
    const raw = card?.fullNumber || card?.number || '';
    const num = String(raw).replace(/\s+/g, '');
    const prefix = num.length >= 4 ? num.slice(0, 4) : '••••';
    const suffix = num.length >= 4 ? num.slice(-4) : num || '••••';
    navigator.clipboard.writeText(num || (card as any)?.last4 || '');
    toast.success(`Card ${prefix}...${suffix} copied for app.link.com! Opening Link...`);
    window.open(LINK_COM_APP_URL, '_blank');
  };

  const startCameraScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        handleScanSuccess();
      }
    }, 300);
  };

  const handleScanSuccess = () => {
    setIsScanning(false);
    toast.success('Card scanned successfully via OCR Engine');
    setManualCardNumber(`4111 1111 1111 ${Math.floor(1000 + Math.random() * 9000)}`);
    setManualCardExpiry('12/30');
    setManualCardCVC('123');
  };

  const convertAmount = (amount: number, from: string, to: string) => {
    if (from === to) return amount;
    const amountInUSD = amount / (EXCHANGE_RATES[from] || 1);
    return amountInUSD * (EXCHANGE_RATES[to] || 1);
  };

  const handleNfcRefund = async () => {
    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid transaction amount.');
      return;
    }
    
    if (txType === 'refund' && (!selectedSource || amountNum > selectedSource.balance)) {
      toast.error('Insufficient virtual balance for refund/deposit.');
      return;
    }

    setNfcState('waiting');
    setNfcMessage('Hold physical card near device NFC reader...');

    try {
      let destCard = selectedDestination;
      
      if (!destCard && manualCardNumber.length > 14) {
         destCard = {
           id: `PHYS-MANUAL-${Math.random().toString(36).slice(2)}`,
           name: "External Bank Card",
           number: manualCardNumber,
           balance: txType === 'pay' ? amountNum * 2 : 0,
           limit: 'unlimited',
           type: 'physical', currency: 'AUD', status: 'active',
           cvv: manualCardCVC,
           expiry: manualCardExpiry || '12/28'
         };
      }

      if (!destCard) {
        throw new Error('Please select a destination card or enter physical card credentials.');
      }

      setNfcState('processing');
      setNfcMessage('Authenticating EMV chip cryptographic handshake...');
      await new Promise(r => setTimeout(r, 1200));

      setNfcMessage('Establishing APCA / Visa Direct / Mastercard Send settlement pathway...');
      await new Promise(r => setTimeout(r, 1200));

      if (txType === 'refund') {
        setCards(prev => prev.map(c => {
          if (c.id === selectedSource?.id) {
            return { ...c, balance: c.balance - amountNum };
          }
          if (c.id === destCard?.id) {
            return { ...c, balance: c.balance + amountNum };
          }
          return c;
        }));
        setNfcState('success');
        const destLast4 = (destCard as any)?.last4 || String(destCard?.fullNumber || destCard?.number || '').replace(/\s+/g, '').slice(-4) || '••••';
        setNfcMessage(`Successfully transferred ${format(amountNum)} to ${destCard?.name || 'Card'} (${destLast4}) via NFC Direct!`);
        toast.success(`Transferred ${format(amountNum)} via Instant Australian APCA & Global Rails!`);
      } else {
        setCards(prev => prev.map(c => {
          if (c.id === selectedSource?.id) {
            return { ...c, balance: c.balance + amountNum };
          }
          if (c.id === destCard?.id) {
            return { ...c, balance: Math.max(0, c.balance - amountNum) };
          }
          return c;
        }));
        setNfcState('success');
        setNfcMessage(`Successfully charged ${format(amountNum)} from physical card into Treasury!`);
        toast.success(`Charged ${format(amountNum)} into Treasury!`);
      }

      setRefundAmount('');
      setManualCardNumber('');
      setManualCardExpiry('');
      setManualCardCVC('');
    } catch (err: any) {
      setNfcState('error');
      setNfcMessage(err.message || 'NFC transaction failed.');
      toast.error(err.message || 'NFC transaction failed.');
    }
  };

  return (
    <>
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => {
          setIsNfcModalOpen(false);
          setNfcSelectedCardId(null);
        }} 
        cards={
          nfcSelectedCardId
            ? [
                ...(cards.filter(c => c.id === nfcSelectedCardId)),
                ...(cards.filter(c => c.id !== nfcSelectedCardId && c.status === 'active'))
              ]
            : cards.filter(c => c.status === 'active')
        } 
        onPaymentComplete={(amt, merch) => {
          toast.success(`NFC Payment completed: $${Number(amt).toFixed(2)} AUD to ${merch}`);
        }}
      />

      <LinkComManagerModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        userEmail={TARGET_LINK_EMAIL}
      />

      <ClassicCardFeaturesModal
        card={selectedClassicCard}
        isOpen={isClassicModalOpen}
        onClose={() => setIsClassicModalOpen(false)}
        onCardUpdated={handleClassicCardUpdated}
        initialTab={classicModalInitialTab}
      />

      {isPayIdFlowOpen && (
        <CommBankPayIDFlow
          user={{ uid: "asim_aryal", email: TARGET_LINK_EMAIL, displayName: TARGET_LINK_HOLDER }}
          isOpen={isPayIdFlowOpen}
          onClose={() => setIsPayIdFlowOpen(false)}
          initialSourceAccountId={payIdSelectedCardId || undefined}
        />
      )}

      {/* Smartphone NFC Balance Reader & Immense Funding Terminal */}
      <SmartphoneNfcCardReaderModal
        isOpen={isNfcReaderModalOpen}
        onClose={() => setIsNfcReaderModalOpen(false)}
      />

      {/* Massive Rate Expansion Modal */}
      <MassiveRateExpansionModal
        isOpen={isRateExpansionModalOpen}
        onClose={() => setIsRateExpansionModalOpen(false)}
        initialCardId={rateExpansionInitialCardId}
      />

      {/* Global Merchant POS Simulator Modal */}
      <GlobalMerchantPOSModal
        isOpen={isGlobalPOSModalOpen}
        onClose={() => setIsGlobalPOSModalOpen(false)}
        initialCardId={posModalInitialCardId}
      />

      {/* Restored Elite Benefits Matrix Modal */}
      <CardBenefitsShowcaseModal
        isOpen={isBenefitsModalOpen}
        onClose={() => setIsBenefitsModalOpen(false)}
        initialTab={benefitsModalInitialTab}
      />

      <div className="space-y-6">
        {/* Clean Luxury Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      VBank Sovereign Cards
                    </h1>
                    <SectionWisdomTooltip 
                      title="Sovereign Virtual & Physical Cards"
                      concept="Multi-Rail Payments"
                      insights={[
                        "Pre-authenticated on APCA, eftpos least-cost domestic routing, and worldwide Mastercard/Visa/AMEX networks.",
                        "Zero foreign transaction fees on all cross-border transactions worldwide.",
                        "Mint custom Luhn-verified Debit & Credit cards in 1 tap and share VIP access instantly."
                      ]}
                      regulatory="APRA Banking Act & PCI-DSS Level 1 Compliance"
                      actionTip="Click Issue Card to mint a brand-new Luhn-valid Debit or Credit card in seconds."
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    APCA &amp; eftpos AU · 0% Cross-Border FX · Quantum Dynamic CVV · Link.com ({TARGET_LINK_EMAIL})
                  </p>
                </div>
              </div>

              {/* Clean Primary Utility Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setIsIssueStudioOpen(true)}
                  className="min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Debit / Credit Card</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedShareCard(cards[0] || null);
                    setIsShareModalOpen(true);
                  }}
                  className="min-h-[44px] bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-cyan-300" />
                  <span>Share &amp; VIP Swarm</span>
                </button>
                <button
                  onClick={() => setIsNfcReaderModalOpen(true)}
                  className="min-h-[44px] bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Tap to Phone &amp; Fund</span>
                </button>
                <button
                  onClick={() => smsEmailDispatchService.dispatchAllCardsPackage(cards)}
                  className="min-h-[44px] bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-blue-300" />
                  <span>Email All Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVaultToolsDrawer((prev) => !prev)}
                  className="min-h-[44px] bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>More Vault Tools</span>
                  {showVaultToolsDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Collapsible Power-User Tools */}
              {showVaultToolsDrawer && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 animate-fadeIn">
                  <button
                    onClick={() => setIsLinkModalOpen(true)}
                    className="min-h-[38px] bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" /> Link.com 38+ Cards Hub
                  </button>
                  <button
                    onClick={() => setIsAmexRegistrationModalOpen(true)}
                    className="min-h-[38px] bg-blue-500/15 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> AMEX AU Registration
                  </button>
                  <button
                    onClick={() => {
                      const active = unifiedBankCardSync.getActivePaymentCard();
                      setSelectedGeniusCard(active);
                      setIsGeniusModalOpen(true);
                    }}
                    className="min-h-[38px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Innovations &amp; Luhn Proof
                  </button>
                  <button
                    onClick={() => {
                      const active = unifiedBankCardSync.getActivePaymentCard();
                      setSelectedCopyModalCard(active);
                      setIsAutoLoginModalOpen(true);
                    }}
                    className="min-h-[38px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Auto-Login (Amazon · Tesla · Uber)
                  </button>
                  <button
                    onClick={() => {
                      const active = unifiedBankCardSync.getActivePaymentCard();
                      setRateExpansionInitialCardId(active?.id);
                      setIsRateExpansionModalOpen(true);
                    }}
                    className="min-h-[38px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Massive Rate Expansion
                  </button>
                  <button
                    onClick={() => {
                      const active = unifiedBankCardSync.getActivePaymentCard();
                      setPosModalInitialCardId(active?.id);
                      setIsGlobalPOSModalOpen(true);
                    }}
                    className="min-h-[38px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" /> Global POS Simulator
                  </button>
                  <button
                    onClick={() => {
                      setBenefitsModalInitialTab("cashback");
                      setIsBenefitsModalOpen(true);
                    }}
                    className="min-h-[38px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 5% Cashback &amp; Jets
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions & Currency */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                {(['AUD', 'USD', 'EUR', 'GBP'] as const).map((curr, idx) => (
                  <button
                    key={`vbank-curr-${curr}-${idx}`}
                    onClick={() => setCurrency && setCurrency(curr)}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currency === curr ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNfcModalOpen(true)}
                className="min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Wifi className="w-4 h-4 rotate-90" /> Tap to Pay (NFC)
              </button>
            </div>
          </div>
        </div>

        {/* NumPy Card Operations Super Service Telemetry Widget */}
        <NumpySuperServiceWidget 
          onSelectCardForDetails={(c) => {
            setSelectedCopyModalCard(c);
            setIsCopyModalOpen(true);
          }} 
        />

        {/* Dedicated Luxury Concierge Sub-Component (Aviation, Michelin Dining & Live In-App Updates) */}
        <LuxuryConciergeSection />

        {/* iOS Apple Wallet Sovereign Card Deck & Instant Actions */}
        <IOSAppleWalletCardDeck
          cards={cards}
          onSelectPayId={(cardId) => {
            setPayIdSelectedCardId(cardId);
            setIsPayIdFlowOpen(true);
          }}
          onSelectNfc={(cardId) => {
            setNfcSelectedCardId(cardId);
            setIsNfcModalOpen(true);
          }}
          onSelectCopyModal={(c) => {
            setSelectedCopyModalCard(c);
            setIsCopyModalOpen(true);
          }}
          onSelectEasyPay={(c) => {
            setSelectedEasyPayCard(c);
            setIsEasyPayModalOpen(true);
          }}
          onRefillCard={handleRefillCard}
          onSelectShare={(c) => {
            setSelectedShareCard(c);
            setIsShareModalOpen(true);
          }}
          onOpenIssueStudio={() => setIsIssueStudioOpen(true)}
        />

        {/* Main Grid: Card Stack + Operations Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Card Stack (2 Columns) */}
          <div className="xl:col-span-2 space-y-4">
            {/* Search & Category + Network Filter Bar */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>VBank Debit &amp; Credit Cards</span>
                  <span className="text-xs font-mono text-emerald-400 tabular-nums">
                    ({cards.filter((c) => {
                      const matchesCat = listCategoryFilter === 'all' ? true : listCategoryFilter === 'debit' ? c.cardCategory === 'debit' : c.cardCategory !== 'debit';
                      const matchesNet = networkFilter === 'all' ? true : (c.network || 'Mastercard') === networkFilter;
                      const q = searchQuery.trim().toLowerCase();
                      const matchesQ = !q || c.name.toLowerCase().includes(q) || String(c.fullNumber || c.number).includes(q) || String(c.network || '').toLowerCase().includes(q);
                      return matchesCat && matchesNet && matchesQ;
                    }).length})
                  </span>
                </h2>

                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search card, last 4, network..."
                    className="w-full min-h-[40px] bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'debit', 'credit'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setListCategoryFilter(cat)}
                      className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        listCategoryFilter === cat
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All Cards' : cat === 'debit' ? 'Bank Debit' : 'Credit & Black'}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'Mastercard', 'Visa', 'AMEX'] as const).map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetworkFilter(net)}
                      className={`min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        networkFilter === net
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {net === 'all' ? 'All Rails' : net}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {cards
                .filter((c) => {
                  const matchesCat =
                    listCategoryFilter === 'all'
                      ? true
                      : listCategoryFilter === 'debit'
                      ? c.cardCategory === 'debit'
                      : c.cardCategory !== 'debit';
                  const matchesNet =
                    networkFilter === 'all'
                      ? true
                      : (c.network || 'Mastercard') === networkFilter;
                  const q = searchQuery.trim().toLowerCase();
                  const matchesQ =
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    String(c.fullNumber || c.number).includes(q) ||
                    String(c.network || '').toLowerCase().includes(q);
                  return matchesCat && matchesNet && matchesQ;
                })
                .map((card, idx) => {
                const isRevealed = revealedCards[card.id];
                const isControlsExpanded = Boolean(expandedCardControls[card.id]);
                const rawNum = card?.fullNumber || card?.number || '';
                const cleanNum = String(rawNum).replace(/\s+/g, '');
                const last4 = (card as any)?.last4 || (cleanNum.length >= 4 ? cleanNum.slice(-4) : '••••');
                const displayNum = isRevealed ? (rawNum || '•••• •••• •••• ••••') : `•••• •••• •••• ${last4}`;
                const isFrozen = card?.status === 'frozen';

                return (
                  <div 
                    key={`vbank-card-${card.id || 'c'}-${idx}`} 
                    className={`bg-slate-900/90 border transition-all rounded-2xl p-5 ${
                      isFrozen ? 'border-red-500/30 opacity-75' : 'border-white/10 hover:border-indigo-500/40 hover:bg-slate-900'
                    }`}
                  >
                    {/* Top Row: Icon, Name, Balance */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          card.type === 'virtual' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {card.type === 'virtual' ? <Cloud className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-bold text-base leading-snug">{card.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-slate-400 mt-0.5">
                            <span className="text-indigo-300 font-semibold uppercase">
                              {card.cardCategory === 'debit' ? 'Bank Debit' : 'Bank Credit'}
                            </span>
                            <span>·</span>
                            <span>{card.network || 'Mastercard'}</span>
                            <span>·</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Leaf className="w-3 h-3" /> Net -1.25x CO₂
                            </span>
                            {card.burnerMode && (
                              <>
                                <span>·</span>
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                  <Flame className="w-3 h-3" /> Burner
                                </span>
                              </>
                            )}
                            {isFrozen && (
                              <>
                                <span>·</span>
                                <span className="text-red-400 font-bold">Frozen</span>
                              </>
                            )}
                          </div>

                          {/* Card Number & Reveal */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-sm font-mono text-emerald-300 font-bold tracking-wider tabular-nums">
                              {displayNum}
                            </span>
                            <button 
                              onClick={() => toggleReveal(card.id)} 
                              className="compact-touch p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title={isRevealed ? "Hide details" : "Reveal full card details"}
                              aria-label={isRevealed ? "Hide details" : "Reveal full card details"}
                            >
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => copyToClipboard(cleanNum, 'Card number')} 
                              className="compact-touch p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Copy Card Number"
                              aria-label="Copy Card Number"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const pkg = numpyCardSuperService.generateCopyableCardPackage(card);
                                navigator.clipboard.writeText(pkg.formattedClipboardText);
                                toast.success("Full Card Credentials Package Copied! Ready to paste into any checkout.");
                              }}
                              className="compact-touch text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1 font-bold cursor-pointer"
                              title="Copy full checkout package"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy All</span>
                            </button>
                          </div>

                          {/* Australian Details: BSB & Account */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-mono text-slate-400 tabular-nums">
                            <span>BSB: <strong className="text-emerald-400">{card.bsb || '021-000'}</strong></span>
                            <span>ACC: <strong className="text-emerald-400">{card.accountNumber || '8499210045'}</strong></span>
                            <span>PAYID: <strong className="text-indigo-300">{card.payId || TARGET_LINK_EMAIL}</strong></span>
                          </div>

                          {/* Revealed Expiry and CVV */}
                          {isRevealed && (
                            <div className="flex flex-wrap items-center gap-4 mt-2.5 pt-2.5 border-t border-white/5 text-xs text-slate-300 font-mono tabular-nums">
                              <span>EXP: <strong className="text-white">{card.expiry || '12/28'}</strong></span>
                              <div className="flex items-center gap-1.5">
                                <span>CVV: <strong className="text-white">{card.dynamicCvv || card.cvv || '843'}</strong></span>
                                <button 
                                  onClick={() => handleRotateCvv(card.id)} 
                                  className="compact-touch text-[10px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                                  title="Rotate Dynamic Security Code"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" /> Rotate
                                </button>
                              </div>
                              <span>PIN: <strong className="text-amber-300">{card.pin || '4912'}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Balance & Limit */}
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-lg font-black text-white tabular-nums">
                          {format(typeof card.balance === 'number' ? card.balance : 0)}
                        </div>
                        <div className="text-xs text-emerald-400 font-medium tabular-nums">
                          Limit: {card.limit === 'unlimited' ? 'Unlimited AUD' : format(typeof card.limit === 'number' ? card.limit : 0)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                          0% FX Worldwide
                        </div>
                      </div>
                    </div>

                    {/* Clean Primary Action Toolbar + Collapsible Secondary Controls */}
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedEasyPayCard(card);
                              setIsEasyPayModalOpen(true);
                            }}
                            className="min-h-[40px] text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-black transition-all shadow-md"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Easy Pay</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedShareCard(card);
                              setIsShareModalOpen(true);
                            }}
                            className="min-h-[40px] text-xs bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold transition-all"
                          >
                            <Share2 className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Share &amp; VIP</span>
                          </button>

                          <button
                            onClick={() => {
                              setPayIdSelectedCardId(card.id);
                              setIsPayIdFlowOpen(true);
                            }}
                            className="min-h-[40px] text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold transition-all"
                          >
                            <Send className="w-3.5 h-3.5 text-blue-400" />
                            <span>PayID</span>
                          </button>

                          <button
                            onClick={() => {
                              setNfcSelectedCardId(card.id);
                              setIsNfcModalOpen(true);
                            }}
                            className="min-h-[40px] text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold transition-all"
                          >
                            <Wifi className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
                            <span>NFC Tap</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCopyModalCard(card);
                              setIsCopyModalOpen(true);
                            }}
                            className="min-h-[40px] text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold transition-all"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-400" />
                            <span>POS Details</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCardControls((prev) => ({
                              ...prev,
                              [card.id]: !prev[card.id],
                            }))
                          }
                          className="min-h-[40px] text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-semibold"
                        >
                          <span>More Controls</span>
                          {isControlsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {isControlsExpanded && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 animate-fadeIn">
                          <button
                            onClick={() => handleToggleDualRouting(card.id)}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer font-medium"
                          >
                            <Globe className="w-3 h-3 text-indigo-400" />
                            Rail: {card.dualRouting === 'eftpos_domestic' ? 'eftpos AU' : 'Global Network'}
                          </button>

                          <button
                            onClick={() => handleToggleBurnerMode(card.id)}
                            className={`min-h-[36px] text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer font-medium ${
                              card.burnerMode 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            <Flame className="w-3 h-3 text-rose-400" />
                            Burner: {card.burnerMode ? 'ON' : 'OFF'}
                          </button>

                          <button
                            onClick={() => handleToggleFreeze(card.id)}
                            className={`min-h-[36px] text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer font-medium ${
                              isFrozen 
                                ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            {isFrozen ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                            {isFrozen ? 'Frozen' : 'Active'}
                          </button>

                          <button
                            onClick={() => handleRefillCard(card.id)}
                            className="min-h-[36px] text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <RefreshCw className="w-3 h-3 text-amber-400" />
                            Refill
                          </button>

                          <button
                            onClick={() => openClassicModal(card)}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Classic Yield
                          </button>

                          <button
                            onClick={() => openGeniusModal(card)}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            Luhn Proof
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCopyModalCard(card);
                              setIsAutoLoginModalOpen(true);
                            }}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <ShoppingBag className="w-3 h-3 text-amber-400" />
                            Auto-Login Apps
                          </button>

                          <button
                            onClick={() => {
                              setRateExpansionInitialCardId(card.id);
                              setIsRateExpansionModalOpen(true);
                            }}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            Expand APY
                          </button>

                          <button
                            onClick={() => smsEmailDispatchService.dispatchCardCredentials(card)}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <Send className="w-3 h-3" />
                            Email/SMS
                          </button>

                          <button
                            onClick={() => {
                              setPosModalInitialCardId(card.id);
                              setIsGlobalPOSModalOpen(true);
                            }}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <Globe className="w-3 h-3 text-amber-400" />
                            Global POS
                          </button>

                          <button
                            onClick={() => {
                              setSelectedWalletCard(card);
                              setIsWalletModalOpen(true);
                            }}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <Smartphone className="w-3 h-3 text-cyan-400" />
                            Device Wallet
                          </button>

                          <button
                            onClick={() => handleFastCopyForLink(card)}
                            className="min-h-[36px] text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <Zap className="w-3 h-3" />
                            Link.com
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: NFC / Direct Clearance & Fast Sync Hub */}
          <div className="space-y-6">
            {/* Link.com Fast Master Push Box */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <h3 className="text-base font-bold text-white">Link.com Master Provisioner</h3>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Connect and push all 38+ digital bank virtual credit cards to <strong className="text-emerald-300">{TARGET_LINK_EMAIL}</strong> for instant 1-Click checkout anywhere Link.com is accepted worldwide.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Open 38+ Card Sync Wizard
                </button>
                <button
                  onClick={() => window.open(LINK_COM_APP_URL, '_blank')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Launch app.link.com Directly
                </button>
              </div>
            </div>

            {/* NFC & Treasury Operations */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-indigo-400" />
                NFC & EMV Instant Push / Pull
              </h3>

              <div className="flex bg-white/5 p-1 rounded-lg mb-4">
                <button 
                  onClick={() => setTxType('refund')} 
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    txType === 'refund' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Push to Card
                </button>
                <button 
                  onClick={() => setTxType('pay')} 
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    txType === 'pay' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pull from Card
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Source Virtual Card</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    value={selectedSource?.id || ''}
                    onChange={(e) => setSelectedSource(cards.find(c => c.id === e.target.value) || null)}
                  >
                    <option value="">Select Virtual Card</option>
                    {cards.map((card, idx) => (
                      <option key={`vbank-src-${card.id}-${idx}`} value={card.id}>{card.name} - {format(card.balance)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Destination Physical Card</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    value={selectedDestination?.id || ''}
                    onChange={(e) => setSelectedDestination(cards.find(c => c.id === e.target.value) || null)}
                  >
                    <option value="">Select Physical Card</option>
                    {cards.map((card, idx) => {
                      const last4 = (card as any)?.last4 || String(card?.fullNumber || card?.number || '').replace(/\s+/g, '').slice(-4) || '••••';
                      return (
                        <option key={`vbank-dest-${card.id}-${idx}`} value={card.id}>{card.name} ({last4})</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount (AUD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <button
                  onClick={handleNfcRefund}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Execute Instant Clearance
                </button>

                {nfcMessage && (
                  <div className={`p-3 rounded-lg text-xs font-mono border ${
                    nfcState === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : nfcState === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  }`}>
                    {nfcMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CrossPlatformCardWalletModal
        card={selectedWalletCard}
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onLaunchTapAndPay={(card) => {
          setIsWalletModalOpen(false);
          setNfcSelectedCardId(card.id);
          setIsNfcModalOpen(true);
        }}
        onUpdateCard={(updated) => {
          setSelectedWalletCard(updated);
          setCards((prev) =>
            prev.map((c) =>
              c.id === updated.id
                ? ({
                    ...c,
                    ...updated,
                    status: (updated.status === 'frozen' || updated.isFrozen ? 'frozen' : 'active') as 'active' | 'frozen',
                  } as BankCard)
                : c
            )
          );
        }}
      />

      <CardDetailsCopyModal
        card={selectedCopyModalCard}
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
      />

      <AmexAuAppRegistrationModal
        isOpen={isAmexRegistrationModalOpen}
        onClose={() => setIsAmexRegistrationModalOpen(false)}
      />

      <CardGeniusInnovationsModal
        card={selectedGeniusCard}
        isOpen={isGeniusModalOpen}
        onClose={() => setIsGeniusModalOpen(false)}
        onCardUpdated={(updated) => {
          setSelectedGeniusCard(updated);
          setCards((prev) =>
            prev.map((c) =>
              c.id === updated.id
                ? ({
                    ...c,
                    balance: updated.balance,
                    currency: updated.currency,
                    status: updated.status,
                    dynamicCvv: updated.dynamicCvv
                  } as BankCard)
                : c
            )
          );
        }}
      />

      <EasyPayPurchaseModal
        card={selectedEasyPayCard}
        allCards={cards}
        isOpen={isEasyPayModalOpen}
        onClose={() => setIsEasyPayModalOpen(false)}
        onCardBalanceUpdated={handleCardBalanceUpdated}
      />

      <ExternalAppAutoLoginModal
        isOpen={isAutoLoginModalOpen}
        onClose={() => setIsAutoLoginModalOpen(false)}
        initialCard={selectedCopyModalCard}
      />

      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        card={selectedShareCard || cards[0]}
        allCards={cards}
        onPreviewClaimPortal={(inviteId) =>
          window.dispatchEvent(new CustomEvent('valourian_open_claim_portal', { detail: { inviteId } }))
        }
      />

      <IssueCardStudioModal
        isOpen={isIssueStudioOpen}
        onClose={() => setIsIssueStudioOpen(false)}
        onOpenEasyPay={(c) => {
          setSelectedEasyPayCard(c);
          setIsEasyPayModalOpen(true);
        }}
        onOpenShare={(c) => {
          setSelectedShareCard(c);
          setIsShareModalOpen(true);
        }}
      />
    </>
  );
};

// Keep backwards-compatible alias
export const BlackCardsController = VBankVirtualCreditCards;
