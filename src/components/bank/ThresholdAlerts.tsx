import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AlertRule {
  id: string;
  asset: string;
  condition: 'above' | 'below';
  threshold: number;
  active: boolean;
  lastTriggered?: number;
}

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 92450.0 },
  { symbol: 'ETH', name: 'Ethereum', price: 3450.0 },
  { symbol: 'SOL', name: 'Solana', price: 145.0 },
  { symbol: 'NVDA', name: 'Nvidia', price: 890.0 },
  { symbol: 'AAPL', name: 'Apple', price: 175.0 },
];

export const sendBrowserNotification = (title: string, body: string) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
};

export const ThresholdAlerts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-threshold-alerts', handleOpen);
    return () => window.removeEventListener('open-threshold-alerts', handleOpen);
  }, []);

  const [rules, setRules] = useState<AlertRule[]>([]);
  const [newAsset, setNewAsset] = useState('BTC');
  const [newCondition, setNewCondition] = useState<'above' | 'below'>('above');
  const [newThreshold, setNewThreshold] = useState('');
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize prices
    const initial: Record<string, number> = {};
    ASSETS.forEach(a => { initial[a.symbol] = a.price; });
    setLivePrices(initial);

    // Request notification permission early
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Price simulation & Alert checking
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(symbol => {
          // fluctuate by up to 0.5%
          const change = next[symbol] * (Math.random() * 0.01 - 0.005);
          next[symbol] = next[symbol] + change;
        });

        // Use setTimeout to defer the setRules call outside the current state updater
        setTimeout(() => {
          setRules(prevRules => {
            let updated = false;
            const nextRules = prevRules.map(rule => {
              if (!rule.active) return rule;
              const currentPrice = next[rule.asset];
              if (!currentPrice) return rule;

              const isTriggered = rule.condition === 'above' 
                ? currentPrice > rule.threshold
                : currentPrice < rule.threshold;

              const now = Date.now();
              // Prevent spamming (alert once per 60 seconds)
              const canTrigger = !rule.lastTriggered || (now - rule.lastTriggered) > 60000;

              if (isTriggered && canTrigger) {
                sendBrowserNotification(
                  `🚨 ${rule.asset} Alert Triggered`, 
                  `${rule.asset} is now ${rule.condition} ${rule.threshold} (Current: ${currentPrice.toFixed(2)})`
                );
                updated = true;
                return { ...rule, lastTriggered: now };
              }
              return rule;
            });
            return updated ? nextRules : prevRules;
          });
        }, 0);

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addRule = () => {
    if (!newThreshold || isNaN(Number(newThreshold))) return;
    setRules(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      asset: newAsset,
      condition: newCondition,
      threshold: Number(newThreshold),
      active: true
    }]);
    setNewThreshold('');
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden fixed bottom-48 right-6 md:right-10 bg-slate-900 text-emerald-400 p-4 rounded-full shadow-2xl border border-emerald-500/30 hover:scale-110 transition-transform z-50 flex items-center justify-center gap-2 group"
      >
        <Bell className="w-6 h-6 group-hover:animate-ping" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
          {rules.filter(r => r.active).length}
        </span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-48 right-6 md:right-10 w-96 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <Bell className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Threshold Alerts</h3>
                  <p className="text-slate-400 text-xs">Real-time asset monitoring</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2">
                <BellOff className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 max-h-[60vh] overflow-y-auto space-y-4">
              
              {/* Add New Rule */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Create New Alert</h4>
                <div className="flex gap-2">
                  <select 
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    {ASSETS.map(a => (
                      <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                    ))}
                  </select>
                  <select 
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    <option value="above">Goes Above</option>
                    <option value="below">Drops Below</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="number"
                      placeholder={`Current: $${livePrices[newAsset]?.toFixed(2) || '0.00'}`}
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button 
                    onClick={addRule}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Rules List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Active Monitors</h4>
                {rules.length === 0 ? (
                  <div className="text-center p-6 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                    <p className="text-slate-500 text-xs">No active alerts configured.</p>
                  </div>
                ) : (
                  rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleRule(rule.id)}
                          className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${rule.active ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700'} border`}
                        >
                          <motion.div 
                            layout
                            className={`w-4 h-4 rounded-full ${rule.active ? 'bg-emerald-400 ml-5' : 'bg-slate-500 ml-1'}`}
                          />
                        </button>
                        <div>
                          <p className="text-white text-sm font-bold flex items-center gap-2">
                            {rule.asset} 
                            {rule.condition === 'above' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                            <span className="font-mono">${rule.threshold}</span>
                          </p>
                          <p className="text-slate-400 text-[10px]">
                            Live: <span className="font-mono text-emerald-400">${livePrices[rule.asset]?.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      <button onClick={() => deleteRule(rule.id)} className="text-slate-500 hover:text-red-400 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
