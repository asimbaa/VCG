with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

for i in range(len(lines)):
    if '                              </motion.div>' in lines[i] and '                            ))}' in lines[i+1]:
        lines.insert(i+2, '                          </AnimatePresence>\n')
        break

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(lines)
