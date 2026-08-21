import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');

const lastRebalanceIndex = content.lastIndexOf(")}");
// Just append the missing closing divs
if (lastRebalanceIndex !== -1) {
    const afterLastRebalance = content.substring(lastRebalanceIndex + 2);
    // Replace the rest with correct closing
    content = content.substring(0, lastRebalanceIndex + 2) + `
          </div>
        </div>
      </div>
    </div>
  );
}`;
    fs.writeFileSync('src/components/bank/EToroApp.tsx', content);
}
