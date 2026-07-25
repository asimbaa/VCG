import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

hook = """        toast.success(`Order placed at ${selectedRestaurant.name}! ${formatConverted(totalToPay)} charged. Receipt sent to ${confirmationEmail}`);"""
new_hook = """        toast.success(`Order placed at ${selectedRestaurant.name}! ${formatConverted(totalToPay)} charged. Receipt sent to ${confirmationEmail}`);
        
        // Send email receipt
        import('../../utils/email').then(module => {
             const htmlBody = module.generateProfessionalReceipt({
                 merchant: selectedRestaurant.name,
                 amount: formatConverted(totalToPay),
             });
             module.sendWorkspaceEmail(confirmationEmail || "asim.nsw@gmail.com", `Uber Eats Reserve Receipt`, htmlBody);
        }).catch(e => console.error(e));"""

if hook in content:
    content = content.replace(hook, new_hook)
    with open("src/components/bank/UberEatsApp.tsx", "w") as f:
        f.write(content)
    print("UberEats hooked.")
else:
    print("UberEats hook not found.")

