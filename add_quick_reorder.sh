#!/bin/bash
awk '
/return \(/ {
  print $0;
  if (in_map == 1) {
    in_return = 1;
  }
}
/filteredOrders.map/ {
  in_map = 1;
  print $0;
  next;
}
/\{\/\* Display delivery details if they exist \*\/\}/ {
  if (in_return == 1) {
    print "                            <button";
    print "                              onClick={() => {";
    print "                                const matchedRestaurant = RESTAURANTS.find((r) => r.name === order.recipient);";
    print "                                if (matchedRestaurant) {";
    print "                                  setSelectedRestaurant(matchedRestaurant);";
    print "                                  // Try to parse items from description or just show the restaurant";
    print "                                  setCart([]);";
    print "                                  setActiveTab(\"cart\");";
    print "                                  toast.success(`Started reorder for ${matchedRestaurant.name}`);";
    print "                                } else {";
    print "                                  toast.error(\"Restaurant no longer available.\");";
    print "                                }";
    print "                              }}";
    print "                              className=\"w-full mt-2 bg-[#06C167]/10 hover:bg-[#06C167]/20 text-[#06C167] font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2\"";
    print "                            >";
    print "                              <RefreshCw className=\"w-3 h-3\" /> Quick Reorder";
    print "                            </button>";
    in_return = 0;
  }
  print $0;
  next;
}
{ print }
' src/components/bank/UberEatsApp.tsx > src/components/bank/UberEatsApp.tsx.tmp && mv src/components/bank/UberEatsApp.tsx.tmp src/components/bank/UberEatsApp.tsx
