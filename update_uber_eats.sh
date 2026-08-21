#!/bin/bash

# Change the sortBy state type
sed -i 's/const \[sortBy, setSortBy\] = useState<"name" | "rating" | "deliveryTime">(/const \[sortBy, setSortBy\] = useState<"name-asc" | "name-desc" | "rating" | "deliveryTime">(/g' src/components/bank/UberEatsApp.tsx
sed -i 's/    "name",/    "name-asc",/g' src/components/bank/UberEatsApp.tsx

# Update sort logic
sed -i 's/return a.name.localeCompare(b.name);/if (sortBy === "name-desc") return b.name.localeCompare(a.name);\n    return a.name.localeCompare(b.name);/g' src/components/bank/UberEatsApp.tsx

# Update Sort Selector
sed -i 's/<option value="name">Alphabetical<\/option>/<option value="name-asc">Alphabetical (A-Z)<\/option>\n                          <option value="name-desc">Alphabetical (Z-A)<\/option>/g' src/components/bank/UberEatsApp.tsx

