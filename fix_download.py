import re
with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    code = f.read()

# Remove 'Download, ' or 'Download,' from everywhere
code = re.sub(r'Download,\s*', '', code)
code = re.sub(r'Download\s*', '', code)

# But wait, then `<Download ...` will be removed!
# ONLY remove it from import statements!
