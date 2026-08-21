import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    code = f.read()

# We want to find:
#         const docRef = await addDoc(collection(db, "active_orders"), {
#           userId: user?.uid || "anonymous",
#           ...
#         });
# and add the fetch to /api/fleet/dispatch right after it.

match_add_doc = r'(const docRef = await addDoc\(collection\(db, "active_orders"\), \{.*?\n\s+\}\);)'
replacement = r"""\1

        // Disptach to Real-Time Backend Fleet Network
        try {
          const fleetResponse = await fetch('/api/fleet/dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: docRef.id,
              restaurantLocation: selectedRestaurant.name,
              dropoffLocation: deliveryAddress
            })
          });
          const fleetData = await fleetResponse.json();
          if (fleetData.success) {
            toast.success(`Workforce Network: Courier ${fleetData.driver.name} dispatched!`);
          } else {
            toast.error(fleetData.error || "Courier network busy.");
          }
        } catch (e) {
          console.error('Fleet dispatch error', e);
        }
"""

new_code = re.sub(match_add_doc, replacement, code, flags=re.DOTALL)
if new_code != code:
    with open("src/components/bank/UberEatsApp.tsx", "w") as f:
        f.write(new_code)
    print("Patched handleOrder successfully.")
else:
    print("Could not find the addDoc block for active_orders.")
