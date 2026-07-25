import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Building2, Coins, Wallet, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface CryptoPortfolioWidgetProps {
  totalEquity: number;
}

export function CryptoPortfolioWidget({ totalEquity }: CryptoPortfolioWidgetProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDestination, setTransferDestination] = useState<'Coinbase' | 'eToro'>('Coinbase');
  const [transferAsset, setTransferAsset] = useState('BTC');
  const [transferAmount, setTransferAmount] = useState('');

  const rawCryptoHoldings = [
    { symbol: 'BTC', name: 'Bitcoin', value: 25000000 },
    { symbol: 'ETH', name: 'Ethereum', value: 15000000 },
    { symbol: 'SOL', name: 'Solana', value: 5000000 },
    { symbol: 'DOGE', name: 'Dogecoin', value: 1000000 },
  ];

  // "increase each assets to 22% of total"
  const targetCryptoValue = totalEquity * 0.22;
  const cryptoHoldings = rawCryptoHoldings.map(c => ({
    ...c,
    value: targetCryptoValue
  }));

  const rawStockHoldings = [
    { symbol: 'TSLA', name: 'Tesla Inc.', value: 125450000.00, change: 4.2 },
    { symbol: 'SPX', name: 'SpaceX', value: 90000000.00, change: 12.5 },
    { symbol: 'OAI', name: 'OpenAI', value: 7500000.00, change: 8.2 },
    { symbol: 'PLTR', name: 'Palantir Tech', value: 2740500.00, change: -1.4 },
  ];

  // "increase each holdings by 22%"
  const stockHoldings = rawStockHoldings.map(s => ({
    ...s,
    value: s.value * 1.22
  }));

  const allHoldings: Array<{symbol: string, name: string, value: number, change?: number}> = [...cryptoHoldings, ...stockHoldings].sort((a, b) => b.value - a.value);

  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.innerHTML = '';
    
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      value: totalEquity * (0.8 + Math.random() * 0.4) // mock historical data
    }));

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.value)! * 0.9, d3.max(data, d => d.value)! * 1.1])
      .range([height, 0]);

    const line = d3.line<{date: Date, value: number}>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('d', line);

    const xAxis = d3.axisBottom(x).ticks(5);
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => `$${d3.format(".2s")(d as number)}`);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('color', '#64748b');

    svg.append('g')
      .call(yAxis)
      .attr('color', '#64748b');

  }, [totalEquity]);

  const handleTransfer = () => {
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    toast.success(`Successfully transferred $${Number(transferAmount).toLocaleString()} of ${transferAsset} to ${transferDestination}`);
    setShowTransferModal(false);
    setTransferAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Portfolio Performance
          </h3>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            Withdraw / Transfer
          </button>
        </div>
        <div ref={chartRef} className="w-full h-[250px]" />
      </div>

      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Combined Assets (Crypto & Equities)
        </h3>
        <div className="space-y-3">
          {allHoldings.map((asset, idx) => (
            <div key={idx} className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white">
                  {asset.symbol}
                </div>
                <div>
                  <div className="text-white font-bold">{asset.name}</div>
                  <div className="text-xs text-slate-400">
                    {'change' in asset ? 'Equity (Increased by 22%)' : 'Crypto (Set to 22% of total)'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                {asset.change !== undefined && (
                  <div className={`text-xs flex items-center justify-end gap-1 ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {asset.change >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} 
                    {asset.change > 0 ? '+' : ''}{asset.change}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-xl font-black text-white mb-6">Transfer Assets</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-2">Destination</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTransferDestination('Coinbase')}
                    className={`flex-1 py-3 rounded-xl border flex justify-center items-center gap-2 font-bold transition-colors ${transferDestination === 'Coinbase' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    <Coins className="w-4 h-4" /> Coinbase
                  </button>
                  <button 
                    onClick={() => setTransferDestination('eToro')}
                    className={`flex-1 py-3 rounded-xl border flex justify-center items-center gap-2 font-bold transition-colors ${transferDestination === 'eToro' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    <Building2 className="w-4 h-4" /> eToro
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-2">Asset</label>
                <select 
                  value={transferAsset}
                  onChange={(e) => setTransferAsset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 font-medium"
                >
                  {allHoldings.map(h => (
                    <option key={h.symbol} value={h.symbol}>{h.name} ({h.symbol})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-2">Amount (USD)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleTransfer}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" /> Confirm Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
