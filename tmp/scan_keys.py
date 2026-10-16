import os
import re

print("=== SCANNING FOR KEYS WITHOUT INDEX OR STATIC KEYS INSIDE MAP ===")
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            for line_no, line in enumerate(lines, 1):
                if 'key=' in line:
                    stripped = line.strip()
                    # Check if it has key=
                    # Let's find what key is
                    match = re.search(r'key=(?:\{([^}]+)\}|"([^"]+)"|\'([^\']+)\')', stripped)
                    if match:
                        expr = match.group(1) or match.group(2) or match.group(3)
                        # Check if index is missing in expr
                        has_index = any(k in expr.lower() for k in ['idx', 'index', '_i', 'i', 'num', 'step'])
                        # If expr is just a single variable or property like card.id or item.name or t.id
                        if not has_index:
                            print(f"{path}:{line_no}: {stripped}")
