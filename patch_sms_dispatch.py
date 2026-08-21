import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    code = f.read()

# Modify handleOrder to also send an SMS upon dispatch
# We already have sendBrowserNotification, and we added the fleet dispatch fetch.
# Let's add SMS dispatch fetch inside the try block of the fleet fetch.

fleet_dispatch_match = r"const fleetData = await fleetResponse\.json\(\);"
replacement = r"""const fleetData = await fleetResponse.json();
          if (fleetData.success) {
            toast.success(`Workforce Network: Courier ${fleetData.driver.name} dispatched!`);
            
            // Trigger Real SMS
            try {
              await fetch('/api/sos/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: `[VALOURIAN LOGISTICS]\nCourier ${fleetData.driver.name} is picking up your order from ${selectedRestaurant.name}. Track live: https://valourian.com/t/${docRef.id}`
                })
              });
            } catch (smsError) {
              console.error("SMS Dispatch failed", smsError);
            }
          }"""

new_code = re.sub(fleet_dispatch_match, replacement, code)
if new_code != code:
    with open("src/components/bank/UberEatsApp.tsx", "w") as f:
        f.write(new_code)
    print("Patched SMS successfully.")
else:
    print("Could not patch SMS.")
    
# Let's also patch BookingApp.tsx to include 24hr room service in 5 star hotels
