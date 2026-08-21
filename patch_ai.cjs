const fs = require('fs');
let file = fs.readFileSync('src/components/bank/SovereignAI.tsx', 'utf8');

// 1. Add 'chart' to type
file = file.replace(
    `type?: 'text' | 'action' | 'asset' | 'alert';`,
    `type?: 'text' | 'action' | 'asset' | 'alert' | 'chart';`
);

// 2. Add Recharts import if not there
if (!file.includes('recharts')) {
    file = file.replace(
        'import { toast } from \'sonner\';',
        'import { toast } from \'sonner\';\nimport { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from \'recharts\';'
    );
}

// 3. Add chart rendering in message mapping
const chartRenderBlock = `
                              {msg.type === 'chart' && (
                                <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 h-64 w-full relative">
                                  <div className="absolute top-4 left-4 z-10 text-[10px] font-black uppercase tracking-widest text-emerald-400">Predicted Liquidity (Q3)</div>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { month: 'Jul', liquidity: 14.2 },
                                        { month: 'Aug', liquidity: 15.8 },
                                        { month: 'Sep', liquidity: 18.5 },
                                        { month: 'Oct', liquidity: 22.4 },
                                        { month: 'Nov', liquidity: 28.1 },
                                        { month: 'Dec', liquidity: 35.0 }
                                    ]}>
                                        <defs>
                                          <linearGradient id="colorLiq" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => \`\$\${val}B\`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }} />
                                        <Area type="monotone" dataKey="liquidity" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLiq)" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
`;

if (!file.includes('msg.type === \'chart\'')) {
    file = file.replace(
        '{msg.type === \'action\' && (',
        chartRenderBlock + '\n                              {msg.type === \'action\' && ('
    );
}

// 4. Add intercept logic
const interceptBlock = `
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('liquidity') || lowerInput.includes('predict') || lowerInput.includes('cashflow') || lowerInput.includes('q3')) {
        const aiChartMsg = {
            role: 'assistant',
            content: 'Based on historical RapidPay clearing volume and recent high-sovereignty asset acquisitions, here is the algorithmic cashflow prediction and liquidity trajectory for Q3 and beyond. We are tracking a steep parabolic curve toward $35B+ capital reserve.',
            timestamp: new Date().toISOString(),
            type: 'chart'
        };
        setTimeout(() => {
            setSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    return { ...s, messages: [...s.messages, aiChartMsg], updatedAt: new Date().toISOString() };
                }
                return s;
            }));
            setIsTyping(false);
        }, 1500);
        return;
    }
`;

if (!file.includes('lowerInput.includes(\'liquidity\')')) {
    file = file.replace(
        'setIsTyping(true);',
        'setIsTyping(true);\n' + interceptBlock
    );
}

fs.writeFileSync('src/components/bank/SovereignAI.tsx', file);
