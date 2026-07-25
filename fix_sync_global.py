import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

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

content = content.replace("  const initiateTransfer = (e: React.FormEvent) => {", global_dict_logic + "\n  const initiateTransfer = (e: React.FormEvent) => {")

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
