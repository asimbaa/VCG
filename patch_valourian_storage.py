import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

storage_effect = """  useEffect(() => {
    const handleStorage = () => {
      const valourianStr = localStorage.getItem("commbank_vip_balances");
      if (valourianStr) {
        setBalances(JSON.parse(valourianStr));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem("commbank_vip_balances", JSON.stringify(balances));
  }, [balances]);
"""

content = content.replace('  useEffect(() => {\n    localStorage.setItem("commbank_vip_balances", JSON.stringify(balances));\n  }, [balances]);', storage_effect)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

