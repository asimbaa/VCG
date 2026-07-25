import re

with open("src/components/bank/UberApp.tsx", "r") as f:
    content = f.read()

hook = "      toast.success(`Ride completed safely! {formatConverted(fare)} charged to Corporate Treasury. Receipt dispatched to Workspace Comms.`);"
new_hook = """      toast.success(`Ride completed safely! ${formatConverted(fare)} charged to Corporate Treasury. Receipt dispatched to Workspace Comms.`);
      
      import('../../utils/email').then(module => {
             const htmlBody = module.generateProfessionalReceipt({
                 merchant: "Uber Executive / Private Aviation",
                 amount: formatConverted(fare),
             });
             module.sendWorkspaceEmail("asim.nsw@gmail.com", `Executive Transport Receipt`, htmlBody);
      }).catch(e => console.error(e));"""

content = content.replace(hook, new_hook)

with open("src/components/bank/UberApp.tsx", "w") as f:
    f.write(content)

