const fs = require('fs');
let code = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf-8');

// Replace {formatConverted(cartTotal)} AUD -> {formatConverted(cartTotal)}
// Replace +${...} AUD -> +{formatConverted(...)}
// Replace -${...} AUD -> -{formatConverted(...)}
// Replace ${...} AUD -> {formatConverted(...)}
code = code.replace(
  '<span className="font-mono text-slate-700">{formatConverted(cartTotal)} AUD</span>',
  '<span className="font-mono text-slate-700">{formatConverted(cartTotal)}</span>'
);

code = code.replace(
  '<span className="font-mono text-slate-700">+${(Math.round((cartTotal * tipPercentage / 100) * 100) / 100).toFixed(2)} AUD</span>',
  '<span className="font-mono text-slate-700">+{formatConverted(cartTotal * tipPercentage / 100)}</span>'
);

code = code.replace(
  '<span className="font-mono text-[#06C167]">-${appliedVoucher.amount.toFixed(2)} AUD</span>',
  '<span className="font-mono text-[#06C167]">-{formatConverted(appliedVoucher.amount)}</span>'
);

code = code.replace(
  '${(Math.max(0, cartTotal + Math.round((cartTotal * tipPercentage / 100) * 100) / 100 - (appliedVoucher?.amount || 0))).toFixed(2)} AUD',
  '{formatConverted(Math.max(0, cartTotal + (cartTotal * tipPercentage / 100) - (appliedVoucher?.amount || 0)))}'
);


// Add Web Notification logic
const notificationLogic = `
      if (prevStatus === 'preparing' && currentStatus === 'transit') {
        toast.info("Your order is now on the way!", {
          description: \`Elite courier is in transit from \${activeOrder.restaurantName || 'the restaurant'} delivering your order.\`,
          icon: "🚗",
          duration: 6000
        });

        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Order in Transit', {
              body: \`Your order from \${activeOrder.restaurantName || 'the restaurant'} is on the way!\`,
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Order in Transit', {
                  body: \`Your order from \${activeOrder.restaurantName || 'the restaurant'} is on the way!\`,
                });
              }
            });
          }
        }
      } else if (prevStatus === 'ordered' && currentStatus === 'preparing') {`;

code = code.replace(
  `      if (prevStatus === 'preparing' && currentStatus === 'transit') {
        toast.info("Your order is now on the way!", {
          description: \`Elite courier is in transit from \${activeOrder.restaurantName || 'the restaurant'} delivering your order.\`,
          icon: "🚗",
          duration: 6000
        });
      } else if (prevStatus === 'ordered' && currentStatus === 'preparing') {`,
  notificationLogic
);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', code);
