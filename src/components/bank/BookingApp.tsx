import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Calendar, 
  Search, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  User, 
  Loader2, 
  History, 
  X, 
  Plus, 
  Minus, 
  Coffee, 
  Utensils, 
  ChefHat, 
  ShieldCheck, 
  Star, 
  Wifi, 
  Waves, 
  Compass, 
  Percent,
  Download,
  FileText,
  Car,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { sendEmailViaService, EmailPreviewModal, EmailData } from './EmailService';

export function BookingApp({ user, balances, setBalances }: {
  user: any;
  balances: Record<string, number>;
  setBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  // Booking Search Criteria States
  const [destination, setDestination] = useState('Melbourne, Australia');
  const [checkInDate, setCheckInDate] = useState('2026-10-15');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-22');
  
  // Guest drop down & selector states
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [roomsCount, setRoomsCount] = useState(1);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  const [confirmationEmail, setConfirmationEmail] = useState('asim.nsw@gmail.com');
  const [contactPhone, setContactPhone] = useState('+61 491 570 156');
  const [confirmedBookingData, setConfirmedBookingData] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Dynamic Catering Package checkboxes
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [includeLunch, setIncludeLunch] = useState(false);
  const [includeDinner, setIncludeDinner] = useState(false);
  const [includeAllInclusive, setIncludeAllInclusive] = useState(false);

  // Live cards list loaded from storage
  const [bookingCards, setBookingCards] = useState<any[]>([]);
  const [selectedBookingCardIndex, setSelectedBookingCardIndex] = useState<number>(0);

  useEffect(() => {
    const syncCards = () => {
      try {
        const saved = window.localStorage.getItem('valourian_digital_cards_v5');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setBookingCards(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to sync cards in BookingApp", e);
      }
    };
    syncCards();
    window.addEventListener('storage', syncCards);
    return () => window.removeEventListener('storage', syncCards);
  }, []);

  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory]);

  const handleDownloadVoucher = (b: any) => {
    const hotelName = b.recipient?.replace("Booking.com - ", "") || b.hotelName || "Sovereign Hotel";
    const guest = b.guestName || "Mr. Asim Aryal";
    const phone = b.phone || "+61 491 570 156";
    const checkIn = b.checkInDate || "2026-06-16";
    const checkOut = b.checkOutDate || "2026-09-02";
    const stayNights = b.nights || 78;
    const roomCount = b.rooms || 1;
    const bAmt = b.amount ? Math.abs(b.amount).toLocaleString() : "273,000";
    const bCurrency = b.currency || "AUD";
    const detailsText = b.description || "VIP Luxury Stay Lodge";

    const receiptContent = `========================================================================
                 VALOURIAN SOVEREIGN TRAVEL LEDGER
               OFFICIAL COMPLIANCE CHECK-IN CLEARANCE
========================================================================
STATUS: LEGITIMATE, VERIFIED & GUARANTEED BY THE TREASURY
CLEARANCE CODE: VC-ETA-9942 / LEVEL-55 CLEARANCE

PROPRIETARY REGISTRY DETAILS:
------------------------------------------------------------------------
Hotel Property     : ${hotelName}
Address            : Barangaroo Avenue, Barangaroo NSW 2000, Australia
Guest Name         : ${guest}
Contact Phone      : ${phone} (VERIFIED AT SIGN-IN)
Total Nights       : ${stayNights} Nights
Total Rooms        : ${roomCount} Premium Suite/s
Check-In Date      : ${checkIn} (From 14:00 AEDT)
Check-Out Date     : ${checkOut} (Until 11:00 AEDT)
Status Level       : PLATINUM ROYALTY VVIP
Catering Package   : VIP All-Inclusive Butler Dining Board & Degustation

TREASURY BILLING & PAYMENT STATUS:
------------------------------------------------------------------------
Settle Status      : ACCOMMODATION FULLY FUNDED IN ADVANCE
Billing Gateway    : Sovereign Wealth Capital Global Clearing
Grand Total Settle : ${bCurrency} ${bAmt}
Payment Type       : MASTERCARD VIP CORPORATE SIGNATURE
Verification Ref   : SEC-LEDGER-CRN-STAY-2026

SPECIAL DISPATCH & COURTESY TRANSFERS:
------------------------------------------------------------------------
The Crown Towers Sydney VIP Concierge and Front Office Director have been
fully briefed on this guest's 78-day luxury residency.

COMPLIMENTARY AIRPORT TRANSFERS SCHEDULED:
1. Rolls-Royce Phantom VIII Chauffeur Pick-up from Sydney International
2. Direct helicopter lift to the hotel helipad / Barangaroo deck
3. Private suite-side check-in (bypassing the public lobby check-in)

IF YOU NEED ASSISTANCE IN CONFLICT RESOLUTION AT FRONT CODES:
Please alert direct executive concierge hotline on verification line.
All staff members of Crown Sydney VIP Operations are aware of this stay.
------------------------------------------------------------------------
       THANK YOU FOR RESIDING WITH SOVEREIGN RESORT SYSTEM
========================================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${hotelName.replace(/\s+/g, "_")}_VVIP_Checkin_Voucher.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Legitimate VVIP Check-In Voucher Saved to Downloads Folder");
  };

  const loadHistory = async () => {
    if (!user || !user.uid) return;
    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid),
        where("recipient", ">=", "Booking.com"),
        where("recipient", "<=", "Booking.com\uf8ff"),
        orderBy("recipient"), 
        orderBy("date", "desc")
      );
      // Fallback query if composite index missing
      const qFallback = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("date", "desc"));
      
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (e: any) {
         if (e.message.includes('index')) {
           snapshot = await getDocs(qFallback);
         } else {
           throw e;
         }
      }

      // Seed default 78-day stay at Crown Towers Sydney
      const crownSydSeeded = {
        id: "crown-sydney-78d-ledger",
        recipient: "Booking.com - Crown Towers Sydney",
        amount: -273000,
        currency: "AUD",
        date: "2026-06-16T15:00:00.000Z",
        type: "card",
        status: "completed",
        description: "VIP Executive Residency: 78 Nights at Crown Towers Sydney. Suite 8801 Ultra-Premium Opera Deck Penthouse. Included Meal packages: VIP All-Inclusive Butler Dining Board, Private Caviar Trolley Service, and French Vintage Champagne Cellar Key. Priority airport helicopter shuttle & private chauffeur transit arranged.",
        isSeeded: true,
        guestName: "Mr. Asim Aryal",
        phone: "+61 491 570 156",
        checkInDate: "2026-06-16",
        checkOutDate: "2026-09-02",
        nights: 78,
        rooms: 1,
        conferredStatus: "PLATINUM ROYALTY VVIP",
        notes: "Authorized via Sovereign Treasury Reserve. VIP Concierge Desk notified. Private Rolls-Royce Phantom Pick-up & Heli-Lift to Barangaroo Deck scheduled.",
        attachments: [
          { name: "Crown_Sydney_78Nights_VIP_Stay_Clearance.pdf", size: "12.4 MB" }
        ]
      };

      const historyData: any[] = [];
      historyData.push(crownSydSeeded);

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.recipient.startsWith("Booking.com") && doc.id !== "crown-sydney-78d-ledger") {
            historyData.push({ id: doc.id, ...data });
        }
      });
      setBookingHistory(historyData);
    } catch (error) {
      console.error("Error loading history", error);
      toast.error("Could not load booking history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Helper to calculate total stay nights
  const getNightsCount = () => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 7;
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nightsCount = getNightsCount();
  const totalGuests = adultsCount + childrenCount;

  // Premium Hotel Directory
  const getHotelsForDestination = (queryStr: string) => {
    const q = queryStr.toLowerCase();
    
    // Melbourne Destination
    if (q.includes('melbourne')) {
      return [
        {
          id: 101,
          name: "Crown Towers Melbourne & Casino",
          location: "Southbank, Melbourne, VIC, Australia",
          price: 980,
          currency: "AUD",
          rating: 4.9,
          reviews: 4832,
          image: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format&fit=crop&q=60",
          description: "An extraordinary skyscraper complex standing tall on the Southbank Promenade. Features ultra-exclusive VIP casinos, premium designer shopping arcades, and massive dynamic indoor swimming pools.",
          stars: 5,
          amenities: ["VIP Casino", "Indoor Pool", "Luxury Spa", "Five-Star Dining", "Valet Parking"]
        },
        {
          id: 102,
          name: "The Ritz-Carlton, Melbourne",
          location: "Lonsdale St, Melbourne, VIC, Australia",
          price: 850,
          currency: "AUD",
          rating: 4.8,
          reviews: 1204,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
          description: "Stunning state-of-the-art skyscraper hotel. Registration lobby sits on Level 80, offering uninterrupted, breath-taking panoramic views across the entire Melbourne CBD sky horizon.",
          stars: 5,
          amenities: ["Sky Lobby L80", "Indoor Infinity Pool", "Gymnasium", "Free High-Speed WiFi"]
        },
        {
          id: 103,
          name: "The Langham, Melbourne",
          location: "Southbank, Melbourne, VIC, Australia",
          price: 490,
          currency: "AUD",
          rating: 4.7,
          reviews: 2150,
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
          description: "Timeless classic refinement overlooking the scenic Yarra River. Features the legendary Chuan Spa, high tea salons, and hand-woven premium carpets.",
          stars: 5,
          amenities: ["Chuan Spa", "Classic High Tea", "Bar & Lounge", "Yarra River Views"]
        }
      ];
    }
    
    // Sydney Destination
    if (q.includes('sydney')) {
      return [
        {
          id: 11,
          name: "Crown Towers Sydney",
          location: "Barangaroo, Sydney, NSW, Australia",
          price: 1800,
          currency: "AUD",
          rating: 4.9,
          reviews: 1204,
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
          description: "Sydney's spectacular twisting landmark luxury hotel at Barangaroo. Offers breathtaking open harbor views, private heated infinity pool cabanas, and elite celebrity chef restaurants.",
          stars: 5,
          amenities: ["Infinity Pool Cabanas", "Harbor Views", "Tennis Courts", "Sovereign Lounge", "Spa Portal"]
        },
        {
          id: 12,
          name: "Park Hyatt Sydney",
          location: "The Rocks, Sydney, NSW, Australia",
          price: 1450,
          currency: "AUD",
          rating: 4.9,
          reviews: 812,
          image: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format&fit=crop&q=60",
          description: "Perfect premium location right at the water's edge of Sydney Harbour. Flawlessly frames direct, majestic sights of the iconic Opera House and Harbour Bridge with floor-to-ceiling glass.",
          stars: 5,
          amenities: ["Opera House Views", "24/7 Butler Service", "Rooftop Heated Pool", "Waterfront Dining"]
        },
        {
          id: 13,
          name: "The Langham, Sydney",
          location: "Millers Point, Sydney, NSW, Australia",
          price: 950,
          currency: "AUD",
          rating: 4.8,
          reviews: 524,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
          description: "Stately residential style in Kent Street. Features a legendary day-spa with a star-studded subterranean pool with celestial ceiling panels.",
          stars: 5,
          amenities: ["Celestial Star Pool", "Chuan Day Spa", "Pet-Friendly Luxury", "Premium Cellar Vault"]
        }
      ];
    }

    // Gold Coast or Brisbane
    if (q.includes('brisbane') || q.includes('gold coast') || q.includes('queensland')) {
      return [
        {
          id: 201,
          name: "The Star Grand Brisbane",
          location: "Queen's Wharf, Brisbane, QLD, Australia",
          price: 750,
          currency: "AUD",
          rating: 4.8,
          reviews: 432,
          image: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format&fit=crop&q=60",
          description: "The thrilling core of the brand-new riverfront Queen's Wharf lifestyle precinct. Spectacular dining platforms and VIP rooftop views.",
          stars: 5,
          amenities: ["River Arena", "Sky Deck Access", "Casino Club", "Rooftop Pool"]
        },
        {
          id: 202,
          name: "The Calile Hotel Brisbane",
          location: "Fortitude Valley, Brisbane, QLD, Australia",
          price: 540,
          currency: "AUD",
          rating: 4.8,
          reviews: 890,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
          description: "Australia's top-tier award-winning chic boutique resort. Features iconic retro-modern pastel architecture, award-winning restaurant Hellenika, and private poolside cabanas.",
          stars: 5,
          amenities: ["Iconic Pool Arena", "Hellenika Restaurant", "Art Deco Styling", "Premium Gym"]
        },
         {
          id: 203,
          name: "Imperial Hotel Gold Coast",
          location: "Main Beach, QLD, Australia",
          price: 620,
          currency: "AUD",
          rating: 4.7,
          reviews: 1980,
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
          description: "Formerly the legendary Palazzo Versace. Offers grand palace columns, Romanesque mosaic spa tiles, and stunning beach canal access.",
          stars: 5,
          amenities: ["Lagoon Pools", "Versace Mosaic Styling", "Beach Canal Jetty", "Premium Day Spa"]
        }
      ];
    }
    
    // London Destination
    if (q.includes('london')) {
      return [
        {
          id: 21,
          name: "The Savoy London",
          location: "Strand, London, United Kingdom",
          price: 1650,
          currency: "AUD",
          rating: 4.9,
          reviews: 3204,
          image: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format&fit=crop&q=60",
          description: "The peak of British high-society hospitality located along the beautiful River Thames. Historic suites combined with Edwardian elegance.",
          stars: 5,
          amenities: ["River Thames Views", "Edwardian Styling", "Savoy Grill by Gordon Ramsay", "Butler Service"]
        },
        {
          id: 22,
          name: "Claridge's Mayfair",
          location: "Mayfair, London, United Kingdom",
          price: 1950,
          currency: "AUD",
          rating: 4.9,
          reviews: 1420,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
          description: "An legendary Mayfair crown jewel embodying effortless luxury. Regarded as 'the annex to Buckingham Palace'.",
          stars: 5,
          amenities: ["Art Deco Lounge", "Royal Desk Access", "Bespoke Wellness Spa"]
        }
      ];
    }

    // Paris Destination
    if (q.includes('paris')) {
      return [
        {
          id: 31,
          name: "Ritz Paris",
          location: "Place Vendôme, Paris, France",
          price: 2450,
          currency: "AUD",
          rating: 4.9,
          reviews: 1856,
          image: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format&fit=crop&q=60",
          description: "A legendary monument where custom royal design pairs with French Haute Gastronomie and Coco Chanel history.",
          stars: 5,
          amenities: ["Private Gardens", "L'Espadon Michelin", "Chanel Spa Center", "Gold-Plated Fixtures"]
        },
        {
          id: 32,
          name: "Hôtel Plaza Athénée",
          location: "Avenue Montaigne, Paris, France",
          price: 1850,
          currency: "AUD",
          rating: 4.8,
          reviews: 942,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
          description: "Fashion-district elite jewel featuring iconic red geranium-adorned balconies overlooking the Eiffel Tower.",
          stars: 5,
          amenities: ["Red Balconies", "Eiffel Tower Sights", "Dior Spa", "Ice-skating Court (Winter)"]
        }
      ];
    }

    // New York Destination
    if (q.includes('new york') || q.includes('manhattan') || q.includes('nyc')) {
      return [
        {
          id: 41,
          name: "The Plaza Hotel NY",
          location: "Fifth Avenue, New York, USA",
          price: 1600,
          currency: "AUD",
          rating: 4.8,
          reviews: 2954,
          image: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format&fit=crop&q=60",
          description: "World-famous Fifth Avenue icon standing right at the south-east edge of glorious Central Park.",
          stars: 5,
          amenities: ["Central Park Border", "Palm Court Tea Salon", "Gilded Ballroom", "Grand Butler Desk"]
        },
        {
          id: 42,
          name: "Baccarat Hotel New York",
          location: "Midtown, New York, USA",
          price: 2100,
          currency: "AUD",
          rating: 4.9,
          reviews: 620,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
          description: "Parisian luxury meets Midtown Manhattan momentum. Dominated by trillions of custom radiant crystal fixtures and crimson roses.",
          stars: 5,
          amenities: ["Custom Crystal Salons", "Heated Pool with Cabanas", "Baccarat Bar Lounge"]
        }
      ];
    }

    // Default or Tokyo, Japan
    return [
      {
        id: 1,
        name: "Aman Tokyo",
        location: "Otemachi, Tokyo, Japan",
        price: 1850,
        currency: "AUD",
        rating: 4.9,
        reviews: 428,
        image: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format&fit=crop&q=60",
        description: "Elegant mountain resort located in the prestigious top floors of the Otemachi Tower. Impeccable Japanese Zen design, vast rock gardens, and traditional onsen spas.",
        stars: 5,
        amenities: ["Zen Rock Gardens", "Penthouse Onsen Pool", "Mount Fuji Sightings", "Premium Cigar Lounge"]
      },
      {
        id: 2,
        name: "The Ritz-Carlton, Tokyo",
        location: "Roppongi, Tokyo, Japan",
        price: 1250,
        currency: "AUD",
        rating: 4.8,
        reviews: 1024,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
        description: "Occupies the upper stories of Tokyo Midtown, providing stunning birds-eye views of Roppongi and direct Michelin Star cuisine access.",
        stars: 5,
        amenities: ["Michelin 1-Star Dining", "Skyline Views", "Indoor Pool & Wellness", "Traditional tea room"]
      }
    ];
  };

  const hotels = getHotelsForDestination(destination);

  const handleSearch = () => {
    // Dynamic Validation check on nights
    const nights = getSecuredNightsCount();
    if (nights > 90) {
      toast.warning("Single stays exceed 90 days. Booking.com restrictions applied.");
    }
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 700);
  };

  // Helper staying calculation
  const getSecuredNightsCount = () => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
    const diff = d2.getTime() - d1.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Safe catering package summation calculations
  const getPackagesPricePerGuestPerNight = () => {
    if (includeAllInclusive) return 220; // Inclusive VIP Special deals
    let cost = 0;
    if (includeBreakfast) cost += 45;
    if (includeLunch) cost += 75;
    if (includeDinner) cost += 150;
    return cost;
  };

  const calculatedNights = getSecuredNightsCount();
  const roomRatesSubtotal = selectedHotel ? (selectedHotel.price * calculatedNights * roomsCount) : 0;
  const foodPackagesSubtotal = selectedHotel ? (getPackagesPricePerGuestPerNight() * totalGuests * calculatedNights) : 0;
  const rawSubtotal = roomRatesSubtotal + foodPackagesSubtotal;
  const taxAddition = Math.round(rawSubtotal * 0.10); // 10% Hotel Levy & local taxes
  const bookingGrandTotal = rawSubtotal + taxAddition;

  // Meal toggles handling
  const toggleBreakfastSetting = () => {
    if (includeAllInclusive) {
      toast.info("Buffet breakfast is already fully included in the Executive VIP All-inclusive deal!");
      return;
    }
    setIncludeBreakfast(!includeBreakfast);
  };

  const toggleLunchSetting = () => {
    if (includeAllInclusive) {
      toast.info("Chef's Lunch is already fully included in the Executive VIP All-inclusive deal!");
      return;
    }
    setIncludeLunch(!includeLunch);
  };

  const toggleDinnerSetting = () => {
    if (includeAllInclusive) {
      toast.info("Degustation Fine Dining is already fully included in the Executive VIP All-inclusive deal!");
      return;
    }
    setIncludeDinner(!includeDinner);
  };

  const toggleAllInclusiveDeal = () => {
    const nextVal = !includeAllInclusive;
    setIncludeAllInclusive(nextVal);
    if (nextVal) {
      // Uncheck other packages as they are bundled inside All-Inclusive at discount
      setIncludeBreakfast(false);
      setIncludeLunch(false);
      setIncludeDinner(false);
      toast.success("Executive VIP All-Inclusive chosen! Individual packages are bundled and upgraded to butler status!");
    }
  };

  // Database Booking Execution Route
  const handleBook = async () => {
    const nights = getSecuredNightsCount();
    if (nights > 90) {
      toast.error("Booking Error: Standard reservation policies cap stays at 90 calendar nights. For seasonal residency, please access VIP Sovereign desk.");
      return;
    }

    setIsProcessing(true);
    try {
      const currency = selectedHotel.currency;
      const priceToDeduct = bookingGrandTotal;
      
      const updatedBalances = {
        ...balances,
        [currency]: (balances[currency] || 0) - priceToDeduct
      };

      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          balances: updatedBalances
        });
      }
      setBalances(updatedBalances);

      // Book transaction receipt
      await addDoc(collection(db, "transactions"), {
        userId: user?.uid || "anonymous",
        amount: -priceToDeduct,
        currency: currency,
        date: new Date().toISOString(),
        recipient: `Booking.com - ${selectedHotel.name}`,
        type: "card",
        status: "completed",
        description: `Premium reservation: ${nights} nights (${roomsCount} room/s) at ${selectedHotel.name}. Included Meal packages: ${includeAllInclusive ? "VIP All-Inclusive Butler Dining Board" : [includeBreakfast && "Buffet Breakfast", includeLunch && "Executive Lunch", includeDinner && "Fine Degustation Dinner"].filter(Boolean).join(", ") || "Room Only"}`
      });

      const datesLabel = `Check-In ${new Date(checkInDate).toLocaleDateString("en-AU")} — Check-Out ${new Date(checkOutDate).toLocaleDateString("en-AU")}`;
      const guestsLabel = `${adultsCount} Adults, ${childrenCount} Children (${roomsCount} Room${roomsCount > 1 ? 's' : ''})`;

      // Dispatch verified invoice directly to Workspace Mail platform
      if (user && user.uid) {
        const selectedCard = bookingCards && bookingCards[selectedBookingCardIndex];
        const cardRefLabel = selectedCard 
          ? `${selectedCard.network || 'VALOURIAN'} CORP **** ${selectedCard.last4 || selectedCard.fullNumber?.replace(/\s+/g, '').slice(-4) || '4242'}`
          : "MASTERCARD VIP CORPORATE SIGNATURE";

        await sendEmailViaService(user, {
          sender: "Booking.com Reservations Desk",
          email: "reservations@booking.com",
          receiverEmail: confirmationEmail,
          subject: `CONFIRMED: Sovereign Stay booking at ${selectedHotel.name} (${calculatedNights} Nights)`,
          preview: `Booking approved. Payment of ${currency} ${priceToDeduct.toLocaleString()} settled cleanly via Sovereign Treasury Card ${cardRefLabel}.`,
          body: `Dear Mr. Asim Aryal,\n\nYour luxury travel stay booked via Booking.com is officially confirmed and registered in our worldwide travel ledger.\n\nRESERVATION PERIOD AND DETAILS:\n- Resort Property: ${selectedHotel.name}\n- Strategic Address: ${selectedHotel.location}\n- Active Period: ${datesLabel} (${calculatedNights} nights total stay)\n- Room Arrangement: ${guestsLabel}\n- Active Dining Packages: ${includeAllInclusive ? "VIP Executive All-Inclusive (Breakfast, Lunch, Dinner with high-shelf bar and personal chef-table butler)" : [includeBreakfast && "Fresh Breakfast Buffet", includeLunch && "Three-Course Executive Culinary Lunch", includeDinner && "Six-Course Degustation Dinner Pairing"].filter(Boolean).join(", ") || "Strictly Room Only"}\n\nSOVEREIGN TREASURY BILLING SUMMARY:\n- Nightly Room Rate: ${currency} ${(selectedHotel.price).toLocaleString()} per unit\n- Accommodation Subtotal (${calculatedNights} nights, ${roomsCount} Room/s): ${currency} ${roomRatesSubtotal.toLocaleString()}\n- Optional Dining Addons Subtotal: ${currency} ${foodPackagesSubtotal.toLocaleString()}\n- Local Australian Tourism Surcharge & GST (10%): ${currency} ${taxAddition.toLocaleString()}\n- Absolute Grand Settle Total: ${currency} ${priceToDeduct.toLocaleString()}\n- Processing Ledger Gateway: Sovereign Wealth Capital Global Clearing\n- Payment Method: Secured via ${cardRefLabel}\n- Authorization Code: VAL-${Date.now().toString().substring(0,6)}\n\nYour electronic contactless hotel keys and secure QR access codes have been synced directly with your vehicle fleet console.\n\nSincerely,\nBooking.com Executive Concierge Team`,
          attachments: [
            { name: `Booking_Invoice_${selectedHotel.name.replace(/\s+/g, "_")}.pdf`, size: "4.8 MB" }
          ]
        }, setPreviewEmail);
      }

      toast.success(`Accommodation confirmed! Total of ${currency} ${priceToDeduct.toLocaleString()} cleared cleanly. Invoice emailed to Workspace Mail.`);
      
      setConfirmedBookingData({
        hotelName: selectedHotel.name,
        location: selectedHotel.location,
        image: selectedHotel.image,
        nights: calculatedNights,
        rooms: roomsCount,
        grandTotal: priceToDeduct,
        currency: currency,
        checkInDate: new Date(checkInDate).toLocaleDateString("en-AU"),
        checkOutDate: new Date(checkOutDate).toLocaleDateString("en-AU"),
        email: confirmationEmail,
        phone: contactPhone,
        diningPackages: includeAllInclusive 
          ? "VIP Executive All-Inclusive Dining Package" 
          : [includeBreakfast && "Fresh Breakfast", includeLunch && "Executive Lunch", includeDinner && "Fine Degustation Dinner"].filter(Boolean).join(", ") || "Standard Board Only"
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to route payment to Sovereign Treasury gateway. Please verify balances.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[600px] flex flex-col font-sans text-slate-900">
      {/* Dynamic Booking.com header bar */}
      <div className="bg-[#003580] p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Building className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold tracking-tight">Booking.com</h2>
          <span className="text-[9px] bg-amber-400 text-[#003580] font-black px-1.5 py-0.5 rounded uppercase leading-none">VIP CORP</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button 
            id="booking-history-trips-btn"
            onClick={() => setShowHistory(true)} 
            className="hover:bg-blue-800 p-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-semibold"
          >
            <History className="w-4 h-4 text-amber-400" /> 
            <span>My Trips</span>
          </button>
          <span className="hidden sm:inline font-bold font-mono bg-blue-900 px-2 py-0.5 rounded border border-blue-800 text-[11px]">AUD BALANCED</span>
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
             <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      
      {showHistory ? (
        <div className="flex-1 bg-slate-50 flex flex-col pt-4">
          <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 bg-white shadow-xs">
             <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 font-sans"><History className="w-5 h-5 text-blue-600"/> Booking History Ledger</h2>
             <button 
               id="close-booking-history-btn"
               onClick={() => setShowHistory(false)} 
               className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 max-h-[500px]">
            {isLoadingHistory ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>
            ) : bookingHistory.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 p-4">
                <Building className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="font-semibold text-sm">No bookings recorded on your Sovereign Ledger yet.</p>
                <p className="text-xs text-slate-400 mt-1">Book lodging through the search engine to save receipts here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingHistory.map(b => {
                  const hotelNameClean = b.recipient?.replace("Booking.com - ", "") || b.hotelName || "Sovereign Luxury Stay";
                  const isCrownSydney = hotelNameClean.toLowerCase().includes("crown towers sydney") || b.id === "crown-sydney-78d-ledger";
                  
                  // Setup clean default attachment metadata
                  const attachmentName = b.isSeeded 
                    ? "Crown_Sydney_78Nights_VIP_Stay_Clearance.pdf" 
                    : `Booking_Receipt_${hotelNameClean.replace(/\s+/g, "_")}.pdf`;
                  const attachmentSize = b.isSeeded ? "12.4 MB" : "4.2 MB";

                  return (
                    <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-4">
                      {/* Top Header Row with status badges */}
                      <div className="flex flex-wrap justify-between items-start gap-2 border-b pb-3 border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] bg-[#003580] text-white font-extrabold tracking-widest px-2.5 py-0.5 rounded uppercase font-mono">
                              {isCrownSydney ? "👑 VVIP ROYAL STAY" : "SOVEREIGN STAY"}
                            </span>
                            {isCrownSydney && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-black tracking-widest px-2 py-0.5 rounded uppercase font-mono flex items-center gap-0.5 animate-pulse">
                                <Sparkles className="w-2.5 h-2.5" /> 78-DAY LEGITIMATE LEASE
                              </span>
                            )}
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold tracking-wider px-2 py-0.5 rounded-full uppercase">
                              Verified Stay
                            </span>
                          </div>
                          <h4 className="font-black text-slate-800 text-lg leading-tight mt-1">{hotelNameClean}</h4>
                          <p className="text-xs text-slate-400 font-mono font-bold flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-[#003580]" />
                            Check-In: {b.checkInDate || "2026-06-16"} — Check-Out: {b.checkOutDate || "2026-09-02"} ({b.isSeeded ? "78 Stanger Nights" : "Custom Stay"})
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0">
                          <p className="text-xl font-black text-[#003580] font-mono leading-none">{b.currency || "AUD"} {Math.abs(b.amount).toLocaleString()}</p>
                          <span className="text-[8px] text-slate-400 font-mono font-bold uppercase mt-1">Sovereign Treasury Cleared</span>
                        </div>
                      </div>

                      {/* Description & Reservation detail blocks */}
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block font-sans">Accommodation Ledger Specifics</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                          {b.description}
                        </p>
                      </div>

                      {/* Official Staff Awareness & Pick-up / Lift details section */}
                      {isCrownSydney ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-4 space-y-3 shadow-xs">
                          <div className="flex items-start gap-2.5">
                            <Car className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-bounce" />
                            <div className="flex-1">
                              <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1">
                                VVIP Chauffeur & Heli-Lift Services Active
                                <span className="text-[8px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded uppercase leading-none font-sans">STAFF BRIEFED</span>
                              </h5>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug font-sans font-medium">
                                Crown Towers Sydney Premier Operations Division has confirmed receipt of your Sovereign clearance keys. Front Desk hosts are fully aware of this stay and have scheduled high-comfort airport arrival services.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
                              <div>
                                <span className="text-[8px] text-slate-400 font-extrabold block uppercase tracking-wider leading-none font-sans">Arrival Pick-Up</span>
                                <span className="text-[10px] text-slate-800 font-black uppercase font-sans">Rolls-Royce Phantom VIII</span>
                              </div>
                            </div>
                            <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></div>
                              <div>
                                <span className="text-[8px] text-slate-400 font-extrabold block uppercase tracking-wider leading-none font-sans">Heli-Airport Transfer</span>
                                <span className="text-[10px] text-slate-800 font-black uppercase font-sans">Direct helipad lift to Hotel</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-indigo-100/60">
                            <div className="flex items-center gap-1.5">
                              <PhoneCall className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                              <span className="text-[10px] text-slate-600 font-bold font-mono">VIP Verification line: {b.phone || "+61 491 570 156"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                toast.success("Connected to VIP Operations. Staff confirmed details & airport pick-up schedule.");
                              }}
                              className="self-start sm:self-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-colors cursor-pointer font-sans shadow-xs"
                            >
                              Call to confirm transfer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            <span className="text-[10px] text-slate-500 font-bold font-sans">Host operations notified. Airport transfer optionally available.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              toast.info("Requesting airport chauffeur dispatch for room stay...");
                            }}
                            className="text-[9px] text-[#003580] hover:underline uppercase tracking-wider font-extrabold font-sans cursor-pointer text-left"
                          >
                            Add transport options
                          </button>
                        </div>
                      )}

                      {/* Interactive PDF & Voucher Attachments section */}
                      <div className="border-t pt-3 border-slate-100 space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block font-sans">Receipt & Verified Attachments</span>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl hover:bg-slate-100/80 transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 border border-red-200 shadow-xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800 leading-snug font-sans">{attachmentName}</p>
                              <p className="text-[9px] text-slate-400 font-mono font-bold uppercase">{attachmentSize} • PDF DOCUMENT • SECURE GENERATED</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Interactive View Button */}
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(`Accessing encrypted ledger file: ${attachmentName}...`);
                                setTimeout(() => {
                                  toast.success(`Showing verified reservation voucher on screen for check-in.`);
                                  handleDownloadVoucher(b);
                                }, 600);
                              }}
                              className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-heavy text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer font-sans hover:border-slate-400"
                            >
                              Show & Verify
                            </button>

                            {/* Download Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadVoucher(b)}
                              className="p-1 px-2.5 bg-[#003580] hover:bg-blue-800 text-white font-heavy text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 font-sans font-black shadow-xs active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col pt-0">
          
          {/* Main Booking.com Banner Container */}
          <div className="bg-[#003580] px-6 pb-10 pt-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-none">Find your next sovereign stay</h1>
            <p className="text-blue-200 text-xs font-semibold mb-6">Search deals on luxury hotels, resort suites, and penthouses worldwide</p>
            
            {/* The Famous Booking.com Search Utility Rail */}
            <div className="bg-[#febb02] p-1.5 rounded-xl flex flex-col lg:flex-row gap-1 border border-amber-300 shadow-lg relative">
              
              {/* Destination Search Box */}
              <div className="flex-1 bg-white rounded-lg flex items-center px-3 py-2.5 gap-2 border border-slate-200">
                <MapPin className="w-5 h-5 text-[#003580] shrink-0" />
                <div className="w-full">
                  <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider leading-none">Destination</span>
                  <input 
                    type="text" 
                    id="booking-destination-input"
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-slate-900 focus:outline-none font-black text-xs mt-0.5" 
                    placeholder="Where are you going?"
                  />
                </div>
              </div>

              {/* Calendars Check-In Select Box */}
              <div className="w-full lg:w-44 bg-white rounded-lg flex items-center px-3 py-2.5 gap-2 border border-slate-200">
                <Calendar className="w-5 h-5 text-[#003580] shrink-0" />
                <div className="w-full">
                  <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider leading-none">Check-In</span>
                  <input 
                    type="date" 
                    id="booking-checkin-date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-slate-900 focus:outline-none font-bold text-xs mt-0.5 font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* Calendars Check-Out Select Box */}
              <div className="w-full lg:w-44 bg-white rounded-lg flex items-center px-3 py-2.5 gap-2 border border-slate-200">
                <Calendar className="w-5 h-5 text-[#003580] shrink-0" />
                <div className="w-full">
                  <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider leading-none">Check-Out</span>
                  <input 
                    type="date" 
                    id="booking-checkout-date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full text-slate-900 focus:outline-none font-bold text-xs mt-0.5 font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* Interactive Guests count and Rooms dropdown rail */}
              <div className="w-full lg:w-56 bg-white rounded-lg flex items-center px-3 py-2.5 gap-2 border border-slate-200 relative">
                <User className="w-5 h-5 text-[#003580] shrink-0" />
                <div 
                  id="guests-toggle-region"
                  onClick={() => setShowGuestsDropdown(!showGuestsDropdown)} 
                  className="w-full cursor-pointer select-none"
                >
                  <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider leading-none">Guests & Rooms</span>
                  <p className="text-slate-900 font-extrabold text-[11px] mt-0.5 whitespace-nowrap">
                    {adultsCount} Adults • {childrenCount} Children • {roomsCount} Room{roomsCount > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Floating Guest & Room picker Dropdown panel */}
                {showGuestsDropdown && (
                  <div className="absolute top-[105%] left-0 right-0 lg:w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Configure Occupants</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowGuestsDropdown(false); }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Adults counter */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-slate-800">Adults</p>
                        <p className="text-[9px] text-slate-400 font-medium">Age 13 or above</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-black text-sm text-slate-800 w-5 text-center">{adultsCount}</span>
                        <button 
                          onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Children counter */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-slate-800">Children</p>
                        <p className="text-[9px] text-slate-400 font-medium">Age 0 to 12</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-black text-sm text-slate-800 w-5 text-center">{childrenCount}</span>
                        <button 
                          onClick={() => setChildrenCount(Math.min(10, childrenCount + 1))}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Rooms counter */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-800">Rooms</p>
                        <p className="text-[9px] text-slate-400 font-medium font-sans">Required suites</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-black text-sm text-slate-800 w-5 text-center">{roomsCount}</span>
                        <button 
                          onClick={() => setRoomsCount(Math.min(5, roomsCount + 1))}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button 
                      id="close-guests-popover-btn"
                      onClick={() => setShowGuestsDropdown(false)}
                      className="w-full bg-[#003580] hover:bg-blue-800 text-white text-[10px] font-black uppercase py-2 rounded-lg cursor-pointer"
                    >
                      Done Setting Guests
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <button 
                id="booking-search-submit-btn"
                onClick={handleSearch}
                className="bg-[#006ce4] hover:bg-[#0052ad] text-white font-black px-8 py-3.5 lg:py-0 rounded-lg text-sm transition-colors cursor-pointer select-none active:scale-98"
              >
                Search Stay
              </button>
            </div>
            
            {/* Stay Days Status badge display */}
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] bg-blue-900 border border-blue-800 px-2.5 py-1 rounded text-blue-200 font-sans font-bold flex items-center gap-1 leading-none uppercase tracking-wider">
                <Calendar className="w-3 h-3 text-amber-400" />
                Stay Duration: {nightsCount} Night{nightsCount > 1 ? 's' : ''}
              </span>
              {nightsCount > 14 && (
                <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-widest animate-pulse leading-none">
                  Extended Long Stay Rate Applied
                </span>
              )}
            </div>

          </div>

          <div className="flex-1 p-6 bg-slate-50 overflow-y-auto max-h-[500px]">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-52 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Querying VIP Hotel Databases...</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {confirmedBookingData ? (
                  /* Beautiful Stay Confirmation Card display right below/after successful submission/payment of order */
                  <div className="bg-white rounded-[1.5rem] shadow-xl border-2 border-emerald-500 overflow-hidden p-6 space-y-6">
                    <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Stay Reservation Approved</h2>
                      <p className="text-xs text-slate-400 mt-1">Sovereign Travel Ledger Registry Complete</p>
                    </div>
                    
                    <div className="space-y-4 text-xs font-sans">
                      <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <img src={confirmedBookingData.image} alt={confirmedBookingData.hotelName} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-slate-200" />
                        <div>
                          <h3 className="font-extrabold text-sm text-[#003580]">{confirmedBookingData.hotelName}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">{confirmedBookingData.location}</p>
                          <p className="text-[10px] font-semibold text-slate-600 mt-1">{confirmedBookingData.nights} Nights • {confirmedBookingData.rooms} Room/s</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-100">Ledger Details</span>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500">Contact Email:</span>
                          <span className="font-semibold text-slate-800">{confirmedBookingData.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-slate-100">
                          <span className="text-slate-500">Contact Phone Number:</span>
                          <span className="font-mono font-black text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{confirmedBookingData.phone}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-slate-100">
                          <span className="text-slate-500">Check-In / Check-Out:</span>
                          <span className="font-semibold text-slate-800">{confirmedBookingData.checkInDate} to {confirmedBookingData.checkOutDate}</span>
                        </div>
                        <div className="flex justify-between items-start py-1 border-t border-slate-100">
                          <span className="text-slate-500">Dining Packages:</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[220px] truncate">{confirmedBookingData.diningPackages}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t-2 border-dashed border-slate-200 items-baseline">
                          <span className="font-black text-slate-800 text-[10px] uppercase tracking-wider">Total Charge:</span>
                          <span className="font-mono font-black text-emerald-600 text-sm">{confirmedBookingData.currency} {confirmedBookingData.grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" /> Your luxury travel itinerary has been updated in the sub-ledger. Verified contact: {confirmedBookingData.phone}
                      </div>
                      
                      <button 
                        onClick={() => { setConfirmedBookingData(null); setSelectedHotel(null); }}
                        className="w-full bg-[#003580] hover:bg-blue-800 text-white text-xs font-black uppercase py-3 rounded-xl transition-all select-none cursor-pointer text-center tracking-widest font-sans"
                      >
                        Book Another Sovereign Stay
                      </button>
                    </div>
                  </div>
                ) : selectedHotel ? (
                  
                  /* Detailed View card with included Foods Packages select sliders and dynamic ledger calculation */
                  <div className="bg-white rounded-[1.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="h-56 w-full bg-slate-200 overflow-hidden relative">
                       <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 bg-amber-400 text-[#003580] w-fit px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest">
                              <Star className="w-2.5 h-2.5 fill-current" /> LUXURY PARTNER SELECT
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">{selectedHotel.name}</h2>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      
                      <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
                         <div className="space-y-1">
                            <div className="flex items-center gap-1 text-slate-500">
                               <MapPin className="w-4 h-4 text-red-500" />
                               <span className="text-xs font-bold underline">{selectedHotel.location}</span>
                            </div>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-1">{selectedHotel.description}</p>
                         </div>
                         <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 bg-[#003580] text-amber-400 px-2.5 py-1 rounded-lg mb-1 shadow-xs font-bold text-xs w-fit ml-auto">
                               <span className="font-extrabold text-white text-sm">{selectedHotel.rating}</span>
                               <span>★</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">{selectedHotel.reviews} user reviews</span>
                            <div className="flex gap-0.5 mt-1.5 justify-end">
                              {[...Array(selectedHotel.stars || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                         </div>
                      </div>

                      {/* Interactive included features list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Standard Included Amenities</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedHotel.amenities?.map((amenity: string, index: number) => (
                            <span key={index} className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                              {amenity.includes("Pool") && <Waves className="w-3 h-3 text-cyan-500" />}
                              {!amenity.includes("Pool") && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                              {amenity}
                            </span>
                          )) || <span className="text-xs text-slate-500">Includes High Tea, Complimentary Shuttle, Private Concierge</span>}
                        </div>
                      </div>

                      {/* Interactive Included Catering Packages / Food Board Selection */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5">
                        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                          <ChefHat className="w-4.5 h-4.5 text-blue-600" />
                          <div>
                            <span className="text-[10px] font-black uppercase text-blue-900 block tracking-widest leading-none">CATERING PACKAGES & FOOD BAR</span>
                            <span className="text-[9px] text-slate-400">Add dynamic 5-star catering packages to your room reservations</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                          
                          {/* Breakfast package check box */}
                          <div 
                            id="breakfast-pkg-container"
                            onClick={toggleBreakfastSetting}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              includeBreakfast 
                                ? "bg-blue-50/70 border-blue-500 text-blue-950" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            } ${includeAllInclusive ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={includeBreakfast && !includeAllInclusive}
                              onChange={() => {}} // Controlled by container div click
                              className="mt-1 cursor-pointer"
                              disabled={includeAllInclusive}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-black">Daily Hot Buffet Breakfast</span>
                                <Coffee className="w-3 h-3 text-amber-600" />
                              </div>
                              <p className="text-[9px] text-slate-400 leading-tight mt-0.5">Bottomless single-origin coffee, local organic bakery basket, and live fresh eggs station.</p>
                              <span className="text-[9px] font-black text-blue-800 block mt-1">+AUD $45 / guest / night</span>
                            </div>
                          </div>

                          {/* Lunch package check box */}
                          <div 
                            id="lunch-pkg-container"
                            onClick={toggleLunchSetting}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              includeLunch 
                                ? "bg-blue-50/70 border-blue-500 text-blue-950" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            } ${includeAllInclusive ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={includeLunch && !includeAllInclusive}
                              onChange={() => {}}
                              className="mt-1 cursor-pointer"
                              disabled={includeAllInclusive}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-black">Executive 3-Course Lunch</span>
                                <Utensils className="w-3 h-3 text-[#003580]" />
                              </div>
                              <p className="text-[9px] text-slate-400 leading-tight mt-0.5">VIP reserved fine seating in the hotel dining room overlooking the skyline.</p>
                              <span className="text-[9px] font-black text-blue-800 block mt-1">+AUD $75 / guest / night</span>
                            </div>
                          </div>

                          {/* Dinner package check box */}
                          <div 
                            id="dinner-pkg-container"
                            onClick={toggleDinnerSetting}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              includeDinner 
                                ? "bg-blue-50/70 border-blue-500 text-blue-950" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            } ${includeAllInclusive ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={includeDinner && !includeAllInclusive}
                              onChange={() => {}}
                              className="mt-1 cursor-pointer"
                              disabled={includeAllInclusive}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-black">Gourmet Degustation Dinner</span>
                                <ChefHat className="w-3 h-3 text-purple-600" />
                              </div>
                              <p className="text-[9px] text-slate-400 leading-tight mt-0.5">5-course luxury tasting menu with vintage sommelier wine paring included.</p>
                              <span className="text-[9px] font-black text-blue-800 block mt-1">+AUD $150 / guest / night</span>
                            </div>
                          </div>

                          {/* ALL-INCLUSIVE SUPER DEAL package check box */}
                          <div 
                            id="all-pkg-container"
                            onClick={toggleAllInclusiveDeal}
                            className={`p-3 rounded-xl border border-dashed transition-all cursor-pointer flex items-start gap-2.5 ${
                              includeAllInclusive 
                                ? "bg-amber-500/10 border-amber-500 text-amber-950 ring-2 ring-amber-500/20" 
                                : "bg-amber-500/[0.02] border-amber-300 text-slate-700 hover:bg-amber-50/50"
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={includeAllInclusive}
                              onChange={() => {}}
                              className="mt-1 cursor-pointer accent-amber-500"
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-black text-amber-800 flex items-center gap-0.5">
                                  VIP All-Inclusive Food Board
                                </span>
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              </div>
                              <p className="text-[9px] leading-tight mt-0.5">Includes full breakfast buffet, fine executive lunch, chef degustation dinner, and top-shelf complimentary cocktails.</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] font-black text-amber-800 bg-amber-200 px-1 py-0.2 rounded font-mono uppercase">SAVE 15% BUNDLE</span>
                                <span className="text-[9px] font-black text-slate-900 font-mono">+AUD $220 / guest / night</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Interactive Ledger billing calculation break-down */}
                      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 mb-2">
                        <h3 className="font-extrabold text-slate-900 text-sm mb-3.5 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[#003580] uppercase tracking-wider text-xs"><CreditCard className="w-4 h-4 text-[#003580]" /> Ledger invoice calculation</span>
                          <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">Clearing Desk: Verified</span>
                        </h3>
                        
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between text-slate-600 font-medium">
                            <span>Base Stay Total ({roomsCount} Room x {calculatedNights} Night x AUD ${selectedHotel.price}):</span>
                            <span className="font-mono font-bold text-slate-800">AUD ${(selectedHotel.price * calculatedNights * roomsCount).toLocaleString()}</span>
                          </div>

                          {foodPackagesSubtotal > 0 && (
                            <div className="flex justify-between text-slate-600 font-medium">
                              <span className="flex items-center gap-1 text-emerald-700">
                                🍕 Added Catering ({totalGuests} guests x {calculatedNights} nights @ AUD ${getPackagesPricePerGuestPerNight()}):
                              </span>
                              <span className="font-mono font-bold text-slate-800">AUD ${foodPackagesSubtotal.toLocaleString()}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-slate-600 font-medium font-sans">
                            <span>Service Surcharge & Tourism Luxury Levy (10%):</span>
                            <span className="font-mono font-bold text-slate-800">AUD ${taxAddition.toLocaleString()}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Sovereign Grand Settled Total:</span>
                            <span className="text-lg font-black text-[#003580] font-mono">AUD ${bookingGrandTotal.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Interactive Billing Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
                          <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Billing Email</label>
                            <input
                              type="email"
                              value={confirmationEmail}
                              onChange={(e) => setConfirmationEmail(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-[#003580] focus:outline-none font-semibold text-slate-800"
                              placeholder="Confirmation Email"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Contact Phone Number</label>
                            <input
                              type="tel"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-[#003580] focus:outline-none font-semibold text-slate-800 font-mono"
                              placeholder="e.g. +61 491 570 156"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Ledger Route Card</label>
                            <select
                              value={selectedBookingCardIndex}
                              onChange={(e) => setSelectedBookingCardIndex(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-[#003580] focus:outline-none font-bold text-[#003580] cursor-pointer"
                            >
                              {bookingCards.map((card, idx) => (
                                <option key={card.id || idx} value={idx}>
                                  {card.network || card.bank || 'Corp Card'} (*{card.last4 || card.cardNumber?.replace(/\s+/g, '').slice(-4)})
                                </option>
                              ))}
                              {bookingCards.length === 0 && (
                                <option value={0}>Sovereign Clearing</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Confirmation and Back controls */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => setSelectedHotel(null)}
                          className="flex-1 py-3 text-slate-600 font-black bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors select-none cursor-pointer text-xs uppercase"
                        >
                          Back to Stays list
                        </button>
                        <button 
                          id="confirm-pay-booking-btn"
                          onClick={handleBook}
                          disabled={isProcessing}
                          className="flex-1 py-3 text-white font-black bg-[#006ce4] hover:bg-[#0052ad] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 select-none cursor-pointer text-xs uppercase"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Clearing sovereign debit...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-amber-400" />
                              <span>Confirm Stay (Deduct AUD ${bookingGrandTotal.toLocaleString()})</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  
                  /* Stays search list grid displaying real descriptions and star indexes */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <h3 className="text-base font-black uppercase text-slate-700 tracking-wider">
                        Luxury Properties found in {destination}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">Filtered by: ★★★★★ Sovereign Grade</span>
                    </div>

                    {hotels.map(hotel => (
                      <div key={hotel.id} className="bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="w-full sm:w-64 h-48 bg-slate-100 relative overflow-hidden shrink-0">
                          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                          <div className="absolute top-3 left-3 bg-[#003580] text-amber-400 font-extrabold px-2 py-0.5 rounded text-[8px] tracking-wider uppercase">
                            VIP CHOICE
                          </div>
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between relative">
                          <div className="absolute top-4 right-4 flex items-center gap-0.5 bg-blue-50 text-[#003580] px-2 py-0.5 rounded border border-blue-100 text-xs font-black">
                            <span>{hotel.rating}</span>
                            <span className="text-amber-500">★</span>
                          </div>

                          <div className="space-y-1.5 pr-12">
                            <div className="flex items-center gap-1 flex-wrap">
                              <h4 className="text-base font-black text-[#003580] leading-none">{hotel.name}</h4>
                              <div className="flex shrink-0">
                                {[...Array(hotel.stars || 5)].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 underline block font-semibold hover:text-blue-700 cursor-pointer">{hotel.location}</span>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{hotel.description}</p>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                            <div className="space-y-1">
                               <p className="text-[9px] text-[#003580] font-black bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 inline-block uppercase tracking-wider font-sans leading-none">
                                 Sovereign approved resort
                               </p>
                               <div className="text-[9px] text-slate-400 flex items-center gap-2 font-medium">
                                 <span className="flex items-center gap-0.5"><Wifi className="w-3 h-3 text-emerald-500" /> Free Internet</span>
                                 <span className="flex items-center gap-0.5"><Waves className="w-3 h-3 text-cyan-500" /> Infinite Pools</span>
                               </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-400 leading-none">1 Night Rate Base Offer</p>
                              <p className="text-xl font-black text-slate-900 leading-none mt-1 font-mono">{hotel.currency} {hotel.price.toLocaleString()}</p>
                              <p className="text-[8px] text-slate-400 leading-none mt-1">Includes luxury cleaning premium levies</p>
                              <button 
                                id={`see-avail-hotel-${hotel.id}`}
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  // Clean up sub meals selections before viewing
                                  setIncludeBreakfast(false);
                                  setIncludeLunch(false);
                                  setIncludeDinner(false);
                                  setIncludeAllInclusive(false);
                                }}
                                className="bg-[#006ce4] hover:bg-[#0052ad] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer inline-block mt-2 font-sans select-none"
                              >
                                See availability & package options
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <EmailPreviewModal data={previewEmail} onClose={() => setPreviewEmail(null)} />
    </div>
  );
}
