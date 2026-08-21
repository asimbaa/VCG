with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i in range(len(lines)):
    # Remove the bad AnimatePresence and divs we added previously
    if '        </AnimatePresence>' in lines[i]:
        continue
    elif '        </div>\n' == lines[i] and '      </div>\n' == lines[i+1] and '      {/* Checkout Confirm Modal */}\n' in lines[i+3]:
        # This is where we closed the scroll area and root app prematurely.
        # Instead, we just close the AnimatePresence and the scroll area here.
        new_lines.append('        </AnimatePresence>\n')
        new_lines.append('      </div>\n') # scroll area
        # The root app div will remain open
    elif '      </div>\n' == lines[i] and '      {/* Checkout Confirm Modal */}\n' in lines[i+2]:
        continue
    else:
        new_lines.append(lines[i])

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)
