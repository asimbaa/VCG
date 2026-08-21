with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

def fix_line(start_line):
    # Find the nearest </motion.div> after start_line and insert </div> before it
    for i in range(start_line, len(lines)):
        if '</motion.div>' in lines[i]:
            # Insert </div>
            lines.insert(i, '</div>\n')
            break

# The lines given by tsc are approximate starts of the divs that were left unclosed.
# Let's fix them in reverse order so line numbers don't shift!
fix_line(3865)
fix_line(3743)
fix_line(3101)
fix_line(2964)
fix_line(2449)
fix_line(2389)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(lines)
