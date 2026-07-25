import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# I see what's happening. The patch replaced `      <AIGuide />\n    </div>\n  );\n}` entirely because it matched all the way to the bottom. Let's fix the end of the file.

if "    </div>\n  );\n}" not in content[-50:]:
    content += "\n      <AIGuide />\n    </div>\n  );\n}"

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)

