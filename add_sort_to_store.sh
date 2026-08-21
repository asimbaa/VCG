#!/bin/bash
sed -i 's/const \[selectedBrand, setSelectedBrand\] = useState<string>("All");/const \[selectedBrand, setSelectedBrand\] = useState<string>("All");\n  const \[sortBy, setSortBy\] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc">("name-asc");/g' src/components/bank/SovereignStore.tsx

sed -i 's/const filteredProducts = STORE_PRODUCTS.filter(p => {/const filteredProducts = STORE_PRODUCTS.filter(p => {/g' src/components/bank/SovereignStore.tsx

awk '
/const filteredProducts = STORE_PRODUCTS.filter\(p => \{/ {
  print $0;
  print "    if (selectedBrand !== \"All\" && p.brand !== selectedBrand) return false;";
  print "    return true;";
  print "  }).sort((a, b) => {";
  print "    if (sortBy === \"price-asc\") return a.price - b.price;";
  print "    if (sortBy === \"price-desc\") return b.price - a.price;";
  print "    if (sortBy === \"name-desc\") return b.name.localeCompare(a.name);";
  print "    return a.name.localeCompare(b.name);";
  print "  });";
  in_filter = 1;
  next;
}
in_filter && /^\s*\}\);/ {
  in_filter = 0;
  next;
}
in_filter && /if \(selectedBrand === "All"\) return true;/ { next; }
in_filter && /return p.brand === selectedBrand;/ { next; }
{ print }
' src/components/bank/SovereignStore.tsx > src/components/bank/SovereignStore.tsx.tmp && mv src/components/bank/SovereignStore.tsx.tmp src/components/bank/SovereignStore.tsx

