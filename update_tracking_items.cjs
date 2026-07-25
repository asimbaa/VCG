const fs = require('fs');
let content = fs.readFileSync('src/components/bank/OrderTrackingDashboard.tsx', 'utf8');

const itemsHTML = `
          {/* Order Contents */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Order Manifest (Asim Aryal - asim.nsw@gmail.com)</h4>
            <div className="space-y-3">
              {[
                { name: "Winter Wares & Pajamas Set", qty: 2 },
                { name: "Merino Wool Long Sleeve Shirt & Trousers", qty: 3 },
                { name: "Family Wardrobe (Men, Women, Girls, Boys, Children)", qty: 5 },
                { name: "Thick Comfy Socks & Comfortable Shoes", qty: 4 },
                { name: "Leisure Ware & Outwear Collection", qty: 2 },
                { name: "Home Essentials & Premium Complimentary Amenities", qty: 1 }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {item.qty}x
                    </div>
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Packed</span>
                </div>
              ))}
            </div>
          </div>
`;

content = content.replace('          {/* Courier Info */}', itemsHTML + '\n          {/* Courier Info */}');

fs.writeFileSync('src/components/bank/OrderTrackingDashboard.tsx', content);
