import re

files = [
    "src/components/bank/LogisticsMap.tsx",
    "src/services/gemini.ts"
]

for file in files:
    try:
        with open(file, "r") as f:
            content = f.read()
            
        content = content.replace(
            '(typeof process !== "undefined" ? process.env?.GOOGLE_MAPS_PLATFORM_KEY : "")',
            "process.env.GOOGLE_MAPS_PLATFORM_KEY"
        )
        content = content.replace(
            'typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : ""',
            'process.env.GEMINI_API_KEY || ""'
        )
        
        with open(file, "w") as f:
            f.write(content)
        print(f"Patched {file}")
    except FileNotFoundError:
        pass

