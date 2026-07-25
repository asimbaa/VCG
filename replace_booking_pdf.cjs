const fs = require('fs');
let code = fs.readFileSync('src/components/bank/BookingApp.tsx', 'utf8');

const newPdfCode = `
  const handleDownloadVoucher = async (b: any) => {
    toast.info("Generating encrypted PDF ledger voucher...");
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      
      const doc = new jsPDF();
      const hotelName = b.recipient?.replace("Booking.com - ", "") || b.hotelName || "Sovereign Hotel";
      const guest = b.guestName || "Mr. Asim Aryal";
      const phone = b.phone || "+61 491 570 156";
      const checkIn = b.checkInDate || "2026-06-16";
      const checkOut = b.checkOutDate || "2026-09-02";
      const stayNights = b.nights || 78;
      const roomCount = b.rooms || 1;
      const bAmt = b.amount ? Math.abs(b.amount).toLocaleString() : "273,000";
      const bCurrency = b.currency || "AUD";
      
      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("VALOURIAN CAPITAL", 14, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("SOVEREIGN TRAVEL LEDGER", 14, 32);
      
      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL COMPLIANCE CHECK-IN CLEARANCE", 14, 55);
      
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text("STATUS: LEGITIMATE, VERIFIED & GUARANTEED BY THE TREASURY", 14, 63);
      doc.text("CLEARANCE CODE: VC-ETA-9942 / LEVEL-55 CLEARANCE", 14, 69);
      
      // Details Table
      autoTable(doc, {
        startY: 80,
        head: [['PROPRIETARY REGISTRY DETAILS', '']],
        body: [
          ['Hotel Property', hotelName],
          ['Address', 'Barangaroo Avenue, Barangaroo NSW 2000, Australia'],
          ['Guest Name', guest],
          ['Contact Phone', \`\${phone} (VERIFIED AT SIGN-IN)\`],
          ['Total Nights', \`\${stayNights} Nights\`],
          ['Total Rooms', \`\${roomCount} Premium Suite/s\`],
          ['Check-In Date', \`\${checkIn} (From 14:00 AEDT)\`],
          ['Check-Out Date', \`\${checkOut} (Until 11:00 AEDT)\`],
          ['Status Level', 'PLATINUM ROYALTY VVIP'],
          ['Catering Package', 'VIP All-Inclusive Butler Dining Board & Degustation']
        ],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      
      // Billing Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['TREASURY BILLING & PAYMENT STATUS', '']],
        body: [
          ['Settle Status', 'ACCOMMODATION FULLY FUNDED IN ADVANCE'],
          ['Billing Gateway', 'Sovereign Wealth Capital Global Clearing'],
          ['Grand Total Settle', \`\${bCurrency} \${bAmt}\`],
          ['Payment Type', 'MASTERCARD VIP CORPORATE SIGNATURE'],
          ['Verification Ref', 'SEC-LEDGER-CRN-STAY-2026']
        ],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      
      // Footer/Notes
      let finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("SPECIAL DISPATCH & COURTESY TRANSFERS", 14, finalY);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("The Crown Towers Sydney VIP Concierge and Front Office Director have been fully briefed on this guest's residency.", 14, finalY + 8);
      doc.text("1. Rolls-Royce Phantom VIII Chauffeur Pick-up from Sydney International", 14, finalY + 14);
      doc.text("2. Direct helicopter lift to the hotel helipad / Barangaroo deck", 14, finalY + 19);
      doc.text("3. Private suite-side check-in (bypassing the public lobby check-in)", 14, finalY + 24);
      
      doc.setFont("helvetica", "bold");
      doc.text("THANK YOU FOR RESIDING WITH SOVEREIGN RESORT SYSTEM", 14, finalY + 40);
      
      doc.save(\`\${hotelName.replace(/\\s+/g, "_")}_VVIP_Checkin_Voucher.pdf\`);
      toast.success("Legitimate VVIP Check-In Voucher Saved as PDF!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF voucher.");
    }
  };
`;

code = code.replace(/const handleDownloadVoucher = \(b: any\) => \{[\s\S]*?toast\.success\("Legitimate VVIP Check-In Voucher Saved to Downloads Folder"\);\n  \};/, newPdfCode.trim());
fs.writeFileSync('src/components/bank/BookingApp.tsx', code);
