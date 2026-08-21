import * as fs from 'fs';
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

const endChunk = `            <AIGuide />
    </div>
    </div>
    </>
  );
}`;

content = content.replace(endChunk, `            <AIGuide />
    </div>
    </>
  );
}`);
fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
