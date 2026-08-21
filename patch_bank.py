import re

with open('src/components/bank/BankDashboard.tsx', 'r') as f:
    content = f.read()

target1 = """                  ) : activeTab === "crypto" ? (
                    <Bitcoin className="w-5 h-5 text-blue-600" />
                  ) : activeTab === "portfolio" ? ("""

replacement1 = """                  ) : activeTab === "crypto" ? (
                    <Bitcoin className="w-5 h-5 text-blue-600" />
                  ) : activeTab === "portfolio" ? (
                    <Globe className="w-5 h-5 text-blue-600" />
                  ) : activeTab === "chat" ? (
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  ) : activeTab === "terminal" ? (
                    <Terminal className="w-5 h-5 text-blue-600" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 capitalize">
                    {activeTab === "cards"
                      ? "Digital Cards"
                      : activeTab.replace("_", " ")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Execute and track global operations
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "send" ? (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                  <h3 className="text-2xl font-bold mb-4">Send Funds</h3>
                  <p className="text-slate-500">Please use voice commands or terminal to execute transfers.</p>
                </div>
              ) : activeTab === "request" ? (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                  <h3 className="text-2xl font-bold mb-4">Request Funds</h3>
                </div>
              ) : activeTab === "cards" ? (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                  <h3 className="text-2xl font-bold mb-4">Digital Cards</h3>
                </div>
              ) : activeTab === "deposit" ? (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                  <h3 className="text-2xl font-bold mb-4">Deposit Funds</h3>
                </div>
              ) : activeTab === "portfolio" ? ("""

content = content.replace(target1, replacement1)

target2 = """) : null}
            {!chatFullScreen && ("""
replacement2 = """) : null}
            </div>
            {!chatFullScreen && ("""

content = content.replace(target2, replacement2)

with open('src/components/bank/BankDashboard.tsx', 'w') as f:
    f.write(content)
