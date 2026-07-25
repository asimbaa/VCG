import re

files_to_patch = [
    'src/components/bank/ValourianDashboard.tsx',
    'src/components/bank/BlackCardsController.tsx',
    'src/components/pay/RapidPay.tsx'
]

for filepath in files_to_patch:
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Update balance values to 200M
        content = re.sub(r'balance:\s*\d+', 'balance: 200000000', content)
        
        # In ValourianDashboard, there are default limits. We'll update limit: to "200M Limit" or number 200000000
        content = re.sub(r'limit:\s*"\$150,000\.00"', 'limit: "200000000"', content)
        content = re.sub(r'limit:\s*"50,000\.00 AUD"', 'limit: "200000000"', content)
        content = re.sub(r'limit:\s*"No Limit"', 'limit: "200000000"', content)
        content = re.sub(r'limit:\s*100000000000', 'limit: 200000000', content)
        content = re.sub(r'limit:\s*50000000', 'limit: 200000000', content)
        content = re.sub(r'limit:\s*1500000000', 'limit: 200000000', content)
        
        # Default card limits
        content = content.replace('useState("50000")', 'useState("200000000")')
        content = content.replace('useState("15000")', 'useState("200000000")')
        
        # Write back
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")
    except FileNotFoundError:
        print(f"Skipping {filepath} - not found")

