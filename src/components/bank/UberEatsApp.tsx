import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { ShoppingBag, Search, ChevronRight, Clock, Star, MapPin, CreditCard, Gift, Send, Heart, Play, RefreshCw, XCircle, ShieldCheck, CheckCircle2, Trash2, Mail, Plus, Camera, ArrowUpRight, ArrowDownLeft, Compass, Phone, PhoneCall, PhoneOff, Volume2, VolumeX, Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, deleteDoc, where, setDoc, onSnapshot } from 'firebase/firestore';
import { sendEmailViaService, EmailPreviewModal, EmailData } from './EmailService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DeliveryMap } from './DeliveryMap';

const RESTAURANTS = [
  {
    id: 1,
    name: "Quay Sydney",
    cuisine: "Modern Australian",
    rating: 4.9,
    deliveryTime: "35-45 min",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
    is24Hours: false,
    menu: [
      { id: 'q1', name: 'Confit Pig Cheek', price: 58 },
      { id: 'q2', name: 'White Coral Dessert', price: 42 },
      { id: 'q3', name: 'Tasting Menu for Two', price: 460 },
    ]
  },
  {
    id: 2,
    name: "Aria Restaurant",
    cuisine: "Fine Dining",
    rating: 4.8,
    deliveryTime: "40-50 min",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    is24Hours: false,
    menu: [
      { id: 'a1', name: 'Roasted Lamb Saddle', price: 65 },
      { id: 'a2', name: 'Sydney Rock Oysters (Dozen)', price: 72 },
    ]
  },
  {
    id: 3,
    name: "Nobu Sydney",
    cuisine: "Japanese",
    rating: 4.8,
    deliveryTime: "30-40 min",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    is24Hours: false,
    menu: [
      { id: 'n1', name: 'Black Cod Miso', price: 85 },
      { id: 'n2', name: 'Yellowtail Jalapeño', price: 45 },
      { id: 'n3', name: 'Premium Sushi Selection', price: 120 },
    ]
  },
  {
    id: 4,
    name: "Maisy's 24 Hour Diner",
    cuisine: "American & Australian Diner",
    rating: 4.6,
    deliveryTime: "15-25 min",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    is24Hours: true,
    menu: [
      { id: 'm1', name: "Maisy's Famous Eggs Benedict", price: 24 },
      { id: 'm2', name: "Double Wagyu Cheese Burger", price: 28 },
      { id: 'm3', name: "Midnight Pancake Stack", price: 18 }
    ]
  },
  {
    id: 5,
    name: "Golden Century Midnight",
    cuisine: "Cantonese Late Night",
    rating: 4.7,
    deliveryTime: "25-35 min",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
    is24Hours: true,
    menu: [
      { id: 'g1', name: "Pippies with XO Sauce & Vermicelli", price: 88 },
      { id: 'g2', name: "Sovereign Roast Duck (Half)", price: 46 },
      { id: 'g3', name: "Steamed Barramundi Fillet", price: 54 }
    ]
  }
];

export const AUSTRALIA_POST_SUGGESTIONS = [
  { street: "350 George Street", suburb: "Sydney", state: "NSW", postcode: "2000", dpid: "59384720", full: "350 George Street, Sydney NSW 2000" },
  { street: "1 Barangaroo Avenue", suburb: "Barangaroo", state: "NSW", postcode: "2000", dpid: "74839201", full: "1 Barangaroo Avenue, Barangaroo NSW 2000" },
  { street: "1 Martin Place", suburb: "Sydney", state: "NSW", postcode: "2000", dpid: "83920182", full: "1 Martin Place, Sydney NSW 2000" },
  { street: "Level 55, Sovereign Tower, 321 Kent Street", suburb: "Sydney", state: "NSW", postcode: "2000", dpid: "57291138", full: "Level 55, Sovereign Tower, Sydney CBD, NSW 2000" },
  { street: "120 Collins Street", suburb: "Melbourne", state: "VIC", postcode: "3000", dpid: "28401923", full: "120 Collins Street, Melbourne VIC 3000" },
  { street: "226 Queen Street", suburb: "Brisbane", state: "QLD", postcode: "4000", dpid: "39482109", full: "226 Queen Street, Brisbane QLD 4000" },
  { street: "108 St Georges Terrace", suburb: "Perth", state: "WA", postcode: "6000", dpid: "40921837", full: "108 St Georges Terrace, Perth WA 6000" },
  { street: "Valourian Capital Lodge, 12 Military Road", suburb: "Mosman", state: "NSW", postcode: "2088", dpid: "82910482", full: "Valourian Capital Lodge, Mosman NSW 2088" },
  { street: "45 Constitution Avenue", suburb: "Canberra", state: "ACT", postcode: "2600", dpid: "38920194", full: "45 Constitution Avenue, Canberra ACT 2600" },
  { street: "88 Rundle Mall", suburb: "Adelaide", state: "SA", postcode: "5000", dpid: "91029384", full: "88 Rundle Mall, Adelaide SA 5000" },
];

export interface ActiveOrder {
  id?: string;
  restaurantName: string;
  total: number;
  items: any[];
  status: 'ordered' | 'preparing' | 'transit' | 'delivered';
  progress: number;
  secondsRemaining: number;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  lastUpdated?: string;
}

const SIMULATION_ROUTES: Record<string, [number, number][]> = {
  "Quay Sydney": [
    [-33.8587, 151.2115], // Quay Start
    [-33.8615, 151.2085], // George St & Alfred St
    [-33.8631, 151.2078], // George St & Bridge St
    [-33.8660, 151.2071], // George St & Hunter St
    [-33.8675, 151.2070]  // Sovereign Tower Center
  ],
  "Aria Restaurant": [
    [-33.8592, 151.2133], // Aria Start
    [-33.8605, 151.2128], // Macquarie St & Albert St
    [-33.8642, 151.2120], // Macquarie St & Hunter St
    [-33.8647, 151.2100], // Hunter St & Elizabeth St
    [-33.8675, 151.2070]  // Sovereign Tower Center
  ],
  "Nobu Sydney": [
    [-33.8618, 151.1995], // Nobu Start
    [-33.8640, 151.2010], // Barangaroo Ave
    [-33.8665, 151.2030], // King St
    [-33.8675, 151.2070]  // Sovereign Tower Center
  ],
  "Maisy's 24 Hour Diner": [
    [-33.8340, 151.2175], // Maisy's Start (Neutral Bay)
    [-33.8435, 151.2105], // Warringah Freeway
    [-33.8490, 151.2100], // Sydney Harbour Bridge (North Entrance)
    [-33.8565, 151.2065], // Sydney Harbour Bridge (South Exit)
    [-33.8640, 151.2060], // York Street
    [-33.8675, 151.2070]  // Sovereign Tower Center
  ],
  "Golden Century Midnight": [
    [-33.8785, 151.2032], // Golden Century Start (Chinatown)
    [-33.8775, 151.2052], // George St & Goulburn St
    [-33.8735, 151.2060], // George St & Town Hall
    [-33.8690, 151.2065], // George St & King St
    [-33.8675, 151.2070]  // Sovereign Tower Center
  ]
};

function getCoordAtProgress(route: [number, number][], progress: number): { lat: number, lng: number } {
  const pct = Math.max(0, Math.min(100, progress)) / 100;
  if (route.length === 0) return { lat: -33.8675, lng: 151.2070 };
  if (route.length === 1) return { lat: route[0][0], lng: route[0][1] };
  
  if (pct <= 0) return { lat: route[0][0], lng: route[0][1] };
  if (pct >= 1) return { lat: route[route.length - 1][0], lng: route[route.length - 1][1] };
  
  const totalSegments = route.length - 1;
  const rawIdx = pct * totalSegments;
  const currIdx = Math.floor(rawIdx);
  const nextIdx = Math.min(currIdx + 1, totalSegments);
  const segmentProgress = rawIdx - currIdx;
  
  const p1 = route[currIdx];
  const p2 = route[nextIdx];
  
  const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
  const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
  
  return { lat, lng };
}

export function D3ProgressBar({ progress, status }: {
  progress: number;
  status: 'ordered' | 'preparing' | 'transit' | 'delivered';
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(400);

  // ResizeObserver to adapt to container changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: boxWidth } = entry.contentRect;
        setWidth(boxWidth || 400);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Clear previous contents
    svg.selectAll("*").remove();

    const paddingX = 40;
    const trackY = 40;
    const trackWidth = Math.max(100, width - paddingX * 2);

    const steps = [
      { key: 'ordered', label: 'Ordered', pct: 1, x: paddingX },
      { key: 'preparing', label: 'Preparing', pct: 25, x: paddingX + trackWidth * 0.33 },
      { key: 'transit', label: 'In Transit', pct: 60, x: paddingX + trackWidth * 0.66 },
      { key: 'delivered', label: 'Arrived', pct: 100, x: paddingX + trackWidth }
    ];

    // Current X position based on progress (0 to 100)
    const currentX = paddingX + (trackWidth * (progress / 100));

    // Create Defs for gradients and filters
    const defs = svg.append("defs");

    // Glow filter
    const glowFilter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Active track gradient
    const gradient = defs.append("linearGradient")
      .attr("id", "progress-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#34d399"); // emerald-400
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06C167"); // primary brand green

    // 1. Draw inactive background track
    svg.append("line")
      .attr("x1", paddingX)
      .attr("y1", trackY)
      .attr("x2", paddingX + trackWidth)
      .attr("y2", trackY)
      .attr("stroke", "#e2e8f0") // slate-200
      .attr("stroke-width", "6")
      .attr("stroke-linecap", "round");

    // 2. Draw active progress track (D3 animated)
    const activeTrack = svg.append("line")
      .attr("x1", paddingX)
      .attr("y1", trackY)
      .attr("x2", paddingX) // start at 0 and animate to currentX
      .attr("y2", trackY)
      .attr("stroke", "url(#progress-grad)")
      .attr("stroke-width", "6")
      .attr("stroke-linecap", "round");

    activeTrack.transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("x2", currentX);

    // 3. Draw milestones
    steps.forEach((step, idx) => {
      const isPassed = progress >= step.pct;
      const isCurrent = status === step.key;

      const group = svg.append("g")
        .attr("class", `milestone-${step.key}`)
        .style("cursor", "pointer");

      // Outer glow circle for current active status
      if (isCurrent) {
        group.append("circle")
          .attr("cx", step.x)
          .attr("cy", trackY)
          .attr("r", 14)
          .attr("fill", "#10b981")
          .attr("opacity", 0.15)
          .attr("filter", "url(#glow)")
          .transition()
          .duration(1000)
          .attr("r", 18)
          .transition()
          .duration(1000)
          .attr("r", 14)
          .on("end", function repeat() {
            d3.select(this)
              .transition()
              .duration(1000)
              .attr("r", 18)
              .transition()
              .duration(1000)
              .attr("r", 14)
              .on("end", repeat);
          });
      }

      // Outer border circle
      const outerCircle = group.append("circle")
        .attr("cx", step.x)
        .attr("cy", trackY)
        .attr("r", 10)
        .attr("fill", "white")
        .attr("stroke", isPassed ? "#06C167" : "#cbd5e1")
        .attr("stroke-width", isPassed ? "3" : "2")
        .attr("class", "outer-ring");

      // Inner dot
      const innerCircle = group.append("circle")
        .attr("cx", step.x)
        .attr("cy", trackY)
        .attr("r", 0) // animate from 0
        .attr("fill", isPassed ? "#06C167" : "#94a3b8");

      innerCircle.transition()
        .delay(idx * 150)
        .duration(600)
        .ease(d3.easeBackOut)
        .attr("r", isCurrent ? 5 : isPassed ? 4 : 3);

      // Label
      const label = group.append("text")
        .attr("x", step.x)
        .attr("y", trackY + 28)
        .attr("text-anchor", "middle")
        .attr("font-family", "Inter, sans-serif")
        .attr("font-size", "10px")
        .attr("font-weight", isCurrent ? "900" : "600")
        .attr("fill", isCurrent ? "#06C167" : isPassed ? "#334155" : "#94a3b8")
        .attr("letter-spacing", "0.05em")
        .style("text-transform", "uppercase")
        .text(step.label);

      // Interaction
      group.on("mouseover", () => {
        outerCircle.transition().duration(200).attr("r", 12).attr("stroke", "#06C167");
        label.transition().duration(200).attr("font-size", "11px").attr("fill", "#06C167");
      }).on("mouseout", () => {
        outerCircle.transition().duration(200).attr("r", 10).attr("stroke", isPassed ? "#06C167" : "#cbd5e1");
        label.transition().duration(200).attr("font-size", "10px").attr("fill", isCurrent ? "#06C167" : isPassed ? "#334155" : "#94a3b8");
      });
    });

    // 4. Glowing indicator bubble on the current progress X
    if (progress > 0 && progress < 100) {
      const trackerGroup = svg.append("g")
        .attr("class", "live-tracker");

      // Background pulse ring
      trackerGroup.append("circle")
        .attr("cx", paddingX) // start at 0
        .attr("cy", trackY)
        .attr("r", 8)
        .attr("fill", "#34d399")
        .attr("opacity", 0.4)
        .attr("filter", "url(#glow)")
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("cx", currentX);

      // Center solid core
      const core = trackerGroup.append("circle")
        .attr("cx", paddingX)
        .attr("cy", trackY)
        .attr("r", 5)
        .attr("fill", "white")
        .attr("stroke", "#06C167")
        .attr("stroke-width", "2");

      core.transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("cx", currentX);
    }

  }, [progress, status, width]);

  return (
    <div ref={containerRef} className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-2 relative shadow-inner overflow-hidden">
      <svg 
        ref={svgRef} 
        className="w-full h-[80px] overflow-visible"
      />
    </div>
  );
}

export function UberEatsApp({ user, balances, setBalances }: {
  user: any;
  balances: Record<string, number>;
  setBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  const [activeTab, setActiveTab] = useState<'order' | 'history' | 'track' | 'cards'>('order');
  
  // Australia Post Address Validation State
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressDpid, setAddressDpid] = useState<string>("57291138");
  const [addressAmasStatus, setAddressAmasStatus] = useState<string>("AMAS PASS");

  // Linked Westpac/CBA Aussie debit or credit cards
  const [linkedCards, setLinkedCards] = useState<any[]>(() => {
    try {
      const saved = window.localStorage.getItem('valourian_digital_cards_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed.map((card: any) => ({
            id: card.id,
            cardholder: card.holder || "Mr Asim Aryal",
            cardNumber: card.fullNumber || card.cardNumber || card.number,
            expiry: card.expiry,
            cvv: card.cvv,
            pin: card.pin,
            bank: card.network || card.bank || "Valourian Capital",
            bsb: card.bsb || "062-951",
            accountNumber: card.accountNumber || "1099 8801",
            balance: card.balance ?? 100000000,
            network: card.network?.includes("Visa") ? "Visa" : card.network?.includes("American Express") ? "Amex" : "Mastercard"
          }));
        }
      }
    } catch {}
    return [
      {
        id: "card-1",
        cardholder: "Mr Asim Aryal",
        cardNumber: "4539••••••••5519",
        expiry: "09/30",
        cvv: "382",
        bank: "Commonwealth Bank of Australia",
        bsb: "062-900",
        accountNumber: "10938472",
        balance: 550.00,
        network: "Visa",
      },
      {
        id: "card-2",
        cardholder: "Mr Asim Aryal",
        cardNumber: "5108••••••••3821",
        expiry: "12/28",
        cvv: "104",
        bank: "Westpac Banking Corporation",
        bsb: "732-001",
        accountNumber: "38291093",
        balance: 1250.00,
        network: "Mastercard",
      }
    ];
  });

  useEffect(() => {
    const syncCards = () => {
      try {
        const saved = window.localStorage.getItem('valourian_digital_cards_v5');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setLinkedCards(parsed.map((card: any) => ({
              id: card.id,
              cardholder: card.holder || "Mr Asim Aryal",
              cardNumber: card.fullNumber || card.cardNumber || card.number,
              expiry: card.expiry,
              cvv: card.cvv,
              pin: card.pin,
              bank: card.network || card.bank || "Valourian Capital",
              bsb: card.bsb || "062-951",
              accountNumber: card.accountNumber || "1099 8801",
              balance: card.balance ?? 100000000,
              network: card.network?.includes("Visa") ? "Visa" : card.network?.includes("American Express") ? "Amex" : "Mastercard"
            })));
          }
        }
      } catch (e) {
        console.error("Failed to sync cards in UberEatsApp", e);
      }
    };
    syncCards();
    window.addEventListener('storage', syncCards);
    return () => window.removeEventListener('storage', syncCards);
  }, []);

  const [selectedPaymentCard, setSelectedPaymentCard] = useState<string>("vault");
  const [isScanningCard, setIsScanningCard] = useState(false);
  const [scanStep, setScanStep] = useState<"idle" | "accessing_camera" | "aligning" | "ocr_processing" | "completed">("idle");
  const [scannedCardData, setScannedCardData] = useState<any | null>(null);

  // Checkout Payment states with instant camera populate options
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'vault' | 'card'>('vault');
  const [checkoutCardholder, setCheckoutCardholder] = useState<string>("Mr Asim Aryal");
  const [checkoutCardNumber, setCheckoutCardNumber] = useState<string>("");
  const [checkoutExpiry, setCheckoutExpiry] = useState<string>("");
  const [checkoutCvv, setCheckoutCvv] = useState<string>("");
  const [checkoutCardBank, setCheckoutCardBank] = useState<string>("Commonwealth Bank of Australia");
  const [checkoutCardNetwork, setCheckoutCardNetwork] = useState<string>("Visa");
  const [isScanningFromCheckout, setIsScanningFromCheckout] = useState(false);

  // Instant card transfer state
  const [transferTargetId, setTransferTargetId] = useState<string>("card-1");
  const [transferAmountInput, setTransferAmountInput] = useState<string>("");
  const [transferReference, setTransferReference] = useState<string>("Sovereign Payout");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [voucherAmount, setVoucherAmount] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailData | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "deliveryTime">("name");
  
  // Track Active Order & History states
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [showTrackingMap, setShowTrackingMap] = useState(true);

  // Real-time tracking status notifications (ordered -> preparing -> transit)
  const prevOrderStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (activeOrder && activeOrder.id) {
      const currentStatus = activeOrder.status;
      const prevStatus = prevOrderStatusRef.current;
      
      if (prevStatus === 'preparing' && currentStatus === 'transit') {
        toast.info("Your order is now on the way!", {
          description: `Elite courier is in transit from ${activeOrder.restaurantName || 'the restaurant'} delivering your order.`,
          icon: "🚗",
          duration: 6000
        });
      } else if (prevStatus === 'ordered' && currentStatus === 'preparing') {
        toast.info("Chef is preparing your gourmet feast!", {
          description: `Your meal is being prepared at ${activeOrder.restaurantName || 'the restaurant'}.`,
          icon: "🍳",
          duration: 6000
        });
      }
      prevOrderStatusRef.current = currentStatus;
    } else {
      prevOrderStatusRef.current = undefined;
    }
  }, [activeOrder]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Delivery & Confirmation Preferences
  const [deliveryAddress, setDeliveryAddress] = useState("Level 55, Sovereign Tower, Sydney CBD, NSW 2000");
  const [confirmationEmail, setConfirmationEmail] = useState(user?.email || "asim.nsw@gmail.com");
  const [customerPhone, setCustomerPhone] = useState("+61 491 570 156");
  const [isCallingPartner, setIsCallingPartner] = useState(false);
  const [callStatus, setCallStatus] = useState<'dialing' | 'connecting' | 'connected' | 'ended'>('dialing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([
    "Level 55, Sovereign Tower, Sydney CBD, NSW 2000",
    "Penthouse Suite, 1 Barangaroo Ave, Sydney NSW 2000",
    "Valourian Capital Lodge, Mosman NSW 2088"
  ]);
  const [newAddressInput, setNewAddressInput] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  
  // Checkout & Filter States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnly24Hours, setShowOnly24Hours] = useState(false);
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; amount: number } | null>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");

  // Scheduling states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState(
    new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16)
  );
  const [scheduledOrders, setScheduledOrders] = useState<any[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);

  // Load and sync past orders
  const loadScheduledOrders = async () => {
    if (!user || !user.uid) return;
    setIsLoadingScheduled(true);
    try {
      const q = query(collection(db, "scheduled_orders"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.userId === user.uid) {
          list.push({ id: docSnap.id, ...d });
        }
      });
      list.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
      setScheduledOrders(list);
    } catch (err) {
      console.error("Error loading scheduled orders:", err);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const loadOrderHistory = async () => {
    if (!user || !user.uid) return;
    setIsLoadingHistory(true);
    try {
      const q = query(collection(db, "transactions"));
      const querySnapshot = await getDocs(q);
      const orders: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.userId === user.uid && d.recipient && d.recipient.includes("Uber Eats")) {
          orders.push({ id: docSnap.id, ...d });
        }
      });
      orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPastOrders(orders);
    } catch (error) {
      console.error("Error loading order history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const loadFavorites = async () => {
      if (user && user.uid) {
        try {
          const q = query(collection(db, "users", user.uid, "uber_eats_favorites"));
          const querySnapshot = await getDocs(q);
          const favs: number[] = [];
          querySnapshot.forEach((doc) => {
            favs.push(doc.data().restaurantId);
          });
          setFavorites(favs);
        } catch (error) {
          console.error("Error loading favorites", error);
        }
      }
    };
    loadFavorites();
    loadOrderHistory();
    loadScheduledOrders();
  }, [user]);

  // Background Tracker to check if order freezes
  useEffect(() => {
    if (!activeOrder || !activeOrder.id) return;
    if (activeOrder.status === 'delivered') return;

    // Check if progress hasn't advanced for > 5 mins
    const freezeInterval = setInterval(() => {
      // In a real scenario we could check a `lastUpdated` timestamp in the activeOrder document
      // Let's verify by just using an arbitrary timestamp tracker if needed
      // To simulate an alert if needed
      if (activeOrder.lastUpdated) {
        const lastUpTime = new Date(activeOrder.lastUpdated).getTime();
        const now = Date.now();
        if (now - lastUpTime > 5 * 60 * 1000) {
          toast.error("Your delivery seems to be stuck or delayed. Uber logistics has been alerted.", { duration: 6000 });
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(freezeInterval);
  }, [activeOrder]);

  // Synchronize Active Order from fast Firestore 'active_orders' collection
  useEffect(() => {
    if (!user || !user.uid) return;
    const unsub = onSnapshot(
      query(collection(db, "active_orders"), where("userId", "==", user.uid)),
      (snapshot) => {
        if (!snapshot.empty) {
          // just taking the most recently active one
          const activeDocs = snapshot.docs.filter(d => d.data().status !== "delivered");
          if (activeDocs.length > 0) {
            const docData = activeDocs[0].data();
            setActiveOrder({ id: activeDocs[0].id, ...docData } as any);
          } else {
            // Check if we just delivered it (if the latest doc was delivered)
            const deliveredDocs = snapshot.docs.filter(d => d.data().status === "delivered");
            if (deliveredDocs.length > 0) {
               // We could show delivered state temporarily, but let's clear it
               // or let the interval handle it
               const lastDelivered = deliveredDocs.sort((a,b) => b.data().timestamp.localeCompare(a.data().timestamp))[0];
               setActiveOrder({ id: lastDelivered.id, ...lastDelivered.data() } as any);
            } else {
               setActiveOrder(null);
            }
          }
        }
      }
    );
    return () => unsub();
  }, [user]);

  // Active Order Live Tracker Progress Timer (Coordinator)
  useEffect(() => {
    if (!activeOrder || !activeOrder.id) return;
    if (activeOrder.status === 'delivered') return;

    // Only one client should ideally drive this, we'll just let the interval run
    const interval = setInterval(async () => {
      try {
        const prev = activeOrder;
        const nextSeconds = prev.secondsRemaining - 1;
        
        if (nextSeconds <= 0) {
          clearInterval(interval);
          const route_coords = SIMULATION_ROUTES[prev.restaurantName] || SIMULATION_ROUTES["Quay Sydney"];
          const finalCoord = route_coords[route_coords.length - 1];
          await updateDoc(doc(db, "active_orders", prev.id), {
            status: 'delivered',
            progress: 100,
            secondsRemaining: 0,
            latitude: finalCoord[0],
            longitude: finalCoord[1]
          });
          toast.success("Your elite Uber Eats order has been successfully delivered!", {
            icon: "🎉",
            duration: 5000
          });
          return;
        }

        let nextStatus = prev.status;
        let nextProgress = prev.progress;

        if (nextSeconds > 30) {
          nextStatus = 'ordered';
          nextProgress = Math.round(((40 - nextSeconds) / 10) * 25);
        } else if (nextSeconds > 20) {
          nextStatus = 'preparing';
          nextProgress = 25 + Math.round(((30 - nextSeconds) / 10) * 35);
        } else if (nextSeconds > 0) {
          nextStatus = 'transit';
          nextProgress = 60 + Math.round(((20 - nextSeconds) / 20) * 38);
        }

        const cappedProgress = Math.min(nextProgress, 98);
        const route_coords = SIMULATION_ROUTES[prev.restaurantName] || SIMULATION_ROUTES["Quay Sydney"];
        const coords = getCoordAtProgress(route_coords, cappedProgress);

        await updateDoc(doc(db, "active_orders", prev.id), {
          status: nextStatus,
          progress: cappedProgress,
          secondsRemaining: nextSeconds,
          latitude: coords.lat,
          longitude: coords.lng,
          lastUpdated: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error updating tracker", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  // Call duration ticker & managers for Twilio Voice Bridge
  useEffect(() => {
    let interval: any;
    if (isCallingPartner && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallingPartner, callStatus]);

  const handleStartVoiceBridgeCall = () => {
    setIsCallingPartner(true);
    setCallStatus('dialing');
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    
    // Simulate dialing for 2s
    setTimeout(() => {
      setCallStatus('connecting');
      // Simulate connecting for 1.5s
      setTimeout(() => {
        setCallStatus('connected');
        toast.success("Secure Twilio Voice Bridge Connection Established!");
      }, 1500);
    }, 2000);
  };

  const handleEndVoiceBridgeCall = () => {
    setCallStatus('ended');
    toast.error("Secure Twilio Voice Bridge Session Ended");
    setTimeout(() => {
      setIsCallingPartner(false);
    }, 1200);
  };

  const filteredRestaurants = RESTAURANTS
    .filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !showOnlyFavorites || favorites.includes(r.id);
      const matches24Hours = !showOnly24Hours || r.is24Hours;
      return matchesSearch && matchesFavorites && matches24Hours;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "deliveryTime") {
        const timeA = parseInt(a.deliveryTime) || 0;
        const timeB = parseInt(b.deliveryTime) || 0;
        return timeA - timeB;
      }
      return a.name.localeCompare(b.name);
    });

  const toggleFavorite = async (e: React.MouseEvent, restaurantId: number) => {
    e.stopPropagation();
    if (!user || !user.uid) return toast.error("Must be logged in to save favorites");

    const isFav = favorites.includes(restaurantId);
    
    try {
      if (isFav) {
        setFavorites(favorites.filter(id => id !== restaurantId));
        const q = query(collection(db, "users", user.uid, "uber_eats_favorites"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (d) => {
          if (d.data().restaurantId === restaurantId) {
            await deleteDoc(doc(db, "users", user.uid, "uber_eats_favorites", d.id));
          }
        });
        toast.success("Removed from favorites");
      } else {
        setFavorites([...favorites, restaurantId]);
        await addDoc(collection(db, "users", user.uid, "uber_eats_favorites"), {
          restaurantId,
          timestamp: new Date().toISOString()
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite", error);
      toast.error("Failed to update favorites");
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);

  const handleOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    setIsProcessing(true);
    
    try {
      const tipAmount = Math.round((cartTotal * tipPercentage / 100) * 100) / 100;
      const discountAmount = appliedVoucher ? appliedVoucher.amount : 0;
      const totalToPay = Math.max(0, cartTotal + tipAmount - discountAmount);

      if (checkoutPaymentMethod === 'card') {
        const checkoutCreditCardNumber = linkedCards.find((c) => c.id === checkoutCardNumber)?.cardNumber || checkoutCardNumber;
        const checkoutCreditCardNetwork = linkedCards.find((c) => c.id === checkoutCardNumber)?.network || checkoutCardNetwork;

        if (!checkoutCreditCardNumber || checkoutCreditCardNumber.trim().length < 12) {
          toast.error("Please enter a valid Credit or Debit Card first, or Scan to populate details.");
          setIsProcessing(false);
          return;
        }
        if (!checkoutExpiry || !checkoutExpiry.includes('/') || checkoutExpiry.trim().length < 5) {
          toast.error("Please enter a valid Expiry Date (MM/YY format).");
          setIsProcessing(false);
          return;
        }
        if (!checkoutCvv || checkoutCvv.trim().length < 3) {
          toast.error("Please enter your 3-digit CVV security code.");
          setIsProcessing(false);
          return;
        }
        // Simulated premium card authorization successful!
        toast.info(`Authorising payment via Secure ${checkoutCreditCardNetwork}...`);
      } else {
        if ((balances.AUD || 0) < totalToPay) {
          toast.error(`Insufficient AUD balance. Total required: $${totalToPay.toFixed(2)} AUD. Available: $${(balances.AUD || 0).toFixed(2)} AUD.`);
          setIsProcessing(false);
          return;
        }

        const updatedBalances = {
          ...balances,
          AUD: (balances.AUD || 0) - totalToPay
        };

        if (user && user.uid) {
          await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
        }
        setBalances(updatedBalances);
      }

      // 1. Mark voucher as claimed on Firestore if a voucher was applied at checkout
      if (appliedVoucher) {
        try {
          const voucherRes = await getDocs(query(collection(db, "vouchers"), where("code", "==", appliedVoucher.code)));
          if (!voucherRes.empty) {
            const vDoc = voucherRes.docs[0];
            await setDoc(doc(db, "vouchers", vDoc.id), {
              claimed: true,
              claimedBy: user?.uid || "anonymous",
              claimedAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (voucherErr) {
          console.error("Error setting voucher as claimed:", voucherErr);
        }
      }

      const itemsDetail = cart.map(i => ({ name: i.name, price: i.price }));

      if (isScheduled) {
        // Create scheduled order in Firestore
        await addDoc(collection(db, "scheduled_orders"), {
          userId: user?.uid || "anonymous",
          restaurantName: selectedRestaurant.name,
          total: totalToPay,
          subtotal: cartTotal,
          tip: tipAmount,
          discount: discountAmount,
          appliedVoucherCode: appliedVoucher?.code || null,
          items: itemsDetail,
          scheduledTime: scheduledDateTime,
          deliveryAddress: deliveryAddress,
          confirmationEmail: confirmationEmail,
          status: "scheduled",
          createdAt: new Date().toISOString()
        });

        // Add to standard transactions list as a "Scheduled Dispatch"
        await addDoc(collection(db, "transactions"), {
          userId: user?.uid || "anonymous",
          amount: -totalToPay,
          currency: "AUD",
          date: new Date().toISOString(),
          recipient: `Uber Eats Scheduled - ${selectedRestaurant.name}`,
          type: "card",
          status: "pending",
          description: `Scheduled delivery for ${new Date(scheduledDateTime).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })} - ${selectedRestaurant.name}`,
          items: itemsDetail,
          deliveryAddress: deliveryAddress,
          confirmationEmail: confirmationEmail,
          scheduledTime: scheduledDateTime
        });

        if (user && user.uid) {
          await sendEmailViaService(user, {
            sender: "Uber Eats Logistics",
            email: "logistics@ubereats.com",
            receiverEmail: confirmationEmail,
            subject: `[SCHEDULED] Your Uber Eats Order - ${selectedRestaurant.name}`,
            preview: `Order scheduled for future dispatch on ${scheduledDateTime}`,
            body: `Dear Mr. Asim,\n\nWe successfully locked your future procurement dispatch coordinates.\n\nDISPATCH WINDOW:\n----------------------------------------\n${new Date(scheduledDateTime).toLocaleString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}\n\nITEMS SUMMARY:\n----------------------------------------\n${itemsDetail.map(i => `${i.name} ($${i.price} AUD)`).join("\n")}\n\nDELIVERY DESTINATION:\n----------------------------------------\n${deliveryAddress}\n\nORDER SUMMARY:\n----------------------------------------\nFood Subtotal: $${cartTotal.toFixed(2)} AUD\nDelivery Driver Tip: $${tipAmount.toFixed(2)} AUD\nVoucher Discount: -$${discountAmount.toFixed(2)} AUD\nTotal Charged: $${totalToPay.toFixed(2)} AUD\n\nOur autonomous fleet will trigger cooking preparation and airway transport exactly 30 minutes prior to delivery.\n\nThank you for choosing Uber Eats Sovereign.`,
          }, setPreviewEmail);
        }

        toast.success(`Order successfully scheduled for ${new Date(scheduledDateTime).toLocaleString()}! Account debited.`);
        setCart([]);
        setSelectedRestaurant(null);
        setShowConfirmModal(false);
        setIsScheduled(false);
        setTipPercentage(0);
        setAppliedVoucher(null);
        loadScheduledOrders();
        loadOrderHistory();
      } else {
        // Immediate Order logic
        const checkoutCreditCardNumber = linkedCards.find((c) => c.id === checkoutCardNumber)?.cardNumber || checkoutCardNumber;
        const checkoutCreditCardNetwork = linkedCards.find((c) => c.id === checkoutCardNumber)?.network || checkoutCardNetwork;

        await addDoc(collection(db, "transactions"), {
          userId: user?.uid || "anonymous",
          amount: -totalToPay,
          currency: "AUD",
          date: new Date().toISOString(),
          recipient: `Uber Eats - ${selectedRestaurant.name}`,
          type: "card",
          status: "completed",
          description: checkoutPaymentMethod === 'card' 
            ? `Paid via ${checkoutCreditCardNetwork} card ending in ${checkoutCreditCardNumber.slice(-4)}`
            : `Premium food delivery from ${selectedRestaurant.name}`,
          items: itemsDetail,
          deliveryAddress: deliveryAddress,
          confirmationEmail: confirmationEmail
        });

        // Initialize Tracker via Firestore (this triggers onSnapshot listener above)
        const docRef = await addDoc(collection(db, "active_orders"), {
          userId: user?.uid || "anonymous",
          restaurantName: selectedRestaurant.name,
          total: totalToPay,
          items: itemsDetail,
          status: 'ordered',
          progress: 10,
          secondsRemaining: 40,
          timestamp: new Date().toISOString()
        });

        if (user && user.uid) {
          await sendEmailViaService(user, {
            sender: "Uber Eats Receipts",
            email: "receipts@ubereats.com",
            receiverEmail: confirmationEmail,
            subject: `Your Uber Eats Order from ${selectedRestaurant.name}`,
            preview: `Your order for AUD ${totalToPay.toFixed(2)} is being prepared.`,
            body: `Hi Asim,\n\nYour order from ${selectedRestaurant.name} is confirmed and will be dispatched shortly.\n\nDELIVERY ADDRESS:\n----------------------------------------\n${deliveryAddress}\n\nORDER SUMMARY:\n----------------------------------------\nFood Subtotal: $${cartTotal.toFixed(2)} AUD\nDelivery Driver Tip: $${tipAmount.toFixed(2)} AUD\nVoucher Discount: -$${discountAmount.toFixed(2)} AUD\nTotal Charged: $${totalToPay.toFixed(2)} AUD\n\nThank you for choosing Uber Eats Sovereign.`,
          }, setPreviewEmail);
        }

        toast.success(`Order placed at ${selectedRestaurant.name}! AUD ${totalToPay.toFixed(2)} charged. Receipt sent to ${confirmationEmail}`);
        setCart([]);
        setSelectedRestaurant(null);
        setShowConfirmModal(false);
        setActiveTab('track');
        setTipPercentage(0);
        setAppliedVoucher(null);
        loadOrderHistory();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel dynamic Future Scheduled Order logistics with full ledger credit refund
  const handleCancelScheduledOrder = async (scheduledOrder: any) => {
    if (!user || !user.uid) return;
    setIsProcessing(true);
    try {
      const refundAmount = scheduledOrder.total;
      const updatedBalances = {
        ...balances,
        AUD: (balances.AUD || 0) + refundAmount
      };

      await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
      setBalances(updatedBalances);

      // Log transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: refundAmount,
        currency: "AUD",
        date: new Date().toISOString(),
        recipient: `Uber Eats Scheduled Refund - ${scheduledOrder.restaurantName}`,
        type: "refund",
        status: "completed",
        description: `Refund for cancelled scheduled order from ${scheduledOrder.restaurantName}`,
        items: scheduledOrder.items || []
      });

      // Delete scheduled order document
      await deleteDoc(doc(db, "scheduled_orders", scheduledOrder.id));

      if (user && user.uid) {
        await sendEmailViaService(user, {
          sender: "Uber Eats Support",
          email: "support@ubereats.com",
          receiverEmail: scheduledOrder.confirmationEmail || confirmationEmail,
          subject: `Cancelled Scheduled Order Dispatch - ${scheduledOrder.restaurantName}`,
          preview: `Refund of AUD ${refundAmount.toFixed(2)} credited back to your account.`,
          body: `Dear Mr. Asim,\n\nAs requested, your scheduled order from ${scheduledOrder.restaurantName} (slated for delivery on ${new Date(scheduledOrder.scheduledTime).toLocaleString()}) has been successfully cancelled.\n\nREFUND CREDITED:\n----------------------------------------\nAUD ${refundAmount.toFixed(2)} has been credited back to your primary AUD ledger.\n\nSovereign profile clearance remains positive.\n\nBest regards,\nUber Eats Enterprise Support`,
        }, setPreviewEmail);
      }

      toast.success(`Scheduled order from ${scheduledOrder.restaurantName} cancelled. AUD ${refundAmount.toFixed(2)} credited back to your treasury.`);
      loadScheduledOrders();
      loadOrderHistory();
    } catch (err) {
      console.error("Error cancelling scheduled order:", err);
      toast.error("Failed to cancel scheduled order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Live Order Cancellation Button & instant VIP Account Refund
  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    if (activeOrder.status === 'delivered') {
      return toast.error("Cannot cancel an order that has already been delivered!");
    }

    setIsProcessing(true);
    try {
      const refundAmount = activeOrder.total;
      const updatedBalances = {
        ...balances,
        AUD: (balances.AUD || 0) + refundAmount
      };

      // Refund database balance
      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
      }
      setBalances(updatedBalances);

      // Save refund transaction
      await addDoc(collection(db, "transactions"), {
        userId: user?.uid || "anonymous",
        amount: refundAmount,
        currency: "AUD",
        date: new Date().toISOString(),
        recipient: `Uber Eats Refund - ${activeOrder.restaurantName}`,
        type: "refund",
        status: "completed",
        description: `Refund for cancelled order from ${activeOrder.restaurantName}`,
        items: activeOrder.items
      });

      // Send refund email confirmation
      if (user && user.uid) {
        await sendEmailViaService(user, {
          sender: "Uber Eats Corporate Refunds",
          email: "refunds@ubereats.com",
          receiverEmail: user.email || "asim.nsw@gmail.com",
          subject: `REFUND ISSUED: AUD ${refundAmount.toFixed(2)} credited to VIP Treasury`,
          preview: `Unilateral order cancellation confirmed. Refund cleared.`,
          body: `Dear Mr. Aryal,\n\nAs requested, the active order from ${activeOrder.restaurantName} was successfully cancelled.\n\nREFUND DEPOSITED: AUD ${refundAmount.toFixed(2)} dynamically credited to your main AUD treasury line.\n\nYour sovereign clearance profile continues with positive integrity limits.\n\nBest,\nUber Eats Enterprise Support`,
        }, setPreviewEmail);
      }

      toast.success(`Order cancelled successfully! AUD ${refundAmount.toFixed(2)} refunded to your account.`);
      setActiveOrder(null);
      setActiveTab('order');
      loadOrderHistory();
    } catch (error) {
      console.error("Cancel order error", error);
      toast.error("Could not complete order cancellation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !voucherAmount) return toast.error("Please fill in email and amount");
    setIsProcessing(true);
    
    try {
      const updatedBalances = {
        ...balances,
        AUD: (balances.AUD || 0) - voucherAmount
      };

      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
      }
      setBalances(updatedBalances);

      await addDoc(collection(db, "transactions"), {
        userId: user?.uid || "anonymous",
        amount: -voucherAmount,
        currency: "AUD",
        date: new Date().toISOString(),
        recipient: `Uber Eats Voucher`,
        type: "card",
        status: "completed",
        description: `Sent AUD ${voucherAmount} voucher to ${recipientEmail}`
      });

      if (user && user.uid) {
        await sendEmailViaService(user, {
          sender: "Uber Eats Corporate",
          email: "gifts@ubereats.com",
          receiverEmail: recipientEmail,
          subject: `You received an Uber Eats Voucher!`,
          preview: `Asim Aryal has sent you an Uber Eats voucher worth AUD ${voucherAmount.toFixed(2)}.`,
          body: `Hello,\n\nYou've received an exclusive corporate Uber Eats voucher.\n\nSender: Asim Aryal\nAmount: AUD ${voucherAmount.toFixed(2)}\n\nUse this digital cash voucher to order premium dining experiences right to your door.`,
          isVoucher: true,
          voucherAmount: voucherAmount
        }, setPreviewEmail);
      }

      toast.success(`Voucher of AUD ${voucherAmount} sent to ${recipientEmail}`);
      setRecipientEmail("");
      setVoucherAmount(100);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process voucher");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="UberEatsApp bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[600px] flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-[#06C167] p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 animate-pulse" />
          <div>
            <h2 className="text-xl font-black tracking-tight">Uber Eats</h2>
            <p className="text-[10px] text-[#ffffffbf] font-medium uppercase tracking-widest leading-none">Valourian Capital Subsidiary</p>
          </div>
        </div>
        <div className="bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
          VIP OWNER
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-slate-50 border-b border-slate-200 flex text-[10px] md:text-xs">
        <button 
          onClick={() => setActiveTab('order')}
          className={`flex-1 py-3 text-center font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'order' 
              ? 'border-[#06C167] text-[#06C167] bg-white font-heavy' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Restaurants
        </button>
        <button 
          onClick={() => { setActiveTab('history'); loadOrderHistory(); }}
          className={`flex-1 py-3 text-center font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'history' 
              ? 'border-[#06C167] text-[#06C167] bg-white font-heavy' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Order History
        </button>
        <button 
          onClick={() => setActiveTab('cards')}
          className={`flex-1 py-3 text-center font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeTab === 'cards' 
              ? 'border-[#06C167] text-[#06C167] bg-white font-heavy' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Cards & Transfers
        </button>
        {activeOrder && (
          <button 
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-3 text-center font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1 ${
              activeTab === 'track' 
                ? 'border-[#06C167] text-[#06C167] bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Track Status
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Restaurants Menu */}
          {activeTab === 'order' && (
            <motion.div
              key="order-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {selectedRestaurant ? (
                <div className="space-y-6">
                  <button onClick={() => setSelectedRestaurant(null)} className="text-slate-500 font-bold mb-2 hover:text-slate-900 transition-colors flex items-center gap-1 text-sm bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm w-fit">
                    ← Back to Restaurants
                  </button>
                  
                  <div className="h-44 rounded-2xl overflow-hidden relative mb-4 shadow-md">
                    <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <div>
                        <span className="bg-[#06C167] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Premier Partner</span>
                        <h3 className="text-2xl font-black text-white mt-1 shadow-sm">{selectedRestaurant.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-[#06C167] text-xs uppercase tracking-widest mb-1.5">Gastronomy List</h4>
                      {selectedRestaurant.menu.map((item: any) => (
                        // Precise Framer Motion subtle hover animation implemented as requested by user
                        <motion.div 
                          key={item.id} 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-default"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{item.name}</span>
                            <span className="text-[10px] text-slate-400">Specially prepared for VIP Account</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-slate-900 font-black font-mono text-sm">${item.price}</span>
                            <button onClick={() => setCart([...cart, item])} className="bg-slate-100 p-2.5 rounded-full hover:bg-[#06C167] hover:text-white transition-colors text-slate-600 font-bold text-xs flex items-center justify-center w-8 h-8">
                              +
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                      <h4 className="font-black text-lg mb-4 text-slate-900 border-b pb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-5 h-5 text-[#06C167]" /> Your Order Cart
                        </span>
                        {cart.length > 0 && (
                          <motion.span
                            key={cart.length}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                            transition={{ type: "spring", stiffness: 450, damping: 15 }}
                            className="bg-[#06C167] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm font-mono"
                          >
                            {cart.length}
                          </motion.span>
                        )}
                      </h4>
                      {cart.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 italic text-sm">
                          Cart is empty. Tap menu items to add.
                        </div>
                      ) : (
                        <div className="space-y-3 mb-4">
                            {cart.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm items-center border-b border-slate-100 pb-2">
                                 <span className="text-slate-700 font-medium">{item.name}</span>
                                 <div className="flex items-center gap-2">
                                   <span className="font-bold text-slate-900 font-mono">${item.price}</span>
                                   <button 
                                     onClick={() => setCart(cart.filter((_, i) => i !== idx))} 
                                     className="text-rose-500 hover:text-rose-700 font-bold text-xs px-1.5 py-0.5 rounded hover:bg-rose-50 cursor-pointer"
                                   >
                                     ✕
                                   </button>
                                 </div>
                              </div>
                            ))}
                            <div className="pt-3 flex justify-between font-black text-base text-slate-900">
                               <span>Order Total</span>
                               <motion.span
                                 key={cartTotal}
                                 initial={{ scale: 0.8, opacity: 0.5 }}
                                 animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                                 transition={{ type: "spring", stiffness: 350, damping: 12 }}
                                 className="font-mono text-[#06C167]"
                               >
                                 ${cartTotal} AUD
                               </motion.span>
                            </div>
                        </div>
                      )}

                      {/* Delivery & Confirmation Preferences Form */}
                      {cart.length > 0 && (
                        <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                            <MapPin className="w-4 h-4 text-[#06C167]" /> Delivery & Contact Preferences
                          </div>
                          
                          {/* Confirmation Email Input */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center justify-between">
                              <span>CONFIRMATION EMAIL</span>
                              <span className="text-[8px] bg-emerald-100 text-emerald-700 font-heavy px-1.5 py-0.5 rounded-full uppercase">secure route</span>
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                value={confirmationEmail}
                                onChange={(e) => setConfirmationEmail(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#06C167] font-sans"
                                placeholder="name@valourian.com"
                              />
                              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            </div>
                          </div>

                          {/* Contact Phone Input */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center justify-between">
                              <span>CONTACT PHONE NUMBER</span>
                              <span className="text-[8px] bg-sky-100 text-sky-700 font-heavy px-1.5 py-0.5 rounded-full uppercase">secure wire</span>
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#06C167] font-mono"
                                placeholder="+61 491 570 156"
                              />
                              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            </div>
                          </div>

                          {/* Delivery Address selector */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                              SAVED ADDRESSES (SELECT ONE)
                            </label>
                            <div className="flex flex-col gap-1.5">
                              {savedAddresses.map((addr) => {
                                const isSelected = deliveryAddress === addr;
                                return (
                                  <button
                                    key={addr}
                                    type="button"
                                    onClick={() => setDeliveryAddress(addr)}
                                    className={`w-full text-left p-2.5 text-xs rounded-xl border transition-all flex items-start gap-2 cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-50/50 border-[#06C167] text-slate-900 font-semibold shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                      isSelected ? 'border-[#06C167] bg-[#06C167]' : 'border-slate-300 bg-white'
                                    }`}>
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                    </span>
                                    <span className="truncate flex-1 pr-1">{addr}</span>
                                    {!["Level 55, Sovereign Tower, Sydney CBD, NSW 2000", "Penthouse Suite, 1 Barangaroo Ave, Sydney NSW 2000", "Valourian Capital Lodge, Mosman NSW 2088"].includes(addr) && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSavedAddresses(savedAddresses.filter(a => a !== addr));
                                          if (deliveryAddress === addr) {
                                            setDeliveryAddress(savedAddresses[0] || "");
                                          }
                                          toast.success("Saved address deleted successfully.");
                                        }}
                                        className="text-slate-400 hover:text-rose-500 cursor-pointer flex-shrink-0 p-0.5"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Add custom address inline form with Australia Post Verified Integration */}
                            {showAddAddress ? (
                              <div className="pt-2 border-t border-slate-100 space-y-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-red-600 tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                    Australia Post Address verification
                                  </label>
                                  <div className="relative">
                                    <textarea
                                      rows={2}
                                      value={newAddressInput}
                                      onChange={(e) => {
                                        const queryVal = e.target.value;
                                        setNewAddressInput(queryVal);
                                        if (queryVal.trim().length > 2) {
                                          setIsSearchingAddress(true);
                                          const matches = AUSTRALIA_POST_SUGGESTIONS.filter(item => 
                                            item.full.toLowerCase().includes(queryVal.toLowerCase())
                                          );
                                          setAddressSuggestions(matches);
                                          
                                          if (matches.length > 0) {
                                            setAddressDpid(matches[0].dpid);
                                            setAddressAmasStatus("AMAS CERTIFIED");
                                          } else {
                                            const hashStr = queryVal.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
                                            setAddressDpid("5" + hashStr.padStart(7, "0").substring(0, 7));
                                            setAddressAmasStatus("PROVISIONAL PASS");
                                          }
                                          setTimeout(() => setIsSearchingAddress(false), 200);
                                        } else {
                                          setAddressSuggestions([]);
                                        }
                                      }}
                                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none font-sans"
                                      placeholder="Type street, suburb, state or postcode (e.g. George St)..."
                                    />
                                  </div>
                                </div>

                                {/* Autocomplete dropdown suggestions */}
                                {addressSuggestions.length > 0 && (
                                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                                    <div className="bg-red-50 px-2 py-1 text-[8px] font-bold text-red-600 tracking-wider uppercase flex justify-between items-center">
                                      <span>Suggested verified matches</span>
                                      <span>AusPost AMAS Online</span>
                                    </div>
                                    {addressSuggestions.map((item, idy) => (
                                      <button
                                        type="button"
                                        key={idy}
                                        onClick={() => {
                                          setNewAddressInput(item.full);
                                          setAddressDpid(item.dpid);
                                          setAddressAmasStatus("AMAS CERTIFIED");
                                          setAddressSuggestions([]);
                                          toast.success("Verified via Australia Post AMAS Gateway!");
                                        }}
                                        className="w-full text-left p-2 hover:bg-slate-50 flex items-start gap-2 text-xs transition-colors cursor-pointer"
                                      >
                                        <div className="w-4 h-4 rounded bg-red-600/10 flex items-center justify-center font-black text-red-600 text-[8px] flex-shrink-0 mt-0.5">AP</div>
                                        <div>
                                          <p className="font-semibold text-slate-800 leading-tight">{item.street}</p>
                                          <span className="text-[10px] text-slate-400 font-medium block">{item.suburb} {item.state} {item.postcode}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Validation results badge */}
                                {newAddressInput.trim().length > 5 && (
                                  <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-[#06C167]" />
                                      <div>
                                        <span className="font-bold text-slate-800 uppercase block tracking-wider text-[8px]">LOGISTICS ROUTE VALIDATED</span>
                                        <span className="text-slate-500 font-semibold block uppercase">DPID: <span className="font-mono text-slate-900 font-bold">{addressDpid}</span> ({addressAmasStatus})</span>
                                      </div>
                                    </div>
                                    <div className="bg-red-600 text-white font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                                      AUSPOST AMAS
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!newAddressInput.trim()) return toast.error("Please enter a valid address");
                                      const trimmed = newAddressInput.trim();
                                      if (savedAddresses.includes(trimmed)) return toast.error("Address already saved");
                                      setSavedAddresses([...savedAddresses, trimmed]);
                                      setDeliveryAddress(trimmed);
                                      setNewAddressInput("");
                                      setAddressSuggestions([]);
                                      setShowAddAddress(false);
                                      toast.success("AMAS-verified delivery address registered successfully!");
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Verify & Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowAddAddress(false);
                                      setNewAddressInput("");
                                      setAddressSuggestions([]);
                                    }}
                                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase rounded-lg cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowAddAddress(true)}
                                className="text-[#06C167] hover:text-[#05a155] text-[10px] font-black uppercase flex items-center gap-1 pt-1.5 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add Custom Address
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Method Integration */}
                      {cart.length > 0 && (
                        <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                            <CreditCard className="w-4 h-4 text-[#06C167]" /> System Checkout Payment
                          </div>

                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center justify-between">
                              <span>Select Payment Method</span>
                              <span className="text-[8px] bg-red-100 text-red-700 font-heavy px-1.5 py-0.5 rounded-full uppercase">secure gateway</span>
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCheckoutPaymentMethod('vault')}
                                className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer ${
                                  checkoutPaymentMethod === 'vault'
                                    ? 'bg-emerald-50 border-[#06C167] text-[#06C167] shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className="font-sans text-[10px] leading-tight">Valourian Vault</span>
                                <span className="text-[8px] text-slate-400 font-medium font-sans">Sovereign Balance</span>
                              </button>

                              <button
                                type="button"
                                id="payment-card-method-btn"
                                onClick={() => setCheckoutPaymentMethod('card')}
                                className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer ${
                                  checkoutPaymentMethod === 'card'
                                    ? 'bg-emerald-50 border-[#06C167] text-[#06C167] shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className="font-sans text-[10px] leading-tight">Credit/Debit Card</span>
                                <span className="text-[8px] text-slate-400 font-medium font-mono">Linked or New</span>
                              </button>
                            </div>

                            {/* Credit/Debit Card Form with Instant Camera Scanning integration */}
                            {checkoutPaymentMethod === 'card' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-3 bg-white p-3.5 border border-slate-200 rounded-xl mt-2 overflow-hidden"
                              >
                                {linkedCards.length > 0 && (
                                  <div className="space-y-2 pb-3 border-b border-slate-100">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Saved Cards</label>
                                    <select
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#06C167] font-sans cursor-pointer"
                                      value={checkoutCardNumber === '' ? 'new' : 
                                             (linkedCards.find(c => c.cardNumber === checkoutCardNumber || c.id === checkoutCardNumber)?.id || 'new')}
                                      onChange={(e) => {
                                        if (e.target.value === 'new') {
                                           setCheckoutCardNumber("");
                                           setCheckoutExpiry("");
                                           setCheckoutCvv("");
                                           setCheckoutCardholder("");
                                           setCheckoutCardBank("");
                                           setCheckoutCardNetwork("Visa");
                                        } else {
                                          const card = linkedCards.find((c) => c.id === e.target.value);
                                          if (card) {
                                            setCheckoutCardNumber(card.id);
                                            setCheckoutExpiry(card.expiry);
                                            setCheckoutCvv('');
                                            setCheckoutCardholder(card.cardholder);
                                            setCheckoutCardBank(card.bank);
                                            setCheckoutCardNetwork(card.network);
                                          }
                                        }
                                      }}
                                    >
                                      <option value="new">Use a New Card</option>
                                      {linkedCards.map(card => (
                                        <option key={card.id} value={card.id}>
                                          {card.bank.substring(0, 15)}... •••• {card.cardNumber.slice(-4)} ({card.network})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black text-[#06C167] uppercase tracking-widest block font-sans">Sovereign Card Gateway</span>
                                  <button
                                    type="button"
                                    id="scan-checkout-card-btn"
                                    onClick={() => {
                                      setIsScanningFromCheckout(true);
                                      setIsScanningCard(true);
                                      setScanStep("accessing_camera");
                                      setTimeout(() => {
                                        setScanStep("aligning");
                                      }, 1000);
                                    }}
                                    className="p-1 px-2 text-[8px] font-heavy text-white uppercase tracking-wider rounded-lg bg-red-600 hover:bg-red-700 cursor-pointer flex items-center gap-1 font-sans font-black"
                                  >
                                    <Camera className="w-2.5 h-2.5" /> Scan Card
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Cardholder Name</label>
                                    <input
                                      type="text"
                                      placeholder="Mr Asim Aryal"
                                      value={checkoutCardholder}
                                      onChange={(e) => setCheckoutCardholder(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#06C167] font-sans"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Card Number</label>
                                    <input
                                      type="text"
                                      placeholder="4539 •••• •••• 5519"
                                      value={linkedCards.find(c => c.id === checkoutCardNumber)?.cardNumber || checkoutCardNumber}
                                      onChange={(e) => setCheckoutCardNumber(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#06C167]"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Expiry Date</label>
                                      <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={checkoutExpiry}
                                        onChange={(e) => setCheckoutExpiry(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-800 text-center focus:outline-none focus:border-[#06C167]"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">CVV Security Code</label>
                                      <input
                                        type="password"
                                        placeholder="•••"
                                        maxLength={3}
                                        value={checkoutCvv}
                                        onChange={(e) => setCheckoutCvv(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-800 text-center focus:outline-none focus:border-[#06C167]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Bank Issuer</label>
                                      <input
                                        type="text"
                                        placeholder="Commonwealth Bank"
                                        value={checkoutCardBank}
                                        onChange={(e) => setCheckoutCardBank(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-600 font-semibold focus:outline-none font-sans"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Network Token</label>
                                      <select
                                        value={linkedCards.find(c => c.id === checkoutCardNumber)?.network || checkoutCardNetwork}
                                        onChange={(e) => setCheckoutCardNetwork(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] text-slate-600 font-semibold focus:outline-none cursor-pointer font-sans"
                                      >
                                        <option value="Visa">Visa</option>
                                        <option value="Mastercard">Mastercard</option>
                                        <option value="Amex">Amex</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Inline Camera Card Scanner inside Checkout */}
                            {isScanningCard && isScanningFromCheckout && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 relative overflow-hidden space-y-3 mt-2"
                              >
                                <div className="absolute top-1.5 right-1.5 z-20">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsScanningCard(false);
                                      setScanStep("idle");
                                      setIsScanningFromCheckout(false);
                                      setScannedCardData(null);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>

                                <h4 className="text-[9px] font-black uppercase text-red-500 tracking-widest flex items-center gap-1 font-sans">
                                  <span className="w-1 h-1 rounded-full bg-red-500 animate-ping"></span>
                                  SECURE CHECKOUT CAMERA SCANNING ACTIVE
                                </h4>

                                <div className="relative h-36 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col justify-center items-center">
                                  <motion.div
                                    className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444]"
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                  />

                                  <div className="absolute inset-5 border border-dashed border-white/20 rounded flex flex-col items-center justify-between pointer-events-none p-1">
                                    <span className="text-[8px] text-white/50 font-semibold tracking-wider uppercase font-sans">ALIGN CARD FOR DISPATCH CHECKOUT</span>
                                    <div className="w-8 h-5 rounded border border-white/10 self-start"></div>
                                  </div>

                                  {scanStep === "accessing_camera" && (
                                    <div className="text-center space-y-1.5 z-10 px-2">
                                      <Camera className="w-6 h-6 text-red-500 mx-auto animate-pulse" />
                                      <p className="text-[10px] font-semibold text-slate-300 font-sans">Requesting checkout camera permission...</p>
                                    </div>
                                  )}

                                  {scanStep === "aligning" && (
                                    <div className="text-center space-y-1.5 z-10 px-2">
                                      <p className="text-[10px] font-bold text-emerald-400 font-sans">Card outline matched!</p>
                                      <button
                                        type="button"
                                        id="analyze-checkout-frame-btn"
                                        onClick={() => {
                                          setScanStep("ocr_processing");
                                          const banksList = [
                                            { name: "Commonwealth Bank of Australia", bsb: "062-900", network: "Visa", prefix: "4539" },
                                            { name: "Westpac Banking Corporation", bsb: "732-001", network: "Mastercard", prefix: "5108" },
                                            { name: "National Australia Bank", bsb: "082-001", network: "Visa", prefix: "4612" },
                                            { name: "ANZ Banking Group", bsb: "012-002", network: "Visa", prefix: "4916" }
                                          ];
                                          const selectedB = banksList[Math.floor(Math.random() * banksList.length)];
                                          const randomEnd = Math.floor(1000 + Math.random() * 9000);
                                          const randomCardNo = `${selectedB.prefix} 4920 3810 ${randomEnd}`;
                                          const randomExp = `0${Math.floor(1 + Math.random() * 9)}/${Math.floor(27 + Math.random() * 5)}`;
                                          const randomCvv = Math.floor(100 + Math.random() * 900).toString();
                                          
                                          setTimeout(() => {
                                            setScannedCardData({
                                              cardholder: "Mr Asim Aryal",
                                              cardNumber: randomCardNo,
                                              expiry: randomExp,
                                              cvv: randomCvv,
                                              bank: selectedB.name,
                                              bsb: selectedB.bsb,
                                              accountNumber: Math.floor(10000000 + Math.random() * 90000000).toString(),
                                              network: selectedB.network
                                            });
                                            setScanStep("completed");
                                            toast.success("Checkout Card details scanned & extracted!");
                                          }, 1500);
                                        }}
                                        className="mt-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase rounded transition-colors cursor-pointer font-sans"
                                      >
                                        Analyze Frame
                                      </button>
                                    </div>
                                  )}

                                  {scanStep === "ocr_processing" && (
                                    <div className="text-center space-y-1.5 z-10">
                                      <RefreshCw className="w-5 h-5 text-red-500 mx-auto animate-spin" />
                                      <p className="text-[10px] font-bold text-slate-300 font-sans">Processing Sovereign AI OCR parser...</p>
                                    </div>
                                  )}

                                  {scanStep === "completed" && scannedCardData && (
                                    <div className="text-center space-y-0.5 z-10 bg-slate-900/95 p-2 rounded-lg border border-white/10">
                                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-center font-sans">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SCAN COMPLETE
                                      </p>
                                      <p className="text-[10px] font-bold text-white font-sans">{scannedCardData.bank}</p>
                                      <span className="text-[9px] font-mono text-slate-300 font-bold block">{scannedCardData.cardNumber}</span>
                                    </div>
                                  )}
                                </div>

                                {scanStep === "completed" && scannedCardData && (
                                  <button
                                    type="button"
                                    id="populate-scanned-details-btn"
                                    onClick={() => {
                                      setCheckoutCardNumber(scannedCardData.cardNumber);
                                      setCheckoutExpiry(scannedCardData.expiry);
                                      setCheckoutCvv(scannedCardData.cvv);
                                      setCheckoutCardholder(scannedCardData.cardholder);
                                      setCheckoutCardBank(scannedCardData.bank);
                                      setCheckoutCardNetwork(scannedCardData.network);
                                      setIsScanningCard(false);
                                      setScanStep("idle");
                                      setIsScanningFromCheckout(false);
                                      setScannedCardData(null);
                                      toast.success("Payment details populated instantly with scanned card!");
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase py-2 rounded-lg transition-colors cursor-pointer text-center font-sans"
                                  >
                                    Populate Payment Details
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isProcessing || cart.length === 0}
                        className="w-full bg-[#06C167] text-white font-heavy uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-[#05a155] transition-colors disabled:opacity-50 shadow-md font-black cursor-pointer"
                      >
                        {isProcessing ? "Processing Vault Debits..." : "Authenticate order payment"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search and Sort controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search restaurants by name or cuisine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#06C167] focus:border-[#06C167] font-sans"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black transition-all text-center uppercase tracking-wider rounded-xl border font-sans cursor-pointer ${
                          showOnlyFavorites 
                            ? "bg-rose-500 text-white border-rose-500 shadow-sm" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white' : 'text-slate-400'}`} />
                        Favorites {showOnlyFavorites ? "On" : "Off"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowOnly24Hours(!showOnly24Hours)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black transition-all text-center uppercase tracking-wider rounded-xl border font-sans cursor-pointer ${
                          showOnly24Hours 
                            ? "bg-[#06C167] text-white border-[#06C167] shadow-sm" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 ${showOnly24Hours ? 'text-white animate-pulse' : 'text-slate-400'}`} />
                        24 Hours {showOnly24Hours ? "On" : "Off"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">Sort:</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#06C167] font-sans pr-8 cursor-pointer"
                          style={{ appearance: 'auto' }}
                        >
                          <option value="name">Alphabetical</option>
                          <option value="rating">Top Rated</option>
                          <option value="deliveryTime">Fastest Delivery</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Saved Favorites Quick Re-Order Section */}
                  {favorites.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-100 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" /> Re-Order Saved Favorites
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold font-sans">{favorites.length} Saved</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                        {RESTAURANTS.filter(r => favorites.includes(r.id)).map(r => (
                          <div 
                            key={r.id} 
                            onClick={() => setSelectedRestaurant(r)}
                            className="bg-white hover:border-emerald-200 border border-slate-200 p-3 rounded-xl flex items-center gap-3 cursor-pointer shrink-0 hover:shadow-sm transition-all select-none"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                              <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-slate-950 leading-tight">{r.name}</h4>
                              <span className="text-[10px] text-slate-500 block font-sans">{r.cuisine} • {r.deliveryTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredRestaurants.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 italic text-sm">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No restaurants match your search query. Try typing another name!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRestaurants.map(r => (
                        <div key={r.id} onClick={() => setSelectedRestaurant(r)} className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
                           <div className="h-32 bg-slate-200 relative overflow-hidden">
                              <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              {r.is24Hours && (
                                <div className="absolute top-2 left-2 bg-emerald-500 border border-emerald-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 z-10">
                                  <Clock className="w-2.5 h-2.5" /> 24/7
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex flex-col gap-2">
                                <button 
                                  onClick={(e) => toggleFavorite(e, r.id)}
                                  className="bg-white p-2 rounded-full shadow-sm hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
                                >
                                   <Heart className={`w-4 h-4 ${favorites.includes(r.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                                </button>
                              </div>
                              <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-[10px] font-black shadow-sm flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {r.rating}
                              </div>
                           </div>
                           <div className="p-4 flex flex-col justify-between flex-1">
                              <div>
                                 <h3 className="font-extrabold text-slate-900 text-base">{r.name}</h3>
                                 <p className="text-slate-500 text-xs mt-1">{r.cuisine} • {r.deliveryTime}</p>
                              </div>
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-[10px] text-slate-500 leading-tight">
                                  <span className="font-bold text-slate-700 block text-[9px] uppercase tracking-wider">Popular</span>
                                  {r.menu[0].name} (${r.menu[0].price})
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCart([...cart, r.menu[0]]);
                                    toast.success(`Quick Added ${r.menu[0].name} to cart!`, { icon: '🛒' });
                                  }}
                                  className="bg-[#06C167] hover:bg-[#05a155] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  Quick Add
                                </button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Voucher Area */}
                  <div className="bg-slate-950 rounded-2xl p-6 text-white mt-4 border border-slate-800 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Gift className="w-32 h-32" />
                    </div>
                    <h3 className="text-xl font-black mb-1 relative z-10 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#06C167]" /> Send Corporate E-Voucher
                    </h3>
                    <p className="text-slate-400 mb-6 text-xs relative z-10">Email an Uber Eats digital cash voucher directly to family, colleagues, or strategic stakeholders.</p>
                    
                    <form onSubmit={handleSendVoucher} className="flex flex-col sm:flex-row gap-2 max-w-lg relative z-10">
                      <input 
                        type="email" 
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="Recipient Email" 
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-[#06C167] outline-none text-xs text-slate-100"
                        required
                      />
                      <div className="relative w-full sm:w-28 flex-shrink-0">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                         <input 
                           type="number" 
                           value={voucherAmount}
                           onChange={(e) => setVoucherAmount(Number(e.target.value))}
                           className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-4 py-2 font-black focus:ring-2 focus:ring-[#06C167] outline-none text-xs text-slate-100 font-mono"
                           required
                         />
                      </div>
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className="bg-[#06C167] hover:bg-[#05a155] text-white py-2 px-5 rounded-xl font-heavy text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 font-bold"
                      >
                        Send <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 4: Aussie Cards & Transfers (Vault Payments) */}
          {activeTab === 'cards' && (
            <motion.div
              key="cards-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Cards Showcase Panel */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                      <CreditCard className="w-5 h-5 text-[#06C167]" /> Linked Australian Cards
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure tokenised debit/credit gateways</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsScanningCard(true);
                      setScanStep("accessing_camera");
                      setTimeout(() => {
                        setScanStep("aligning");
                      }, 1000);
                    }}
                    className="p-2 py-1.5 bg-red-650 hover:bg-red-700 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm font-sans"
                  >
                    <Camera className="w-3.5 h-3.5" /> Scan Card via Camera
                  </button>
                </div>

                {isScanningCard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 relative overflow-hidden space-y-4"
                  >
                    <div className="absolute top-2 right-2 z-20">
                      <button
                        onClick={() => {
                          setIsScanningCard(false);
                          setScanStep("idle");
                        }}
                        className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white cursor-pointer"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      SECURE CAMERA-BASED CARD SCANNER ACTIVE
                    </h4>

                    {/* Scanner Screen Frame */}
                    <div className="relative h-44 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-center items-center">
                      {/* Grid Scanning Laser Lines */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      />

                      {/* Align Guides */}
                      <div className="absolute inset-8 border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-between pointer-events-none p-2">
                        <span className="text-[9px] text-white/50 font-semibold tracking-wider uppercase font-sans">ALIGN CARD DETAILS INSIDE BOX</span>
                        <div className="w-10 h-7 rounded border border-white/20 self-start"></div>
                      </div>

                      {/* Scanner States Feedback */}
                      {scanStep === "accessing_camera" && (
                        <div className="text-center space-y-2 z-10 px-4">
                          <Camera className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
                          <p className="text-xs font-semibold text-slate-300 font-sans">Requesting full security camera privileges...</p>
                        </div>
                      )}

                      {scanStep === "aligning" && (
                        <div className="text-center space-y-2 z-10 px-4">
                          <p className="text-xs font-bold text-emerald-400 font-sans">Card outline matched! Keep steady...</p>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">Scanning Holograms & Chip BIN numbers</span>
                          <button
                            type="button"
                            onClick={() => {
                              setScanStep("ocr_processing");
                              const banksList = [
                                { name: "Commonwealth Bank of Australia", bsb: "062-900", network: "Visa", prefix: "4539" },
                                { name: "Westpac Banking Corporation", bsb: "732-001", network: "Mastercard", prefix: "5108" },
                                { name: "National Australia Bank", bsb: "082-001", network: "Visa", prefix: "4612" },
                                { name: "ANZ Banking Group", bsb: "012-002", network: "Visa", prefix: "4916" }
                              ];
                              const selectedB = banksList[Math.floor(Math.random() * banksList.length)];
                              const randomEnd = Math.floor(1000 + Math.random() * 9000);
                              const randomCardNo = `${selectedB.prefix} •••• •••• ${randomEnd}`;
                              const randomExp = `0${Math.floor(1 + Math.random() * 9)}/${Math.floor(27 + Math.random() * 5)}`;
                              const randomCvv = Math.floor(100 + Math.random() * 900).toString();
                              
                              setTimeout(() => {
                                setScannedCardData({
                                  cardholder: "Mr Asim Aryal",
                                  cardNumber: randomCardNo,
                                  expiry: randomExp,
                                  cvv: randomCvv,
                                  bank: selectedB.name,
                                  bsb: selectedB.bsb,
                                  accountNumber: Math.floor(10000000 + Math.random() * 90000000).toString(),
                                  network: selectedB.network
                                });
                                setScanStep("completed");
                                toast.success("Australian Issued Card elements successfully scanned & extracted!");
                              }, 1500);
                            }}
                            className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer font-sans"
                          >
                            Analyze Frame
                          </button>
                        </div>
                      )}

                      {scanStep === "ocr_processing" && (
                        <div className="text-center space-y-2 z-10">
                          <RefreshCw className="w-8 h-8 text-red-500 mx-auto animate-spin" />
                          <p className="text-xs font-bold text-slate-300 font-sans">Executing Sovereign AI OCR parser...</p>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Decoding ISO/IEC 7812 identifiers</span>
                        </div>
                      )}

                      {scanStep === "completed" && scannedCardData && (
                        <div className="text-center space-y-1 z-10 bg-slate-900/90 p-3 rounded-xl border border-white/10">
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-center font-sans">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SCAN COMPLETE
                          </p>
                          <p className="text-xs font-bold text-white font-sans">{scannedCardData.bank}</p>
                          <span className="text-[10px] font-mono text-slate-300 font-bold block">{scannedCardData.cardNumber} | Exp: {scannedCardData.expiry}</span>
                        </div>
                      )}
                    </div>

                    {scanStep === "completed" && scannedCardData && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-slate-200"
                      >
                        <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-sans">Configure Scanning Transfer Parameters</h5>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-sans">AUSTRALIAN BSB NUMBER</label>
                            <input
                              type="text"
                              value={scannedCardData.bsb}
                              onChange={(e) => setScannedCardData({ ...scannedCardData, bsb: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-sans">AUSTRALIAN ACCOUNT NO.</label>
                            <input
                              type="text"
                              maxLength={9}
                              value={scannedCardData.accountNumber}
                              onChange={(e) => setScannedCardData({ ...scannedCardData, accountNumber: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newCard = {
                                id: `card-${Date.now()}`,
                                cardholder: scannedCardData.cardholder,
                                cardNumber: scannedCardData.cardNumber,
                                expiry: scannedCardData.expiry,
                                cvv: scannedCardData.cvv,
                                bank: scannedCardData.bank,
                                bsb: scannedCardData.bsb,
                                accountNumber: scannedCardData.accountNumber,
                                balance: 0,
                                network: scannedCardData.network,
                              };
                              setLinkedCards([...linkedCards, newCard]);
                              setIsScanningCard(false);
                              setScanStep("idle");
                              setScannedCardData(null);
                              toast.success(`Success! Fully-validated ${newCard.bank} debit card successfully tokenised.`);
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase py-2 rounded-lg transition-colors cursor-pointer text-center font-sans"
                          >
                            Link Tokenised Card
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setScanStep("aligning");
                              setScannedCardData(null);
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer font-sans"
                          >
                            Rescan
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Grid layout of linked cards in Australia style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedCards.map((card) => {
                    const isCBA = card.bank.includes("Commonwealth");
                    const isWestpac = card.bank.includes("Westpac");
                    const isANZ = card.bank.includes("ANZ");
                    const isNAB = card.bank.includes("National");

                    const cardBg = isCBA 
                      ? "bg-gradient-to-br from-amber-400 via-amber-550 to-amber-600 text-slate-900" 
                      : isWestpac 
                      ? "bg-gradient-to-br from-red-650 via-rose-700 to-red-800 text-white" 
                      : isANZ
                      ? "bg-gradient-to-br from-sky-600 via-indigo-700 to-sky-900 text-white"
                      : isNAB
                      ? "bg-gradient-to-br from-slate-800 via-zinc-900 to-black text-white"
                      : "bg-gradient-to-br from-emerald-600 to-teal-850 text-white";

                    return (
                      <div
                        key={card.id}
                        className={`p-5 rounded-2xl relative overflow-hidden shadow-md flex flex-col justify-between min-h-36 ${cardBg}`}
                      >
                        <div className="flex justify-between items-start z-10">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest block opacity-75 font-sans">POLICIED AUSTRALIAN SYSTEM</span>
                            <h4 className="font-black text-xs uppercase leading-tight font-sans">{card.bank}</h4>
                          </div>
                          <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-tighter font-sans">
                            {card.network}
                          </span>
                        </div>

                        <div className="my-3 z-10">
                          <p className="text-sm font-semibold tracking-wider font-mono">{card.cardNumber}</p>
                        </div>

                        <div className="flex justify-between items-end z-10 border-t border-white/20 pt-2 text-[10px] gap-2">
                          <div className="truncate">
                            <span className="text-[7px] font-black uppercase block opacity-70 font-sans">CARDHOLDER</span>
                            <span className="font-bold uppercase tracking-tight block truncate font-sans">{card.cardholder}</span>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-[7px] font-black uppercase block opacity-70 font-sans">BSB & Acct</span>
                            <span className="font-mono font-bold block">{card.bsb} • {card.accountNumber}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[7px] font-black uppercase block opacity-70 font-sans">Card Balance</span>
                            <span className="font-mono font-bold text-xs block">${card.balance.toFixed(2)} AUD</span>
                          </div>
                        </div>

                        {/* background symbol watermark */}
                        <div className="absolute right-4 bottom-1/2 translate-y-2 opacity-30 select-none pointer-events-none">
                          <CreditCard className="w-16 h-16" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secure instant NPP transfer direct payout form */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                    <Send className="w-5 h-5 text-red-600" /> Liquidate Sovereign Treasury to Card
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Instant settlement to Australian debit/credit accounts via Osko / NPP</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[10px] text-amber-800 font-semibold space-y-1 leading-normal font-sans">
                  <p className="uppercase font-black text-amber-900 tracking-wider">Australian Interbank Transfer Regulation</p>
                  <p>Outgoing disbursements are processed as continuous real-time settlements. Linked card accounts will receive AUD deposits within 30 seconds of clearance authentication.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payout controls */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">1. Select Target Card Account</label>
                      <select
                        value={transferTargetId}
                        onChange={(e) => setTransferTargetId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 font-semibold font-sans cursor-pointer"
                      >
                        {linkedCards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.bank} — •••• {c.cardNumber.substring(c.cardNumber.length-4)} ({c.bsb}) (${c.balance.toFixed(2)} AUD)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">2. Enter Transfer Amount (AUD)</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={transferAmountInput}
                          onChange={(e) => setTransferAmountInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-400">$</span>
                        <span className="absolute right-3 top-3 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black font-sans">AUD</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase pl-1 font-sans">
                        Sovereign Treasury Wallet: ${(balances.AUD || 0).toFixed(2)} AUD Available
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">3. Transaction Reference Code</label>
                      <input
                        type="text"
                        placeholder="e.g. Sovereign Settlement Payout"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isTransferring || !transferAmountInput || Number(transferAmountInput) <= 0}
                      onClick={async () => {
                        const amount = Number(transferAmountInput);
                        if (isNaN(amount) || amount <= 0) return toast.error("Please enter a valid transfer amount");
                        if ((balances.AUD || 0) < amount) {
                          return toast.error("Insufficient funds in Sovereign Treasury balance.");
                        }

                        const targetCard = linkedCards.find((c) => c.id === transferTargetId);
                        if (!targetCard) return toast.error("Target card account not found.");

                        const tId = toast.loading(`Initiating Osko settlement of $${amount.toFixed(2)} AUD to standard card accounts...`);
                        setIsTransferring(true);
                        try {
                          await new Promise((resolve) => setTimeout(resolve, 2000));

                          const updatedBal = {
                            ...balances,
                            AUD: (balances.AUD || 0) - amount
                          };
                          
                          if (user && user.uid) {
                            await updateDoc(doc(db, "users", user.uid), { balances: updatedBal });
                          }
                          setBalances(updatedBal);

                          setLinkedCards(linkedCards.map((c) => {
                            if (c.id === transferTargetId) {
                              return { ...c, balance: c.balance + amount };
                            }
                            return c;
                          }));

                          await addDoc(collection(db, "transactions"), {
                            userId: user?.uid || "anonymous",
                            amount: -amount,
                            currency: "AUD",
                            date: new Date().toISOString(),
                            recipient: `${targetCard.bank} - NPP Payout`,
                            type: "card",
                            status: "completed",
                            description: `Liquidity transfer to Australian card ${targetCard.cardNumber} (${targetCard.cardholder}) BSB: ${targetCard.bsb} Acct: ${targetCard.accountNumber} Ref: ${transferReference}`
                          });

                          toast.dismiss(tId);
                          toast.success(`Instant NPP / OSKO Transfer Delivered Successfully back to ${targetCard.bank}! Funds are immediately available on ${targetCard.cardholder}'s account.`);
                          setTransferAmountInput("");
                        } catch (err) {
                          console.error(err);
                          toast.dismiss(tId);
                          toast.error("Osko interbank clearing gateway timeout. Retry in a few seconds.");
                        } finally {
                          setIsTransferring(false);
                        }
                      }}
                      className="w-full bg-red-650 hover:bg-red-700 bg-red-650 hover:bg-red-700 text-white font-heavy uppercase tracking-widest text-xs py-3 rounded-xl transition-colors disabled:opacity-50 shadow-md font-black cursor-pointer text-center font-sans"
                    >
                      {isTransferring ? "Processing NPP Clearings..." : "Authorize NPP Instant Transfer"}
                    </button>
                  </div>

                  {/* Receipt Preview */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase block border-b border-slate-200 pb-1.5 font-sans">NPP OSKO Clearance Outline</span>
                    
                    <div className="space-y-2 flex-1 pt-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-sans">Processing Interbank:</span>
                        <span className="text-slate-800 font-bold font-sans">NPP Australia Node</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-sans">Method Code:</span>
                        <span className="text-emerald-600 font-extrabold flex items-center gap-1 font-sans">OSKO Instant <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span></span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-sans">Sender Source:</span>
                        <span className="text-slate-800 font-mono">Valourian Vault</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-sans">Recipient Bank:</span>
                        <span className="text-slate-800 font-sans">{linkedCards.find((c)=>c.id === transferTargetId)?.bank || "Not Selected"}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-sans">Target BSB/Acct Number:</span>
                        <span className="text-slate-800 font-mono font-bold">
                          {linkedCards.find((c)=>c.id === transferTargetId)?.bsb} • {linkedCards.find((c)=>c.id === transferTargetId)?.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold pt-1 border-t border-slate-200">
                        <span className="text-slate-500 font-sans">Disbursed Amount:</span>
                        <span className="text-slate-900 font-mono font-bold">${Number(transferAmountInput || 0).toFixed(2)} AUD</span>
                      </div>
                    </div>

                    <div className="bg-slate-100 p-2.5 rounded-xl text-[9px] text-slate-500 leading-normal flex items-start gap-1.5 border border-slate-250 font-semibold uppercase tracking-wider font-sans">
                      <ShieldCheck className="w-4 h-4 text-[#06C167] flex-shrink-0 mt-0.5" />
                      <span>APRA compliant cryptographically-signed interbank settlement voucher.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Order History */}
          {activeTab === 'history' && (
            <motion.div
              key="history-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-[#06C167]" /> Elite Order History
                </h3>
                <button 
                  onClick={loadOrderHistory} 
                  disabled={isLoadingHistory}
                  className="p-1 px-3 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-colors text-[10px] uppercase font-black tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingHistory ? 'animate-spin' : ''}`} /> Sync History
                </button>
              </div>

              {/* Data Visualization with Recharts */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    Sovereign Monthly Spending Trend (AUD)
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Live Insights
                  </span>
                </div>
                
                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={(() => {
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        const baseData = [
                          { name: "Jan", Spend: 120 },
                          { name: "Feb", Spend: 280 },
                          { name: "Mar", Spend: 190 },
                          { name: "Apr", Spend: 410 },
                          { name: "May", Spend: 310 },
                          { name: "Jun", Spend: 150 }
                        ];

                        pastOrders.forEach(order => {
                          if (!order.date) return;
                          const d = new Date(order.date);
                          const mName = monthNames[d.getMonth()];
                          const amt = Math.abs(order.amount);
                          
                          const found = baseData.find(item => item.name === mName);
                          if (found) {
                            found.Spend += amt;
                          } else {
                            baseData.push({ name: mName, Spend: amt });
                          }
                        });

                        return baseData;
                      })()} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06C167" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06C167" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} stroke="#94a3b8" />
                      <YAxis fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', background: '#0f172a', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(value: any) => [`$${value} AUD`, 'Total Spend']}
                      />
                      <Area type="monotone" dataKey="Spend" stroke="#06C167" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* History Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search previous orders by restaurant, item, or date..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-[#06C167] focus:border-[#06C167] font-sans shadow-sm"
                />
              </div>

              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#06C167] border-t-transparent rounded-full animate-spin"></span>
                  Reading secure transactions...
                </div>
              ) : (() => {
                const filteredOrders = pastOrders.filter((order) => {
                  const term = historySearchTerm.toLowerCase().trim();
                  if (!term) return true;
                  
                  const recipientMatches = order.recipient?.toLowerCase().includes(term);
                  const descMatches = order.description?.toLowerCase().includes(term);
                  
                  const orderDateString = new Date(order.date).toLocaleDateString("en-AU", {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).toLowerCase();
                  const dateMatches = orderDateString.includes(term);

                  const itemsMatches = order.items?.some((it: any) => it.name?.toLowerCase().includes(term));

                  return recipientMatches || descMatches || dateMatches || itemsMatches;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="bg-white p-8 border border-slate-200 rounded-2xl text-center text-slate-400 text-sm italic">
                      No matching transaction entries found.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const orderDate = new Date(order.date).toLocaleDateString("en-AU", {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-[#06C167] text-md">{order.recipient}</h4>
                              <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">{orderDate}</span>
                            </div>
                            <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-full ${
                              order.amount < 0 
                                ? 'bg-red-50 text-red-600' 
                                : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {order.amount < 0 ? '-' : '+'}${Math.abs(order.amount).toFixed(2)}
                            </span>
                          </div>

                          {/* Display delivery details if they exist */}
                          {order.deliveryAddress && (
                            <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#06C167] flex-shrink-0" />
                              <span className="truncate">Delivered to: {order.deliveryAddress}</span>
                            </div>
                          )}

                          {/* Display items details */}
                          {order.items && order.items.length > 0 ? (
                            <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Ordered Gastronomy Items</span>
                              <div className="space-y-1">
                                {order.items.map((it: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-xs text-slate-600">
                                    <span>{it.name}</span>
                                    <span className="font-mono font-bold">${it.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="border-t border-slate-100 pt-2.5">
                              <p className="text-xs text-slate-500 italic font-medium">{order.description}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50/50 p-1.5 px-3 rounded-lg border border-emerald-100/50 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            SOVEREIGN TRANSACTION SECURELY ENCRYPTED
                          </div>

                          {/* Re-order Functionality */}
                          {order.items && order.items.length > 0 && order.recipient?.includes("Uber Eats") && (
                            <div className="pt-3 border-t border-slate-100 flex justify-end">
                              <button
                                onClick={() => {
                                  // Extract restaurant name safely (format is usually "Uber Eats - Restaurant Name" or "Uber Eats Scheduled - Restaurant Name")
                                  const nameParts = order.recipient.split("-");
                                  const rName = nameParts.length > 1 ? nameParts[1].trim() : nameParts[0];
                                  
                                  const matchRes = RESTAURANTS.find(r => r.name.toLowerCase() === rName.toLowerCase());
                                  if (!matchRes) {
                                    toast.error(`Cannot find restaurant '${rName}' in current system.`);
                                    return;
                                  }
                                  
                                  // Find specific items or map closest prices
                                  const newCartItems = order.items.map((it: any) => {
                                      return {
                                          name: it.name,
                                          price: it.price,
                                          id: `reorder_${Math.random()}`
                                      };
                                  });
                                  
                                  setCart(newCartItems);
                                  setSelectedRestaurant(matchRes);
                                  setActiveTab('order');
                                  toast.success(`Restored ${newCartItems.length} items from previous order.`);
                                  // Auto-open checkout modal after a slight delay
                                  setTimeout(() => {
                                      if (newCartItems.length > 0) {
                                          setShowConfirmModal(true);
                                      }
                                  }, 300);
                                }}
                                className="px-4 py-2 bg-[#06C167] text-white hover:bg-[#05a155] active:bg-[#048243] rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                              >
                                Re-Order Items
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </motion.div>
          )}

           {/* TAB 3: Track Active Order */}
          {activeTab === 'track' && (
            <motion.div
              key="track-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {activeOrder ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <span className="text-[#06C167] text-[10px] font-black uppercase tracking-widest">Active System Tracking</span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{activeOrder.restaurantName}</h3>
                      <p className="text-[11px] text-slate-500 leading-none mt-1">Autonomous VIP Delivery In Progress</p>
                      
                      {/* View Map Toggle Button */}
                      <button
                        id="toggle-delivery-map-btn"
                        onClick={() => setShowTrackingMap(!showTrackingMap)}
                        className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black tracking-widest rounded-xl border uppercase font-sans cursor-pointer transition-all ${
                          showTrackingMap 
                            ? "bg-[#06C167] border-[#06c167] text-white hover:bg-[#05a155] shadow-xs" 
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        {showTrackingMap ? "Hide Map" : "View Map"}
                      </button>
                    </div>
                      <div className="flex items-center gap-2">
                        
                        <div className="text-right flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">Est. Remaining</span>
                            <span className="text-xl font-bold font-mono text-[#06C167] animate-pulse">
                              {activeOrder.secondsRemaining > 0 
                                ? `${activeOrder.secondsRemaining}s` 
                                : "Delivered!"
                              }
                            </span>
                          </div>
                          {/* D3 Timer Ring */}
                          <div className="w-10 h-10 relative flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle 
                                cx="20" cy="20" r="16" 
                                className="stroke-slate-100" 
                                strokeWidth="4" 
                                fill="none" 
                              />
                              <circle 
                                cx="20" cy="20" r="16" 
                                className="stroke-[#06C167] transition-all duration-1000 ease-linear" 
                                strokeWidth="4" 
                                fill="none" 
                                strokeDasharray="100.53" 
                                strokeDashoffset={100.53 * (1 - (activeOrder.secondsRemaining / 120))} 
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Real-time Leaflet GIS Delivery Tracker Map */}
                  <AnimatePresence>
                    {showTrackingMap && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`relative delivery-map-container transition-all duration-300 bg-white ${isMapExpanded ? 'fixed inset-4 z-[100] h-auto rounded-3xl shadow-2xl !mt-0 p-4' : 'overflow-hidden rounded-xl border border-slate-200'}`}
                      >
                        {isMapExpanded && (
                          <style>{`
                            .delivery-map-container > div.space-y-4 { height: 100% !important; display: flex; flex-direction: column; }
                            .delivery-map-container .relative.overflow-hidden.bg-slate-50 { flex: 1 !important; height: auto !important; border-radius: 1rem; }
                            #delivery-map { height: 100% !important; border-radius: 1rem; }
                          `}</style>
                        )}
                        <button
                          id="expand-delivery-map-btn"
                          onClick={() => {
                            setIsMapExpanded(!isMapExpanded);
                            if (!isMapExpanded) {
                              document.body.style.overflow = 'hidden';
                            } else {
                              document.body.style.overflow = '';
                            }
                          }}
                          className={`absolute top-4 right-4 z-[1000] bg-white text-slate-700 hover:text-black px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg border border-slate-200 cursor-pointer`}
                        >
                          {isMapExpanded ? 'Collapse Map' : 'Expand Map'}
                        </button>
                        <DeliveryMap 
                          restaurantName={activeOrder.restaurantName} 
                          progress={activeOrder.progress} 
                          latitude={activeOrder.latitude}
                          longitude={activeOrder.longitude}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* D3-Animated Dynamic Progress Bar & Tracker UI */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#06C167] animate-ping"></span>
                        Real-time D3 Tracker
                      </span>
                      <span className="font-mono font-bold text-[#06C167] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 shadow-2xs">
                        {activeOrder.progress}% Completed
                      </span>
                    </div>
                    
                    <D3ProgressBar progress={activeOrder.progress} status={activeOrder.status} />
                  </div>

                  {/* Status Message Details */}
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-1.5 shadow-md col-span-1">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block leading-none">Sub-Ledger Dispatch Details</span>
                    <p className="text-xs font-medium font-sans">
                      {activeOrder.status === 'ordered' && "Unilateral Treasury Clearance OK. Dispatching request route files directly to partner."}
                      {activeOrder.status === 'preparing' && "Elite chef assembling gastronomy provisions. Staging dedicated autonomous vehicle variant."}
                      {activeOrder.status === 'transit' && "Model Y autonomous transport actively traversing Sydney CBD. Quantum laser routing enabled."}
                      {activeOrder.status === 'delivered' && "Safe deposit finalized. Order signed and delivered under digital signature verification."}
                    </p>
                    <div className="pt-2 border-t border-slate-800 font-mono text-[9px] text-slate-500 flex justify-between">
                       <span>SECURITY REF: VC-ETA-9942</span>
                       <span>PLATFORM: COPA-9 SECTOR 3</span>
                    </div>
                  </div>

                  {/* Secure Twilio Voice Bridge Calling Panel */}
                  {activeOrder.status !== 'delivered' && (
                    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-sky-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-[#06C167] text-white font-heavy tracking-widest px-1.5 py-0.5 rounded uppercase leading-none font-sans">Twilio SECURE</span>
                          <span className="text-[8px] bg-sky-600 text-white font-heavy tracking-widest px-1.5 py-0.5 rounded uppercase leading-none font-sans">Voice Proxy</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800">Secure Courier Voice Bridge</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Direct encrypted bridge protects customer/driver personal phone numbers</p>
                      </div>
                      <button
                        type="button"
                        id="twilio-voice-dial-btn"
                        onClick={handleStartVoiceBridgeCall}
                        className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap self-stretch sm:self-auto text-center"
                      >
                        <Phone className="w-3.5 h-3.5 animate-pulse" /> Call Delivery Partner
                      </button>
                    </div>
                  )}

                  {/* Cancel Button - Allowed only if status is NOT transit or delivered */}
                  <div className="pt-2">
                    {activeOrder.status !== 'transit' && activeOrder.status !== 'delivered' ? (
                      <button
                        onClick={handleCancelOrder}
                        disabled={isProcessing}
                        className="w-full py-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-xl font-heavy uppercase tracking-widest text-xs font-black transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Order (Instant AUD Refund)
                      </button>
                    ) : activeOrder.status === 'delivered' ? (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl text-xs font-bold justify-center">
                        <ShieldCheck className="w-4 h-4 animate-bounce" /> Unilateral delivery handoff confirmed successfully.
                      </div>
                    ) : (
                      <div className="bg-amber-50 text-amber-600 border border-amber-100 p-3 rounded-xl text-xs font-bold text-center">
                        🔒 Order past preparing phase (In Transit); bypass cancellation disabled.
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">No Active Deliveries</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      No live gastronomy dispatches currently in transit. Command an elite autonomous food airlift in the Restaurants menu!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('order')}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#06C167] hover:bg-[#05a155] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Browse Gastronomy List <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Scheduled Orders Pipeline */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#06C167]" /> Future Dispatch Pipeline
                    </h3>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">Sovereign Future Logistics</p>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-[#06C167] bg-[#06C167]/10 px-2.5 py-0.5 rounded-full">
                    {scheduledOrders.length} Pending
                  </span>
                </div>

                {isLoadingScheduled ? (
                  <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-[#06C167] border-t-transparent rounded-full animate-spin"></span>
                    Syncing scheduled pipeline...
                  </div>
                ) : scheduledOrders.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs italic">
                    No future procurements scheduled on the ledger.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {scheduledOrders.map((ord) => {
                      const schedDate = new Date(ord.scheduledTime);
                      const formattedDate = schedDate.toLocaleDateString("en-AU", {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div key={ord.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 shadow-2xs relative overflow-hidden">
                          <div className="absolute top-0 right-0 h-1 w-20 bg-[#06C167]"></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-[#06C167] text-sm">{ord.restaurantName}</h4>
                              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                                <Clock className="w-3.5 h-3.5 text-[#06C167]" />
                                Deliver on: <span className="font-mono text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-black">{formattedDate}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelScheduledOrder(ord)}
                              disabled={isProcessing}
                              className="p-1.5 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-400 hover:text-rose-600 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Cancel Scheduled Dispatch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="border-t border-slate-200/60 pt-2.5 space-y-1 rounded-sm">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Provisions</span>
                            <div className="space-y-1">
                              {ord.items && ord.items.map((it: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-xs text-slate-650">
                                  <span>{it.name}</span>
                                  <span className="font-mono font-bold text-slate-800">${it.price} AUD</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {ord.deliveryAddress && (
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#06C167] flex-shrink-0 mt-0.5" />
                              <span className="leading-tight">Airlift target: {ord.deliveryAddress}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center bg-[#06C167]/5 px-3 py-1.5 rounded-xl border border-[#06C167]/10 text-[9px] text-[#06C167] font-black uppercase">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Pre-authorized Sovereign Lock
                            </span>
                            <span className="font-mono text-xs text-slate-900">${ord.total} AUD</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 25 }}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-6 relative"
            >
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
               >
                 <XCircle className="w-5 h-5" />
               </button>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-[#06C167]/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#06C167]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-none">Order Verification</h3>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Uber Eats Sovereign Vault Checkout</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Selected Food Items</span>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-700">
                        <span className="font-semibold">{item.name}</span>
                        <span className="font-mono font-bold text-slate-900">${item.price} AUD</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Real-time Delivery Address</span>
                    <p className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs font-semibold text-slate-700 leading-normal flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-[#06C167] flex-shrink-0 mt-0.5" />
                      {deliveryAddress}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Receipt Contact Address</span>
                    <p className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs font-semibold font-mono text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {confirmationEmail}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Receipt Contact Phone</span>
                    <p className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs font-bold font-mono text-emerald-600 bg-emerald-50/50 justify-between items-center flex gap-1.5">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {customerPhone}
                      </span>
                      <span className="text-[8.5px] bg-emerald-100 px-1.5 py-0.5 rounded/default uppercase font-black text-emerald-700">verified stay profile</span>
                    </p>
                  </div>
                </div>

                {/* Driver Tipping Selector */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">Add Delivery Partner Tip</span>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPercentage(pct)}
                        className={`py-2 text-xs font-black rounded-xl border transition-all ${
                          tipPercentage === pct
                            ? "bg-[#06C167] border-[#06C167] text-white shadow-md shadow-emerald-500/10"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {pct === 0 ? "None" : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voucher / Coupon System */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">Apply Corporate E-Voucher</span>
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-[#06C167]" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight font-mono">{appliedVoucher.code}</p>
                          <span className="text-[10px] text-emerald-700 font-semibold block">-${appliedVoucher.amount.toFixed(2)} AUD applied</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAppliedVoucher(null)}
                        className="text-slate-500 hover:text-slate-700 text-[9px] font-extrabold uppercase bg-white border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Voucher code (e.g. UBEREATS-VCS-9942)"
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#06C167] font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!voucherCodeInput.trim()) return toast.error("Please enter a voucher code");
                          const code = voucherCodeInput.trim().toUpperCase();
                          const tId = toast.loading("Checking sovereign voucher ledger...");
                          try {
                            const qV = query(collection(db, "vouchers"), where("code", "==", code));
                            const snap = await getDocs(qV);
                            if (snap.empty) {
                              toast.dismiss(tId);
                              toast.error("Voucher code not found in sovereign ledger registry.");
                              return;
                            }
                            const vData = snap.docs[0].data();
                            if (vData.claimed) {
                              toast.dismiss(tId);
                              toast.error("This voucher has already been redeemed.");
                              return;
                            }
                            setAppliedVoucher({
                              code: code,
                              amount: Number(vData.amount || 0)
                            });
                            setVoucherCodeInput("");
                            toast.dismiss(tId);
                            toast.success(`Success! Voucher for $${vData.amount} AUD successfully applied.`);
                          } catch (err) {
                            console.error(err);
                            toast.dismiss(tId);
                            toast.error("Database lookup failed. Offline session bypass active.");
                            // local mock voucher fallback for convenience
                            if (code.startsWith("UBEREATS-")) {
                              setAppliedVoucher({
                                code: code,
                                amount: 100
                              });
                              setVoucherCodeInput("");
                              toast.success("Offline voucher ($100.00 AUD) applied successfully.");
                            }
                          }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-sans"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Future Logistics Scheduler Toggle */}
                <div className="my-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200/85 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="rounded border-slate-300 text-[#06C167] focus:ring-[#06C167] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-slate-800 uppercase font-sans">Schedule for future dispatch</span>
                  </label>
                  
                  {isScheduled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 pt-1.5 border-t border-slate-200"
                    >
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-sans">Select Delivery Date & Time</span>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#06C167] font-sans shadow-sm"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </motion.div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-1.5 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold font-sans">Subtotal:</span>
                    <span className="font-mono text-slate-700">${cartTotal.toFixed(2)} AUD</span>
                  </div>
                  {tipPercentage > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold font-sans">Driver Tip ({tipPercentage}%):</span>
                      <span className="font-mono text-slate-700">+${(Math.round((cartTotal * tipPercentage / 100) * 100) / 100).toFixed(2)} AUD</span>
                    </div>
                  )}
                  {appliedVoucher && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#06C167] font-semibold font-sans">E-Voucher Discount:</span>
                      <span className="font-mono text-[#06C167]">-${appliedVoucher.amount.toFixed(2)} AUD</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-emerald-200/50 pt-2 font-black">
                    <div>
                      <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block font-sans">Account Ledger Debt</span>
                      <span className="text-[10px] text-slate-400 font-bold block font-sans">No auxiliary dispatch cost</span>
                    </div>
                    <span className="text-xl font-bold font-mono text-[#06C167]">
                      ${(Math.max(0, cartTotal + Math.round((cartTotal * tipPercentage / 100) * 100) / 100 - (appliedVoucher?.amount || 0))).toFixed(2)} AUD
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase text-xs tracking-wider rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel & Edit
                </button>
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={isProcessing}
                  className="py-3 bg-[#06C167] hover:bg-[#05a155] text-white font-heavy uppercase text-xs tracking-wider rounded-xl transition-all shadow-md font-black cursor-pointer text-center"
                >
                  {isProcessing ? "Mutating Ledger..." : "Confirm & Charge"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Twilio Secure Voice Bridge Active Call Overlay Modal */}
      <AnimatePresence>
        {isCallingPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden p-6 text-center flex flex-col items-center justify-between min-h-[460px]"
            >
              {/* Top Meta info */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">Twilio Encrypted Voice Bridge</span>
                </div>
                <div className="text-[8px] bg-slate-800 border border-slate-700 text-sky-450 text-sky-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit mx-auto">
                  Proxy Relay Node: +1 (415) 523-8886
                </div>
              </div>

              {/* Call Center Visualizer */}
              <div className="my-6 space-y-4 flex flex-col items-center">
                <div className="relative">
                  {/* Glowing Pulse Halos */}
                  {callStatus !== 'ended' && (
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-500/30 -m-3"
                    />
                  )}
                  {callStatus === 'dialing' && (
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border border-sky-500/20 -m-6"
                    />
                  )}
                  
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                    callStatus === 'ended' 
                      ? 'bg-rose-950/40 border-rose-500 text-rose-500'
                      : 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                  } shadow-lg shadow-emerald-500/10`}>
                    <PhoneCall className={`w-10 h-10 ${callStatus === 'dialing' || callStatus === 'connecting' ? 'animate-bounce' : ''}`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-white uppercase">Uber Autonomous Partner</h3>
                  <p className="text-[10px] text-slate-405 text-slate-400 uppercase tracking-widest font-mono">
                    {callStatus === 'dialing' && 'Initiating Securing Tunnel...'}
                    {callStatus === 'connecting' && 'Connecting Bridge...'}
                    {callStatus === 'connected' && 'SECURE VOICE SESSION ACTIVE'}
                    {callStatus === 'ended' && 'CALL DISCONNECTED'}
                  </p>
                </div>

                {/* Duration Counter & Sound Equalizer Waves */}
                {callStatus === 'connected' && (
                  <div className="space-y-3">
                    <span id="call-duration-timer" className="text-2xl font-black font-mono tracking-widest text-[#06C167] block">
                      {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                    </span>
                    {/* Simulated equalizers lines */}
                    <div className="flex gap-1 justify-center items-center h-4 py-1">
                      {[...Array(6)].map((_, i) => (
                        <motion.span
                          key={i}
                          animate={{ height: isMuted ? 4 : [6, 16, 6] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.5 + i * 0.1,
                            ease: "easeInOut"
                          }}
                          className="w-1 bg-[#06C167] rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {callStatus === 'dialing' && (
                  <span className="text-xs text-sky-400 font-bold tracking-wider animate-pulse uppercase">Dialing secure endpoint...</span>
                )}
                {callStatus === 'connecting' && (
                  <span className="text-xs text-amber-400 font-bold tracking-wider animate-pulse uppercase">Handshaking twilio signaling...</span>
                )}
              </div>

              {/* Call Controls Panel */}
              <div className="w-full space-y-5">
                <div className="flex justify-center gap-6">
                  {/* Mute button */}
                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      toast.info(isMuted ? "Microphone active" : "Microphone muted");
                    }}
                    type="button"
                    disabled={callStatus !== 'connected'}
                    className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                      isMuted 
                        ? 'bg-[#06C167] border-[#06C167] text-white' 
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-25'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Speaker Button */}
                  <button
                    onClick={() => {
                      setIsSpeakerOn(!isSpeakerOn);
                      toast.info(isSpeakerOn ? "Speakerphone off" : "Speakerphone on");
                    }}
                    type="button"
                    disabled={callStatus !== 'connected'}
                    className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                      isSpeakerOn 
                        ? 'bg-sky-600 border-sky-600 text-white' 
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-25'
                    }`}
                  >
                    {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono px-2">
                    <span>CALLER ID: +61 **** **156</span>
                    <span>COURIER: +1 **** **014</span>
                  </div>
                  
                  {callStatus !== 'ended' ? (
                    <button
                      type="button"
                      id="twilio-hangup-btn"
                      onClick={handleEndVoiceBridgeCall}
                      className="w-full py-3 bg-red-650 hover:bg-red-700 active:scale-98 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <PhoneOff className="w-4 h-4" /> End Encrypted Call
                    </button>
                  ) : (
                    <div className="w-full py-3 bg-slate-800 text-slate-400 text-xs font-bold uppercase rounded-2xl flex items-center justify-center gap-1 cursor-default">
                      <PhoneOff className="w-4 h-4 text-rose-500" /> Connecting Terminal Closed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailPreviewModal data={previewEmail} onClose={() => setPreviewEmail(null)} />
    </div>
  );
}
