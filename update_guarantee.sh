#!/bin/bash
sed -i 's/<span>Payment Method:<\/span>/<span>Payment Method:<\/span>/g' src/components/bank/UberEatsApp.tsx
# Just replace the <button ...> Place Order/Confirm Payment to include the guarantee above it.
sed -i 's/disabled={isProcessing || cart.length === 0}/disabled={isProcessing || cart.length === 0}/g' src/components/bank/UberEatsApp.tsx
