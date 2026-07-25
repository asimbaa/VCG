import re

with open('src/components/bank/UberApp.tsx', 'r') as f:
    content = f.read()

new_presets = """const PRESETS = [
  {
    name: "Valourian Command / Home",
    address: "Unit 712, 15 Barton Rd, Artarmon NSW 2064",
    coords: { lat: -33.8118, lng: 151.1833 }
  },
  {
    name: "Westfield Chatswood Storefront",
    address: "1 Anderson St, Chatswood NSW 2067",
    coords: { lat: -33.7963, lng: 151.1837 }
  },
  {
    name: "Sovereign Dispatch Warehouse",
    address: "1/163 Prospect Hwy, Seven Hills NSW 2147",
    coords: { lat: -33.7667, lng: 150.9333 }
  },
  {
    name: "Sydney CBD (Martin Place)",
    address: "Martin Pl, Sydney NSW 2000",
    coords: { lat: -33.8675, lng: 151.2100 }
  }
];"""

content = re.sub(r'const PRESETS = \[.*?\];', new_presets, content, flags=re.DOTALL)

with open('src/components/bank/UberApp.tsx', 'w') as f:
    f.write(content)

