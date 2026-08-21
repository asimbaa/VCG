import re

with open("src/components/bank/DocuCraftAI.tsx", "r") as f:
    content = f.read()

# Update the log when generating
pay_addition = """    setTimeout(() => {
      setIsPaid(true);
      toast.success("Treasury Payment Executed. Contract is binding.", { icon: "✅" });
      if ((window as any).updateNodeVerification) {
         (window as any).updateNodeVerification('Payout Deed TX-002');
      }
    }, 1500);"""

content = content.replace("""    setTimeout(() => {
      setIsPaid(true);
      toast.success("Treasury Payment Executed. Contract is binding.", { icon: "✅" });
    }, 1500);""", pay_addition)

gen_addition = """      setAuditLogs(prev => [newLog, ...prev].slice(0, 5));
      if ((window as any).updateNodeVerification) {
         (window as any).updateNodeVerification('Payout Deed TX-001');
      }"""

content = content.replace("      setAuditLogs(prev => [newLog, ...prev].slice(0, 5));", gen_addition)


with open("src/components/bank/DocuCraftAI.tsx", "w") as f:
    f.write(content)
