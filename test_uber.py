import re

with open("src/components/bank/UberApp.tsx", "r") as f:
    content = f.read()

# Uber is already highly mocked, let's inject emails into it
hook = """setTimeout(() => {
        toast.success(`Ride completed. Total charged: ${rideCost}`);
        setRideStatus("completed");"""

new_hook = """setTimeout(() => {
        toast.success(`Ride completed. Total charged: ${rideCost}`);
        
        import('../../utils/email').then(module => {
             const htmlBody = module.generateProfessionalReceipt({
                 merchant: "Uber Sovereign Black",
                 amount: rideCost,
             });
             module.sendWorkspaceEmail("asim.nsw@gmail.com", `Your Uber Receipt: Sovereign Black`, htmlBody);
        }).catch(e => console.error(e));

        setRideStatus("completed");"""

if hook in content:
    content = content.replace(hook, new_hook)
    with open("src/components/bank/UberApp.tsx", "w") as f:
        f.write(content)
    print("Uber hooked.")
else:
    print("Uber hook not found.")

