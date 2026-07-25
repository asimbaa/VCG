import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                <button
                  onClick={() => setActiveTab("payments")}"""

message_center_btn = """                <button
                  onClick={() => setActiveTab("messagecenter")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "messagecenter" 
                      ? "bg-slate-800 text-[#ffcc00] shadow-md border border-slate-700" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Message Center
                </button>
"""

content = content.replace(target, message_center_btn + target)

with open('src/App.tsx', 'w') as f:
    f.write(content)
