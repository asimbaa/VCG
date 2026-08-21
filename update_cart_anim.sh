#!/bin/bash
sed -i 's/initial={{ opacity: 0, height: 0, scale: 0.95 }}/initial={{ x: 50, opacity: 0, height: 0 }}/g' src/components/bank/UberEatsApp.tsx
sed -i 's/exit={{ opacity: 0, height: 0, scale: 0.95 }}/exit={{ x: -50, opacity: 0, height: 0 }}/g' src/components/bank/UberEatsApp.tsx
sed -i 's/scale: 1,/x: 0,/g' src/components/bank/UberEatsApp.tsx
