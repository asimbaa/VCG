#!/bin/bash
sed -i 's/initial={{ opacity: 0, x: -20, scale: 0.95 }}/initial={{ opacity: 0, x: 50, height: 0 }}/g' src/components/bank/SovereignStore.tsx
sed -i 's/animate={{ opacity: 1, x: 0, scale: 1 }}/animate={{ opacity: 1, x: 0, height: "auto" }}/g' src/components/bank/SovereignStore.tsx
