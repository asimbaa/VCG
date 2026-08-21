import re

with open("src/components/bank/ReserveArbitrageWidget.tsx", "r") as f:
    content = f.read()

# Add Recharts imports
import_recharts = "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';\n"
content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\n" + import_recharts)

# Update state to store historical data
state_updates = """  const [activeAsset, setActiveAsset] = useState<'RBA Bonds' | 'US Treasuries' | 'UK Gilts'>('US Treasuries');
  const [yieldRate, setYieldRate] = useState(4.25);
  const [chartData, setChartData] = useState<any[]>(Array.from({length: 10}, (_, i) => ({
    time: `10:0${i}`,
    RBA: 4.35 + (Math.random() - 0.5) * 0.02,
    US: 4.25 + (Math.random() - 0.5) * 0.02,
    UK: 3.95 + (Math.random() - 0.5) * 0.02,
  })));"""

content = re.sub(
    r"  const \[activeAsset, setActiveAsset\].*?useState\(4\.25\);",
    state_updates,
    content,
    flags=re.DOTALL
)

# Update the effect
effect = """    const interval = setInterval(() => {
      const assets = [
        { name: 'RBA Bonds', baseYield: 4.35, key: 'RBA' },
        { name: 'US Treasuries', baseYield: 4.25, key: 'US' },
        { name: 'UK Gilts', baseYield: 3.95, key: 'UK' }
      ];
      
      const newRBA = 4.35 + (Math.random() - 0.5) * 0.05;
      const newUS = 4.25 + (Math.random() - 0.5) * 0.05;
      const newUK = 3.95 + (Math.random() - 0.5) * 0.05;
      
      const best = [
        { name: 'RBA Bonds', currentYield: newRBA },
        { name: 'US Treasuries', currentYield: newUS },
        { name: 'UK Gilts', currentYield: newUK }
      ].sort((a, b) => b.currentYield - a.currentYield)[0];
      
      if (best.name !== activeAsset) {
        setActiveAsset(best.name as any);
        setYieldRate(best.currentYield);
      } else {
         setYieldRate(best.currentYield);
      }
      
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          RBA: newRBA,
          US: newUS,
          UK: newUK
        }];
        return newData;
      });
      
    }, 2000);"""

content = re.sub(
    r"    const interval = setInterval\(\(\) => \{.*?    \}, 3000\);",
    effect,
    content,
    flags=re.DOTALL
)

# Change ECB Gilts to UK Gilts
content = content.replace("'ECB Gilts'", "'UK Gilts'")
content = content.replace("ECB Gilts", "UK Gilts")
# Update base yield from 3.85 to 3.95
content = content.replace("3.85", "3.95")

# Add the recharts component
recharts_component = """
        <div className="h-48 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={8} />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickFormatter={(v) => v.toFixed(2) + '%'} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="RBA" name="RBA Bonds" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="US" name="US Treasuries" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="UK" name="UK Gilts" stroke="#d946ef" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">"""

content = content.replace("""        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">""", recharts_component)

with open("src/components/bank/ReserveArbitrageWidget.tsx", "w") as f:
    f.write(content)
