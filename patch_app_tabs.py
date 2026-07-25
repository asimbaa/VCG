import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add MessageCenter import
if "import { MessageCenter }" not in content:
    content = content.replace('import { AIGuide } from "./components/AIGuide";', 'import { AIGuide } from "./components/AIGuide";\nimport { MessageCenter } from "./components/messagecenter/MessageCenter";')

# Update activeTab type
content = content.replace('<"bank" | "commbank" | "docucraft" | "websites" | "payments">', '<"bank" | "commbank" | "docucraft" | "websites" | "payments" | "messagecenter">')

# Add MessageCenter tab button
nav_button = """                <button 
                  onClick={() => setActiveTab("messagecenter")}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-all duration-300
                    ${activeTab === "messagecenter" 
                      ? "bg-slate-900 shadow-lg text-white" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <Mail className={`w-5 h-5 ${activeTab === "messagecenter" ? "text-blue-400" : ""}`} />
                    <span className="font-bold tracking-widest text-[11px] uppercase">Message Center</span>
                  </div>
                </button>
"""
content = content.replace('{/* Apps Header */}', nav_button + '\n                {/* Apps Header */}')

# Add MessageCenter render
content = content.replace('{activeTab === "payments" && <RapidPay user={user} />}', '{activeTab === "payments" && <RapidPay user={user} />}\n            {activeTab === "messagecenter" && <MessageCenter user={user} />}')

with open('src/App.tsx', 'w') as f:
    f.write(content)
