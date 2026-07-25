import re

with open("src/components/bank/DeliveryMap.tsx", "r") as f:
    content = f.read()

# Fix API Key loading
content = content.replace(
    "googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',",
    """googleMapsApiKey: (typeof process !== "undefined" ? process.env?.GOOGLE_MAPS_PLATFORM_KEY : "") || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || '',"""
)

with open("src/components/bank/DeliveryMap.tsx", "w") as f:
    f.write(content)
print("DeliveryMap API key patched")
