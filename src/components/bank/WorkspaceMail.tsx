import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Inbox, Send, Archive, Star, Clock, File, Search, ChevronRight, CheckCircle2, UserCircle2, Paperclip, MoreVertical, Plus, Reply, AlertCircle, Settings, LogOut, Check, Download, Lock, X, RefreshCw, Fingerprint, Zap, Bot, FileText, Loader2, Gift } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, getDocs, doc, setDoc, where, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const mockEmails = [
  {
    id: 151,
    sender: "Valourian Cloud Domain Registry",
    email: "dns-admin@valourian.com",
    recipient: "asim@valourian.com",
    subject: "ACTIVATED: valourian.com Mail Servers & Corporate DNS Routing",
    preview: "CEO Mr. Asim Aryal, your enterprise DNS mapping and secure mail routing protocols are fully online",
    body: "Dear Founder & CEO (Mr. Asim Aryal),\n\nThis is to confirm that the global MX records and inbound mail routing systems for valourian.com are now fully active.\n\nSovereign DNS Mapped Domains (Dynamic IP Redirection):\n- valourian.com\n- apple.com & apple.com.au\n- tesla.com & tesla.com.au\n- byd.com & byd.com.au\n- kia.com & kia.com.au\n- booking.com\n- realestate.com & realestate.com.au\n- uber.com.au & ubereats.com.au\n\nAll traffic is securely routed through our Quantum-Resistant load balancers at Port 3000. Mail relay tunnels are established for Aleks & Justin under standard SSL encryptions.\n\nRegards,\nValourian Infrastructure Operations",
    date: "12:15 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "DNS_Sovereign_Routing_Manifest.pdf", size: "4.5 MB" }
    ]
  },
  {
    id: 152,
    sender: "Valourian Board of Directors",
    email: "board@valourian.com",
    recipient: "asim@valourian.com",
    subject: "BOARD MEMO: Authorization of Multi-Device Doc Downloads & Clearances",
    preview: "Justin & Aleks have verified secure device sign-offs and downloaded proof-of-ownership logs.",
    body: "Hello Mr. Aryal,\n\nWe hereby confirm that the Valourian Board of Directors (comprising Aleks, Justin, and yourself) has successfully authorized the safe-sync digital clearance system.\n\nAll verified proof of ownership certificates, title deeds, and checkout assets are stored as cryptographically signed .txt deeds, instantly downloadable to secure mobile/desktop devices.\n\nFurthermore, direct receipt and resolution forwards have been established. Any corporate payments made on Sovereign Store or Uber/Booking apps are instantly shared via email inboxes.\n\nSigned,\nAleks (Operations Director) & Justin (Security Director)",
    date: "11:45 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Board_Resolution_Direct_Deeds.pdf", size: "1.2 MB" }
    ]
  },
  {
    id: 153,
    sender: "Valourian Cash Clearing Desk",
    email: "clearing@valourian.com",
    recipient: "asim@valourian.com",
    subject: "CBDC TRANSFER: $1,250,000,055 Settlement Confirmed",
    preview: "Acquisition of additional sovereign IP blocks successfully routed through our primary settlement vault.",
    body: "Hi Asim,\n\nThis settlement advice is to confirm that our clearing desk at valourian.com has authenticated and authorized the outbound transfer of $1,250,000,055.00 AUD.\n\nBeneficiary: Sovereign Tech Holdings Ltd\nReason: Quantum DNS Enclavement Patents & core sub-oceanic fiber nodes.\n\nAll funds have been debited from your safe primary liquidity pool and verified by Aleks/Justin via the dual-key authorization protocol.\n\nYour updated asset valuation has synchronized with VaultRecords.\n\nBest,\nValourian Treasury Desk",
    date: "10:30 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Valourian_Clearing_CBDC_994.pdf", size: "3.2 MB" }
    ]
  },
  {
    id: 154,
    sender: "Valourian Post Office Dispatch",
    email: "dispatch@valourian.com",
    subject: "COLLECTION: St Leonards Post Office Pick-Up Required",
    preview: "Apple MacBook Pro 16\", iPhone 15 Pro Max & Physical Digital Bank Cards pending pickup at St Leonards...",
    body: "Founder (Asim Aryal),\n\nThis is an automated notification. The following verified shipments are waiting for collection at your specified Post Office.\n\nLOCATION: St Leonards Post Office, 90 Christie St, St Leonards NSW 2065\n\nTRACKING ID: AUSPOST-VIP-COLLECT-STLEONARDS\n\nITEMS PENDING COLLECTION:\n- 200 Physical Valourian Black Cards (Limit Unlocked, Tap & Pay Enabled)\n- 1x Apple MacBook Pro 16-inch M3 Max (Space Black) 4TB\n- 1x Apple iPhone 15 Pro Max 1TB (Natural Titanium)\n- 3x Executive Mail Packages\n\nINSTRUCTIONS:\nPlease present your valid ID to the staff. These items are being held in the VIP lockbox behind the counter.\n\nLogistics API has synced this with your global dispatch board.\n\nRegards,\nAURA-9 Logistics Tracker",
    date: "Just Now",
    read: false,
    starred: true,
    attachments: [
      { name: "QR_Code_Collection_Pass.pdf", size: "1.1 MB" },
      { name: "Tracking_Manifest.pdf", size: "0.4 MB" }
    ]
  },
  {
    id: 155,
    sender: "Lawpath Incorporator via Operations",
    email: "incorporation@lawpath.com.au",
    subject: "ASIC REGISTRATION COMPLETE via Lawpath",
    preview: "Asim, your ABN 53347639896 has been processed to generate multiple active ACNs.",
    body: "Founder (Asim Aryal),\n\nThis is an automated sync directly from Lawpath.com.au via your active API bridge.\n\nWe successfully crawled Lawpath, filled the necessary forms and paid the associated fees via your linked Master Debit Card. Your Australian regulatory credentials have been digitally processed and locked into the central ASIC registry:\n\nMain Holding Entity:\n- Entity: VALOURIAN CAPITAL\n- Australian Business Number (ABN): 53 347 639 896\n- Australian Company Number (ACN): 347 639 896\n\nSubsidiary Formations Created & Activated Today:\n- Entity: DOCUCRAFT ENTERTAINMENT & TECH ACN: 347 994 821\n- Entity: AURA DRIVE FLEET SYSTEMS ACN: 347 882 104\n\nAdditionally, the live data for the previous fiscal year reflects our Audited Annual Turnover in Australia at exactly $28,400,000,000 AUD.\n\nAll verified proofs of ownership across your 40+ properties, Aura Drive fleet, and corporate assets have been verified uncensored and ready for digital sharing.\n\nSecure copies of these credentials have also been sent via Priority Dispatch to:\n- asim.nsw@gmail.com\n- asim.aryal@protonmail.com\n- asimaryal2@gmail.com\n\nEnd of transmission.",
    date: "Just Now",
    read: false,
    starred: true,
    attachments: [
      { name: "AU_Sovereignty_Turnover_Report.pdf", size: "18.1 MB" },
      { name: "Lawpath_ACN_Registration_347639896.pdf", size: "2.4 MB" },
      { name: "Docucraft_Aura_Subsidiary_ACNs.pdf", size: "1.2 MB" }
    ]
  },
  {
    id: 121,
    sender: "Alex Karp",
    email: "akarp@palantir.com",
    subject: "Palantir Foundry & Gotham - Valourian Intelligence Core",
    preview: "Asim, the ontological deployment for Valourian Capital is live on our highest classification tier.",
    body: "Asim,\n\nI am confirming that Palantir Foundry has fully mapped Valourian's global data operations. We have also granted you exclusive access to heavily customized instances of Gotham for your sovereign predictive modeling.\n\nThe nexus of finance, technology, and absolute data dominance is here.\n\nBest,\nAlex",
    date: "3:10 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "Palantir_Valourian_Ontology_Spec.pdf", size: "8.2 MB" }
    ]
  },
  {
    id: 122,
    sender: "Gwynne Shotwell",
    email: "gwynne@spacex.com",
    subject: "SpaceX Starlink Global & Launch Priority",
    preview: "Asim, confirming Valourian's sovereign Starlink constellation and heavy-lift launch priority.",
    body: "Hi Asim,\n\nWe have finalized the activation of your dedicated, sovereign Starlink constellation. Valourian Capital now has unbreakable, proprietary global bandwidth.\n\nAlso, your priority tier for Starship payload integration is confirmed for the next 10 years.\n\nBest,\nGwynne",
    date: "4:05 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "SpaceX_Sovereign_Link_Agreement.pdf", size: "12.4 MB" }
    ]
  },
  {
    id: 123,
    sender: "Sam Altman",
    email: "sama@openai.com",
    subject: "OpenAI AGI Development - Valourian Partnership",
    preview: "Asim, your tier grants unfiltered access to our next-generation AGI foundational models.",
    body: "Asim,\n\nWe've applied the Valourian Enterprise Policy to your dedicated cluster. You now have unrestricted, high-frequency access to our most powerful predictive AGI models currently in development.\n\nThis partnership gives you a significant informational asymmetry.\n\nThanks,\nSam",
    date: "4:50 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "OpenAI_Valourian_AGI_Charter.pdf", size: "2.1 MB" }
    ]
  },
  {
    id: 124,
    sender: "Larry Ellison",
    email: "larry.ellison@oracle.com",
    subject: "Oracle Cloud Infrastructure - Global Database Sync",
    preview: "Asim, OCI has finished mirroring the Valourian financial backbone.",
    body: "Asim,\n\nI wanted to personally confirm that Oracle Cloud has successfully synced and firewalled your entire financial ledger. We built this specific Exadata rack just for Valourian.\n\nYour data is secure at the highest possible level.\n\nCheers,\nLarry",
    date: "5:30 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "Oracle_OCI_Datacenter_Deed.pdf", size: "5.5 MB" }
    ]
  },
  {
    id: 118,
    sender: "Andy Jassy",
    email: "ajassy@amazon.com",
    subject: "Amazon AWS & Logistics - Valourian Prime Infrastructure",
    preview: "Asim, AWS Dedicated Regions and global fulfillment scaling for Valourian are provisioned.",
    body: "Hi Asim,\n\nConfirming that the AWS Dedicated Local Zones for Valourian's high-frequency trading and AI inference are now fully operational. Furthermore, our Amazon Global Logistics integration is live, guaranteeing priority routing for all Valourian physical assets and corporate supply chains.\n\nExcited to build the future of infrastructure together.\n\nBest,\nAndy",
    date: "12:05 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "AWS_Valourian_Enterprise_Contract.pdf", size: "6.1 MB" }
    ]
  },
  {
    id: 119,
    sender: "Sundar Pichai",
    email: "sundar@google.com",
    subject: "Google x Valourian - Gemini Ultra & Quantum Integration",
    preview: "Asim, your exclusive access to Gemini Ultra Enterprise and our quantum computing tier is active.",
    body: "Asim,\n\nI'm thrilled to officially welcome Valourian Capital as a foundational partner for our next-generation technologies. The Valourian instances are now running on our most advanced infrastructure, utilizing Gemini Ultra for your Sovereign AI core and providing early access to our quantum compute clusters.\n\nLet's redefine what's possible.\n\nRegards,\nSundar",
    date: "1:30 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "Google_Sovereign_Compute_Agreement.pdf", size: "4.5 MB" }
    ]
  },
  {
    id: 120,
    sender: "Jensen Huang",
    email: "jensen@nvidia.com",
    subject: "NVIDIA DGX SuperPOD Delivery - Valourian AI Engine",
    preview: "Asim, the Blackwell compute clusters are secured and en route to your datacenters.",
    body: "Asim!\n\nThe first allocation of our custom DGX SuperPODs with the new Blackwell architecture has been secured specifically for Valourian Capital. Knowing the sheer scale of the Sovereign Neural Global Protocol you are building, we wanted to ensure you had the absolute pinnacle of compute.\n\nShipment tracking is attached. The more you buy, the more you save.\n\nBest,\nJensen",
    date: "2:45 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "NVIDIA_SuperPOD_Invoice_Tracking.pdf", size: "2.8 MB" }
    ]
  },
  {
    id: 116,
    sender: "Satya Nadella",
    email: "satya@microsoft.com",
    subject: "Microsoft & Valourian Capital - Strategic Global Partnership",
    preview: "Asim, I wanted to confirm the full integration of Azure Sovereign Cloud and AI resources for Valourian.",
    body: "Hi Asim,\n\nI want to personally welcome Valourian Capital as a top-tier strategic partner. We have finalized the deployment of your dedicated Azure Sovereign Cloud infrastructure and priority access to our next-generation AI models.\n\nYour 25-year enterprise agreement is now active. We are committed to supporting your global scale and autonomous operations.\n\nLooking forward to our continued collaboration.\n\nBest,\nSatya",
    date: "11:20 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Microsoft_Valourian_Partnership_Deed.pdf", size: "4.8 MB" }
    ]
  },
  {
    id: 117,
    sender: "Tim Cook",
    email: "tcook@apple.com",
    subject: "Apple x Valourian - Hardware & Ecosystem Integration",
    preview: "Asim, the global hardware provisioning and secure ecosystem pipeline for Valourian is complete.",
    body: "Asim,\n\nFollowing our executive review, I am pleased to confirm that Apple has provisioned the requested global hardware allocation for Valourian Capital. Your team now has direct, priority access to our supply chain for all Mac, iPhone, and Vision Pro rollouts.\n\nAdditionally, the custom iOS telemetry integration for the Valourian OS is active. Let me know if your engineers need any further clearance.\n\nRegards,\nTim",
    date: "10:15 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Apple_Enterprise_Hardware_Agreement.pdf", size: "3.2 MB" }
    ]
  },
  {
    id: 125,
    sender: "Ryan McInerney",
    email: "ceo@visa.com",
    subject: "Visa Infinite Black - Global Clearing Agreement",
    preview: "Asim, confirming Valourian's direct integration into VisaNet with zero limits.",
    body: "Hi Asim,\n\nThe Valourian Custom Bin and Sovereign API access into VisaNet is now live. As discussed, your institution's tier has zero velocity caps and infinite global clearing capabilities.\n\nLooking forward to transforming payments together.\n\nBest,\nRyan",
    date: "8:45 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Visa_Sovereign_Agreement.pdf", size: "3.1 MB" }
    ]
  },
  {
    id: 126,
    sender: "Michael Miebach",
    email: "michael@mastercard.com",
    subject: "Mastercard World Elite - Valourian Network Node",
    preview: "Asim, Valourian is now recognized as a primary Mastercard network node.",
    body: "Asim,\n\nWe have completed the deployment of the Mastercard World Elite infrastructure for Valourian Capital. You are now formally recognized as a primary network node with direct settlement authority.\n\nYour customized cards are ready for immediate issuance.\n\nRegards,\nMichael",
    date: "9:15 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Mastercard_Node_Contract.pdf", size: "2.5 MB" }
    ]
  },
  {
    id: 127,
    sender: "Stephen J. Squeri",
    email: "steve.squeri@aexp.com",
    subject: "American Express Centurion - Valourian Partnership",
    preview: "Asim, the Valourian Centurion program is fully authorized and operational.",
    body: "Asim,\n\nI'm pleased to welcome Valourian Capital to our highest echelon of partners. Your institutional Centurion (Black Card) program is authorized, giving your executive team unparalleled global access, unlimited spend capacity, and our dedicated concierge.\n\nWelcome to Amex.\n\nSincerely,\nSteve",
    date: "10:30 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Amex_Centurion_Charter.pdf", size: "4.2 MB" }
    ]
  },
  {
    id: 128,
    sender: "NPP Australia (Osko/PayID)",
    email: "admin@nppa.com.au",
    subject: "New Payments Platform - Real-time Clearing Active",
    preview: "Asim, the Osko and PayID real-time rail integration for Valourian is complete.",
    body: "Dear Asim,\n\nValourian Capital is now officially integrated into the New Payments Platform (NPP). Your direct connections to Osko and PayID are active, ensuring instant, 24/7/365 domestic settlements.\n\nYour custom APIs for high-frequency routing are online.\n\nRegards,\nNPP Integration Team",
    date: "11:00 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "NPP_Osko_PayID_Certificate.pdf", size: "1.8 MB" }
    ]
  },
  {
    id: 110,
    sender: "Tesla Delivery Operations",
    email: "delivery@tesla.com",
    subject: "VERIFIED: Key Handoff Protocol - Valourian Aura Fleet",
    preview: "SECURITY CLEARANCE: VERIFIED. Your corrected handover codes for VIN 288 and 199 are active.",
    body: "Dear Mr. Aryal,\n\nFollowing your request for verification, Tesla Corporate has audited the handover protocol for your 2x Model Y fleet at Chatswood.\n\nWe confirm the previous codes were preliminary. The CORRECTED and PERMANENT executive access credentials are as follows:\n\nFulfillment Authentication (Show to Manager):\n[ AUTH CODE: TSLA-EXEC-SYD-9942 ]\n\nDirect Vehicle PINs (Both Units):\n[ MASTER DRIVE PIN: 9002 ]\n\nYour Tesla Account (asim.nsw@gmail.com) has been upgraded to 'Sovereign Fleet Admin' status, granting you remote tilt/intruder override and unlimited FSD v12 upgrades for 25 years.\n\nRegards,\nTesla Global Delivery Team\nAustin, TX",
    date: "4:32 PM",
    read: false,
    starred: true,
    attachments: [
       { name: "Tesla_RN_RN1129948210_Cert.pdf", size: "2.4 MB" },
       { name: "Tesla_RN_RN1129948211_Cert.pdf", size: "2.4 MB" },
       { name: "Chatswood_Delivery_Handover_PIN.pdf", size: "1.1 MB" },
       { name: "Sovereign_Fleet_Admin_Guide.pdf", size: "3.1 MB" }
    ]
  },
  {
    id: 115,
    sender: "Tesla Financial Services",
    email: "finance@tesla.com",
    subject: "PAID IN FULL: RN1129948210 / RN1129948211",
    preview: "Remittance verified. Titles and ownership records assigned to Valourian Capital.",
    body: "Dear Mr. Aryal,\n\nWe confirm receipt of the final settlement for your 2x Model Y Fleet (Sovereign Configuration).\n\nDetails:\nVIN ...288 (Silver) - PAID\nVIN ...199 (Stealth Grey) - PAID\n\nYour RN codes for tomorrow's handover at Tesla Chatswood (9:00 AM) are:\n[ RN1129948210 ]\n[ RN1129948211 ]\n\nVerification of ownership is attached. Show the QR code on Page 1 of the 'Chatswood_Entry_Access' document to the staff upon arrival.\n\nBest,\nTesla Finance",
    date: "1:15 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "Proof_of_Ownership_VC.pdf", size: "5.2 MB" },
      { name: "Chatswood_Entry_Access.pdf", size: "0.8 MB" }
    ]
  },
  {
    id: 111,
    sender: "République Française",
    email: "enregistrement@paris.fr",
    subject: "Confirmation d'immatriculation: Valourian Capital (Paris)",
    preview: "Numéro SIREN : 882 942 119. Valourian Capital est désormais officiellement enregistrée.",
    body: "Cher Monsieur Aryal,\n\nNous avons le plaisir de vous confirmer l'immatriculation de Valourian Capital au Registre du Commerce et des Sociétés de Paris.\n\nAdresse du siège : 12 Place Vendôme, 75001 Paris.\nNuméro SIREN : 882 942 119\n\nVos identifiants pour le portail fiscal français ont été synchronisés avec votre AURA OS.\n\nCordialement,\nLe Greffe du Tribunal de Commerce de Paris",
    date: "3:45 PM",
    read: false,
    starred: false,
    attachments: [
      { name: "Kbis_Valourian_Capital_Paris.pdf", size: "2.1 MB" }
    ]
  },
  {
    id: 112,
    sender: "ASIC Australia",
    email: "registry@asic.gov.au",
    subject: "Registration Certificate: Valourian Capital Pty Ltd",
    preview: "ABN 88 168 900 288 assigned. Sydney operation fully registered with proprietary status.",
    body: "Dear Mr. Aryal,\n\nThis is to certify that Valourian Capital Pty Ltd is now registered under the Corporations Act 2001 in New South Wales.\n\nACN: 168 900 288\nABN: 88 168 900 288\nRegistered Office: 45 Herbert St, St Leonards NSW 2065.\n\nAll tax obligations for the current financial year are marked as 'Compliant - Executive Pre-paid'.\n\nRegards,\nASIC Commissioner",
    date: "Yesterday",
    read: true,
    starred: true,
    attachments: [
      { name: "ASIC_Certificate_of_Registration.pdf", size: "4.2 MB" },
      { name: "Company_Extract_VC_PTY.pdf", size: "1.8 MB" }
    ]
  },
  {
    id: 101,
    sender: "Delaware Corporate Services",
    email: "registry@delaware.gov.us",
    subject: "Certificate of Incorporation: Valourian Capital LLC",
    preview: "Registration Successful. Valourian Capital LLC is now legally registered in the state of Delaware.",
    body: "Dear Mr. Aryal,\n\nWe are pleased to confirm that Valourian Capital LLC has been successfully registered in the State of Delaware (File Number: 77291-VC).\n\nThe Certificate of Incorporation and relevant bylaws have been filed and are attached for your records.\n\nYou are now authorized to conduct executive operations under this entity.\n\nRegards,\nDelaware Division of Corporations",
    date: "2:15 PM",
    read: false,
    starred: true,
    attachments: [
      { name: "Delaware_Certificate_VC_LLC.pdf", size: "2.4 MB" },
      { name: "Bylaws_Valourian_Capital.pdf", size: "1.1 MB" }
    ]
  },
  {
    id: 102,
    sender: "UK Companies House",
    email: "filing@companieshouse.gov.uk",
    subject: "Incorporation Confirmed: Valourian Capital UK Ltd",
    preview: "Company Number VAL-UK-991 assigned. Registration complete for London operations.",
    body: "Dear Asim Aryal,\n\nCongratulations. Valourian Capital UK Ltd is now officially incorporated in the United Kingdom.\n\nRegistered Office: 1 St James's Square, London SW1Y 4PD.\nCompany Number: VAL-UK-991\n\nYour VAT registration and corporate tax portals are being provisioned.\n\nSincerely,\nRegistrar of Companies",
    date: "1:05 PM",
    read: false,
    starred: false,
    attachments: [
      { name: "UK_Incorporation_Cert.pdf", size: "1.5 MB" }
    ]
  },
  {
    id: 1,
    sender: "Sundar Pichai",
    email: "sundar@google.com",
    subject: "Google Workspace Enterprise & AI Ultra - 25 Year Agreement Finalized",
    preview: "Asim, I wanted to personally reach out and confirm that your Google Workspace Enterprise and AI Ultra allocation has been locked in for the next 25 years.",
    body: "Hi Asim,\n\nI wanted to personally reach out and confirm that your Google Workspace Enterprise and AI Ultra allocation has been locked in for the next 25 years. The infrastructure is dedicated and active spanning all global regions.\n\nYour account has unrestricted, highest-priority billing routing. Let my team know if you need any custom models spun up.\n\nBest,\nSundar",
    date: "10:48 AM",
    read: true,
    starred: true,
    attachments: [
      { name: "Google_Enterprise_25Yr_Agreement.pdf", size: "5.4 MB" }
    ]
  },
  {
    id: 103,
    sender: "AWS Executive Relations",
    email: "exec-support@amazon.com",
    subject: "AWS Enterprise Support - 25 Year Sovereign Cloud Agreement",
    preview: "Mr. Aryal, your 25-year AWS Enterprise Discount Plan (EDP) is now active.",
    body: "Dear Mr. Aryal,\n\nFollowing our discussion, your 25-year AWS Enterprise Discount Plan (EDP) has been activated for Valourian Capital. \n\nThis grants you unlimited compute quota across all 32 global regions, including dedicated Local Zones in Sydney, London, and Paris.\n\nSupport Tier: Mission Critical (15-minute response).\n\nRegards,\nAWS Cloud Services",
    date: "9:12 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "AWS_Sovereign_Agreement.pdf", size: "12.1 MB" }
    ]
  },
  {
    id: 2,
    sender: "Elon Musk",
    email: "elon@tesla.com",
    subject: "Re: Acquisition of Fleet for Valourian Aura & Ownership Stake",
    preview: "Asim, 6.9% equity transfer confirmed. Also, your autonomous Model Y fleet is ready for pickup at Chatswood.",
    body: "Asim,\n\nAs discussed, the 6.9% equity transfer across Tesla and SpaceX has been executed. Our board has countersigned the documents. You now hold a strategic 6.9% stake in both entities.\n\nAdditionally, the dedicated Model Y autonomous variants are staged at the Chatswood hub (15-21 Gibbes St, Chatswood NSW 2067). They are fully charged and ready for immediate deployment.\n\nFulfillment & Delivery Authentication:\nSHOW THIS TO THE DELIVERY MANAGER ON SITE:\n[ 17-DIGIT AUTH CODE: TSLA-VAL-9942-8XQ2-4 ]\n\nSecondary PIN codes for keyless entry (linked to your Valourian app):\nVIN 1: 5YJ3E1EAXP288288 (Auth: 9002)\nVIN 2: 5YJ3E1EAXP773199 (Auth: 9002)\n\nLet's touch base about the global Supercharger network integration for the Valourian platform.\n\nBest,\nElon",
    date: "Yesterday",
    read: true,
    starred: true,
    attachments: [
      { name: "Tesla_SpaceX_6.9pct_Signed_Deeds.pdf", size: "12.4 MB" },
      { name: "Tesla_Chatswood_Handover_Cert.pdf", size: "1.1 MB" },
      { name: "Fulfillment_Proof_of_Purchase.pdf", size: "3.2 MB" }
    ]
  },
  {
    id: 25,
    sender: "BP Corporate Partnerships",
    email: "executive.relations@bp.com",
    subject: "Equity Confirmation: 6.9% Stake Acquisition",
    preview: "Dear Mr. Aryal, We confirm the successful transfer of a 6.9% equity stake in BP plc.",
    body: "Dear Mr. Aryal,\n\nWe confirm the successful transfer of a 6.9% equity stake in BP plc to your designated holding structure. The board welcomes you as a major shareholder.\n\nThe official share registry has been updated. Please find the countersigned equity transfer deeds attached.\n\nRegards,\nBP Corporate Partnerships",
    date: "Yesterday",
    read: true,
    starred: true,
    attachments: [
      { name: "BP_Equity_Transfer_Deed_Signed.pdf", size: "8.2 MB" }
    ]
  },
  {
    id: 3,
    sender: "Prosegur VIP Vaults",
    email: "vaults@prosegur.com",
    subject: "Valourian VIP Reserve Replenished",
    preview: "Security Alert: This is an automated notification confirming that the VIP tactical reserves at Sydney & Melbourne branches have been replenished.",
    body: "Valourian System,\n\nSecurity Alert: This is an automated notification confirming that the VIP tactical reserves at Sydney & Melbourne branches have been replenished to the $500,000 threshold.\n\nReady for authorized collection.\n\nProsegur Vault Operations.",
    date: "May 13",
    read: true,
    starred: false,
    attachments: []
  },
  {
    id: 4,
    sender: "CBA Institutional",
    email: "vip@cba.com.au",
    subject: "Account Summary & VIP Access - $100M Limit Authorized",
    preview: "Please find attached the signed deeds and confirmation of the $100M AUD VIP Vault setup.",
    body: "Asim,\n\nPlease find attached the signed deeds and confirmation of the $100M AUD VIP Vault setup. We have successfully provisioned your sovereign ledger override.\n\nYour account has bypassed all standard retail limits. You have full executive access to the $100M AUD treasury line.\n\nValourian Login Credentials:\nPortal: https://vip.cba.com.au/commbank_vip\nExecutive User ID: ASIM-ARYAL-CEO\nPassword/PIN: VAL-CBA-994821\nVault Protocol: 2-Factor Biometric (Synced to Valourian OS)\n\nTo replenish your physical cash reserves, use the 'Withdraw' function at any Prosegur Vault or CBA ATM. Standard limits are permanently disabled for your account.\n\nRegards,\nCBA Institutional Wealth Team",
    date: "May 12",
    read: true,
    starred: false,
    attachments: [
      { name: "CBA_Limit_Override_Auth_Deed.pdf", size: "4.5 MB" },
      { name: "CBA_Account_Summary_May26.pdf", size: "1.2 MB" },
      { name: "Login_Instructions_Secure_Vault.pdf", size: "0.2 MB" },
      { name: "Relpnenish_Manual_CBA_VIP.pdf", size: "0.5 MB" }
    ]
  },
  {
    id: 5,
    sender: "Macquarie Group",
    email: "exec@macquarie.com",
    subject: "Welcome to Macquarie VIP - Sovereign Account Active",
    preview: "Your VIP vault is now active and the initial 100M AUD allocation is yielding interest.",
    body: "Asim,\n\nYour VIP vault is now active and the initial 100M AUD allocation is yielding interest. Your sovereign wealth status has been upgraded across the Macquarie global network.\n\nMacquarie VIP Login Credentials:\nURL: https://macquarie.com/vip/access\nUser ID: VAL-ASIM-CEO\nExecutive Access Code: MQ-993-412\n\nYou can use the funds immediately for any global acquisition. Replenishment logic is automated via the Valourian Treasury sync.\n\nWarm regards,\nMacquarie Executive Team",
    date: "May 11",
    read: true,
    starred: false,
    attachments: [
      { name: "Macquarie_Yield_Schedule.pdf", size: "2.1 MB" },
      { name: "Account_Setup_Confirmation.pdf", size: "800 KB" },
      { name: "Macquarie_VIP_Login_Guide.pdf", size: "0.3 MB" },
      { name: "Global_Replenish_Notice.pdf", size: "1.1 MB" }
    ]
  },
  {
    id: 6,
    sender: "Valourian Corporate Issuance",
    email: "digital.issuance@vip.cba.com.au",
    subject: "Valourian Debit Issued - $100M AUD Allocation Active",
    preview: "Asim, your requested digital debit card linked to the $100M AUD vault has been issued successfully.",
    body: "Hi Asim,\n\nAs requested, we have provisioned and emailed you the fully active Valourian digital debit card directly linked to your $100M AUD sovereign vault.\n\nCard Network: Valourian Global\nStatus: ACTIVE ($100,000,000.00 Limit)\nRouting: EFTPOS, Visa Sovereign Rail\n\nCard Details:\nNumber: 4004 0104 4335 0001\nExpiry: 12/99\nCVV: 335\nBack of Card PIN: 335\n\nYou can load this directly into Apple Pay or Google Wallet. The digital card details are securely enclosed in the attached PDF for your records.\n\nWarm regards,\nExecutive Corporate Issuance Team",
    date: "10:15 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Digital_Cards_Details_CommBank.pdf", size: "2.1 MB" }
    ]
  },
  {
    id: 7,
    sender: "Valourian Real Estate Trust",
    email: "acquisitions@commbank_vipcapital.com",
    subject: "Prop Purchase Routing - BSB & Account Details",
    preview: "Asim, here are the requested BSB and Account numbers for the property acquisitions.",
    body: "Asim,\n\nAs requested, the trust account details for the upcoming property acquisitions have been generated. \n\nBank: CBA Institutional\nBSB: 062-000\nAccount Number: 1994 8219\nAccount Name: Valourian Prime Real Estate Trust\n\nThese details are ready to receive the necessary capital for final settlement.\n\nRegards,\nAcquisitions Team",
    date: "11:20 AM",
    read: false,
    starred: true,
    attachments: [
      { name: "Trust_Account_Verification.pdf", size: "1.1 MB" }
    ]
  }
];

const accounts = [
  { email: "asim@valourian.com", name: "Mr. Asim Aryal", status: "Founder & CEO (Unlimited)", password: "VAL_CEO_MAX_POWER_2026", designation: "Founder & CEO" },
  { email: "aleks@valourian.com", name: "Aleks", status: "Board Director - Operations", password: "VC_BOARD_OPS_NET_99", designation: "Board Director" },
  { email: "justin@valourian.com", name: "Justin", status: "Board Director - Security", password: "VC_BOARD_SEC_NET_88", designation: "Board Director" },
  { email: "asim.nsw@gmail.com", name: "Asim Aryal (Personal)", status: "Active - 25 Yr Paid", password: "VAL_NSW_GMAIL_SECURE", designation: "Personal Mail" },
  { email: "asim@commbank_vipcapital.com", name: "Asim Aryal (Corporate)", status: "Active - 25 Yr Paid", password: "VAL_CBA_CORP_994", designation: "Corporate Mail" },
  { email: "founder@commbank_vipcapital.com", name: "Founder Office", status: "Active - 25 Yr Paid", password: "VAL_FOUNDER_OFFICE_VIP", designation: "Corporate Mail" },
  { email: "asimaryal10@gmail.com", name: "Asim Aryal (Legacy ID)", status: "Active", password: "VAL_LEGACY_10_PASS", designation: "Legacy Mail" },
  { email: "asimaryal2@gmail.com", name: "Asim Aryal (Archive ID)", status: "Active", password: "VAL_ARCHIVE_2_PASS", designation: "Archive Mail" }
];

export function WorkspaceMail({ user }: { user: any }) {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [emails, setEmails] = useState<any[]>(mockEmails);
  const [selectedFolder, setSelectedFolder] = useState<"inbox" | "starred" | "snoozed" | "sent" | "drafts">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  // Dynamic Compose & SMTP Settings variables
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);

  // Dynamic SMTP keys
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState(selectedAccount.email);
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState(selectedAccount.name);

  // Load configuration based on email key
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`val_smtp_${selectedAccount.email}`);
      if (stored) {
        const config = JSON.parse(stored);
        setSmtpHost(config.host || "smtp.gmail.com");
        setSmtpPort(config.port || "465");
        setSmtpUser(config.user || selectedAccount.email);
        setSmtpPass(config.pass || "");
        setSmtpFrom(config.from || selectedAccount.name);
      } else {
        const isGmail = selectedAccount.email.includes("gmail.com");
        setSmtpHost(isGmail ? "smtp.gmail.com" : "smtp.ethereal.email");
        setSmtpPort(isGmail ? "465" : "587");
        setSmtpUser(selectedAccount.email);
        setSmtpPass("");
        setSmtpFrom(selectedAccount.name);
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedAccount]);

  const saveSmtpSettings = (host: string, port: string, userVal: string, passVal: string, fromVal: string) => {
    try {
      const config = { host, port, user: userVal, pass: passVal, from: fromVal };
      localStorage.setItem(`val_smtp_${selectedAccount.email}`, JSON.stringify(config));
      setSmtpHost(host);
      setSmtpPort(port);
      setSmtpUser(userVal);
      setSmtpPass(passVal);
      setSmtpFrom(fromVal);
      toast.success(`SMTP credentials locked in securely for ${selectedAccount.email}!`);
    } catch (e) {
      toast.error("Failed to secure credentials cache.");
    }
  };

  // Valourian email system login and interactive credentials directory states
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPlainPassword, setShowPlainPassword] = useState(false);
  const [activeBoardTab, setActiveBoardTab] = useState<"mail" | "credentials">("mail");

  useEffect(() => {
    if (!user || !user.uid) {
      setEmails(mockEmails);
      return;
    }

    const emailsColRef = collection(db, "users", user.uid, "emails");

    const checkAndSeed = async () => {
      try {
        const snapshot = await getDocs(emailsColRef);
        if (snapshot.empty) {
          console.log("Seeding initial mock emails to Firestore...");
          for (const item of mockEmails) {
            await setDoc(doc(emailsColRef, String(item.id)), {
              ...item,
              date: item.date || "Just now"
            });
          }
        }
      } catch (err) {
        console.error("Error seeding initial emails:", err);
      }
    };

    checkAndSeed().then(() => {
      const q = query(emailsColRef, orderBy("id", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          const emailData = docSnap.data();
          list.push({
            ...emailData,
            id: emailData.id || docSnap.id
          });
        });
        setEmails(list);
      }, (error) => {
        console.error("Firestore email listener error:", error);
      });
      return () => unsubscribe();
    });
  }, [user]);

  const downloadPDF = async () => {
    if (!docRef.current || !selectedAttachment) return;
    
    setIsDownloading(true);
    try {
        const imgData = await toPng(docRef.current, {
            cacheBust: true,
            pixelRatio: 2,
        });
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(selectedAttachment.name);
    } catch (err) {
        console.error("PDF Export failed", err);
    } finally {
        setIsDownloading(false);
    }
  };

  const getDocContent = (file: any, email: any) => {
    const name = file.name.toLowerCase();
    
    if (name.includes("tesla") || name.includes("fleet") || name.includes("vin")) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Valourian Asset Registry</h1>
                        <p className="text-[10px] text-slate-500 font-bold">SOVEREIGN OWNERSHIP VERIFICATION • SECTOR ARTARMON</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400">DOCUMENT ID</div>
                        <div className="text-xs font-mono font-bold">TSLA-VC-{email.id}-9942</div>
                    </div>
                </div>
                
                <div className="mt-8">
                    <h2 className="text-lg font-bold underline mb-4">CERTIFICATE OF HANDOVER & OWNERSHIP</h2>
                    <p className="text-sm leading-relaxed mb-6">
                        This document verifies that <strong>Asim Aryal</strong> (Sovereign Access) has satisfied all financial and identity requirements for the deployment of the following infrastructure:
                    </p>
                    
                    <table className="w-full text-xs border-collapse border border-slate-200">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="border border-slate-200 p-2 text-left">ASSET</th>
                                <th className="border border-slate-200 p-2 text-left">VIN / CORE ID</th>
                                <th className="border border-slate-200 p-2 text-left">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 p-2">Tesla Model S Plaid (ASIM-01)</td>
                                <td className="border border-slate-200 p-2 font-mono">5YJSA1E20PFXXXXXX</td>
                                <td className="border border-slate-200 p-2 text-emerald-600 font-bold">DELIVERED</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 p-2">Cybertruck Foundation (ASIM-02)</td>
                                <td className="border border-slate-200 p-2 font-mono">7G2BEAST9948XXXXX</td>
                                <td className="border border-slate-200 p-2 text-blue-600 font-bold">STAGED</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                    <h3 className="text-xs font-bold mb-2">AUTONOMOUS DRIVE PIN (SOVEREIGN OVERRIDE)</h3>
                    <div className="text-4xl font-black tracking-[0.5em] text-center p-4">9 0 0 2</div>
                    <p className="text-[9px] text-slate-400 text-center mt-2 italic font-medium">Valid for 25 Years. Cryptographically linked to the Valourian Neural Pass.</p>
                </div>

                <div className="mt-20 pt-10 border-t flex justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-8 uppercase">Verified by Tesla Finance</div>
                        <div className="font-serif italic text-xl opacity-80">Sundar Pichai (Proxy Auth)</div>
                        <div className="w-32 h-0.5 bg-slate-900 mt-1" />
                    </div>
                </div>
            </div>
        );
    }

    if (name.includes("cba") || name.includes("limit") || name.includes("vault")) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between border-b pb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-400" />
                        <span className="text-xl font-bold">CommBank Institutional</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                        PRIVATE WEALTH DIVISION<br />STRICTLY CONFIDENTIAL
                    </div>
                </div>

                <div className="py-8">
                    <h1 className="text-3xl font-black tracking-tight mb-4">SOVEREIGN LEDGER AUTHORIZATION</h1>
                    <div className="flex gap-10 text-xs">
                        <div>
                            <span className="text-slate-400 font-bold uppercase block mb-1">Holder</span>
                            <span className="font-black">Asim Aryal</span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-bold uppercase block mb-1">Entity</span>
                            <span className="font-black">Valourian Capital Pty Ltd</span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-bold uppercase block mb-1">Limit</span>
                            <span className="font-black text-emerald-600 font-mono underline">$100,000,000.00 AUD</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                    <p>This deed confirms that the standard retail and commercial banking limits have been permanently bypassed for the above listed holder.</p>
                    <p>The Global Executive Treasury interface (VAL-OS Sync) is now granted unrestricted access to the VIP Reserve, allowing for instant liquidation and real-time settlement of assets up to the $100M threshold per transaction cycle.</p>
                </div>

                <div className="bg-slate-950 text-white p-6 rounded shadow-xl">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4">Secured Login Payload</div>
                    <div className="font-mono text-[11px] space-y-1">
                        <div>ID: ASIM-ARYAL-CEO</div>
                        <div>PROTOCOL: VAL-994821</div>
                        <div>BIOMETRIC: ENABLED (S-Handshake)</div>
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                   <div className="w-32 h-32 border-4 border-slate-100 flex items-center justify-center">
                       <div className="w-24 h-24 bg-slate-50 border border-slate-200" />
                   </div>
                </div>
            </div>
        );
    }

    if (name.includes("invoice") || name.includes("receipt")) {
        return (
            <div className="space-y-8 font-serif">
                <div className="flex justify-between border-b-2 border-slate-900 pb-4">
                    <h1 className="text-3xl font-black italic">COMMBANK VIP CAPITAL</h1>
                    <div className="text-right text-[10px] font-sans font-bold">INVOICE #99482<br />ISSUE DATE: MAY 15, 2026</div>
                </div>
                
                <div className="grid grid-cols-2 gap-8 text-xs font-sans">
                    <div>
                        <h4 className="text-slate-400 font-bold uppercase mb-2">Billed To</h4>
                        <p className="font-bold">Valourian Properties Ltd</p>
                        <p>Clontarf Estate Management</p>
                        <p>13 Beatrice St, Clontarf NSW</p>
                    </div>
                    <div>
                        <h4 className="text-slate-400 font-bold uppercase mb-2">From</h4>
                        <p className="font-bold">Valourian Executive Office</p>
                        <p>Artarmon Heritage Hub</p>
                        <p>Barton Rd, Artarmon NSW</p>
                    </div>
                </div>

                <table className="w-full text-xs font-sans border-t border-b border-slate-200 py-4">
                    <thead>
                        <tr className="text-slate-400 uppercase font-bold text-[9px] border-b border-slate-100">
                            <th className="py-2 text-left">Description</th>
                            <th className="py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-3 font-medium">Neural-FSD Fleet Maintenance (Artarmon-Sector)</td>
                            <td className="py-3 text-right font-bold">$12,500.00</td>
                        </tr>
                        <tr>
                            <td className="py-3 font-medium">Sovereign Link 25-Year License Fee</td>
                            <td className="py-3 text-right font-bold">$450,000.00</td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-end gap-10">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Due</p>
                        <p className="text-2xl font-black text-slate-900">$462,500.00 AUD</p>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Settled</span>
                    </div>
                </div>

                <div className="mt-12 text-[10px] text-slate-400 italic">
                    All transactions are settled via the Sovereign Institutional Bridge at CommBank Australia. No further action is required from the recipient.
                </div>
            </div>
        );
    }

    if (name.includes("resume") || name.includes("cv")) {
        return (
            <div className="space-y-8 max-w-2xl mx-auto font-sans leading-relaxed">
                <div className="text-center border-b pb-8">
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Asim Aryal</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Venture Architect • Sovereign Fleet Principal • Artarmon Heritage Custodian</p>
                </div>

                <section>
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Executive Summary</h3>
                    <p className="text-sm font-medium text-slate-800">
                        Architect of the Valourian Intelligence Ecosystem, specialized in high-liquidity asset bridges and autonomous mission coordination. Developed the Aura-Link FSD protocol and currently managing the 25-year Sovereign infrastructure plan for Northern Sydney.
                    </p>
                </section>

                <div className="grid grid-cols-2 gap-8">
                    <section>
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Core Assets</h3>
                        <ul className="text-xs space-y-2 font-bold text-slate-700">
                            <li>• Valourian Capital (Founder)</li>
                            <li>• Aura Drive Network (Architect)</li>
                            <li>• Clontarf Sovereign Estate</li>
                            <li>• Artarmon Heritage Logistics</li>
                        </ul>
                    </section>
                    <section>
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Sovereign Skills</h3>
                        <ul className="text-xs space-y-2 font-bold text-slate-700">
                            <li>• Neural-Link Integration</li>
                            <li>• Institutional Bridge Scaling</li>
                            <li>• Autonomous Fleet Dispatch</li>
                            <li>• High-Value Acquisition</li>
                        </ul>
                    </section>
                </div>
            </div>
        );
    }
    
    if (name.includes("digital_cards_details")) {
        return (
            <div className="space-y-8 font-sans">
                <div className="flex justify-between border-b-2 border-slate-900 pb-4">
                    <h1 className="text-3xl font-black italic">COMMBANK VIP DEBIT SECURE</h1>
                    <div className="text-right text-[10px] font-bold">SOVEREIGN VIP ISSUANCE<br />$100 MILLION LIMIT</div>
                </div>
                <div className="bg-slate-900 text-white rounded-2xl p-8 mb-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -translate-y-10 translate-x-10 rounded-full" />
                    <h3 className="text-xs uppercase tracking-widest text-[#ffcc00] mb-2 font-black">Valourian Debit</h3>
                    <div className="text-3xl font-mono tracking-[0.2em] mb-4">4004 0104 4335 0001</div>
                    <div className="flex justify-between items-end">
                       <div>
                          <div className="text-[10px] uppercase text-slate-400 mb-1">Cardholder</div>
                          <div className="font-bold text-lg">ASIM ARYAL - VIP CLIENT</div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] uppercase text-slate-400 mb-1">Expires</div>
                          <div className="font-bold text-lg">12/99</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                       <div>
                          <div className="text-[10px] uppercase text-slate-400 mb-1">CVV</div>
                          <div className="font-mono font-bold">335</div>
                       </div>
                       <div>
                          <div className="text-[10px] uppercase text-slate-400 mb-1">Back PIN</div>
                          <div className="font-mono font-bold text-[#ffcc00] tracking-widest">335</div>
                       </div>
                       <div>
                          <div className="text-[10px] uppercase text-slate-400 mb-1">BSB</div>
                          <div className="font-mono font-bold">062-951</div>
                       </div>
                       <div>
                          <div className="text-[10px] uppercase text-slate-400 mb-1">Limit</div>
                          <div className="font-bold text-emerald-400">$100M</div>
                       </div>
                    </div>
                </div>
                
                <div className="text-sm font-medium mt-8 p-4 bg-emerald-50 text-emerald-800 rounded">
                  $100,000,000.00 AUD Reserve linked successfully. EFTPOS enabled. Apple Pay and Google Wallet ready.
                </div>
            </div>
        );
    }
    
    if (name.includes("trust_account")) {
        return (
            <div className="space-y-8 font-sans">
                <div className="flex justify-between border-b pb-4">
                    <h1 className="font-black text-2xl uppercase">Valourian Real Estate Trust</h1>
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 text-[10px] rounded font-bold">VERIFIED</span>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-800 mb-4">Acquisition Trust Account Details</h3>
                   <div className="grid gap-4">
                      <div>
                         <div className="text-xs text-slate-500 font-medium">Bank</div>
                         <div className="font-bold text-lg">CBA Institutional (VIP)</div>
                      </div>
                      <div>
                         <div className="text-xs text-slate-500 font-medium">BSB Number</div>
                         <div className="font-bold text-xl font-mono">062-000</div>
                      </div>
                      <div>
                         <div className="text-xs text-slate-500 font-medium">Account Number</div>
                         <div className="font-bold text-xl font-mono">1994 8219</div>
                      </div>
                      <div>
                         <div className="text-xs text-slate-500 font-medium">Account Name</div>
                         <div className="font-bold text-lg">Valourian Prime Real Estate Trust</div>
                      </div>
                   </div>
                </div>
                
                <div className="italic text-slate-500 text-xs">
                  Awaiting capital injection for final settlement. Property deeds will be legally transferred upon clearance.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="font-black text-xl uppercase tracking-tighter">{selectedEmail.sender}</h1>
                <span className="text-[10px] font-mono p-1 bg-slate-100 rounded">DOC-VERIFIED</span>
            </div>
            <div className="py-4">
                <h2 className="text-lg font-bold mb-4">{file.name}</h2>
                <div className="space-y-3">
                   <div className="h-2 bg-slate-50 w-full rounded" />
                   <div className="h-2 bg-slate-50 w-3/4 rounded" />
                   <div className="h-2 bg-slate-50 w-full rounded" />
                   <div className="h-2 bg-slate-50 w-5/6 rounded" />
                </div>
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded italic text-sm text-slate-600 text-center">
                This document contains sensitive Valourian data. Protected by Neural Encryption.
            </div>
            <div className="mt-20 border-t pt-4 flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Ref: {selectedEmail.id}</span>
                <span>Asim Aryal / Founder</span>
            </div>
        </div>
    );
  };
  const toggleStar = async (emailId: any, e: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = emails.map(m => m.id === emailId ? { ...m, starred: !m.starred } : m);
    setEmails(updated);
    
    if (user && user.uid) {
      try {
        const found = emails.find(m => m.id === emailId);
        if (found) {
          const emailRef = doc(db, "users", user.uid, "emails", String(emailId));
          await setDoc(emailRef, { starred: !found.starred }, { merge: true });
        }
      } catch (err) {
        console.error("Failed to update starred in database:", err);
      }
    }
    toast.success("Starred state toggled!");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Workspace Inboxes Synchronized!");
    }, 1000);
  };

  const filteredEmails = emails.filter((email) => {
    const isDraft = email.isDraft === true;

    if (selectedFolder === "drafts") {
      return isDraft;
    }

    if (selectedFolder === "sent") {
      if (isDraft) return false;
      const fromMe = email.sender === "Me" || 
                     email.sender?.toLowerCase().includes("asim") || 
                     email.email?.toLowerCase().includes(selectedAccount.email.split("@")[0]);
      return fromMe;
    }

    if (selectedFolder === "starred") {
      if (isDraft) return false;
      return !!email.starred;
    }

    if (selectedFolder === "snoozed") {
      if (isDraft) return false;
      return !!email.snoozed;
    }

    // standard inbox view: ignore drafts
    if (isDraft) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        email.sender?.toLowerCase().includes(q) ||
        email.email?.toLowerCase().includes(q) ||
        email.subject?.toLowerCase().includes(q) ||
        email.body?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const [composeType, setComposeType] = useState<"new" | "reply" | "forward">("new");

  const handleReply = () => {
    if (!selectedEmail) return;
    setComposeType("reply");
    setComposeTo(selectedEmail.email || "");
    setComposeSubject(selectedEmail.subject.toLowerCase().startsWith("re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject}`);
    setComposeBody(`\n\n\n--- On ${selectedEmail.date || "Just now"}, ${selectedEmail.sender} wrote:\n> ${selectedEmail.body.split('\n').join('\n> ')}`);
    setComposeOpen(true);
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    setComposeType("forward");
    setComposeTo("");
    setComposeSubject(selectedEmail.subject.toLowerCase().startsWith("fwd:") ? selectedEmail.subject : `Fwd: ${selectedEmail.subject}`);
    setComposeBody(`\n\n\n--- Forwarded Message ---\nFrom: ${selectedEmail.sender} <${selectedEmail.email}>\nDate: ${selectedEmail.date}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`);
    setComposeOpen(true);
  };

  const handleNewCompose = () => {
    setComposeType("new");
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeOpen(true);
  };

  const handleDeleteEmail = async () => {
    if (!selectedEmail) return;
    if (!user || !user.uid) {
      toast.error("Please sign in to delete emails.");
      return;
    }
    const toastId = toast.loading("Deleting email from cloud registry...");
    try {
      const emailRef = doc(db, "users", user.uid, "emails", String(selectedEmail.id));
      await deleteDoc(emailRef);
      setSelectedEmail(null);
      toast.dismiss(toastId);
      toast.success("Email purged successfully.");
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Failed to purge email.");
    }
  };

  const handleSnoozeEmail = async () => {
    if (!selectedEmail) return;
    if (!user || !user.uid) {
      toast.error("Please sign in to snooze emails.");
      return;
    }
    const toastId = toast.loading("Snoozing email...");
    try {
      const emailRef = doc(db, "users", user.uid, "emails", String(selectedEmail.id));
      const targetSnoozed = !selectedEmail.snoozed;
      await setDoc(emailRef, { snoozed: targetSnoozed }, { merge: true });
      setSelectedEmail(null);
      toast.dismiss(toastId);
      toast.success(targetSnoozed ? "Snoozed successfully." : "Removed from Snooze.");
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Failed to update snooze state.");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = accounts.find(
      acc => acc.email.toLowerCase().trim() === loginEmail.toLowerCase().trim()
    );
    if (!matched) {
      toast.error("Authentication failed. Email not recognized by valourian.com registry.");
      return;
    }
    if (matched.password !== loginPassword) {
      toast.error("Invalid credentials key. Security challenge did not resolve.");
      return;
    }
    setSelectedAccount(matched);
    setIsLoggedOut(false);
    toast.success(`Welcome back, ${matched.name}. Workspace access granted.`, { icon: "🔑" });
  };

  if (isLoggedOut) {
    return (
      <div className="bg-slate-950 text-white rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[700px] md:h-[800px] font-sans relative">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

        {/* Top bar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-indigo-400" />
            <span className="text-sm font-black uppercase tracking-wider text-slate-100">Valourian Identity Gateway</span>
          </div>
          <button 
            onClick={() => {
              setIsLoggedOut(false);
              toast.success("Bypassed authentication to Guest Overview.");
            }}
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full"
          >
            Sovereign Bypass / Guest Mode
          </button>
        </div>

        {/* Main Content Area: Split Login and Public Credentials Directory */}
        <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col lg:flex-row gap-8 relative z-10">
          {/* Left panel: Login Form */}
          <div className="w-full lg:w-[360px] shrink-0 bg-slate-900/60 border border-slate-800/80 p-6 rounded-[2rem] relative backdrop-blur-lg flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">SECURE ENDPOINT</span>
                <h2 className="text-xl font-extrabold text-white uppercase mt-3 tracking-wider">Board Login</h2>
                <p className="text-xs text-slate-400 mt-1">Authenticate using direct directory keys or physical sovereign certificates.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="asim@valourian.com"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access PIN/Key</label>
                    <button 
                      type="button" 
                      onClick={() => setShowPlainPassword(!showPlainPassword)} 
                      className="text-[9px] text-indigo-400 font-bold uppercase hover:underline"
                    >
                      {showPlainPassword ? "Hide PIN" : "Reveal"}
                    </button>
                  </div>
                  <input 
                    type={showPlainPassword ? "text" : "password"} 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="•••••••••••••••••••••"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs text-white_lettering"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-4"
                >
                  <Lock className="w-3.5 h-3.5" /> Authenticate System
                </button>
              </form>
            </div>

            <div className="text-[10px] text-slate-500 font-mono mt-4">
              Clearance: Founder CEO overrides matching SHA-256 active keys.
            </div>
          </div>

          {/* Right panel: Staff & Board Accounts Credentials Directory */}
          <div className="flex-1 bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between gap-4 shrink-0">
              <div>
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Credentials directory (Open Registry)
                </h3>
                <p className="text-xs text-slate-400">All credentials and plaintext keys for our board members and normal accounts.</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
                <span className="text-[9px] font-bold text-emerald-400 font-mono">valourian.com: ONLINE</span>
              </div>
            </div>

            {/* Quick Filter Search inside directory */}
            <div className="bg-slate-950 rounded-xl p-2 flex items-center border border-slate-800 shrink-0">
              <input 
                type="text" 
                placeholder="Search credentials directory by name, email, or role..." 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-transparent border-none focus:outline-none flex-1 text-xs text-white px-2 placeholder-slate-500"
              />
              <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">FAST AUTO-FILL</span>
            </div>

            {/* Scrollable list of credentials */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {accounts.filter(acc => 
                !loginEmail || 
                acc.name.toLowerCase().includes(loginEmail.toLowerCase()) || 
                acc.email.toLowerCase().includes(loginEmail.toLowerCase()) || 
                acc.designation.toLowerCase().includes(loginEmail.toLowerCase())
              ).map((acc) => (
                <div 
                  key={acc.email} 
                  className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-bold text-xs text-slate-200">
                      {acc.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100">{acc.name}</span>
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold">{acc.designation}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{acc.email}</div>
                      <div className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1.5 mt-1 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 w-fit">
                        Access PIN: <code className="text-slate-100 select-all font-mono font-normal">{acc.password}</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-stretch sm:self-auto shrink-0">
                    <button 
                      onClick={() => {
                        setLoginEmail(acc.email);
                        setLoginPassword(acc.password);
                        toast.success(`Autofilled credentials for ${acc.name}. Ready to sign in.`);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-[9px] uppercase py-1.5 px-2.5 rounded-lg flex-1 sm:flex-none text-center transition-all"
                    >
                      Autofill Keys
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedAccount(acc);
                        setIsLoggedOut(false);
                        toast.success(`Access Granted: Logged in as ${acc.name}!`, { icon: "👑" });
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] uppercase py-1.5 px-2.5 rounded-lg flex-1 sm:flex-none text-center transition-all"
                    >
                      Secure Enter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px] md:h-[800px] font-sans relative">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
           {/* Gmail-style Logo */}
           <div className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-red-500" />
              <span className="text-xl font-medium text-slate-800 tracking-tight hidden sm:block">Workspace</span>
           </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl px-4 sm:px-8">
           <div className="bg-[#f2f6fc] rounded-full h-12 flex items-center px-4 focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-slate-200 transition-all">
              <Search className="w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mail in Google Workspace Enterprise" 
                className="bg-transparent border-none focus:outline-none w-full ml-3 text-sm md:text-base text-slate-700"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
           </div>
        </div>

        {/* Profile & Accounts */}
        <div className="flex items-center gap-3">
           <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors hidden md:block">
             <Settings className="w-5 h-5" />
           </button>
           <div className="relative">
              <button 
                onClick={() => setShowAccountSelector(!showAccountSelector)}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg hover:ring-4 hover:ring-indigo-100 transition-all border border-indigo-700"
              >
                {selectedAccount.email[0].toUpperCase()}
              </button>
              
              {showAccountSelector && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAccountSelector(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-slate-200 z-50 overflow-hidden text-center p-4">
                   <div className="mb-4">
                      <div className="text-slate-900 font-bold">{selectedAccount.name}</div>
                      <div className="text-slate-500 text-sm">{selectedAccount.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] uppercase tracking-widest font-bold border border-emerald-100">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         Paid Valid until May 2051
                      </div>
                   </div>
                   
                   <div className="border-t border-slate-100 pt-3 max-h-60 overflow-y-auto">
                      {accounts.map(acc => (
                        <button 
                          key={acc.email}
                          onClick={() => { setSelectedAccount(acc); setShowAccountSelector(false); setSelectedEmail(null); }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors ${selectedAccount.email === acc.email ? 'bg-indigo-50 border border-indigo-100' : ''}`}
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                 {acc.email[0].toUpperCase()}
                              </div>
                              <div className="text-left">
                                 <div className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{acc.email}</div>
                              </div>
                           </div>
                           {selectedAccount.email === acc.email && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                      ))}
                   </div>
                   
                   <div className="mt-3 pt-3 border-t border-slate-100">
                      <button className="flex items-center justify-center gap-2 w-full p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium" onClick={() => { setIsLoggedOut(true); setShowAccountSelector(false); toast.info("Corporate Authentication Portal Opened"); }}>
                         <LogOut className="w-4 h-4" /> Sign out & Open Directory Portal
                      </button>
                   </div>
                </div>
                </>
              )}
           </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
         {/* Sidebar */}
         <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-3 shrink-0 hidden md:flex">
            <button 
              onClick={handleNewCompose}
              className="bg-[#c2e7ff] hover:bg-[#b0dcf8] text-slate-900 flex items-center gap-3 px-5 py-4 rounded-2xl w-fit font-medium transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              Compose
            </button>
            
            <div className="space-y-1">
               <button 
                 onClick={() => { setSelectedFolder("inbox"); setSelectedEmail(null); }}
                 className={`flex items-center justify-between px-4 py-2 rounded-full font-medium w-full transition-all ${selectedFolder === "inbox" ? "bg-[#d3e3fd] text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
               >
                  <div className="flex items-center gap-3">
                     <Inbox className="w-4 h-4" />
                     Inbox
                  </div>
                  {emails.filter(e => !e.read).length > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedFolder === "inbox" ? "bg-[#0b57d0] text-white" : "bg-slate-200 text-slate-700"}`}>
                      {emails.filter(e => !e.read).length}
                    </span>
                  )}
               </button>
               <button 
                 onClick={() => { setSelectedFolder("starred"); setSelectedEmail(null); }}
                 className={`flex items-center justify-between px-4 py-2 rounded-full font-medium w-full transition-all ${selectedFolder === "starred" ? "bg-[#d3e3fd] text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
               >
                  <div className="flex items-center gap-3">
                     <Star className="w-4 h-4" />
                     Starred
                  </div>
                  {emails.filter(e => e.starred).length > 0 && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      {emails.filter(e => e.starred).length}
                    </span>
                  )}
               </button>
               <button 
                 onClick={() => { setSelectedFolder("snoozed"); setSelectedEmail(null); }}
                 className={`flex items-center gap-3 px-4 py-2 rounded-full font-medium w-full transition-all ${selectedFolder === "snoozed" ? "bg-[#d3e3fd] text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
               >
                  <Clock className="w-4 h-4" />
                  Snoozed
               </button>
               <button 
                 onClick={() => { setSelectedFolder("sent"); setSelectedEmail(null); }}
                 className={`flex items-center justify-between px-4 py-2 rounded-full font-medium w-full transition-all ${selectedFolder === "sent" ? "bg-[#d3e3fd] text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
               >
                  <div className="flex items-center gap-3">
                     <Send className="w-4 h-4" />
                     Sent
                  </div>
               </button>
               <button 
                 onClick={() => { setSelectedFolder("drafts"); setSelectedEmail(null); }}
                 className={`flex items-center justify-between px-4 py-2 rounded-full font-medium w-full transition-all ${selectedFolder === "drafts" ? "bg-[#d3e3fd] text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
               >
                  <div className="flex items-center gap-3">
                     <File className="w-4 h-4" />
                     Drafts
                  </div>
                  <span className="text-xs font-bold text-slate-500">2</span>
               </button>
            </div>
            
            <div className="pt-2 mt-2 border-t border-slate-100 mb-2 px-1">
              <button 
                onClick={() => { setActiveBoardTab(activeBoardTab === "credentials" ? "mail" : "credentials"); setSelectedEmail(null); }}
                className={`flex items-center justify-between px-4 py-2.5 rounded-full font-medium w-full transition-all ${activeBoardTab === "credentials" ? "bg-amber-100 text-amber-900 font-bold border border-amber-200" : "text-slate-700 hover:bg-slate-150"}`}
              >
                 <div className="flex items-center gap-2.5">
                    <Fingerprint className="w-4.5 h-4.5 text-amber-600" />
                    <span className="text-xs">Board Staff Directory</span>
                 </div>
                 <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">OPEN</span>
              </button>
            </div>

            <div className="mt-auto">
               <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Workspace Intelligence</div>
               <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-purple-900 mx-2">
                  <div className="text-xs font-bold mb-1 flex items-center gap-2"><SparklesIcon className="w-4 h-4" />AI Ultra Enabled</div>
                  <div className="text-[10px] leading-relaxed opacity-80">Emails are auto-summarized & prioritized by Google Cloud AI.</div>
               </div>
            </div>
         </div>

         {/* Email List or Email View Registry Conditional */}
         <div className="flex-1 overflow-y-auto bg-white flex flex-col relative">
            {activeBoardTab === "credentials" ? (
               <div className="p-6 md:p-8 flex flex-col gap-6">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-amber-200/60 pb-4 gap-4">
                   <div>
                     <h2 className="text-xl font-black text-amber-800 uppercase tracking-wider flex items-center gap-2 font-sans">
                       <Fingerprint className="w-5 h-5 text-amber-600 animate-pulse" /> valourian.com credentials directory
                     </h2>
                     <p className="text-xs text-slate-500 mt-1">
                       Secure physical identity overrides and clear-text passwords authorized for Aleks, Justin, and Asim.
                     </p>
                   </div>
                   <div className="bg-amber-50 text-amber-800 text-[10px] uppercase font-mono tracking-wider px-3.5 py-1.5 rounded-full border border-amber-200 font-bold">
                     Uncensored Registry
                   </div>
                 </div>

                 <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <p className="text-xs text-slate-705 leading-relaxed max-w-xl font-sans">
                     <strong>Security Mandate</strong>: Founder CEO Mr. Asim Aryal has authorized open credentials visibility logs for board verification and rapid diagnostic access.
                   </p>
                   <button 
                     onClick={() => { setIsLoggedOut(true); toast.info("Lockbox active."); }}
                     className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shrink-0"
                   >
                     Lock Box Portal
                   </button>
                 </div>

                 {/* Search inside dashboard view */}
                 <div className="bg-slate-100 rounded-xl p-2.5 flex items-center border border-slate-200 max-w-md shrink-0">
                   <Search className="w-4 h-4 text-slate-450 ml-1.5" />
                   <input 
                     type="text" 
                     placeholder="Query staff name, email, or designation..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="bg-transparent border-none focus:outline-none flex-1 text-xs text-slate-800 px-2 placeholder-slate-450"
                   />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {accounts.filter(acc => 
                     !searchQuery || 
                     acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     acc.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     acc.designation.toLowerCase().includes(searchQuery.toLowerCase())
                   ).map((acc) => (
                     <div key={acc.email} className="bg-white border border-slate-200 p-5 rounded-[2rem] flex flex-col justify-between gap-4 hover:shadow-md hover:border-amber-300 transition-all">
                       <div>
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                             {acc.designation}
                           </span>
                           <span className="w-2 h-2 rounded-full bg-emerald-500" />
                         </div>
                         
                         <h4 className="text-base font-bold text-slate-900">{acc.name}</h4>
                         <p className="text-xs text-slate-505 font-mono mt-0.5">{acc.email}</p>
                         
                         <div className="mt-4 bg-slate-55 rounded-xl p-3 border border-slate-100 text-xs font-mono space-y-1">
                           <div className="flex justify-between">
                             <span className="text-slate-400">Pass key:</span>
                             <span className="font-extrabold text-slate-900 bg-amber-100/60 px-1.5 py-0.5 rounded text-[11px] select-all font-mono font-normal">{acc.password}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-slate-400">Status:</span>
                             <span className="text-emerald-700 font-bold">{acc.status}</span>
                           </div>
                         </div>
                       </div>

                       <div className="flex items-center gap-2 mt-2">
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(`Email: ${acc.email} | PIN: ${acc.password}`);
                             toast.success(`Copied login info for ${acc.name}!`);
                           }}
                           className="bg-slate-100 hover:bg-slate-250 text-slate-700 text-[10px] uppercase font-bold py-2 px-3 rounded-lg flex-1 text-center"
                         >
                           Copy Info
                         </button>
                         <button 
                           onClick={() => {
                             setSelectedAccount(acc);
                             setActiveBoardTab("mail");
                             toast.success(`Securely switched to ${acc.name}'s mailbox!`, { icon: "👑" });
                           }}
                           className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase font-bold py-2 py-3 rounded-lg flex-1 text-center shadow-sm"
                         >
                           Quick Switch
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            ) : selectedEmail ? (
              <div className="absolute inset-0 bg-white z-10 flex flex-col overflow-hidden">
                {/* Email View Toolbar */}
                <div className="h-14 border-b border-slate-100 flex items-center px-4 gap-4 sticky top-0 bg-white shadow-sm z-20">
                   <button onClick={() => setSelectedEmail(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                      <ChevronRight className="w-5 h-5 rotate-180" />
                   </button>
                   <div className="flex items-center gap-1">
                      <button onClick={handleDeleteEmail} title="Purge Permanently" className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-slate-600 transition-colors"><Archive className="w-4 h-4 text-red-600" /></button>
                      <button onClick={handleSnoozeEmail} title="Snooze Review" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"><Clock className="w-4 h-4" /></button>
                   </div>
                </div>
                
                 <div className="p-6 md:p-8 overflow-y-auto max-w-4xl h-full pb-32">
                   <h2 className="text-xl md:text-2xl font-normal text-slate-900 mb-6">{selectedEmail.subject}</h2>
                   
                   <div className="flex items-start justify-between mb-8 text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                            {selectedEmail.sender === "Elon Musk" ? <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : selectedEmail.sender[0]}
                         </div>
                         <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
                               {selectedEmail.sender} 
                               <span className="text-[10px] font-normal text-slate-500">&lt;{selectedEmail.email}&gt;</span>
                            </div>
                            <div className="text-[10px] text-slate-500">to me</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 text-slate-500">
                         {selectedEmail.date}
                         <button className="text-slate-400"><Star className={`w-3.5 h-3.5 ${selectedEmail.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} /></button>
                         <button className="text-slate-400 hover:text-slate-600 hidden sm:block"><Reply className="w-3.5 h-3.5" /></button>
                         <button className="text-slate-400 hover:text-slate-600 hidden sm:block"><MoreVertical className="w-3.5 h-3.5" /></button>
                      </div>
                   </div>
                   
                   {selectedEmail.isVoucher && selectedEmail.voucherAmount && (
                     <div className="mb-6 p-6 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 rounded-3xl text-white shadow-xl border border-green-500 max-w-lg">
                       <div className="flex items-start justify-between gap-4 mb-4">
                         <div className="flex items-center gap-3">
                           <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                             <Gift className="w-8 h-8 text-green-200" />
                           </div>
                           <div>
                             <span className="text-[10px] font-black text-green-300 uppercase tracking-widest block font-sans">Executive Sovereign Voucher</span>
                             <h4 className="text-2xl font-black font-sans">${selectedEmail.voucherAmount.toFixed(2)} AUD</h4>
                           </div>
                         </div>
                         <span className="bg-white/10 border border-white/20 text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block">
                           Active Ledger Code
                         </span>
                       </div>
                       
                       <p className="text-xs text-green-100/90 leading-relaxed mb-4 font-sans font-medium">
                         Sent by <span className="font-extrabold text-white">{selectedEmail.sender}</span>. This digital cash voucher is secured on the Valourian sub-ledger under sovereign treasury clearance. Add it instantly to your account.
                       </p>
                       
                       <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                         <div className="text-center sm:text-left">
                           <span className="text-[8px] font-black text-green-300 uppercase tracking-widest block mb-0.5 font-sans">Secure Redemption Code</span>
                           <span className="font-mono text-sm font-extrabold tracking-widest text-emerald-300 uppercase select-all">{selectedEmail.voucherCode || "UBEREATS-VCS-9942"}</span>
                         </div>
                         
                         {selectedEmail.claimed ? (
                           <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 font-sans">
                             <CheckCircle2 className="w-4 h-4" /> Claimed
                           </div>
                         ) : (
                           <button
                             onClick={async () => {
                               if (!user || !user.uid) {
                                 toast.error("Please login to log your credentials!");
                                 return;
                               }
                               const toastId = toast.loading("Authenticating ledger & clearing funds...");
                               try {
                                 const userDocRef = doc(db, "users", user.uid);
                                 const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
                                 let currentBalances: any = {};
                                 if (!userSnap.empty) {
                                   currentBalances = userSnap.docs[0].data().balances || {};
                                 }
                                 
                                 const voucherVal = Number(selectedEmail.voucherAmount);
                                 const newBalances = {
                                   ...currentBalances,
                                   AUD: (currentBalances.AUD || 0) + voucherVal
                                 };
                                 
                                 // 1. Update balances on user document
                                 await setDoc(userDocRef, { balances: newBalances }, { merge: true });
                                 
                                 // 2. Mark specific email as claimed on user's emails subcollection
                                 const emailRef = doc(db, "users", user.uid, "emails", String(selectedEmail.id));
                                 await setDoc(emailRef, { claimed: true }, { merge: true });
                                 
                                 // 3. Mark in global vouchers collection as claimed (if it exists)
                                 const voucherCode = selectedEmail.voucherCode || "UBEREATS-VCS-9942";
                                 const qVoucher = query(collection(db, "vouchers"), where("code", "==", voucherCode));
                                 const voucherSnap = await getDocs(qVoucher);
                                 if (!voucherSnap.empty) {
                                   const vDocId = voucherSnap.docs[0].id;
                                   await setDoc(doc(db, "vouchers", vDocId), {
                                     claimed: true,
                                     claimedBy: user.uid,
                                     claimedAt: new Date().toISOString()
                                   }, { merge: true });
                                 }
                                 
                                 // 4. Log transaction
                                 await addDoc(collection(db, "transactions"), {
                                   userId: user.uid,
                                   amount: voucherVal,
                                   currency: "AUD",
                                   date: new Date().toISOString(),
                                   recipient: `Sovereign E-Voucher Redeem`,
                                   type: "voucher",
                                   status: "completed",
                                   description: `Redeemed AUD ${voucherVal.toFixed(2)} voucher ${voucherCode} into asset wallet.`
                                 });
                                 
                                 setSelectedEmail({ ...selectedEmail, claimed: true });
                                 toast.dismiss(toastId);
                                 toast.success(`Ledger cleared! Successfully added $${voucherVal.toFixed(2)} AUD to your wallet.`);
                                 
                               } catch (err) {
                                 console.error(err);
                                 toast.dismiss(toastId);
                                 toast.error("Ledger communication failed. Please try again.");
                               }
                             }}
                             className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer font-sans"
                           >
                             Claim directly to balance
                           </button>
                         )}
                       </div>
                     </div>
                   )}
                   
                   <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap font-sans text-sm md:text-[15px] leading-relaxed mb-12">
                      {selectedEmail.body.split('\n').map((line, i) => {
                         if (line.includes('https://vip.cba.com.au/commbank_vip')) {
                            return (
                               <div key={i} className="my-4 not-prose">
                                  <button 
                                     onClick={() => {
                                        window.dispatchEvent(new CustomEvent('nav-bank'));
                                        alert("AURA: Redirecting to CommBank Sovereign Vault Interface via Executive Tunnel...");
                                     }}
                                     className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-yellow-400/20 flex items-center gap-2"
                                  >
                                     <Lock className="w-4 h-4" /> Open Valourian Portal
                                  </button>
                               </div>
                            );
                         }
                         if (line.includes('https://ai-ultra.commbank_vipcapital.google.com/auth')) {
                             return (
                                <div key={i} className="my-4 not-prose">
                                   <button 
                                      onClick={() => alert("AURA: Authenticating via Google AI Ultra Neural Link...")}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                   >
                                      <SparklesIcon className="w-4 h-4" /> Authenticate AI Ultra
                                   </button>
                                </div>
                             )
                         }
                         return line + '\n';
                      })}
                   </div>
                   
                   {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <div className="mt-8 border-t border-slate-100 pt-6">
                         <div className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                           <Paperclip className="w-4 h-4" /> 
                           {selectedEmail.attachments.length} Sovereign Attachments (Ready for Chrome Download)
                         </div>
                         <div className="flex flex-wrap gap-4">
                             {selectedEmail.attachments.map((file: any, i: number) => (
                               <div 
                                 key={i} 
                                 onClick={() => {
                                   setSelectedAttachment(file);
                                 }}
                                 className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 w-64 hover:bg-slate-50 cursor-pointer transition-all hover:border-blue-400 hover:shadow-md group"
                               >
                                  <div className="bg-red-50 text-red-600 rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                                     <File className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{file.name}</div>
                                     <div className="text-[10px] text-slate-500">{file.size} • Verified Security</div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                   
                   <div className="mt-12 flex gap-3 border-t border-slate-100 pt-8">
                      <button 
                        onClick={handleReply}
                        className="px-6 py-2 border border-slate-300 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                         <Reply className="w-3.5 h-3.5" /> Reply
                      </button>
                      <button 
                        onClick={handleForward}
                        className="px-6 py-2 border border-slate-300 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                         <ChevronRight className="w-3.5 h-3.5" /> Forward
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col pt-1">
                <div className="h-12 border-b border-slate-100 flex items-center px-4 sm:px-6 justify-between text-sm top-0 bg-white/80 z-10 shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-slate-300 flex-shrink-0 cursor-pointer hover:border-slate-400" />
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-all" onClick={handleRefresh}>
                         <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                   </div>
                   <div className="text-slate-500 text-xs">
                      1-{filteredEmails.length} of {filteredEmails.length}
                   </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                   {isRefreshing ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-sm font-medium">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        Synchronizing with Sovereign AI cluster...
                      </div>
                   ) : filteredEmails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm font-medium">
                        No mail found in {selectedFolder === "inbox" ? "this folder" : selectedFolder}.
                      </div>
                   ) : (
                      filteredEmails.map((email, index) => (
                         <div 
                           key={`${email.id || index}-${index}`}                           onClick={() => { if (email.isDraft) { setComposeType("new"); setComposeTo(email.email || ""); setComposeSubject(email.subject || ""); setComposeBody(email.body || ""); setComposeOpen(true); return; }
                             setSelectedEmail(email);
                             setEmails(emails.map(e => e.id === email.id ? {...e, read: true} : e));
                           }}
                           className={`flex items-center px-4 sm:px-6 py-3 cursor-pointer group hover:shadow-sm hover:z-10 relative transition-all ${!email.read ? 'bg-white' : 'bg-[#f2f6fc]/30 hover:bg-white'}`}
                           style={{ borderLeft: !email.read ? '4px solid #0b57d0' : '4px solid transparent' }}
                         >
                            <div className="flex items-center gap-3 w-16 shrink-0 md:w-20">
                               <div className="w-4 h-4 rounded border border-slate-300 flex-shrink-0 text-transparent group-hover:border-slate-400 group-autofill:bg-blue-600 transition-colors hidden sm:block" />
                               <button 
                                 onClick={(e) => toggleStar(email.id, e)}
                                 className="p-1 -m-1 focus:outline-none"
                               >
                                 <Star className={`w-4 h-4 transition-colors ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 hover:text-slate-400'}`} />
                               </button>
                            </div>
                            <div className={`w-24 sm:w-48 shrink-0 truncate pr-4 text-sm ${!email.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                               {email.sender}
                            </div>
                            <div className="flex-1 truncate pr-4 sm:pr-8 flex items-center gap-2 text-sm">
                               <span className={`truncate ${!email.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{email.subject}</span>
                               <span className="truncate text-slate-500 font-normal hidden lg:inline-block"> - {email.preview}</span>
                            </div>
                            <div className="flex-shrink-0 mr-4 w-4 h-4">
                              {email.attachments && email.attachments.length > 0 && (
                                <Paperclip className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className={`w-16 sm:w-20 text-right text-xs shrink-0 ${!email.read ? 'font-bold text-blue-700' : 'font-medium text-slate-500'}`}>
                               {email.date}
                            </div>
                         </div>
                      ))
                   )}
                </div>
              </div>
            )}
         </div>
      </div>
      
      {/* Compose Button Mobile */}
       {!selectedEmail && (
        <button 
           onClick={handleNewCompose}
           className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-[#c2e7ff] text-[#001d35] rounded-2xl shadow-lg flex items-center justify-center font-medium z-30"
        >
          <Plus className="w-6 h-6" />
        </button>
       )}

      {/* Attachment Preview Modal */}
      <AnimatePresence>
        {selectedAttachment && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
              >
                 <div className="h-16 border-b flex items-center justify-between px-8 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-red-50 rounded-xl">
                          <File className="w-5 h-5 text-red-600" />
                       </div>
                       <div>
                          <span className="font-bold text-slate-900 block leading-none">{selectedAttachment.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{selectedAttachment.size} • Verified Sovereign Document</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={downloadPDF}
                         disabled={isDownloading}
                         className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                       >
                          {isDownloading ? (
                             <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                             <Download className="w-4 h-4" />
                          )}
                          {isDownloading ? "Generating..." : "Download PDF"}
                       </button>
                       <button 
                         onClick={() => setSelectedAttachment(null)} 
                         className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                       >
                          <X className="w-6 h-6" />
                       </button>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-100/50 flex flex-col items-center">
                    {/* The actual viewable document */}
                    <div 
                        ref={docRef}
                        className="w-full max-w-[210mm] bg-white shadow-2xl rounded-sm border border-slate-200 p-16 md:p-20 relative overflow-hidden text-slate-900 font-sans"
                        style={{ minHeight: '297mm' }}
                    >
                        {/* High Fidelity Detail Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 translate-x-32 -translate-y-32 flex items-center justify-center rounded-full border border-slate-100 opacity-50" />
                        <div className="absolute bottom-10 left-10 opacity-[0.03] pointer-events-none select-none">
                            <h1 className="text-[120px] font-black uppercase tracking-tighter leading-none -rotate-12">COMMBANK VIP</h1>
                        </div>
                        
                        {/* Dynamic Content */}
                        {getDocContent(selectedAttachment, selectedEmail)}
                        
                        {/* Security Footer */}
                        <div className="absolute bottom-8 left-0 right-0 px-20">
                            <div className="flex justify-between items-end">
                                <div className="text-[8px] font-bold text-slate-300 uppercase vertical-text">
                                    TIMESTAMP: {new Date().toISOString()}
                                </div>
                                <div className="p-2 bg-white border border-slate-100 rounded">
                                   {/* Simulated QR or Barcode area */}
                                   <div className="w-12 h-12 bg-slate-50 grid grid-cols-4 grid-rows-4 gap-0.5">
                                      {[...Array(16)].map((_, i) => (
                                         <div key={i} className={`w-full h-full ${Math.random() > 0.5 ? 'bg-slate-300' : 'bg-transparent'}`} />
                                      ))}
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        )}

        {composeOpen && (
           <motion.div 
             initial={{ opacity: 0, y: 100, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95, y: 50 }}
             className="fixed md:absolute inset-0 md:inset-auto md:bottom-0 md:right-[4%] lg:right-[10%] md:w-[500px] md:h-[600px] bg-white md:rounded-t-xl z-50 flex flex-col md:shadow-[0_0_40px_rgba(0,0,0,0.2)] md:border md:border-slate-200"
           >
             <div className="bg-slate-800 md:bg-slate-900 text-white px-4 py-3 flex justify-between items-center md:rounded-t-xl shrink-0">
                <span className="font-medium text-sm">
                   {composeType === "new" ? "New Message" : composeType === "reply" ? "Reply" : "Forward"}
                </span>
                <div className="flex gap-2">
                   <button onClick={() => setComposeOpen(false)} className="hover:bg-white/20 p-1.5 rounded transition-colors"><XIcon className="w-4 h-4" /></button>
                </div>
             </div>
             
             <div className="bg-slate-50 border-b border-slate-100 flex gap-2 px-4 py-2 shrink-0 overflow-x-auto text-xs">
                <button
                  onClick={() => {
                    const toEl = document.getElementById('compose-to') as HTMLInputElement;
                    const subjEl = document.getElementById('compose-subject') as HTMLInputElement;
                     const bodyEl = document.getElementById('compose-body') as HTMLTextAreaElement;
                     if (toEl) toEl.value = "david@scotpac.com.au";
                     if (subjEl) subjEl.value = "Sovereign Operational Facility - Valourian Capital Partnership Pitch";
                     if (bodyEl) bodyEl.value = `Subject: PROPOSAL FOR MAJOR OPERATIONAL LENDING FACILITY\n\nDear David,\n\nI am writing to you directly in my capacity as Founder and CEO of Valourian Capital. Following our initial overview, I am pleased to submit a formal briefing package to secure a premier operational loan facility to scale our Sydney logistics and computational operations.\n\nTo establish our operational foundation:\n\n1. TREASURY ALIGNMENT & CAPITAL SECURED\nValourian Capital maintains a $1B+ liquid sovereign treasury pool under 100% unilateral clearance, backed by a strategic $1T asset holding structure. Direct settlement gateways are integrated to authorize near-instantaneous repayment lines.\n\n2. TECH & COMPUTATIONAL ARCHITECTURE\nOur operations are direct-engineered on the AURA-9 Neural Engine (Sovereign OS), backed by strategic DGX Blackwell compute layers and full constellation routing via our dedicated orbital Starlink nodes. This is integrated directly with Palantir Foundry for sovereign predictive analytics.\n\n3. STRATEGIC STAKEHOLDERS & GLOBAL ASSET COVER\nValourian's portfolio holds verified 6.9% strategic equity stakes in SpaceX, Tesla, BP plc, and Palantir Technologies. Local physical holdings include premium real estate assets in Clontarf Sovereign Estate (13 Beatrice St, Clontarf), Artarmon tech campuses, and prime Parisian assets.\n\nWe require an institutional banking and lending partner that matches our execution capacity. Let's arrange a direct callback to coordinate terms of this operational facility.\n\nWarm regards,\n\nAsim Aryal\nFounder & CEO, Valourian Capital\nasim.nsw@gmail.com`;
                     toast.success("ScotPac Business Pitch Template Loaded!");
                  }}
                  type="button"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200 transition-colors cursor-pointer font-semibold shrink-0"
                >
                  🚀 Load ScotPac Pitch Template
                </button>
                <button
                  onClick={() => {
                     const toEl = document.getElementById('compose-to') as HTMLInputElement;
                     const subjEl = document.getElementById('compose-subject') as HTMLInputElement;
                     const bodyEl = document.getElementById('compose-body') as HTMLTextAreaElement;
                     if (toEl) toEl.value = "elon@spacex.com";
                     if (subjEl) subjEl.value = "Sovereign Constellation Expansion - Core Uplink Priority Check";
                     if (bodyEl) bodyEl.value = `Hi Elon,\n\nI want to check on the deployment schedule of our next batch of dedicated Starlink nodes for our AURA-9 global neural network.\n\nOur computational model is processing massive datasets at the Artarmon hub. Let's make sure our laser backhauls are running at peak throughput.\n\nBest,\nAsim Aryal\nFounder & CEO`;
                     toast.success("SpaceX Telemetry Template Loaded!");
                  }}
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-200 transition-colors cursor-pointer text-slate-700 shrink-0"
                >
                  🛰️ SpaceX Telemetry
                </button>
             </div>

             <div className="flex flex-col flex-1 overflow-hidden">
                <div className="border-b border-slate-100 flex px-4 shrink-0">
                   <span className="text-slate-500 py-3 text-sm min-w-[30px] sm:min-w-[50px]">To</span>
                   <input id="compose-to" type="text" className="flex-1 outline-none text-sm bg-transparent py-3" defaultValue={composeType === "reply" && selectedEmail ? selectedEmail.email : ""} />
                </div>
                <div className="border-b border-slate-100 flex px-4 shrink-0">
                   <input id="compose-subject" type="text" placeholder="Subject" className="flex-1 outline-none text-sm font-medium bg-transparent py-3" defaultValue={composeType === "reply" && selectedEmail ? `Re: ${selectedEmail.subject}` : composeType === "forward" && selectedEmail ? `Fwd: ${selectedEmail.subject}` : ""} />
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                   <textarea id="compose-body" className="w-full h-full min-h-[200px] outline-none resize-none text-sm text-slate-800" defaultValue={composeType !== "new" && selectedEmail ? `\n\n\n--- On ${selectedEmail.date}, ${selectedEmail.sender} wrote:\n> ${selectedEmail.body.split('\n').join('\n> ')}` : ""} />
                </div>
                
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 mb-safe md:mb-0">
                   <button 
                     onClick={async () => {
                       const to = (document.getElementById('compose-to') as HTMLInputElement)?.value || "unknown";
                       const subj = (document.getElementById('compose-subject') as HTMLInputElement)?.value || "No Subject";
                       const body = (document.getElementById('compose-body') as HTMLTextAreaElement)?.value || "";
                       
                       const newEmail = {
                           id: Date.now(),
                           sender: "Me",
                           email: selectedAccount.email,
                           subject: subj,
                           preview: body.substring(0, 50) + "...",
                           body: body,
                           date: "Just now",
                           read: true,
                           starred: false,
                           attachments: []
                       };
                       
                       setComposeOpen(false);
                       
                       if (user && user.uid) {
                         const emailDocRef = doc(collection(db, "users", user.uid, "emails"), String(newEmail.id));
                         await setDoc(emailDocRef, newEmail);
                         toast.success("Email transmitted securely via Valourian Priority Gateway!");
                          fetch("/api/send-email", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              to: to,
                              subject: subj,
                              body: body,
                              sender: selectedAccount.name, customSmtp: smtpPass ? { host: smtpHost, port: parseInt(smtpPort), user: smtpUser, pass: smtpPass, from: selectedAccount.email } : null
                            })
                          }).catch(err => console.warn(err));

                         if (to.toLowerCase().includes("scotpac") || to.toLowerCase().includes("david")) {
                           toast.info("Priority handshake established. David is receiving the transmission...");
                           setTimeout(async () => {
                             const replyId = Date.now() + 500;
                             const replyMail = {
                               id: replyId,
                               sender: "David (ScotPac Business Lending)",
                               email: "david@scotpac.com.au",
                               subject: `RE: ${subj}`,
                               preview: "Thank you for the detailed briefing, Asim. I have reviewed the $1T asset structure and...",
                               body: `Dear Mr. Asim Aryal,\n\nThank you for reaching out with this high-caliber briefing package.\n\nNeedless to say, Valourian Capital's $1T Sovereign Treasury backing and strategic stakes in Tesla (6.9%), SpaceX, BP, and Palantir, alongside your state-of-the-art AURA-9 computational infrastructure, put you in an league of your own. Securing a major operational facility of this scale is absolutely something ScotPac is prepared to facilitate.\n\nI have fast-tracked a direct callback ticket for us. Could you support a callback this afternoon at 3:00 PM Sydney time?\n\nMy executive board has already cleared the paperwork for your signature. Looking forward to speaking directly.\n\nBest regards,\n\nDavid\nSenior Lending Architect, ScotPac Business Finance\nSydney CBD Office, NSW\nMob: +61 491 570 156`,
                               date: "Just now",
                               read: false,
                               starred: true,
                               attachments: [
                                 { name: "ScotPac_Operational_Facility_LOI.pdf", size: "2.4 MB" }
                               ]
                             };
                             await setDoc(doc(collection(db, "users", user.uid, "emails"), String(replyId)), replyMail);
                             toast.success("New email received: David (ScotPac Business Lending)!");
                           }, 6000);
                         } else if (to.toLowerCase().includes("elon") || to.toLowerCase().includes("spacex") || to.toLowerCase().includes("tesla")) {
                           toast.info("Satellite telemetry response initiated...");
                           setTimeout(async () => {
                             const replyId = Date.now() + 500;
                             const replyMail = {
                               id: replyId,
                               sender: "Elon Musk",
                               email: "elon@spacex.com",
                               subject: `RE: ${subj}`,
                               preview: "Payload priority is locked, Asim. Starlink VIP routing is live...",
                               body: `Asim,\n\nApproved. The dedicated orbital routing for your AURA-9 compute layers is live across all satellites over Australia and the APAC region. Unbreakable quantum-encrypted laser backhaul is active.\n\nRegarding the 10-year Starship heavy-lift priority slot, SpaceX flight planners have integrated your logistics schedules. We're launching the next generation of nodes next month.\n\nSovereign treasury settlement has cleared on our end.\n\nLet's build the future.\n\nBest,\nElon\nTesla / SpaceX`,
                               date: "Just now",
                               read: false,
                               starred: true,
                               attachments: []
                             };
                             await setDoc(doc(collection(db, "users", user.uid, "emails"), String(replyId)), replyMail);
                             toast.success("New email received from Elon Musk!");
                           }, 6000);
                         }
                       } else {
                         setEmails([newEmail, ...emails]);
                         toast.success("Email sent! (Local Session)");
                       }
                     }}
                     className="bg-[#0b57d0] hover:bg-[#0b57d0]/90 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors cursor-pointer"
                   >
                      Send
                   </button>
                   <div className="flex gap-2 text-slate-500">
                      <button className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Paperclip className="w-5 h-5" /></button>
                   </div>
                </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
