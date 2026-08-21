import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

# 1. Modify the Active Orders listener
active_orders_listener = """    if (!user || !user.uid) return;
    const unsub = onSnapshot(
      query(collection(db, "active_orders"), where("userId", "==", user.uid)),
      (snapshot) => {
        if (!snapshot.empty) {
          const activeDocs = snapshot.docs.filter(
            (d) => d.data().status !== "delivered",
          );
          if (activeDocs.length > 0) {
            const docData = activeDocs[0].data();
            setActiveOrder((prev: any) => {
              if (prev && prev.id === activeDocs[0].id) {
                if (prev.status === 'preparing' && docData.status === 'transit') {
                  sendBrowserNotification(
                    "UberEats Order Update",
                    "Your courier has picked up the order and is now in transit!"
                  );
                }
              }
              return { id: activeDocs[0].id, ...docData } as any;
            });
          } else {"""

content = re.sub(
    r"    if \(\!user \|\| \!user\.uid\) return;\s*const unsub = onSnapshot\(\s*query\(collection\(db, \"active_orders\"\), where\(\"userId\", \"==\", user\.uid\)\),\s*\(snapshot\) => \{\s*if \(\!snapshot\.empty\) \{\s*// just taking the most recently active one\s*const activeDocs = snapshot\.docs\.filter\(\s*\(d\) => d\.data\(\)\.status \!\=\= \"delivered\",\s*\);\s*if \(activeDocs\.length > 0\) \{\s*const docData = activeDocs\[0\]\.data\(\);\s*setActiveOrder\(\{ id: activeDocs\[0\]\.id, \.\.\.docData \} as any\);\s*\} else \{",
    active_orders_listener,
    content
)


# 2. Add Download Summary button
download_button = """                            {/* Download summary button */}
                            <div className="pt-2 border-t border-slate-100 flex justify-end mt-2">
                                <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      const contentStr = `UBER EATS RECEIPT SUMMARY\\n\\nRestaurant: ${order.recipient}\\nDate: ${orderDate}\\nTotal: $${Math.abs(order.amount).toFixed(2)}\\n\\nItems:\\n${(order.items || []).map((it:any) => `- ${it.name} ($${it.price})`).join('\\n')}\\n\\nDelivery Address: ${order.deliveryAddress || 'N/A'}`;
                                      const blob = new Blob([contentStr], { type: 'text/plain' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `Receipt_${order.id}.txt`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                  }}
                                  className="text-[10px] font-black uppercase tracking-widest text-[#06C167] hover:text-[#05a155] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                >
                                  <Download className="w-3 h-3" /> Download Summary
                                </button>
                            </div>
                          </div>"""
content = re.sub(
    r"                              </div>\s*\)\}\s*</div>",
    lambda m: r"                              </div>\n                            )}\n" + download_button,
    content
)

# 3. Smoother transition and subtle scale animation for the tracker UI
# We add `key={activeOrder.status}` to the motion.div containing the D3ProgressBar so it pulses on state change
scale_animation = """                  {/* D3-Animated Dynamic Progress Bar & Tracker UI */}
                  <motion.div
                    key={activeOrder.status}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                    }}
                    className="space-y-3 pt-2"
                  >"""
content = content.replace(
"""                  {/* D3-Animated Dynamic Progress Bar & Tracker UI */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "tween",
                      duration: 0.4,
                      delay: 0.1,
                      ease: "easeOut",
                    }}
                    className="space-y-3 pt-2"
                  >""",
scale_animation)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(content)

print("UberEatsApp patched")
