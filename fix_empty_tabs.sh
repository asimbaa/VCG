#!/bin/bash
sed -i 's/activeTab === ("podcast" as any)/activeTab === "podcast"/g' src/components/bank/ValourianDashboard.tsx
sed -i 's/activeTab === ("receipts" as any)/activeTab === "receipts"/g' src/components/bank/ValourianDashboard.tsx
