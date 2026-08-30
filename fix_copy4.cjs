const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// The issue might be that the file length is too long and hitting some binary limit
// Let's strip out some of the huge arrays if possible, or just fix the JSX error.

const lines = content.split('\n');

// Find the line where <select ends
let idx = 11847;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</select>')) {
    idx = i;
    break;
  }
}

// We know the line after </select> is `</div>`
let cutIdx = idx + 1;

const newLines = lines.slice(0, cutIdx + 1);

const closing = `
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </div>
</div>
  );
}
`;

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', newLines.join('\n') + closing);

