with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if '<div className="pt-2 border-t border-slate-100 flex justify-end mt-2">' in line and '                                <button' in lines[i+1]:
        # Skip the bad download button block
        # We know it ends with `</button>\n                            </div>\n                          </div>\n`
        # wait, let's just skip until we see `id="populate-scanned-details-btn"`
        while i < len(lines) and 'id="populate-scanned-details-btn"' not in lines[i]:
            i += 1
        # Now we are at `id="populate-scanned-details-btn"`, we should add back the `{scanStep === "completed" && scannedCardData && ( <button ...`
        new_lines.append('                                  </div>\n')
        new_lines.append('                                )}\n')
        new_lines.append('                                {scanStep === "completed" &&\n')
        new_lines.append('                                  scannedCardData && (\n')
        new_lines.append('                                    <button\n')
        new_lines.append('                                      id="populate-scanned-details-btn"\n')
        i += 1
        continue
    
    # Also fix the one at 4577 which is `</div>\n )}\n {/* Download summary button */}`
    if '</div>' in line and i+1 < len(lines) and ')}' in lines[i+1] and i+2 < len(lines) and '{/* Download summary button */}' in lines[i+2]:
        # wait, the bad patch at 4577 might just be missing the correct JSX
        pass

    new_lines.append(line)
    i += 1

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)

