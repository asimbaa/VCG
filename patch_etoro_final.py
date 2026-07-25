import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Make sure AI agent logic is implemented in eToroApp as requested by user
import_etoro = """
import EToroApp from "./EToroApp";
"""

if "import EToroApp from \"./EToroApp\";" not in content:
    content = content.replace("import CommonwealthBankApp from \"./CommonwealthBankApp\";", "import EToroApp from \"./EToroApp\";\nimport CommonwealthBankApp from \"./CommonwealthBankApp\";")

tab_logic = """
          {activeTab === "etoro" && <EToroApp />}
          {activeTab === "commbank" && <CommonwealthBankApp />}
"""

if "{activeTab === \"etoro\" && <EToroApp />}" not in content:
    content = content.replace("{activeTab === \"commbank\" && <CommonwealthBankApp />}", tab_logic)


nav_link = """
              <button
                onClick={() => setActiveTab("etoro")}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  activeTab === "etoro"
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LineChart className={`w-5 h-5 ${activeTab === "etoro" ? "text-emerald-400" : "text-slate-500"}`} />
                  <span className="font-bold tracking-wide">eToro</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("commbank")}
"""

if "onClick={() => setActiveTab(\"etoro\")}" not in content:
    content = content.replace("<button\n                onClick={() => setActiveTab(\"commbank\")}", nav_link)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()
    if "LineChart" not in content:
        content = content.replace("Bot } from \"lucide-react\";", "Bot, LineChart } from \"lucide-react\";")
        
with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

