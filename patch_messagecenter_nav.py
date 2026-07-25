import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add MessageCenter tab button right after payments tab button
target = """                <button
                  onClick={() => setActiveTab("payments")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "payments" 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Payments
                </button>"""

message_center_btn = """                <button
                  onClick={() => setActiveTab("messagecenter")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "messagecenter" 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Message Center
                </button>"""

if "Message Center" not in content:
    content = content.replace(target, target + "\n" + message_center_btn)
else:
    print("Already there")

with open('src/App.tsx', 'w') as f:
    f.write(content)
