import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, FileText, Key, Map as MapIcon, ChevronRight, Download, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { VoiceInputButton } from '../shared/VoiceInputButton';

export function MessageCenter({ user }: { user: any }) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'login' | 'invoices' | 'maps'>('all');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [dbMessages, setDbMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchListening, setIsSearchListening] = useState(false);
  
  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, "users", user.uid, "emails"),
      orderBy("id", "desc")
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ ...d.data(), docId: d.id }));
      setDbMessages(msgs);
    });
    
    return () => unsub();
  }, [user]);

  const messages = useMemo(() => [
    {
      id: 1,
      category: 'login',
      subject: 'Neuralink Quantum Authentication: Access Granted',
      sender: 'Sovereign IAM (Tier-1)',
      date: 'Today, 08:30 AM',
      read: false,
      content: `Valourian Security Protocol Alpha-7 has successfully verified your biometric and neural signatures.\n\nIdentity: ${user?.email || 'asim.nsw@gmail.com'}\nQuantum Encryption State: ACTIVE (AES-4096-GCM)\nDevice Matrix: Neuralink Pro & Apple Vision Pro (Synchronized)\nGeospatial Coordinates: Sydney, Australia (Encrypted Tunnel)\n\nAll deep space computational nodes confirm your access. Welcome back, Director. Your sovereign portfolio is operating at 99.999% uptime.`,
      attachments: [{ name: 'Access_Log_Alpha7.enc', size: '4.1 KB', icon: Key }]
    },
    {
      id: 2,
      category: 'invoices',
      subject: 'Invoice #VAL-2941: Global Asset Clearance via Sovereign Network',
      sender: 'Valourian Treasury',
      date: 'Yesterday, 14:15 PM',
      read: true,
      content: `The following asset clearance has been executed across the Valourian blockchain utilizing zero-knowledge proof settlement.\n\nTotal Settled: $200,000,000.00 AUD\nTransaction Hash: 0x9b8a...3f1c\nStatus: PAID (Zero Limits Clearance Verified)\n\nAttached is the immutable smart contract invoice and the proof of purchase. The treasury reserves have been automatically rebalanced across the distributed ledger.`,
      attachments: [{ name: 'SmartContract_Invoice_VAL2941.pdf', size: '1.2 MB', icon: FileText }, { name: 'Ledger_Verification.hash', size: '256 B', icon: FileText }]
    },
    {
      id: 3,
      category: 'maps',
      subject: 'Tactical Route Map: Westfield Chatswood to Artarmon Central Hub',
      sender: 'Sovereign Logistics Command',
      date: 'Oct 12, 10:00 AM',
      read: true,
      content: `Your secure delivery vector has been locked and encrypted. Autonomous escort drones are currently mapping real-time traffic anomalies.\n\nOrigin: Westfield Chatswood (Secured Loading Bay)\nDestination: Artarmon Sovereign Hub (Vault 4)\nThreat Level: Zero (Path Clear)\n\nThe Sovereign Logistics dashboard is streaming live telemetry. Proceed to the command center to monitor the asset transfer.`,
      attachments: [{ name: 'Route_Map_Secure_Vector.png', size: '3.4 MB', icon: MapIcon }, { name: 'Drone_Telemetry_Log.json', size: '840 KB', icon: FileText }]
    },
    {
      id: 4,
      category: 'login',
      subject: 'Sovereign Identity Verification Code',
      sender: 'Valourian Shield',
      date: 'Oct 10, 09:45 AM',
      read: true,
      content: `A new session initialization was detected from your primary visual interface.\n\nVerification Code: 849-201-XYZ\n\nPlease submit this code via your neural interface to bypass the retinal firewall. This code is valid for exactly 180 seconds and is shielded against external interception.`,
      attachments: []
    }
  ], [user]);

  // Combine static and db messages
  const allMessages = useMemo(() => {
    const combined = [...messages, ...dbMessages.map(m => ({
      id: m.id || m.docId,
      category: 'invoices', // Auto categorise db emails here or based on content
      subject: m.subject || 'Sovereign Notification',
      sender: m.sender || m.email || 'Valourian System',
      date: new Date(m.id).toLocaleString() || 'Recent',
      read: m.read || false,
      content: m.body || m.content || '',
      attachments: [],
      isDbMessage: true,
      docId: m.docId
    }))];
    
    // Auto catalog tags
    return combined.map(m => {
       const contentLower = m.content.toLowerCase();
       if (contentLower.includes('invoice') || contentLower.includes('paid') || contentLower.includes('receipt')) m.category = 'invoices';
       else if (contentLower.includes('login') || contentLower.includes('password') || contentLower.includes('access')) m.category = 'login';
       else if (contentLower.includes('map') || contentLower.includes('location') || contentLower.includes('tracking')) m.category = 'maps';
       else m.category = 'all'; // Default
       return m;
    });
  }, [dbMessages, messages]);

  const filteredMessages = allMessages.filter(m => {
    if (activeCategory !== 'all' && m.category !== activeCategory) return false;
    if (searchQuery) {
       const q = searchQuery.toLowerCase();
       return m.subject.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q);
    }
    return true;
  });
  
  const handleMessageClick = async (msg: any) => {
    setSelectedMessage(msg);
    if (msg.isDbMessage && !msg.read) {
       try {
         await updateDoc(doc(db, "users", user.uid, "emails", msg.docId), {
            read: true
         });
       } catch(e) {}
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col md:flex-row rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl relative z-10">
      
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[300px] md:h-auto overflow-y-auto">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-black tracking-widest uppercase text-sm text-slate-900">Message Center</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sovereign Comms</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activeCategory === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Mail className="w-4 h-4" /> All Messages
            </button>
            <button 
              onClick={() => setActiveCategory('login')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activeCategory === 'login' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Key className="w-4 h-4" /> Login Details
            </button>
            <button 
              onClick={() => setActiveCategory('invoices')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activeCategory === 'invoices' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FileText className="w-4 h-4" /> Invoices & Proofs
            </button>
            <button 
              onClick={() => setActiveCategory('maps')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activeCategory === 'maps' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MapIcon className="w-4 h-4" /> Store Maps
            </button>
          </div>
          
          <div className="mt-6 relative">
             <input 
               type="text" 
               placeholder="Search documents..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-indigo-500"
             />
             <VoiceInputButton 
               isListening={isSearchListening}
               setIsListening={setIsSearchListening}
               onTranscript={(text) => setSearchQuery((prev) => prev ? prev + ' ' + text : text)}
               className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map(msg => (
            <div 
              key={msg.isDbMessage ? msg.docId : `static-${msg.id}`}
              onClick={() => handleMessageClick(msg)}
              className={`p-5 border-b border-slate-100 cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'} ${!msg.read ? 'bg-white' : 'opacity-80'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{msg.sender}</span>
                <span className="text-[9px] font-bold text-slate-400">{msg.date}</span>
              </div>
              <h4 className={`text-sm ${!msg.read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'} line-clamp-1`}>{msg.subject}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white/50 backdrop-blur-sm relative h-full overflow-y-auto">
        {selectedMessage ? (
          <div className="max-w-3xl mx-auto p-8 md:p-12">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{selectedMessage.subject}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-indigo-600">{selectedMessage.sender}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-500">{selectedMessage.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="prose prose-sm md:prose-base max-w-none text-slate-700 font-medium whitespace-pre-wrap">
                {selectedMessage.content}
              </div>
              
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Attachments</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedMessage.attachments.map((att: any, idx: number) => {
                      const Icon = att.icon;
                      return (
                        <div key={idx} className="flex items-center p-4 rounded-xl border border-slate-200 bg-slate-50 group cursor-pointer hover:bg-slate-100 transition-colors">
                          <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0 mr-4">
                            <Icon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{att.name}</p>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">{att.size}</p>
                          </div>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Mail className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm font-bold tracking-widest uppercase">Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
