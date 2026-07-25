import re

with open('src/components/bank/SovereignLogisticsDashboard.tsx', 'r') as f:
    content = f.read()

# Replace global points with real addresses
replacements = {
    "{ name: 'Apple Park, Cupertino', lat: 37.3346, lng: -122.0090 }": "{ name: 'Apple Store, Sydney (367 George St)', lat: -33.8688, lng: 151.2069 }",
    "{ name: 'LVMH Paris Hub', lat: 48.8686, lng: 2.3025 }": "{ name: 'Westfield Sydney (Pitt St Mall)', lat: -33.8698, lng: 151.2081 }",
    "{ name: 'Tesla Gigafactory Texas', lat: 30.2223, lng: -97.6171 }": "{ name: 'Tesla Showroom (Alexandria, NSW)', lat: -33.9103, lng: 151.1963 }",
    "Apple Park, Cupertino": "Apple Store, Sydney (367 George St)",
    "LVMH Paris Hub": "Westfield Sydney (Pitt St Mall)"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/components/bank/SovereignLogisticsDashboard.tsx', 'w') as f:
    f.write(content)
