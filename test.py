with open('src/components/messagecenter/MessageCenter.tsx', 'r') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if "Search documents" in l:
        print(f"Search found at {i+1}")
