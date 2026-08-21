with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

for i in range(len(lines)):
    if '                <PhoneOff className="w-6 h-6" />' in lines[i]:
        # we found the PhoneOff button
        # i+1 is </button>
        # i+2 should be </div>, but right now it is </motion.div>
        lines.insert(i+2, '            </div>\n')
        break

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(lines)
