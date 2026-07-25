import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# 1. Add export dictionary button and logic
global_dict_logic = """
  const syncGlobalTransferDictionary = async () => {
    try {
      toast.success("Querying global transfer requirements...");
      const GLOBAL_SCHEMAS = {
        au_bsb: {
          region: "Australia",
          type: "BSB/Account",
          fields: ["bsb", "account", "name", "reference"],
          settlement: "Instant (Osko)",
          limits: "Unlimited"
        },
        us_ach: {
          region: "United States",
          type: "ACH/Wire",
          fields: ["routing_number", "account_number", "account_type", "name"],
          settlement: "1-2 Business Days",
          limits: "Unlimited"
        },
        uk_bacs: {
          region: "United Kingdom",
          type: "BACS/CHAPS",
          fields: ["sort_code", "account_number", "name"],
          settlement: "Same Day (CHAPS) / 3 Days (BACS)",
          limits: "Unlimited"
        },
        eu_sepa: {
          region: "Europe",
          type: "SEPA",
          fields: ["iban", "bic", "name"],
          settlement: "Instant (SEPA Inst) / 1 Day",
          limits: "Unlimited"
        },
        ca_eft: {
          region: "Canada",
          type: "EFT",
          fields: ["transit_number", "institution_number", "account_number", "name"],
          settlement: "1-2 Business Days",
          limits: "Unlimited"
        }
      };
      
      // Splice into DB
      for (const [key, schema] of Object.entries(GLOBAL_SCHEMAS)) {
        await addDoc(collection(db, "global_transfer_schemas"), {
            id: key,
            ...schema,
            updatedAt: serverTimestamp()
        });
      }
      toast.success("Global dictionaries spliced into DB and Schemas updated.", {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
      });
    } catch(err) {
      toast.error("Failed to sync global transfer dictionaries to DB.");
    }
  };
"""

content = content.replace("  const initiateTransfer = async (e: React.FormEvent) => {", global_dict_logic + "\n  const initiateTransfer = async (e: React.FormEvent) => {")

# 2. Add Button to UI in Send tab
sync_btn = """                        <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-[9px] font-black uppercase text-blue-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" /> Live Rates Active
                        </div>
                        <button type="button" onClick={syncGlobalTransferDictionary} className="ml-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-[9px] font-black uppercase text-indigo-400 hover:bg-indigo-500/30 transition-colors">
                          Sync Global Schemas
                        </button>"""

content = content.replace("""                        <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-[9px] font-black uppercase text-blue-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />{" "}
                          Live Rates Active
                        </div>""", sync_btn)


# 3. Add to transfer types
transfer_types_old = """                          {[
                            { id: "au_bsb", label: "AU BSB", icon: Landmark },
                            { id: "swift", label: "SWIFT", icon: Globe2 },
                            { id: "payid", label: "PayID", icon: Smartphone },
                            { id: "iban", label: "IBAN", icon: Globe },
                            { id: "crypto", label: "Crypto", icon: Bitcoin },
                            {
                              id: "eftpos",
                              label: "EFTPOS Cash",
                              icon: Wallet,
                            },
                          ].map((type) => ("""

transfer_types_new = """                          {[
                            { id: "au_bsb", label: "AU BSB", icon: Landmark },
                            { id: "us_ach", label: "US ACH", icon: Landmark },
                            { id: "uk_bacs", label: "UK BACS", icon: Landmark },
                            { id: "swift", label: "SWIFT", icon: Globe2 },
                            { id: "payid", label: "PayID", icon: Smartphone },
                            { id: "iban", label: "IBAN", icon: Globe },
                            { id: "crypto", label: "Crypto", icon: Bitcoin },
                            {
                              id: "eftpos",
                              label: "EFTPOS Cash",
                              icon: Wallet,
                            },
                          ].map((type) => ("""

content = content.replace(transfer_types_old, transfer_types_new)

# 4. Add form fields for US ACH and UK BACS
form_fields = """                          {transferType === "iban" && (
                            <input
                              type="text"
                              required
                              value={recipient}
                              onChange={(e) =>
                                setRecipient(
                                  e.target.value.toUpperCase().replace(/\s/g, ""),
                                )
                              }
                              placeholder="IBAN Number"
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 placeholder:text-slate-300"
                            />
                          )}

                          {transferType === "us_ach" && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                required
                                placeholder="9-Digit ABA Routing Number"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 placeholder:text-slate-300"
                              />
                              <input
                                type="text"
                                required
                                placeholder="Account Number"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 placeholder:text-slate-300"
                              />
                            </div>
                          )}

                          {transferType === "uk_bacs" && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                required
                                placeholder="Sort Code (XX-XX-XX)"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 placeholder:text-slate-300"
                              />
                              <input
                                type="text"
                                required
                                placeholder="8-Digit Account Number"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 placeholder:text-slate-300"
                              />
                            </div>
                          )}"""

old_iban = """                          {transferType === "iban" && (
                            <input
                              type="text"
                              required
                              value={recipient}
                              onChange={(e) =>
                                setRecipient(
                                  e.target.value.toUpperCase().replace(/\s/g, ""),
                                )
                              }
                              placeholder="IBAN Number"
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 placeholder:text-slate-300"
                            />
                          )}"""

content = content.replace(old_iban, form_fields)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
