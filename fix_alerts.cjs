const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ThresholdAlerts.tsx', 'utf8');

const target = `        // Check rules against next prices
        setRules(prevRules => {
          let updated = false;
          const nextRules = prevRules.map(rule => {
            if (!rule.active) return rule;
            const currentPrice = next[rule.asset];
            if (!currentPrice) return rule;

            const isTriggered = rule.condition === 'above' 
              ? currentPrice > rule.threshold
              : currentPrice < rule.threshold;

            const now = Date.now();
            // Prevent spamming (alert once per 60 seconds)
            const canTrigger = !rule.lastTriggered || (now - rule.lastTriggered) > 60000;

            if (isTriggered && canTrigger) {
              sendBrowserNotification(
                \`🚨 \${rule.asset} Alert Triggered\`, 
                \`\${rule.asset} is now \${rule.condition} $\${rule.threshold} (Current: $\${currentPrice.toFixed(2)})\`
              );
              updated = true;
              return { ...rule, lastTriggered: now };
            }
            return rule;
          });
          return updated ? nextRules : prevRules;
        });`;

const replacement = `        // Use setTimeout to defer the setRules call outside the current state updater
        setTimeout(() => {
          setRules(prevRules => {
            let updated = false;
            const nextRules = prevRules.map(rule => {
              if (!rule.active) return rule;
              const currentPrice = next[rule.asset];
              if (!currentPrice) return rule;

              const isTriggered = rule.condition === 'above' 
                ? currentPrice > rule.threshold
                : currentPrice < rule.threshold;

              const now = Date.now();
              // Prevent spamming (alert once per 60 seconds)
              const canTrigger = !rule.lastTriggered || (now - rule.lastTriggered) > 60000;

              if (isTriggered && canTrigger) {
                sendBrowserNotification(
                  \`🚨 \${rule.asset} Alert Triggered\`, 
                  \`\${rule.asset} is now \${rule.condition} $\${rule.threshold} (Current: $\${currentPrice.toFixed(2)})\`
                );
                updated = true;
                return { ...rule, lastTriggered: now };
              }
              return rule;
            });
            return updated ? nextRules : prevRules;
          });
        }, 0);`;

if(code.includes('// Check rules against next prices')) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/bank/ThresholdAlerts.tsx', code);
    console.log("Fixed");
} else {
    console.log("Not found");
}
