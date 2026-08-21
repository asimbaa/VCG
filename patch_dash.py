import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

content = content.replace("<OrderTrackingDashboard />", "<OrderTrackingDashboard user={user} />")

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
