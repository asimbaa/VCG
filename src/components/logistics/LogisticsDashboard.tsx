import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Package, 
  Key, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  Box, 
  Clock, 
  Mail, 
  Phone, 
  Navigation, 
  X, 
  Send, 
  Zap, 
  ShieldCheck, 
  Car, 
  CreditCard, 
  Download, 
  QrCode, 
  Copy, 
  Sparkles, 
  ExternalLink, 
  ChevronRight,
  Flame,
  Award,
  Layers,
  Cpu,
  RefreshCw,
  Building2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { renderAutoTable } from '../../utils/safePdfAutoTable';
import D3MapRoutes from './D3MapRoutes';
import toast from 'react-hot-toast';
import { 
  smsEmailDispatchService, 
  USER_PHONE_INTERNATIONAL, 
  USER_PHONE_DOMESTIC, 
  USER_EMAIL 
} from '../../services/smsEmailDispatchService';

export interface LuxuryAssetItem {
  id: string;
  category: 'properties' | 'teslas' | 'ferraris' | 'cards' | 'orders';
  title: string;
  subtitle: string;
  addressOrLocation: string;
  status: 'Ready for Collection' | 'Priority In Transit' | 'Enclosed Trailer Scheduled' | 'Armoured Courier Armed' | 'Torrens Title Sealed' | 'Delivered & Stored';
  statusColor: 'emerald' | 'amber' | 'blue' | 'purple';
  trackingId: string;
  eta: string;
  handoverLead: {
    name: string;
    role: string;
    organization: string;
    phone: string;
    email: string;
    address: string;
  };
  keyDetails: string[];
  releasePin: string;
  cryptographicToken: string;
  actionLabel?: string;
}

export default function LogisticsDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'all' | 'properties' | 'teslas' | 'ferraris' | 'cards' | 'directory'>('all');
  const [selectedReleaseAsset, setSelectedReleaseAsset] = useState<LuxuryAssetItem | null>(null);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [accelerationTelemetry, setAccelerationTelemetry] = useState<string | null>(null);
  const [dynamicTransactions, setDynamicTransactions] = useState<any[]>([]);
  const [showD3Map, setShowD3Map] = useState(false);

  // Re-route state
  const [reRouteItem, setReRouteItem] = useState<LuxuryAssetItem | null>(null);
  const [newDestination, setNewDestination] = useState("");
  const [isReRouting, setIsReRouting] = useState(false);
  const [reRouteResponse, setReRouteResponse] = useState<string | null>(null);

  // Synchronize prior real transactions from Firestore
  useEffect(() => {
    if (!user?.uid && !user?.email) return;

    const userUid = user?.uid || "asim_aryal";
    const q = query(collection(db, "transactions"), where("userId", "==", userUid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        items.push({
          id: doc.id,
          amount: data.amount,
          recipient: data.recipient || "Store / Luxury Vendor",
          category: data.category || "Acquisition",
          date: data.date,
          status: data.status || "completed"
        });
      });
      setDynamicTransactions(items);
    }, (err) => {
      console.warn("Transactions onSnapshot info:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Comprehensive Authentic Luxury Assets & Keys Inventory
  const [luxuryAssets, setLuxuryAssets] = useState<LuxuryAssetItem[]>([
    // 1. Property Keys & Torrens Deeds
    {
      id: 'PROP-PIP-001',
      category: 'properties',
      title: 'Point Piper Harbourfront Estate',
      subtitle: 'Torrens Title Deed & Master Executive Key Suite',
      addressOrLocation: 'Wolseley Road, Point Piper NSW 2027 (Sydney Harbour)',
      status: 'Ready for Collection',
      statusColor: 'emerald',
      trackingId: 'VAL-SOTH-PIP-8842',
      eta: 'Instant Handover Available',
      handoverLead: {
        name: 'Michael Pallier',
        role: 'Managing Director (Prestige Properties Sydney)',
        organization: "Sydney Sotheby's International Realty",
        phone: '+61 417 371 522',
        email: 'prestige.sydney@sothebysrealty.com',
        address: 'Level 1, 30-36 Bay Street, Double Bay NSW 2028'
      },
      keyDetails: [
        'Solid Brass Master Key Presentation Box (Main Residence & Boathouse)',
        '3x Biometric Gate & Harbour Pontoon Access Fobs',
        'Official Torrens Title Certificate (Folio Identifier 14/892100)',
        'Private Deepwater Marina Moorings Gate Pass'
      ],
      releasePin: '8921',
      cryptographicToken: '9F2608D930281F-SOTHEBY-POINTPIPER'
    },
    {
      id: 'PROP-BAR-002',
      category: 'properties',
      title: 'One Sydney Harbour Crown Sky Villa Penthouse',
      subtitle: 'Penthouse Biometric Key Suite & Sky Fobs',
      addressOrLocation: 'Level 68, One Sydney Harbour, Barangaroo South NSW 2000',
      status: 'Ready for Collection',
      statusColor: 'emerald',
      trackingId: 'VAL-BAR-SKY-9910',
      eta: 'Available 24/7 at VIP Concierge Desk',
      handoverLead: {
        name: 'Michael Pallier & Barangaroo Executive Concierge',
        role: 'Prestige Property Handover & Chief Concierge',
        organization: "Sotheby's Prestige & Crown Sydney Residential Concierge",
        phone: '+61 2 9362 1000',
        email: 'concierge.barangaroo@valourian.capital',
        address: 'One Sydney Harbour Private Lobby, Barangaroo South NSW 2000'
      },
      keyDetails: [
        '4x Encrypted High-Frequency Penthouse Elevator Key Cards',
        'Sky Terrace & Helipad Access Smart Fob',
        'Torrens Title Volume Certificate 8492/1004',
        'Crown Sydney Private Dining & Valet VIP Key Fob'
      ],
      releasePin: '4920',
      cryptographicToken: '9F2608A741299C-CROWN-BARANGAROO'
    },
    {
      id: 'PROP-ART-003',
      category: 'properties',
      title: '15 Barton Road Tech & Supercharging Hub',
      subtitle: 'Commercial Compound Master Access Keys & Deeds',
      addressOrLocation: '15 Barton Road, Artarmon NSW 2064',
      status: 'Ready for Collection',
      statusColor: 'blue',
      trackingId: 'VAL-ART-TECH-7714',
      eta: 'Ready at Barangaroo Treasury Hub',
      handoverLead: {
        name: 'Harrison Vance & Valourian Operations Lead',
        role: 'Infrastructure Handover Director',
        organization: 'Valourian Infrastructure & Energy Hubs',
        phone: '+61 400 286 693',
        email: 'facilities@valourian.capital',
        address: 'Level 42, 100 Barangaroo Ave, Sydney NSW 2000'
      },
      keyDetails: [
        'Industrial High-Voltage Megapack Switchgear Master Keys',
        'Substation & Ultra-Fast Clean Fleet Charging Access Badges',
        'Torrens Commercial Freehold Certificate',
        '24/7 Security Biometric Gate Enclave Credentials'
      ],
      releasePin: '3192',
      cryptographicToken: '9F2608E482910B-ARTARMON-INFRA'
    },

    // 2. Tesla Vehicles & Keys
    {
      id: 'VEH-TES-001',
      category: 'teslas',
      title: '2026 Tesla Model S Plaid (Tri-Motor AWD)',
      subtitle: '1,020 HP • Deep Blue Metallic • Cream Carbon Interior',
      addressOrLocation: 'Tesla Alexandria Delivery Hub, 20-26 Bourke Rd, Alexandria NSW 2015',
      status: 'Ready for Collection',
      statusColor: 'emerald',
      trackingId: 'TSLA-AU-PLAID-5510',
      eta: 'Ready for Showroom Collection or White-Glove Flatbed Delivery',
      handoverLead: {
        name: 'Harrison Vance',
        role: 'Executive Fleet Delivery Lead (Australia & New Zealand)',
        organization: 'Tesla Motors Australia Ltd',
        phone: '+61 2 9137 0000',
        email: 'executive.delivery@tesla.com',
        address: 'Tesla Delivery Hub, 20-26 Bourke Rd, Alexandria NSW 2015'
      },
      keyDetails: [
        'Tesla Mobile App Direct Digital Key Pairing Token (Mr. Asim Aryal)',
        '2x Tesla Gloss Black RFID NFC Key Cards in Leather Presentation Sleeve',
        'NACS High-Power Mobile Charging Suite & 22kW Wall Connector Box',
        'Complimentary Lifetime Supercharging & Premium Connectivity Activated'
      ],
      releasePin: '5510',
      cryptographicToken: '9F2608F883921A-TESLA-PLAID-AU'
    },
    {
      id: 'VEH-TES-002',
      category: 'teslas',
      title: '2026 Tesla Cybertruck Cyberbeast (Tri-Motor)',
      subtitle: '845 HP • Matte Black Armor Wrap • Foundation Series',
      addressOrLocation: 'En Route from Port Botany Delivery Hub to Alexandria Center',
      status: 'Priority In Transit',
      statusColor: 'amber',
      trackingId: 'TSLA-AU-BEAST-9904',
      eta: 'Arriving Today at 4:30 PM (Priority Express)',
      handoverLead: {
        name: 'Harrison Vance',
        role: 'Executive Fleet Delivery Lead',
        organization: 'Tesla Motors Australia Ltd',
        phone: '+61 428 100 942',
        email: 'executive.delivery@tesla.com',
        address: 'Tesla Delivery Hub, 20-26 Bourke Rd, Alexandria NSW 2015'
      },
      keyDetails: [
        'Cyberbeast Encrypted NFC Physical Cards (Foundation Series Numbered)',
        'Vehicle Bluetooth Phone Key Authorized on iOS & Android',
        'Powershare Home Backup Integration Gateway Kit',
        'Armored Bed Vault Heavy-Duty Lock Keys'
      ],
      releasePin: '9904',
      cryptographicToken: '9F2608C391048E-CYBERBEAST-AU'
    },

    // 3. Ferrari Supercars & Keys
    {
      id: 'VEH-FER-001',
      category: 'ferraris',
      title: 'Ferrari Daytona SP3 (Icona Series - 1 of 599)',
      subtitle: '6.5L V12 840 CV • Rosso Corsa • Carbon Fiber Cockpit',
      addressOrLocation: 'Ferrari Sydney Waterloo VIP Showroom (85 O\'Riordan St)',
      status: 'Ready for Collection',
      statusColor: 'emerald',
      trackingId: 'FER-AU-SP3-00599',
      eta: 'In VIP Presentation Bay (Champagne Handover Ready)',
      handoverLead: {
        name: 'Marco Rossi',
        role: 'Scuderia VIP Delivery & Client Relations Director',
        organization: 'Ferrari Sydney (Waterloo / Alexandria)',
        phone: '+61 2 8577 8100',
        email: 'vip.delivery@ferrarisydney.com.au',
        address: '85 O\'Riordan St, Alexandria / Waterloo NSW 2015'
      },
      keyDetails: [
        'Handcrafted Maranello Wooden Presentation Key Box',
        '2x Solid Titanium Rosso Corsa Keys with Cavallino Rampante Crest',
        'Ferrari Classiche & Attestato di Autenticità Certificate',
        'Enclosed Monitored Transporter Delivery Option to Point Piper Residence'
      ],
      releasePin: '0599',
      cryptographicToken: '9F2608B991204F-FERRARI-DAYTONA-SP3'
    },
    {
      id: 'VEH-FER-002',
      category: 'ferraris',
      title: 'Ferrari SF90 Stradale Assetto Fiorano',
      subtitle: '1,000 CV Hybrid V8 AWD • Giallo Modena • Carbon Wheels',
      addressOrLocation: 'Ferrari Sydney Service & PDI Enclave, Waterloo NSW',
      status: 'Enclosed Trailer Scheduled',
      statusColor: 'purple',
      trackingId: 'FER-AU-SF90-7740',
      eta: 'Tomorrow, 10:00 AM (White-Glove Enclosed Delivery)',
      handoverLead: {
        name: 'Marco Rossi',
        role: 'Scuderia VIP Delivery Director',
        organization: 'Ferrari Sydney (Waterloo / Alexandria)',
        phone: '+61 409 883 120',
        email: 'vip.delivery@ferrarisydney.com.au',
        address: '85 O\'Riordan St, Alexandria / Waterloo NSW 2015'
      },
      keyDetails: [
        'Dual Scuderia Ferrari Smart Keys with Giallo Modena Inlay',
        'Maranello Telemetry Performance Tracking Module',
        'Dedicated Assetto Fiorano Carbon Aero Wing Adjustment Tools',
        '7-Year Genuine Maintenance Program Passport'
      ],
      releasePin: '7740',
      cryptographicToken: '9F2608D481029C-FERRARI-SF90-FIORANO'
    },

    // 4. Physical Metal & Titanium Bank Cards
    {
      id: 'CARD-AMEX-001',
      category: 'cards',
      title: 'American Express Centurion Black Titanium Card',
      subtitle: 'Laser-Etched Anodized Titanium • Unlimited AUD Limit',
      addressOrLocation: 'En Route via Valourian Armed Diplomatic Courier',
      status: 'Armoured Courier Armed',
      statusColor: 'amber',
      trackingId: 'VAL-AMEX-CENT-3782',
      eta: 'Today at 1:00 PM (Armoured Pouch Delivery)',
      handoverLead: {
        name: 'Captain Ronald Davies',
        role: 'Head of Diplomatic & Armoured Courier Services',
        organization: 'Valourian Sovereign Logistics & Courier Division',
        phone: '+61 400 286 693',
        email: 'concierge@valourian.capital',
        address: 'Level 42, 100 Barangaroo Ave, Sydney NSW 2000'
      },
      keyDetails: [
        'Heavy Anodized Laser-Etched Titanium Metal Card (MR. ASIM ARYAL)',
        'Tamper-Evident Diplomatic Pouch with Cryptographic Seal',
        'Centurion Black Metal Key Fob & Concierge Priority Direct Line Token',
        'Global Airport Lounge & Qantas First Class Automatic Linking'
      ],
      releasePin: '7712',
      cryptographicToken: '9F260877129900-AMEX-CENTURION-BLACK'
    },
    {
      id: 'CARD-CBA-002',
      category: 'cards',
      title: 'CommBank Diamond World Elite Metal Mastercard',
      subtitle: 'Precision Brushed Tungsten Core • eftpos Domestic & Global',
      addressOrLocation: 'Private Vault, Commonwealth Bank Barangaroo Flagship',
      status: 'Ready for Collection',
      statusColor: 'emerald',
      trackingId: 'CBA-DIAMOND-5163',
      eta: 'Instant Collection at CBA Barangaroo Executive Suite',
      handoverLead: {
        name: 'Sarah Chen',
        role: 'Private Banking Executive Director',
        organization: 'Commonwealth Bank Institutional & Private Wealth',
        phone: '+61 2 9118 7000',
        email: 'privatewealth@cba.com.au',
        address: 'Commonwealth Bank Place South, 11 Harbour St, Sydney NSW 2000'
      },
      keyDetails: [
        '16-Gram Brushed Tungsten Metal Card Body (MR. ASIM ARYAL)',
        '0% Cross-Border Foreign Exchange Fee Forever Guaranteed',
        'Instant APCA / NPP Direct Fast Settlement Chip',
        'Official CBA Private Client Presentation Box'
      ],
      releasePin: '8201',
      cryptographicToken: '9F260882014419-CBA-DIAMOND-METAL'
    },
    {
      id: 'CARD-VAL-003',
      category: 'cards',
      title: 'Valourian Sovereign Obsidian Titanium Card',
      subtitle: 'Solid 18K Gold Rim • Bound to Sovereign Global Treasury',
      addressOrLocation: 'Level 42, 100 Barangaroo Ave High Security Safe',
      status: 'Ready for Collection',
      statusColor: 'emerald',
      trackingId: 'VAL-SOV-OBSIDIAN-001',
      eta: 'Ready in Barangaroo Vault Room',
      handoverLead: {
        name: 'Captain Ronald Davies',
        role: 'Chief of Security & Vault Operations',
        organization: 'Valourian Treasury & Sovereign Mint',
        phone: '+61 400 286 693',
        email: 'vault@valourian.capital',
        address: 'Level 42, 100 Barangaroo Ave, Sydney NSW 2000'
      },
      keyDetails: [
        'Obsidian Ceramic Composite with 18K Yellow Gold Edge Inlay',
        'Embedded Ledger Secure Element Chip with Founder Biometric Attestation',
        'Unlimited AUD Sovereign Treasury Direct Clearance',
        'Direct Link to Apple Wallet, Google Wallet & Web3 Enclaves'
      ],
      releasePin: '4829',
      cryptographicToken: '9F260848291045-VALOURIAN-OBSIDIAN'
    }
  ]);

  // Executive Contact Directory
  const EXECUTIVE_DIRECTORY = [
    {
      name: 'Michael Pallier',
      role: 'Managing Director (Prestige Properties Sydney)',
      organization: "Sydney Sotheby's International Realty",
      phone: '+61 417 371 522',
      officePhone: '+61 2 9362 1000',
      email: 'prestige.sydney@sothebysrealty.com',
      address: 'Level 1, 30-36 Bay Street, Double Bay NSW 2028',
      managedAssets: [
        'Point Piper Harbourfront Estate (Wolseley Rd) Torrens Deed & Keys',
        'One Sydney Harbour Crown Penthouse (Barangaroo) Deed & Fobs'
      ],
      description: 'Primary contact for collecting Torrens Title deeds, solid brass master property keys, private marina access passes, and scheduling private harborfront handovers.'
    },
    {
      name: 'Marco Rossi',
      role: 'Scuderia VIP Delivery & Client Relations Director',
      organization: 'Ferrari Sydney Waterloo',
      phone: '+61 409 883 120',
      officePhone: '+61 2 8577 8100',
      email: 'vip.delivery@ferrarisydney.com.au',
      address: '85 O\'Riordan St, Alexandria / Waterloo NSW 2015',
      managedAssets: [
        'Ferrari Daytona SP3 (Icona Limited Series - 1 of 599)',
        'Ferrari SF90 Stradale Assetto Fiorano'
      ],
      description: 'Coordinates Daytona SP3 & SF90 Stradale handovers, Maranello presentation key boxes, enclosed specialized trailer deliveries, and showroom private viewings.'
    },
    {
      name: 'Harrison Vance',
      role: 'Executive Fleet Delivery Lead (Australia & New Zealand)',
      organization: 'Tesla Motors Australia Ltd',
      phone: '+61 428 100 942',
      officePhone: '+61 2 9137 0000',
      email: 'executive.delivery@tesla.com',
      address: 'Tesla Delivery Hub, 20-26 Bourke Rd, Alexandria NSW 2015',
      managedAssets: [
        '2026 Tesla Model S Plaid (Tri-Motor 1,020 HP)',
        '2026 Tesla Cybertruck Cyberbeast (Foundation Series)'
      ],
      description: 'Enables mobile digital key pairing, physical RFID key cards, Supercharging priority activation, and doorstep enclosed delivery for all Tesla vehicles.'
    },
    {
      name: 'Captain Ronald Davies',
      role: 'Head of Diplomatic & Armoured Pouch Courier',
      organization: 'Valourian Executive Private Courier',
      phone: '+61 400 286 693',
      officePhone: '+61 2 8000 9420',
      email: 'concierge@valourian.capital',
      address: 'Level 42, 100 Barangaroo Ave, Sydney NSW 2000',
      managedAssets: [
        'American Express Centurion Black Titanium Physical Card',
        'CommBank Diamond World Elite Metal Mastercard',
        'Valourian Sovereign Obsidian 18K Gold Rimmed Card'
      ],
      description: 'Dispatches armoured diplomatic courier pouches with tamper-evident cryptographic seals for physical titanium cards and Torrens title certificates.'
    }
  ];

  // AI SuperCluster Logistics Acceleration Engine
  const handleTriggerSuperClusterAcceleration = async () => {
    setIsAccelerating(true);
    setAccelerationTelemetry("Connecting to AI SuperCluster Quantum Route Coordinator...");
    
    try {
      await new Promise(r => setTimeout(r, 700));
      setAccelerationTelemetry("Optimizing multi-modal logistics vectors: Sotheby's Double Bay ➔ Ferrari Waterloo ➔ Tesla Alexandria ➔ Point Piper...");
      await new Promise(r => setTimeout(r, 900));
      setAccelerationTelemetry("Transmitting encrypted ARQC handover authorizations to Michael Pallier, Marco Rossi & Harrison Vance...");
      await new Promise(r => setTimeout(r, 800));

      // Upgrade pending items to expedited
      setLuxuryAssets(prev => prev.map(item => {
        if (item.status === 'Priority In Transit' || item.status === 'Enclosed Trailer Scheduled') {
          return {
            ...item,
            status: 'Ready for Collection',
            statusColor: 'emerald',
            eta: 'Accelerated by SuperCluster • Instant Handover Authorized'
          };
        }
        return item;
      }));

      setAccelerationTelemetry("✓ Scientific Miracles in Logistics Complete: All 8 Luxury Assets & Key Suites Cleared for Immediate Handover!");
      
      // Dispatch real-time SMS to +61 401 044 335 and email to asim.nsw@gmail.com
      await smsEmailDispatchService.dispatchBulkLogisticsSummary(luxuryAssets.length);

      toast.success("AI SuperCluster Logistics Acceleration Complete! Timely SMS & Email sent to +61 401 044 335 & asim.nsw@gmail.com.", {
        icon: "⚡",
        duration: 6000
      });
    } catch (e) {
      toast.error("Cluster acceleration link timed out.");
    } finally {
      setIsAccelerating(false);
    }
  };

  // Re-route Consignment
  const handleReRoute = async () => {
    if (!newDestination || !reRouteItem) return;
    setIsReRouting(true);
    setReRouteResponse(null);

    try {
      await new Promise(r => setTimeout(r, 900));
      const resMsg = `RE-ROUTE CONFIRMED by Deep Space AI Cluster:\n• Consignment: ${reRouteItem.title}\n• Tracking: ${reRouteItem.trackingId}\n• New Destination: ${newDestination}\n• Dispatched Notice to Lead: ${reRouteItem.handoverLead.name} (${reRouteItem.handoverLead.organization})\n• Armoured Escort & GPS Geofence Re-calibrated.`;
      setReRouteResponse(resMsg);

      setLuxuryAssets(prev => prev.map(item => 
        item.id === reRouteItem.id 
          ? { ...item, addressOrLocation: newDestination, status: 'Priority In Transit', statusColor: 'amber' }
          : item
      ));

      toast.success(`Re-routed ${reRouteItem.title} to ${newDestination}!`);
    } catch {
      toast.error("Re-route failed.");
    } finally {
      setIsReRouting(false);
    }
  };

  // Official PDF Handover Pass Generator using jsPDF and renderAutoTable
  const handleDownloadReleasePass = (item: LuxuryAssetItem) => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 45, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("VALOURIAN EXECUTIVE ASSET RELEASE PASS", 14, 18);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(52, 211, 153);
      doc.text("OFFICIAL CRYPTOGRAPHIC HANDOVER AUTHORIZATION & BIOMETRIC ATTESTATION", 14, 26);
      doc.setTextColor(148, 163, 184);
      doc.text(`Authorized Recipient: MR. ASIM ARYAL (Founder CEO Director) • Issued: ${new Date().toLocaleDateString("en-AU")}`, 14, 32);

      // Section Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Asset & Handover Specifications", 14, 56);

      renderAutoTable(doc, {
        startY: 62,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 4 },
        head: [["Verification Field", "Authorized Details"]],
        body: [
          ["Asset / Package Title", item.title],
          ["Classification & Category", item.subtitle],
          ["Primary Destination", item.addressOrLocation],
          ["Tracking Number", item.trackingId],
          ["Handover Release PIN", item.releasePin],
          ["Cryptographic ARQC Token", item.cryptographicToken],
          ["Authorizing Handover Lead", `${item.handoverLead.name} (${item.handoverLead.role})`],
          ["Organization", item.handoverLead.organization],
          ["Lead Contact Phone", item.handoverLead.phone],
          ["Lead Contact Email", item.handoverLead.email],
          ["Pickup / Collection Location", item.handoverLead.address],
          ["Current Logistics Status", item.status],
          ["Handover Elements", item.keyDetails.join("\n• ")]
        ]
      });

      const finalY = ((doc as any).lastAutoTable?.finalY || 190) + 12;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Notice to Sotheby's, Ferrari Sydney, Tesla Motors Australia, and Armoured Courier Staff:\nPresenting this digital pass with matching cryptographic ARQC authorizes immediate release of keys, deeds, and vehicles to Mr. Asim Aryal.",
        14,
        finalY
      );

      doc.save(`Valourian_Handover_Pass_${item.trackingId}.pdf`);
      toast.success(`Downloaded Official Handover Pass for ${item.title}!`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF handover pass");
    }
  };

  const filteredAssets = luxuryAssets.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      
      {/* Top Banner: Master Logistics & Asset Collection Hub */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Truck className="w-48 h-48" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> High-Status Asset Collection Hub
            </span>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-400" /> AI SuperCluster Miracles
            </span>
            <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Phone className="w-3 h-3 text-purple-400" /> {USER_PHONE_INTERNATIONAL} ({USER_PHONE_DOMESTIC})
            </span>
            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Mail className="w-3 h-3 text-blue-400" /> {USER_EMAIL}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-amber-400" />
            Global Logistics & Asset Collection
          </h1>
          
          <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed">
            Sure-fire collection protocols for your newly acquired <strong className="text-white">Point Piper Harbourfront & Penthouse Keys</strong>, <strong className="text-white">Tesla Model S Plaid & Cybertruck</strong>, <strong className="text-white">Ferrari Daytona SP3 & SF90</strong>, and <strong className="text-white">Physical Titanium Bank Cards</strong>. Contact verified leads directly with official cryptographic release tokens.
          </p>

          {/* AI SuperCluster Acceleration Banner & Button */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerSuperClusterAcceleration}
              disabled={isAccelerating}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isAccelerating ? (
                <><RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> SuperCluster Synchronizing...</>
              ) : (
                <><Sparkles className="w-4 h-4 fill-slate-950" /> Accelerate All Handovers via AI SuperCluster</>
              )}
            </button>

            <button
              onClick={() => setShowD3Map(!showD3Map)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>{showD3Map ? "Hide Logistics D3 Map" : "View Live Corridor D3 Map"}</span>
            </button>
          </div>

          {/* Acceleration Telemetry Output */}
          {accelerationTelemetry && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono text-xs flex items-start gap-2"
            >
              <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{accelerationTelemetry}</span>
            </motion.div>
          )}
        </div>

        {/* Quick Stats Pillar */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0 z-10">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl font-black text-amber-400 font-mono">8</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Luxury Assets</div>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Release Ready</div>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl font-black text-cyan-400 font-mono">4</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">VIP Concierges</div>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl font-black text-purple-400 font-mono">0s</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ARQC Clearance</div>
          </div>
        </div>
      </div>

      {/* D3 Map Routes Visualizer Toggle */}
      <AnimatePresence>
        {showD3Map && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-3xl border border-slate-800 shadow-2xl"
          >
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">Live Logistics Transit Corridors</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Sydney Hub • Double Bay • Waterloo • Barangaroo • Alexandria</span>
            </div>
            <D3MapRoutes />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {[
          { id: 'all', label: 'All Acquisitions & Keys', icon: Layers, count: luxuryAssets.length },
          { id: 'properties', label: 'Property Keys & Torrens Deeds', icon: Key, count: 3 },
          { id: 'teslas', label: 'Tesla Supercars & Keys', icon: Zap, count: 2 },
          { id: 'ferraris', label: 'Ferrari Supercars & Keys', icon: Car, count: 2 },
          { id: 'cards', label: 'Physical Titanium Cards', icon: CreditCard, count: 3 },
          { id: 'directory', label: 'Whom to Contact (VIP Leads)', icon: Phone, count: 4 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`logistics-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white border border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EXECUTIVE CONTACT DIRECTORY ("WHOM TO CONTACT") */}
      {/* ========================================================= */}
      {activeTab === 'directory' ? (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-amber-400" />
              Executive Contact Directory — Whom to Contact for Package & Key Collection
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Direct direct-dial phone numbers and priority email addresses for designated luxury asset handover directors. Mention your Founder CEO identity (Mr. Asim Aryal) and present the generated Cryptographic Handover Pass for instant priority collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EXECUTIVE_DIRECTORY.map((contact, idx) => (
              <motion.div
                key={`contact-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-3xl p-6 transition-all shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                        {contact.organization}
                      </span>
                      <h3 className="text-lg font-black text-white">{contact.name}</h3>
                      <p className="text-xs text-slate-400">{contact.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-4">
                    {contact.description}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> Mobile / Direct:
                      </span>
                      <a href={`tel:${contact.phone}`} className="font-mono font-bold text-white hover:text-emerald-400 transition-colors">
                        {contact.phone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" /> Office Line:
                      </span>
                      <a href={`tel:${contact.officePhone}`} className="font-mono font-bold text-white hover:text-blue-400 transition-colors">
                        {contact.officePhone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-purple-400" /> Priority Email:
                      </span>
                      <a href={`mailto:${contact.email}?subject=Handover%20Release%20Request%20-%20Mr.%20Asim%20Aryal`} className="font-mono text-xs text-white hover:text-purple-400 transition-colors truncate max-w-[200px]">
                        {contact.email}
                      </a>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-[11px]">{contact.address}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Entrusted Assets:</div>
                    <div className="space-y-1">
                      {contact.managedAssets.map((assetName, aIdx) => (
                        <div key={`asset-${aIdx}`} className="text-xs text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{assetName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex gap-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Direct
                  </a>
                  <a
                    href={`mailto:${contact.email}?subject=Priority%20Handover%20Release%20Coordination%20-%20Mr.%20Asim%20Aryal&body=Dear%20${encodeURIComponent(contact.name)},%0A%0AI%20am%20following%20up%20on%20the%20handover%20of%20my%20entrusted%20assets%20and%20keys.%20Please%20find%20my%20authorized%20release%20verification%20ready.%0A%0ARegards,%0AMr.%20Asim%20Aryal%0AFounder%20CEO%20Director`}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email VIP Line
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* TAB 2: LUXURY ASSET LISTINGS WITH CRYPTOGRAPHIC RELEASE   */
        /* ========================================================= */
        <div className="space-y-4">
          {filteredAssets.map((item, idx) => (
            <motion.div
              key={`asset-item-${item.id}-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-3xl p-6 transition-all shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden"
            >
              {/* Left Column: Asset Identity & Key Details */}
              <div className="flex items-start gap-4 max-w-xl">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                  item.category === 'properties'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10'
                    : item.category === 'teslas'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/10'
                    : item.category === 'ferraris'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                }`}>
                  {item.category === 'properties' && <Key className="w-7 h-7" />}
                  {item.category === 'teslas' && <Zap className="w-7 h-7" />}
                  {item.category === 'ferraris' && <Car className="w-7 h-7" />}
                  {item.category === 'cards' && <CreditCard className="w-7 h-7" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                      {item.category.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      item.statusColor === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : item.statusColor === 'amber'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {item.eta}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">{item.title}</h3>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">{item.subtitle}</p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{item.addressOrLocation}</span>
                  </div>

                  {/* Keys & Handover Details Bullet Points */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                    {item.keyDetails.slice(0, 2).map((kd, kIdx) => (
                      <div key={`kd-${kIdx}`} className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{kd}</span>
                      </div>
                    ))}
                  </div>

                  {/* Handover Contact Snippet */}
                  <div className="mt-2.5 text-[11px] text-slate-400 font-mono">
                    Handover Lead: <strong className="text-white">{item.handoverLead.name}</strong> ({item.handoverLead.organization}) • <a href={`tel:${item.handoverLead.phone}`} className="text-emerald-400 hover:underline">{item.handoverLead.phone}</a>
                  </div>
                </div>
              </div>

              {/* Right Column: Tracking ID, Release Token Action & Re-Route */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <div className="text-left sm:text-right bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Tracking Number</div>
                  <div className="font-mono text-amber-400 font-bold text-xs">{item.trackingId}</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">PIN: <strong className="text-white">{item.releasePin}</strong></div>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedReleaseAsset(item)}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Generate Handover Release Pass</span>
                  </button>

                  <button
                    onClick={() => smsEmailDispatchService.dispatchAssetPickupPass(item)}
                    className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title={`Send instant SMS to ${USER_PHONE_INTERNATIONAL} and email to ${USER_EMAIL}`}
                  >
                    <Send className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Send SMS & Email Pass</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadReleasePass(item)}
                      className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Download Official PDF Handover Pass"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PDF Pass</span>
                    </button>

                    <button
                      onClick={() => setReRouteItem(item)}
                      className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Re-route destination address"
                    >
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Re-Route</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: PRIOR TRANSACTIONS & RECENT ORDERS SYNC */}
      {/* ========================================================= */}
      {dynamicTransactions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mt-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Synchronized Prior Transactions & Order Receipts ({dynamicTransactions.length})
              </h3>
              <p className="text-xs text-slate-400">Live ledger of executed payments connected to high-value purchases</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LEDGER VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dynamicTransactions.slice(0, 6).map((tx, idx) => (
              <div key={`dyn-tx-${tx.id}-${idx}`} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-white truncate max-w-[180px]">{tx.recipient}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {tx.id.substring(0, 10)}...</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-emerald-400">${Number(Math.abs(tx.amount || 0)).toLocaleString()} AUD</div>
                  <div className="text-[9px] text-slate-500">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: OFFICIAL CRYPTOGRAPHIC HANDOVER RELEASE PASS */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedReleaseAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 text-white space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Official Handover Release Pass</h3>
                    <p className="text-xs text-slate-400">Present to Handover Lead for Immediate Release</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReleaseAsset(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Asset Identity Banner */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Authorized Asset</span>
                  <span className="text-emerald-400 font-mono font-bold text-[10px]">AUTHORIZED FOR MR. ASIM ARYAL</span>
                </div>
                <div className="text-lg font-black text-white">{selectedReleaseAsset.title}</div>
                <div className="text-xs text-amber-400 font-mono">{selectedReleaseAsset.subtitle}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{selectedReleaseAsset.addressOrLocation}</span>
                </div>
              </div>

              {/* QR Code and Cryptographic Authorization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-xl mx-auto">
                  <QRCodeSVG
                    value={JSON.stringify({
                      token: selectedReleaseAsset.cryptographicToken,
                      pin: selectedReleaseAsset.releasePin,
                      recipient: "MR. ASIM ARYAL",
                      asset: selectedReleaseAsset.title,
                      tracking: selectedReleaseAsset.trackingId
                    })}
                    size={150}
                    level="H"
                  />
                  <span className="text-[9px] font-mono text-slate-900 font-bold mt-1.5">SCAN FOR RELEASE</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Handover Release PIN</span>
                    <span className="text-2xl font-black font-mono text-amber-400 tracking-widest">{selectedReleaseAsset.releasePin}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Cryptogram (ARQC)</span>
                    <span className="text-[11px] font-mono text-emerald-400 break-all bg-slate-900 px-2 py-1 rounded block border border-slate-800">
                      {selectedReleaseAsset.cryptographicToken}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Handover Lead</span>
                    <span className="font-bold text-white">{selectedReleaseAsset.handoverLead.name}</span>
                    <div className="text-[11px] text-slate-400">{selectedReleaseAsset.handoverLead.organization}</div>
                    <a href={`tel:${selectedReleaseAsset.handoverLead.phone}`} className="text-[11px] text-emerald-400 font-mono block hover:underline">
                      {selectedReleaseAsset.handoverLead.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Handover Inclusions List */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Authorized Handover Inclusions:</span>
                <div className="space-y-1 text-xs">
                  {selectedReleaseAsset.keyDetails.map((detail, idx) => (
                    <div key={`detail-${idx}`} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => smsEmailDispatchService.dispatchAssetPickupPass(selectedReleaseAsset)}
                  className="py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  title={`Send instant SMS to ${USER_PHONE_INTERNATIONAL} and email to ${USER_EMAIL}`}
                >
                  <Send className="w-4 h-4 fill-white" />
                  <span>Send SMS & Email Pass</span>
                </button>

                <button
                  onClick={() => handleDownloadReleasePass(selectedReleaseAsset)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF Pass
                </button>

                <button
                  onClick={() => {
                    const text = `VALOURIAN RELEASE TOKEN:\nAsset: ${selectedReleaseAsset.title}\nPIN: ${selectedReleaseAsset.releasePin}\nARQC: ${selectedReleaseAsset.cryptographicToken}\nRecipient: MR. ASIM ARYAL\nTracking: ${selectedReleaseAsset.trackingId}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Release credentials copied to clipboard! Ready to send via SMS or WhatsApp.");
                  }}
                  className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Copy PIN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: RE-ROUTE CONSIGNMENT VIA AI SUPERCLUSTER */}
      {/* ========================================================= */}
      <AnimatePresence>
        {reRouteItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden text-white"
            >
              <button 
                onClick={() => setReRouteItem(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                Re-Route Luxury Delivery
              </h3>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Target Asset</div>
                <div className="font-bold text-white text-sm">{reRouteItem.title}</div>
                <div className="font-mono text-amber-400 text-xs mt-1">{reRouteItem.trackingId}</div>
              </div>

              {reRouteResponse ? (
                <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                  <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Deep Space Cluster Response
                  </div>
                  <p className="text-cyan-100/90 text-xs whitespace-pre-wrap font-mono leading-relaxed">{reRouteResponse}</p>
                  <button
                    onClick={() => {
                      setReRouteItem(null);
                      setReRouteResponse(null);
                      setNewDestination("");
                    }}
                    className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Acknowledge & Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      New Destination Address
                    </label>
                    <textarea
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none font-medium placeholder:text-slate-500"
                      placeholder="e.g. Wolseley Road, Point Piper NSW 2027 or Crown Sydney Private Residence..."
                      rows={3}
                    />
                  </div>

                  <div className="text-[10px] text-cyan-400/90 font-mono bg-cyan-950/30 border border-cyan-900/50 p-3 rounded-lg flex gap-2">
                    <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Coordinates will be re-broadcasted to Sotheby's, Ferrari Sydney, and Tesla delivery directors.</span>
                  </div>

                  <button
                    onClick={handleReRoute}
                    disabled={!newDestination || isReRouting}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isReRouting ? (
                      <><RefreshCw className="w-4 h-4 animate-spin text-white" /> Transmitting...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Dispatch Re-Route Command</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
