import re

with open("src/components/bank/SovereignStore.tsx", "r") as f:
    content = f.read()

# Fix the type of logisticsProvider
content = re.sub(
    r"const \[logisticsProvider, setLogisticsProvider\] = useState<'Australia Post' \| 'Amazon Logistics' \| 'FedEx' \| 'DHL' \| 'Aura Drive Tesla Fleet' \| 'Apple Store Fleet'>\('Amazon Logistics'\);",
    r"const [logisticsProvider, setLogisticsProvider] = useState<string>('Amazon Logistics');",
    content
)

# Insert hasRealEstate variable right before filteredProducts
if "const hasRealEstate =" not in content:
    content = content.replace(
        "const filteredProducts =",
        "const hasRealEstate = cart.some(item => item.brand === 'Valourian Real Estate' || item.tag === 'Real Estate' || item.category === 'Real Estate Property');\n\n  const filteredProducts ="
    )

# Replace the logistics provider dropdown options
target_select = """                  <select
                    value={logisticsProvider}
                    onChange={(e) => setLogisticsProvider(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50 font-sans cursor-pointer"
                  >
                    <option value="Australia Post">Australia Post</option>
                    <option value="Amazon Logistics">Amazon Logistics</option>
                    <option value="FedEx">FedEx</option>
                    <option value="DHL">DHL Express</option>
                    <option value="Aura Drive Tesla Fleet">Aura Drive Tesla Fleet</option>
                    <option value="Apple Store Fleet">Apple Store Fleet</option>
                  </select>"""

replacement_select = """                  <select
                    value={logisticsProvider}
                    onChange={(e) => setLogisticsProvider(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50 font-sans cursor-pointer"
                  >
                    {hasRealEstate ? (
                      <>
                        <option value="Sotheby's International Realty">Sotheby's VIP Brokerage (Keys & Deeds)</option>
                        <option value="Knight Frank VIP Brokerage">Knight Frank Private Office</option>
                        <option value="Agent 47 Sovereign Hand-off">Agent 47 / Sovereign Hand-off</option>
                        <option value="Prosegur Armored Transport">Prosegur Armored Escort</option>
                        <option value="PEXA Secure e-Conveyancing">PEXA Digital Settlement</option>
                      </>
                    ) : (
                      <>
                        <option value="Australia Post">Australia Post</option>
                        <option value="Amazon Logistics">Amazon Logistics</option>
                        <option value="FedEx">FedEx</option>
                        <option value="DHL">DHL Express</option>
                        <option value="Aura Drive Tesla Fleet">Aura Drive Tesla Fleet</option>
                        <option value="Apple Store Fleet">Apple Store Fleet</option>
                      </>
                    )}
                  </select>"""

content = content.replace(target_select, replacement_select)

with open("src/components/bank/SovereignStore.tsx", "w") as f:
    f.write(content)

print("Patched successfully")
