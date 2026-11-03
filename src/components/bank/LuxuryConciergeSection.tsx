import React, { useState, useEffect } from "react";
import {
  Crown,
  Plane,
  Utensils,
  Sparkles,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  DollarSign,
  Send,
  CreditCard,
  Wine,
  ShieldCheck,
  RotateCw,
  X,
  ChevronRight,
  ExternalLink,
  Receipt,
  FileCheck,
  RefreshCw,
  Search,
  Gem
} from "lucide-react";
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { unifiedBankCardSync, UnifiedBankCard } from "../../services/unifiedBankCardSync";
import { smsEmailDispatchService, USER_EMAIL, USER_NAME } from "../../services/smsEmailDispatchService";
import toast from "react-hot-toast";

export interface ConciergeBooking {
  id: string;
  serviceType: "aviation" | "restaurant" | "procurement";
  title: string;
  details: string;
  locationOrRoute: string;
  dateTime: string;
  guestsOrPassengers: number;
  amountPaidAUD: number;
  cashbackEarnedAUD: number;
  cardId: string;
  cardName: string;
  cardLast4: string;
  confirmationCode: string;
  status: "confirmed" | "completed" | "in-progress" | "refunded";
  specialRequests?: string;
  leadConcierge: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
}

interface AircraftOption {
  model: string;
  manufacturer: string;
  range: string;
  speed: string;
  capacity: number;
  hourlyRateAUD: number;
  legCostAUD: number;
  features: string[];
  emoji: string;
}

interface RestaurantOption {
  name: string;
  city: string;
  country: string;
  stars: string;
  chef: string;
  specialty: string;
  costPerPersonAUD: number;
  winePairingPerPersonAUD: number;
  seatingOptions: string[];
  emoji: string;
}

const FLEET_AIRCRAFT: AircraftOption[] = [
  {
    model: "Gulfstream G700",
    manufacturer: "Gulfstream Aerospace",
    range: "7,750 nm (Trans-Pacific Non-stop)",
    speed: "Mach 0.925",
    capacity: 19,
    hourlyRateAUD: 16500,
    legCostAUD: 95000,
    features: ["Master Bedroom Suite", "Ultra-Galley with Espresso", "100% Fresh Air Whisper Quiet Cabin"],
    emoji: "✈️"
  },
  {
    model: "Bombardier Global 7500",
    manufacturer: "Bombardier Aviation",
    range: "7,700 nm (Sydney to London direct)",
    speed: "Mach 0.90",
    capacity: 16,
    hourlyRateAUD: 18000,
    legCostAUD: 120000,
    features: ["Nuage Ergonomic Chairs", "Full Private En-Suite with Shower", "Dedicated Flight Crew Rest"],
    emoji: "🛩️"
  },
  {
    model: "Dassault Falcon 10X",
    manufacturer: "Dassault Aviation",
    range: "7,500 nm (Sky Penthouse)",
    speed: "Mach 0.925",
    capacity: 14,
    hourlyRateAUD: 15000,
    legCostAUD: 85000,
    features: ["Widest Cabin in Business Aviation", "Direct FalconEye Vision System", "Private Dining Salon"],
    emoji: "🛫"
  },
  {
    model: "Embraer Praetor 600",
    manufacturer: "Embraer Executive Jets",
    range: "4,018 nm (Regional Inter-Continental)",
    speed: "Mach 0.83",
    capacity: 12,
    hourlyRateAUD: 9800,
    legCostAUD: 48000,
    features: ["Full Fly-By-Wire Active Turbulence Reduction", "Stone-Fluted Flooring", "High-Speed Ka-Band"],
    emoji: "✨"
  }
];

const PRESTIGE_RESTAURANTS: RestaurantOption[] = [
  {
    name: "Quay",
    city: "Sydney",
    country: "Australia",
    stars: "Three Chef Hats · World's 50 Best",
    chef: "Peter Gilmore",
    specialty: "Rare Australian Coastal Produce & Signature White Coral",
    costPerPersonAUD: 420,
    winePairingPerPersonAUD: 260,
    seatingOptions: ["Upper Deck Harbour Panoramic Table", "Chef's Table Adjacent Kitchen", "Green Room Private Dining"],
    emoji: "🌊"
  },
  {
    name: "Eleven Madison Park",
    city: "New York",
    country: "USA",
    stars: "3 Michelin Stars",
    chef: "Daniel Humm",
    specialty: "Plant-Based Haute Cuisine & Reserve Caviar Pairing",
    costPerPersonAUD: 890,
    winePairingPerPersonAUD: 480,
    seatingOptions: ["Main Dining Vault", "Chef's Table inside Kitchen", "Private Salon overlooking Madison Square Park"],
    emoji: "🗽"
  },
  {
    name: "Osteria Francescana",
    city: "Modena",
    country: "Italy",
    stars: "3 Michelin Stars · #1 Best of the Best",
    chef: "Massimo Bottura",
    specialty: "Five Ages of Parmigiano Reggiano & Contemporary Emilia-Romagna",
    costPerPersonAUD: 950,
    winePairingPerPersonAUD: 520,
    seatingOptions: ["Saletta del Duomo", "Historic Library Alcove", "Private Sommelier Cellar"],
    emoji: "🍝"
  },
  {
    name: "The French Laundry",
    city: "Yountville, Napa Valley",
    country: "USA",
    stars: "3 Michelin Stars",
    chef: "Thomas Keller",
    specialty: "Oysters and Pearls & Daily Napa Organic Harvest",
    costPerPersonAUD: 980,
    winePairingPerPersonAUD: 650,
    seatingOptions: ["Historic Stone Dining Room", "Courtyard Garden Pavilion", "Boardroom Private Dining"],
    emoji: "🍇"
  },
  {
    name: "Alain Ducasse at The Dorchester",
    city: "London",
    country: "UK",
    stars: "3 Michelin Stars",
    chef: "Jean-Philippe Blondet",
    specialty: "Modern French Prestige Cuisine & Dorset Crab",
    costPerPersonAUD: 820,
    winePairingPerPersonAUD: 450,
    seatingOptions: ["Table Lumière (Surrounded by 4,500 Luminescent Fiber Optic Rods)", "Park Lane Salon", "Wine Director's Table"],
    emoji: "👑"
  },
  {
    name: "Mirazur",
    city: "Menton",
    country: "France",
    stars: "3 Michelin Stars · #1 World's 50 Best",
    chef: "Mauro Colagreco",
    specialty: "Lunar Cycle Cuisine & French Riviera Botanicals",
    costPerPersonAUD: 920,
    winePairingPerPersonAUD: 490,
    seatingOptions: ["Mediterranean Cliffside Terrace", "Lunar Dining Room", "Gardens Master Table"],
    emoji: "🍋"
  }
];

const GLOBAL_FBOS = [
  "Sydney Kingsford Smith Airport (SYD) · Sydney Jet Base VIP FBO",
  "Teterboro Airport (TEB) · Jet Aviation FBO, New York",
  "Farnborough Airport (FAB) · TAG Aviation Executive Terminal, London",
  "Paris Le Bourget (LBG) · Signature Flight Support VIP, Paris",
  "Dubai Al Maktoum (DWC) · Jetex Executive VIP FBO, Dubai",
  "Singapore Seletar (WSSL) · Universal Aviation FBO, Singapore",
  "Tokyo Haneda (HND) · Premier Gate VIP FBO, Tokyo",
  "Nice Côte d'Azur (NCE) · Signature Flight Support, French Riviera",
  "San Francisco International (SFO) · Signature Flight Support VIP"
];

const INITIAL_MOCK_BOOKINGS: ConciergeBooking[] = [
  {
    id: "BK-JET-9942",
    serviceType: "aviation",
    title: "Gulfstream G700 Private Charter (SYD → JFK)",
    details: "Non-stop trans-pacific flight with Master Bedroom Suite & Michelin in-flight catering for 4 VIP passengers.",
    locationOrRoute: "Sydney (SYD) → New York (JFK/TEB)",
    dateTime: "Tomorrow, 08:30 AM AEST",
    guestsOrPassengers: 4,
    amountPaidAUD: 95000,
    cashbackEarnedAUD: 4750,
    cardId: "amex_au_centurion_black",
    cardName: "American Express Centurion Black Card (Australia)",
    cardLast4: "7712",
    confirmationCode: "VAL-ICAO-G700-9942",
    status: "confirmed",
    specialRequests: "Dom Pérignon 2012 Vintage on ice, Beluga Caviar service, and enclosed vehicle tarmac escort.",
    leadConcierge: {
      name: "Captain Julian Vance",
      phone: "+61 401 044 335",
      email: "aviation@valourian.com"
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "BK-DIN-8812",
    serviceType: "restaurant",
    title: "Eleven Madison Park (Chef's Kitchen Table)",
    details: "12-Course plant-based tasting experience with Grand Reserve Sommelier pairing for 2 guests.",
    locationOrRoute: "11 Madison Ave, New York, NY 10010, USA",
    dateTime: "Friday, 8:00 PM EST",
    guestsOrPassengers: 2,
    amountPaidAUD: 2740,
    cashbackEarnedAUD: 137,
    cardId: "vc-cba-diamond-world",
    cardName: "CommBank Diamond World Elite Virtual",
    cardLast4: "8208",
    confirmationCode: "EMP-CHEF-TBL-8812",
    status: "confirmed",
    specialRequests: "Chef Daniel Humm personalized greeting and menu signed for Mr. Asim Aryal.",
    leadConcierge: {
      name: "Elena Rostova (VIP Hospitality Lead)",
      phone: "+1 (212) 555-0199",
      email: "hospitality@valourian.com"
    },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

export const LuxuryConciergeSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"aviation" | "restaurants" | "procurement" | "active">("aviation");
  const [cards, setCards] = useState<UnifiedBankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [bookings, setBookings] = useState<ConciergeBooking[]>(() => {
    try {
      const stored = localStorage.getItem("valourian_luxury_concierge_bookings_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_MOCK_BOOKINGS;
  });

  // Aviation Form State
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftOption>(FLEET_AIRCRAFT[0]);
  const [departureFBO, setDepartureFBO] = useState(GLOBAL_FBOS[0]);
  const [arrivalFBO, setArrivalFBO] = useState(GLOBAL_FBOS[1]);
  const [flightDateTime, setFlightDateTime] = useState("Tomorrow · 09:00 AM Departure");
  const [passengerCount, setPassengerCount] = useState(4);
  const [cateringTier, setCateringTier] = useState<"michelin" | "caviar_reserve" | "wellness">("michelin");
  const [aviationSpecialReqs, setAviationSpecialReqs] = useState("Tarmac vehicle transfer right to aircraft stairs at Sydney Jet Base. Dom Pérignon on ice.");
  const [isSubmittingAviation, setIsSubmittingAviation] = useState(false);

  // Restaurant Form State
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantOption>(PRESTIGE_RESTAURANTS[0]);
  const [diningDate, setDiningDate] = useState("This Saturday Evening");
  const [diningTime, setDiningTime] = useState("8:00 PM (Prime Table)");
  const [diningGuests, setDiningGuests] = useState(2);
  const [includeWinePairing, setIncludeWinePairing] = useState(true);
  const [selectedSeating, setSelectedSeating] = useState(PRESTIGE_RESTAURANTS[0].seatingOptions[0]);
  const [diningSpecialReqs, setDiningSpecialReqs] = useState("Celebration dinner for Valourian Capital Treasury Director. Quiet prime window location.");
  const [isSubmittingDining, setIsSubmittingDining] = useState(false);

  // Procurement Form State
  const [procurementItem, setProcurementItem] = useState("Patek Philippe Grandmaster Chime 6300G");
  const [procurementBudget, setProcurementBudget] = useState("3500000");
  const [procurementNotes, setProcurementNotes] = useState("Acquisition directly via Geneva executive allocation. Hand-delivered via armed diplomatic courier to Artarmon NSW.");
  const [isSubmittingProcurement, setIsSubmittingProcurement] = useState(false);

  // 1. Sync Virtual Cards
  useEffect(() => {
    const allCards = unifiedBankCardSync.getCards();
    setCards(allCards);
    setSelectedCardId(unifiedBankCardSync.getActivePaymentCardId());

    const unsubscribe = unifiedBankCardSync.subscribe((next) => {
      setCards(next);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-Time Auto-InAppUpdates from Firestore
  useEffect(() => {
    if (!db) return;

    try {
      const q = query(collection(db, "luxury_concierge_bookings"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ConciergeBooking[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data() as any;
              list.push({
                id: doc.id,
                ...data
              });
            });

            setBookings((prev) => {
              // Merge Firestore with local cache, avoiding duplicates
              const map = new Map<string, ConciergeBooking>();
              list.forEach((b) => map.set(b.id, b));
              prev.forEach((b) => {
                if (!map.has(b.id)) map.set(b.id, b);
              });
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              try {
                localStorage.setItem("valourian_luxury_concierge_bookings_v1", JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        },
        (error) => {
          console.warn("Firestore real-time concierge listener notice:", error);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore listener setup error:", e);
    }
  }, []);

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  // Helper: Persist Booking Real-Time
  const persistBookingRealtime = async (booking: ConciergeBooking) => {
    // 1. Update local state immediately (zero latency)
    setBookings((prev) => {
      const updated = [booking, ...prev];
      try {
        localStorage.setItem("valourian_luxury_concierge_bookings_v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Persist to Firestore for multi-device sync
    try {
      if (db) {
        await addDoc(collection(db, "luxury_concierge_bookings"), {
          ...booking,
          userId: auth.currentUser?.uid || "asim_aryal",
          serverTimestamp: Timestamp.now()
        });
      }
    } catch (e) {
      console.warn("Firestore write notice:", e);
    }
  };

  // 1. Submit Aviation Booking
  const handleScheduleAviation = async () => {
    if (!currentCard) return;

    const cateringCost = cateringTier === "caviar_reserve" ? 8500 : cateringTier === "michelin" ? 4500 : 2000;
    const totalCostAUD = selectedAircraft.legCostAUD + cateringCost;

    setIsSubmittingAviation(true);

    setTimeout(async () => {
      try {
        // Real card balance deduction & cashback award
        const spendResult = unifiedBankCardSync.spendFromCard(currentCard.id, {
          merchantName: `Valourian Executive Aviation (${selectedAircraft.model})`,
          merchantLocation: departureFBO.split("·")[0].trim(),
          region: "AUS",
          foreignAmount: totalCostAUD,
          foreignCurrency: "AUD",
          category: "Private Aviation Charter"
        });

        const code = `VAL-ICAO-${selectedAircraft.model.replace(/\s+/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
        const bookingId = `BK-JET-${Date.now().toString(36).toUpperCase()}`;

        const newBooking: ConciergeBooking = {
          id: bookingId,
          serviceType: "aviation",
          title: `${selectedAircraft.model} Private Charter`,
          details: `${selectedAircraft.manufacturer} · Non-stop cruise ${selectedAircraft.range} · Speed ${selectedAircraft.speed} · ${passengerCount} Passengers`,
          locationOrRoute: `${departureFBO.split("·")[0].trim()} → ${arrivalFBO.split("·")[0].trim()}`,
          dateTime: flightDateTime,
          guestsOrPassengers: passengerCount,
          amountPaidAUD: totalCostAUD,
          cashbackEarnedAUD: spendResult.cashbackEarned,
          cardId: currentCard.id,
          cardName: currentCard.name,
          cardLast4: currentCard.last4,
          confirmationCode: code,
          status: "confirmed",
          specialRequests: aviationSpecialReqs,
          leadConcierge: {
            name: "Captain Julian Vance (Aviation Lead)",
            phone: "+61 401 044 335",
            email: "aviation@valourian.com"
          },
          createdAt: new Date().toISOString()
        };

        await persistBookingRealtime(newBooking);

        // Dispatch real SMS and Email with complete itinerary
        await smsEmailDispatchService.dispatchConciergeServicePass({
          bookingId: newBooking.id,
          serviceType: "aviation",
          title: newBooking.title,
          details: newBooking.details,
          locationOrRoute: newBooking.locationOrRoute,
          dateTime: newBooking.dateTime,
          guestsOrPassengers: newBooking.guestsOrPassengers,
          amountPaidAUD: newBooking.amountPaidAUD,
          cashbackEarnedAUD: newBooking.cashbackEarnedAUD,
          cardUsed: `${currentCard.name} (•••• ${currentCard.last4})`,
          confirmationCode: newBooking.confirmationCode,
          leadConcierge: newBooking.leadConcierge,
          specialRequests: newBooking.specialRequests
        });

        setIsSubmittingAviation(false);
        setActiveTab("active");

        toast.success(
          `✈️ PRIVATE JET SCHEDULED & CONFIRMED!\n$${totalCostAUD.toLocaleString()} AUD charged to •••• ${currentCard.last4}.\n+$${spendResult.cashbackEarned.toLocaleString()} AUD Cashback credited!`,
          { duration: 6000, icon: "✈️" }
        );
      } catch (err: any) {
        setIsSubmittingAviation(false);
        toast.error(`Aviation scheduling failed: ${err.message || "Unknown error"}`);
      }
    }, 500);
  };

  // 2. Submit Restaurant Pre-Payment & Booking
  const handleBookRestaurant = async () => {
    if (!currentCard) return;

    const baseDiningCost = selectedRestaurant.costPerPersonAUD * diningGuests;
    const wineCost = includeWinePairing ? selectedRestaurant.winePairingPerPersonAUD * diningGuests : 0;
    const totalCostAUD = baseDiningCost + wineCost;

    setIsSubmittingDining(true);

    setTimeout(async () => {
      try {
        const spendResult = unifiedBankCardSync.spendFromCard(currentCard.id, {
          merchantName: `${selectedRestaurant.name} (${selectedRestaurant.city})`,
          merchantLocation: `${selectedRestaurant.city}, ${selectedRestaurant.country}`,
          region: selectedRestaurant.country === "Australia" ? "AUS" : selectedRestaurant.country === "USA" ? "USA" : "EU",
          foreignAmount: totalCostAUD,
          foreignCurrency: "AUD",
          category: "Michelin Fine Dining Pre-Payment"
        });

        const code = `RES-${selectedRestaurant.name.replace(/\s+/g, "").slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const bookingId = `BK-DIN-${Date.now().toString(36).toUpperCase()}`;

        const newBooking: ConciergeBooking = {
          id: bookingId,
          serviceType: "restaurant",
          title: `${selectedRestaurant.name} · ${selectedRestaurant.stars}`,
          details: `${selectedRestaurant.specialty} · Chef ${selectedRestaurant.chef} · ${selectedSeating} ${includeWinePairing ? "· Grand Reserve Wine Pairing" : ""}`,
          locationOrRoute: `${selectedRestaurant.name}, ${selectedRestaurant.city}, ${selectedRestaurant.country}`,
          dateTime: `${diningDate} at ${diningTime}`,
          guestsOrPassengers: diningGuests,
          amountPaidAUD: totalCostAUD,
          cashbackEarnedAUD: spendResult.cashbackEarned,
          cardId: currentCard.id,
          cardName: currentCard.name,
          cardLast4: currentCard.last4,
          confirmationCode: code,
          status: "confirmed",
          specialRequests: diningSpecialReqs,
          leadConcierge: {
            name: "Elena Rostova (Hospitality Concierge Lead)",
            phone: "+61 401 044 335",
            email: "hospitality@valourian.com"
          },
          createdAt: new Date().toISOString()
        };

        await persistBookingRealtime(newBooking);

        await smsEmailDispatchService.dispatchConciergeServicePass({
          bookingId: newBooking.id,
          serviceType: "restaurant",
          title: newBooking.title,
          details: newBooking.details,
          locationOrRoute: newBooking.locationOrRoute,
          dateTime: newBooking.dateTime,
          guestsOrPassengers: newBooking.guestsOrPassengers,
          amountPaidAUD: newBooking.amountPaidAUD,
          cashbackEarnedAUD: newBooking.cashbackEarnedAUD,
          cardUsed: `${currentCard.name} (•••• ${currentCard.last4})`,
          confirmationCode: newBooking.confirmationCode,
          leadConcierge: newBooking.leadConcierge,
          specialRequests: newBooking.specialRequests
        });

        setIsSubmittingDining(false);
        setActiveTab("active");

        toast.success(
          `🍽️ TABLE PRE-PAID & CONFIRMED!\n${selectedRestaurant.name} booked for ${diningGuests} guests.\n+$${spendResult.cashbackEarned.toLocaleString()} AUD Cashback credited!`,
          { duration: 6000, icon: "🍽️" }
        );
      } catch (err: any) {
        setIsSubmittingDining(false);
        toast.error(`Dining reservation failed: ${err.message || "Unknown error"}`);
      }
    }, 500);
  };

  // 3. Submit Procurement Request
  const handleProcurementRequest = async () => {
    if (!currentCard) return;
    const depositAUD = Math.min(parseFloat(procurementBudget) * 0.1 || 50000, 250000);

    setIsSubmittingProcurement(true);

    setTimeout(async () => {
      try {
        const spendResult = unifiedBankCardSync.spendFromCard(currentCard.id, {
          merchantName: `Valourian Bespoke Asset Escrow (${procurementItem})`,
          merchantLocation: "Geneva / Sydney Treasury Escrow",
          region: "Global",
          foreignAmount: depositAUD,
          foreignCurrency: "AUD",
          category: "Bespoke Asset Procurement Deposit"
        });

        const code = `AST-PROC-${Math.floor(10000 + Math.random() * 90000)}`;
        const bookingId = `BK-AST-${Date.now().toString(36).toUpperCase()}`;

        const newBooking: ConciergeBooking = {
          id: bookingId,
          serviceType: "procurement",
          title: `Procurement: ${procurementItem}`,
          details: `Target Allocation Budget: $${parseFloat(procurementBudget).toLocaleString()} AUD · Priority VIP Sourcing Escrow: $${depositAUD.toLocaleString()} AUD`,
          locationOrRoute: "Diplomatic Sourcing Desk (Geneva · Zurich · London · Sydney)",
          dateTime: "Immediate Execution · Active Priority",
          guestsOrPassengers: 1,
          amountPaidAUD: depositAUD,
          cashbackEarnedAUD: spendResult.cashbackEarned,
          cardId: currentCard.id,
          cardName: currentCard.name,
          cardLast4: currentCard.last4,
          confirmationCode: code,
          status: "in-progress",
          specialRequests: procurementNotes,
          leadConcierge: {
            name: "Marcus Sterling (Senior Horology & Asset Lead)",
            phone: "+61 401 044 335",
            email: "assets@valourian.com"
          },
          createdAt: new Date().toISOString()
        };

        await persistBookingRealtime(newBooking);

        await smsEmailDispatchService.dispatchConciergeServicePass({
          bookingId: newBooking.id,
          serviceType: "procurement",
          title: newBooking.title,
          details: newBooking.details,
          locationOrRoute: newBooking.locationOrRoute,
          dateTime: newBooking.dateTime,
          guestsOrPassengers: newBooking.guestsOrPassengers,
          amountPaidAUD: newBooking.amountPaidAUD,
          cashbackEarnedAUD: newBooking.cashbackEarnedAUD,
          cardUsed: `${currentCard.name} (•••• ${currentCard.last4})`,
          confirmationCode: newBooking.confirmationCode,
          leadConcierge: newBooking.leadConcierge,
          specialRequests: newBooking.specialRequests
        });

        setIsSubmittingProcurement(false);
        setActiveTab("active");

        toast.success(
          `💎 BESPOKE ASSET DIRECTIVE LOGGED!\nEscrow deposit settled via •••• ${currentCard.last4}.\n+$${spendResult.cashbackEarned.toLocaleString()} AUD Cashback credited!`,
          { duration: 6000, icon: "💎" }
        );
      } catch (err: any) {
        setIsSubmittingProcurement(false);
        toast.error(`Procurement request failed: ${err.message || "Unknown error"}`);
      }
    }, 500);
  };

  // Re-Dispatch Email Pass
  const handleResendPass = async (booking: ConciergeBooking) => {
    await smsEmailDispatchService.dispatchConciergeServicePass({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      title: booking.title,
      details: booking.details,
      locationOrRoute: booking.locationOrRoute,
      dateTime: booking.dateTime,
      guestsOrPassengers: booking.guestsOrPassengers,
      amountPaidAUD: booking.amountPaidAUD,
      cashbackEarnedAUD: booking.cashbackEarnedAUD,
      cardUsed: `${booking.cardName} (•••• ${booking.cardLast4})`,
      confirmationCode: booking.confirmationCode,
      leadConcierge: booking.leadConcierge,
      specialRequests: booking.specialRequests
    });
  };

  // Instant Refund / Cancellation
  const handleCancelAndRefund = (booking: ConciergeBooking) => {
    if (booking.status === "refunded") return;

    unifiedBankCardSync.injectImmenseFunds(booking.cardId, booking.amountPaidAUD);

    const updated = bookings.map((b) =>
      b.id === booking.id ? { ...b, status: "refunded" as const } : b
    );
    setBookings(updated);
    try {
      localStorage.setItem("valourian_luxury_concierge_bookings_v1", JSON.stringify(updated));
    } catch {}

    toast.success(
      `REFUND EXECUTED: $${booking.amountPaidAUD.toLocaleString()} AUD credited back to ${booking.cardName} immediately!`,
      { duration: 5500, icon: "💳" }
    );
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Valourian Luxury Concierge
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-500/10 font-bold">
                REAL CARDS BILLING
              </span>
              <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10 font-bold">
                LIVE AUTO-SYNC
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Instant private aviation chartering, Michelin 3-Star dining pre-payments, and bespoke asset procurement billed directly through your virtual cards with 5% cashback.
            </p>
          </div>
        </div>

        {/* Active Billing Card Badge */}
        {currentCard && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 px-4 flex items-center gap-3 shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Active Billing Card
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[190px]">
                {currentCard.name}
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                •••• {currentCard.last4} · ${Number(currentCard.balance).toLocaleString("en-AU")} AUD
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto relative z-10">
        {[
          { id: "aviation", label: "Private Aviation Scheduling", icon: Plane, count: null },
          { id: "restaurants", label: "Michelin Dining Pre-Payments", icon: Utensils, count: null },
          { id: "procurement", label: "Bespoke Asset Allocation", icon: Gem, count: null },
          { id: "active", label: "Active Itineraries & Passes", icon: Receipt, count: bookings.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isSel
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSel ? "text-slate-950" : "text-amber-400"}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSel ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Private Aviation Scheduling */}
      {activeTab === "aviation" && (
        <div className="space-y-6 relative z-10">
          {/* Aircraft Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Plane className="w-4 h-4 text-amber-400" />
                Select Sovereign Aircraft Fleet
              </label>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                +5% Uncapped Cashback on All Flights
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {FLEET_AIRCRAFT.map((plane) => {
                const isSelected = selectedAircraft.model === plane.model;
                return (
                  <button
                    key={plane.model}
                    onClick={() => setSelectedAircraft(plane)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl">{plane.emoji}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                        Up to {plane.capacity} VIPs
                      </span>
                    </div>
                    <div className="font-black text-white text-sm mb-0.5">{plane.model}</div>
                    <div className="text-[10px] text-slate-400 font-mono mb-2">{plane.manufacturer}</div>
                    <div className="text-[11px] text-slate-300 space-y-1 mb-3">
                      <div>Speed: <strong className="text-white">{plane.speed}</strong></div>
                      <div>Range: <strong className="text-white">{plane.range}</strong></div>
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-400 pt-2 border-t border-slate-800">
                      ${plane.legCostAUD.toLocaleString()} AUD / leg
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flight Parameters Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Departure VIP FBO Terminal
                </label>
                <select
                  value={departureFBO}
                  onChange={(e) => setDepartureFBO(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  {GLOBAL_FBOS.map((fbo) => (
                    <option key={`dep-${fbo}`} value={fbo}>{fbo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Destination VIP FBO Terminal
                </label>
                <select
                  value={arrivalFBO}
                  onChange={(e) => setArrivalFBO(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  {GLOBAL_FBOS.map((fbo) => (
                    <option key={`arr-${fbo}`} value={fbo}>{fbo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Departure Date & Time
                </label>
                <input
                  type="text"
                  value={flightDateTime}
                  onChange={(e) => setFlightDateTime(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                  placeholder="e.g. Tomorrow · 09:00 AM"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Passenger Manifest Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedAircraft.capacity}
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  In-Flight Michelin Catering
                </label>
                <select
                  value={cateringTier}
                  onChange={(e) => setCateringTier(e.target.value as any)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  <option value="michelin">3-Star Tasting Menu & Vintage Dom Pérignon (+$4,500)</option>
                  <option value="caviar_reserve">Beluga Caviar & Wagyu Reserve Banquet (+$8,500)</option>
                  <option value="wellness">Cold-Pressed Organic Wellness & Light Plates (+$2,000)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Bespoke Ground & Flight Directives
              </label>
              <input
                type="text"
                value={aviationSpecialReqs}
                onChange={(e) => setAviationSpecialReqs(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
                placeholder="Special baggage, diplomatic security clearance, pet in cabin..."
              />
            </div>

            {/* Price & Execution CTA */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-left w-full sm:w-auto">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Total Pre-Paid Charter Rate
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  ${(selectedAircraft.legCostAUD + (cateringTier === "caviar_reserve" ? 8500 : cateringTier === "michelin" ? 4500 : 2000)).toLocaleString()}{" "}
                  <span className="text-sm font-normal text-slate-400">AUD</span>
                </div>
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  Instant 5% Cashback: +${Math.round((selectedAircraft.legCostAUD + (cateringTier === "caviar_reserve" ? 8500 : cateringTier === "michelin" ? 4500 : 2000)) * 0.05).toLocaleString()} AUD
                </div>
              </div>

              <button
                onClick={handleScheduleAviation}
                disabled={isSubmittingAviation || !currentCard}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAviation ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting ICAO Clearances & Card Charge...</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-4 h-4 fill-slate-950" />
                    <span>Pre-Pay & Confirm Flight via •••• {currentCard?.last4 || "Card"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Michelin Dining Pre-Payments */}
      {activeTab === "restaurants" && (
        <div className="space-y-6 relative z-10">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                Select World-Class Dining Destination
              </label>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Direct Pre-Payment & Guaranteed Table Placement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESTIGE_RESTAURANTS.map((resto) => {
                const isSelected = selectedRestaurant.name === resto.name;
                return (
                  <button
                    key={resto.name}
                    onClick={() => {
                      setSelectedRestaurant(resto);
                      setSelectedSeating(resto.seatingOptions[0]);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-2xl">{resto.emoji}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700">
                        {resto.stars}
                      </span>
                    </div>
                    <div className="font-black text-white text-sm">{resto.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">{resto.city}, {resto.country} · Chef {resto.chef}</div>
                    <div className="text-[10px] text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                      {resto.specialty}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Tasting Menu:</span>
                      <span className="font-bold text-emerald-400">${resto.costPerPersonAUD} AUD / guest</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restaurant Booking Parameters */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Reservation Date
                </label>
                <input
                  type="text"
                  value={diningDate}
                  onChange={(e) => setDiningDate(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                  placeholder="e.g. This Saturday Evening"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Seating Time
                </label>
                <select
                  value={diningTime}
                  onChange={(e) => setDiningTime(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  <option value="7:00 PM (Sunset Seating)">7:00 PM (Sunset Seating)</option>
                  <option value="8:00 PM (Prime Table)">8:00 PM (Prime Table)</option>
                  <option value="8:30 PM (Chef's Kitchen Service)">8:30 PM (Chef's Kitchen Service)</option>
                  <option value="9:00 PM (Late VIP Service)">9:00 PM (Late VIP Service)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Party Size (Guests)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={diningGuests}
                  onChange={(e) => setDiningGuests(parseInt(e.target.value) || 1)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Preferred Seating Area
                </label>
                <select
                  value={selectedSeating}
                  onChange={(e) => setSelectedSeating(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  {selectedRestaurant.seatingOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="winePairingCheck"
                  checked={includeWinePairing}
                  onChange={(e) => setIncludeWinePairing(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                />
                <label htmlFor="winePairingCheck" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Include Sommelier Grand Reserve Wine Pairing (+${selectedRestaurant.winePairingPerPersonAUD} AUD / person)
                </label>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Special Requests / Dietary / Occasion
              </label>
              <input
                type="text"
                value={diningSpecialReqs}
                onChange={(e) => setDiningSpecialReqs(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            {/* Price & Pre-Payment CTA */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-left w-full sm:w-auto">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Total Pre-Paid Dining Settlement
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  ${((selectedRestaurant.costPerPersonAUD + (includeWinePairing ? selectedRestaurant.winePairingPerPersonAUD : 0)) * diningGuests).toLocaleString()}{" "}
                  <span className="text-sm font-normal text-slate-400">AUD</span>
                </div>
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  Instant 5% Cashback: +${Math.round(((selectedRestaurant.costPerPersonAUD + (includeWinePairing ? selectedRestaurant.winePairingPerPersonAUD : 0)) * diningGuests) * 0.05).toLocaleString()} AUD
                </div>
              </div>

              <button
                onClick={handleBookRestaurant}
                disabled={isSubmittingDining || !currentCard}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDining ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Restaurant Pre-Payment...</span>
                  </>
                ) : (
                  <>
                    <Utensils className="w-4 h-4 fill-slate-950" />
                    <span>Pre-Pay &amp; Lock Table via •••• {currentCard?.last4 || "Card"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bespoke Horology & Asset Allocation */}
      {activeTab === "procurement" && (
        <div className="space-y-6 relative z-10">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Bespoke Horology &amp; Sovereign Asset Allocation
                </h3>
                <p className="text-xs text-slate-400">
                  Priority allocation directly with Geneva, Le Brassus, and Mayfair salons. 10% escrow deposit settled directly from your card.
                </p>
              </div>
              <Gem className="w-8 h-8 text-amber-400 shrink-0" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Requested Asset or Timepiece
                </label>
                <select
                  value={procurementItem}
                  onChange={(e) => setProcurementItem(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  <option value="Patek Philippe Grandmaster Chime 6300G">Patek Philippe Grandmaster Chime 6300G ($3,500,000 AUD)</option>
                  <option value="Rolex Daytona Platinum 126506 (Baguette Diamond Dial)">Rolex Daytona Platinum 126506 ($240,000 AUD)</option>
                  <option value="Audemars Piguet Royal Oak Jumbo Extra-Thin 16202ST">Audemars Piguet Royal Oak Jumbo 16202ST ($145,000 AUD)</option>
                  <option value="Hermès Birkin 30 Faubourg White House Crocodile">Hermès Birkin 30 Faubourg Crocodile ($380,000 AUD)</option>
                  <option value="Monaco Grand Prix Superyacht Berth 50m (Port Hercule)">Monaco Grand Prix Superyacht Berth 50m ($450,000 AUD)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Target Allocation Budget (AUD)
                </label>
                <input
                  type="number"
                  value={procurementBudget}
                  onChange={(e) => setProcurementBudget(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Custody &amp; Handover Instructions
                </label>
                <textarea
                  value={procurementNotes}
                  onChange={(e) => setProcurementNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-left w-full sm:w-auto">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Initial Priority Escrow Charge
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    ${Math.min(parseFloat(procurementBudget) * 0.1 || 50000, 250000).toLocaleString()} AUD
                  </div>
                </div>

                <button
                  onClick={handleProcurementRequest}
                  disabled={isSubmittingProcurement || !currentCard}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProcurement ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting Sourcing Directive...</span>
                    </>
                  ) : (
                    <>
                      <Gem className="w-4 h-4 fill-slate-950" />
                      <span>Authorize Escrow via •••• {currentCard?.last4 || "Card"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Active Itineraries & Real-Time Passes */}
      {activeTab === "active" && (
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live Verified Itineraries ({bookings.length})
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time Firestore &amp; Card Sync Active
            </span>
          </div>

          <div className="space-y-3">
            {bookings.map((booking) => {
              const isAviation = booking.serviceType === "aviation";
              const isDining = booking.serviceType === "restaurant";
              const isProcurement = booking.serviceType === "procurement";

              return (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">
                        {isAviation ? "✈️" : isDining ? "🍽️" : "💎"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-sm">{booking.title}</h4>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : booking.status === "refunded"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{booking.locationOrRoute}</div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <div className="text-sm font-bold text-white">
                        ${booking.amountPaidAUD.toLocaleString("en-AU")} AUD
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">
                        +${booking.cashbackEarnedAUD.toLocaleString("en-AU")} Cashback
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-900/60 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-500 text-[9px] uppercase block">Ref Code</span>
                      <span className="font-bold text-amber-400 truncate">{booking.confirmationCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] uppercase block">Timing</span>
                      <span className="text-slate-200 truncate">{booking.dateTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] uppercase block">Card Charged</span>
                      <span className="text-slate-300 truncate">•••• {booking.cardLast4}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] uppercase block">Lead Concierge</span>
                      <span className="text-slate-300 truncate">{booking.leadConcierge.name}</span>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="text-[11px] text-slate-400 font-mono bg-slate-900/30 p-2 rounded-lg">
                      <strong className="text-slate-300">Directives:</strong> {booking.specialRequests}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-500 font-mono">
                      Booked for {USER_NAME} ({USER_EMAIL})
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendPass(booking)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Re-send full official pass & verification receipt to asim.nsw@gmail.com"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Email VIP Pass</span>
                      </button>

                      {booking.status !== "refunded" && (
                        <button
                          onClick={() => handleCancelAndRefund(booking)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                          title="Instant cancellation and refund directly back to card balance"
                        >
                          <span>Refund &amp; Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
