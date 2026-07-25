import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Add states for cash and equity
states = """  const [availableCash, setAvailableCash] = useState(2000000); // Start with 2M from Treasury
  const [totalEquity, setTotalEquity] = useState(100240500);
"""
content = content.replace("  const [fundingAmount, setFundingAmount] = useState('');", states + "  const [fundingAmount, setFundingAmount] = useState('');")

# Modify handleFunding
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
      
      if (type === 'deposit') {
          setAvailableCash(prev => prev + amount);
          setTotalEquity(prev => prev + amount);
      } else {
          setAvailableCash(prev => prev - amount);
          setTotalEquity(prev => prev - amount);
      }
      
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

# Modify render values
content = content.replace('<div className="text-4xl font-black text-white">$100,240,500.00</div>', '<div className="text-4xl font-black text-white">${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>')
content = content.replace('<div className="text-2xl font-black text-emerald-400">$2,500,000.00</div>', '<div className="text-2xl font-black text-emerald-400">${availableCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>')

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)

