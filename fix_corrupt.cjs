const fs = require('fs');

const content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const lines = content.split('\n');

let safeLines = [];
for (let line of lines) {
    if (line.includes('border-xU')) {
        break;
    }
    safeLines.push(line);
}

const remainder = `                            className="w-full bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white h-10 px-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-colors">
                        Allocate Network Block
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="text-xs font-black uppercase text-slate-200 tracking-wider">
                        Virtual Card Issuance / Push to Wallet
                      </div>
                      <div className="space-y-2">
                        <select
                          value={pushSelectedCardId}
                          onChange={(e) => setPushSelectedCardId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white h-11 px-3 rounded-xl focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="">-- Choose active card record from ledger --</option>
                          {digitalCards.map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.holder} - {card.network || "Visa"} {card.fullNumber || card.number || "5119 3988 4562 " + card.last4} ({String(card.limit || "").replace(".00","")} Limit)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "entities" ? (
                <PortfolioEntitiesTab />
            ) : activeTab === "swarm" ? (
                <SwarmIntelligenceTab />
            ) : activeTab === "terminal" ? (
                <CommandCenterTab />
            ) : activeTab === "gateway" ? (
                <PartnerNetworkTab />
            ) : activeTab === "vouchers" ? (
                <VouchersAndPrintTab />
            ) : activeTab === "concierge" ? (
                <PurchaseConciergeTab />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </div>
</div>
  );
}
`;

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', safeLines.join('\n') + remainder);
