import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Add useEffect for cross-tab or global state sync (optional, or just update localStorage)
funding_logic = """    const handleFunding = async (type: 'deposit' | 'withdraw') => {
    const amount = Number(fundingAmount);
    if (!fundingAmount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    
    if (type === 'withdraw' && amount > availableCash) {
        toast.error("Insufficient available cash.");
        return;
    }
    
    setIsFunding(true);
    
    try {
      if (user) {
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          type: type === 'deposit' ? "ETORO_DEPOSIT" : "ETORO_WITHDRAWAL",
          amount: amount,
          status: "completed",
          timestamp: serverTimestamp()
        });
      }
      
      const valourianStr = localStorage.getItem("commbank_vip_balances");
      let vBal = valourianStr ? JSON.parse(valourianStr) : { AUD: 100000000.0, USD: 0, EUR: 0, GBP: 0 };
      
      if (type === 'deposit') {
          if (vBal.AUD < amount) {
              toast.error("Insufficient Treasury funds for this deposit.");
              setIsFunding(false);
              return;
          }
          setAvailableCash(prev => prev + amount);
          setTotalEquity(prev => prev + amount);
          vBal.AUD -= amount;
      } else {
          setAvailableCash(prev => prev - amount);
          setTotalEquity(prev => prev - amount);
          vBal.AUD += amount;
      }
      localStorage.setItem("commbank_vip_balances", JSON.stringify(vBal));
      
      window.dispatchEvent(new Event('storage')); // Trigger update in ValourianDashboard if listening
      
      toast.success(`Successfully ${type === 'deposit' ? 'deposited $' + amount.toLocaleString() + ' from Treasury to' : 'withdrew $' + amount.toLocaleString() + ' to Bank Account from'} eToro.`, {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
      });
      setFundingAmount("");
    } catch (error) {
      console.error("Funding error:", error);
      toast.error("Funding operation failed.");
    } finally {
      setIsFunding(false);
    }
  };"""

content = re.sub(r"    const handleFunding = async \(type: 'deposit' \| 'withdraw'\) => \{.*?    \};", funding_logic, content, flags=re.DOTALL)

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)

