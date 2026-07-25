import re

with open('src/components/messagecenter/MessageCenter.tsx', 'r') as f:
    content = f.read()

import_str = """import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { VoiceInputButton } from '../shared/VoiceInputButton';
"""
if "import { db }" not in content:
    content = content.replace("import { Mail, FileText, Key, Map as MapIcon, ChevronRight, Download, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';", 
                              "import { Mail, FileText, Key, Map as MapIcon, ChevronRight, Download, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';\n" + import_str)

state_str = """  const [dbMessages, setDbMessages] = useState<any[]>([]);
  
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
"""

if "setDbMessages" not in content:
    content = content.replace("  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);", "  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);\n" + state_str)

target_filter = """  const filteredMessages = activeCategory === 'all' 
    ? messages
    : messages.filter(m => m.category === activeCategory);"""

replace_filter = """  const [searchQuery, setSearchQuery] = useState("");
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
"""

content = content.replace(target_filter, replace_filter)

content = content.replace("onClick={() => setSelectedMessage(msg)}", "onClick={() => handleMessageClick(msg)}")
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';")


search_ui = """          </div>
          
          <div className="mt-4 relative">
             <input 
               type="text" 
               placeholder="Search documents..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500"
             />
          </div>"""

if "Search documents" not in content:
    content = content.replace("</button>\n          </div>\n        </div>", "</button>\n          </div>\n" + search_ui + "\n        </div>")

with open('src/components/messagecenter/MessageCenter.tsx', 'w') as f:
    f.write(content)
