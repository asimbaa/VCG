import re

files = [
    "src/components/bank/AuraDriveMap.tsx",
    "src/components/bank/DeliveryMap.tsx",
    "src/components/bank/OrderTrackingDashboard.tsx",
    "src/components/bank/ValourianDashboard.tsx"
]

for file in files:
    try:
        with open(file, "r") as f:
            content = f.read()
            
        content = content.replace(
            '(typeof process !== "undefined" ? process.env?.GOOGLE_MAPS_PLATFORM_KEY : "")',
            "process.env.GOOGLE_MAPS_PLATFORM_KEY"
        )
        
        with open(file, "w") as f:
            f.write(content)
        print(f"Patched {file}")
    except FileNotFoundError:
        pass

