import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Make TSLA liquidation add to Bank (Treasury)
liquidation_button = """                       <button onClick={() => {
                           setIsFunding(true);
                           toast.success("Initiating 2% TSLA transfer to eToro...", { icon: <Activity className="w-4 h-4 text-emerald-400"/> });
                           setTimeout(() => {
                               toast.success("TSLA shares liquidated at market rate.", { icon: <LineChart className="w-4 h-4 text-emerald-400"/> });
                           }, 2000);
                           setTimeout(() => {
                               toast.success("$2,509,000.00 withdrawn to Commonwealth Bank successfully.", { icon: <DollarSign className="w-4 h-4 text-emerald-400"/> });
                               
                               const valourianStr = localStorage.getItem("commbank_vip_balances");
                               let vBal = valourianStr ? JSON.parse(valourianStr) : { AUD: 100000000.0, USD: 0, EUR: 0, GBP: 0 };
                               vBal.AUD += 2509000;
                               localStorage.setItem("commbank_vip_balances", JSON.stringify(vBal));
                               window.dispatchEvent(new Event('storage'));
                               
                               setTotalEquity(prev => prev - 2509000); // Because we sold and withdrew
                               
                               setIsFunding(false);
                           }, 4000);
                       }} disabled={isFunding} className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 text-emerald-400 font-bold rounded-xl transition-colors border border-emerald-500/50 uppercase tracking-widest text-xs">"""

content = re.sub(
    r"<button onClick=\{\(\) => \{\s*setIsFunding\(true\);\s*toast\.success\(\"Initiating 2% TSLA transfer to eToro\.\.\.\".*?disabled=\{isFunding\} className=\"w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 text-emerald-400 font-bold rounded-xl transition-colors border border-emerald-500/50 uppercase tracking-widest text-xs\">",
    liquidation_button,
    content,
    flags=re.DOTALL
)

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)

