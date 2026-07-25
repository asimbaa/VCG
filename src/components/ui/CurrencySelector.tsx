import React from 'react';
import { SYMBOLS } from '../../utils/CurrencyConverter';
import { Globe } from 'lucide-react';

interface Props {
  currency: string;
  onChange: (cur: string) => void;
  supportedCurrencies: string[];
}

export const CurrencySelector: React.FC<Props> = ({ currency, onChange, supportedCurrencies }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-full px-3 py-1.5 hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
      <Globe className="w-4 h-4 text-emerald-400" />
      <select 
        value={currency} 
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-white text-xs font-bold font-mono outline-none cursor-pointer appearance-none pr-4"
      >
        {supportedCurrencies.map(c => (
          <option key={c} value={c} className="bg-slate-900 text-white">{c} ({SYMBOLS[c]})</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-2 h-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
};
