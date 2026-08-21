const fs = require('fs');
const file = 'src/components/bank/UberEatsApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `{/* Display delivery details if they exist */}`;
const replacement = `<button
                              onClick={() => {
                                const matchedRestaurant = RESTAURANTS.find((r) => r.name === order.recipient);
                                if (matchedRestaurant) {
                                  setSelectedRestaurant(matchedRestaurant);
                                  // For a legitimate Quick Reorder, we re-parse items if possible from order details, or set the restaurant to browse
                                  setCart([]); // User can then select what they want
                                  setActiveTab("cart");
                                  toast.success("Reorder initiated for " + matchedRestaurant.name);
                                } else {
                                  toast.error("Restaurant/Merchant no longer available for quick reorder.");
                                }
                              }}
                              className="w-full mt-3 bg-[#06C167]/10 hover:bg-[#06C167]/20 text-[#06C167] font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                            >
                              <RefreshCw className="w-3 h-3" /> Quick Reorder
                            </button>
                            {/* Display delivery details if they exist */}`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);
