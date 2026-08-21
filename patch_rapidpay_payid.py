import re

with open('src/components/pay/RapidPay.tsx', 'r') as f:
    content = f.read()

target = """        // Find recipient in users collection if transferType is standard
        if (transferType === "standard") {
          const q = query(collection(db, "users"), where("email", "==", transferTo.trim()));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
             const recipientDoc = querySnapshot.docs[0];
             const recipientData = recipientDoc.data();
             const recipientRef = doc(db, "users", recipientDoc.id);
             await updateDoc(recipientRef, {
                "balances.AUD": (recipientData.balances?.AUD || 0) + amtNum
             });
             toast.success(`Successfully delivered ${amtNum} AUD to ${transferTo}!`);
          } else {
             toast.info(`Recipient ${transferTo} not found in Valourian network. Routing to external clearing house...`);
          }
        }"""

replacement = """        // Find recipient in users collection if transferType is standard or payid
        if (transferType === "standard" || transferType === "payid") {
          const lookupValue = transferType === "payid" ? payIdValue.trim() : transferTo.trim();
          const q = query(collection(db, "users"), where("email", "==", lookupValue));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
             const recipientDoc = querySnapshot.docs[0];
             const recipientData = recipientDoc.data();
             const recipientRef = doc(db, "users", recipientDoc.id);
             await updateDoc(recipientRef, {
                "balances.AUD": (recipientData.balances?.AUD || 0) + amtNum
             });
             toast.success(`Successfully delivered ${amtNum} AUD to ${lookupValue}!`);
          } else {
             toast.info(`Recipient ${lookupValue} not found in Valourian network. Routing to external clearing house...`);
          }
        }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/pay/RapidPay.tsx', 'w') as f:
        f.write(content)
    print("Patched handleConfirm")
else:
    print("Target not found in handleConfirm")
