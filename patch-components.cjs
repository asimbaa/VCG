const fs = require('fs');

const content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const newComponents = `
function VouchersAndPrintTab() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto printable-area">
      <style>{\`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      \`}</style>
      
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">Vouchers & Receipts</h2>
          <p className="text-slate-400">Printable records for Uber, Booking.com, and retail vouchers.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Print Document
        </button>
      </div>

      <div className="bg-white text-slate-900 p-10 rounded-2xl shadow-xl space-y-8 border border-slate-200">
        <div className="flex justify-between items-start border-b border-slate-200 pb-8">
          <div>
            <div className="text-3xl font-black tracking-tighter mb-1">VALOURIAN<span className="text-emerald-600">TREASURY</span></div>
            <div className="text-slate-500 text-sm font-medium">Official Payment Receipt & Voucher Record</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">Transaction ID: TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
            <div className="text-slate-500">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Authorized Recipient</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 mb-1">Name</div>
                <div className="font-bold text-lg">Asim Aryal</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Account Tier</div>
                <div className="font-bold text-emerald-600">Sovereign Elite</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Order Details</h3>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold text-slate-600">Item / Service</th>
                    <th className="p-4 font-bold text-slate-600">Provider</th>
                    <th className="p-4 font-bold text-slate-600 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-4">Uber Eats Global Pass (1 Year)</td>
                    <td className="p-4 font-medium">Uber Technologies Inc.</td>
                    <td className="p-4 text-right font-bold">$1,200.00</td>
                  </tr>
                  <tr>
                    <td className="p-4">Booking.com Reservation - Crown Casino Suite</td>
                    <td className="p-4 font-medium">Booking Holdings</td>
                    <td className="p-4 text-right font-bold">$12,500.00</td>
                  </tr>
                  <tr>
                    <td className="p-4">Apple Store - Hardware Procurement</td>
                    <td className="p-4 font-medium">Apple Inc.</td>
                    <td className="p-4 text-right font-bold">$4,300.00</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="p-4 font-black text-right uppercase tracking-widest text-slate-500">Total Charged to Treasury</td>
                    <td className="p-4 text-right font-black text-xl text-emerald-600">$18,000.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 text-xs text-slate-400 text-center uppercase tracking-widest font-medium">
            This document serves as proof of payment authorized via Valourian Capital Treasury. <br/>
            No further payment is required. Keep this receipt for your records.
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseConciergeTab() {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Global Purchase Concierge</h2>
        <p className="text-slate-400">Paste links to booking.com, concert tickets, or any retail item to authorize treasury acquisition.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Item / Booking URL</label>
          <div className="flex gap-4">
            <input 
              type="text"
              placeholder="e.g. https://www.booking.com/hotel/au/crown-towers-sydney..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
            />
            <button className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shrink-0">
              Analyze Request
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
             <ShoppingCart className="w-8 h-8 text-blue-500 mb-4" />
             <h3 className="font-bold text-white mb-2">Automated Procurement</h3>
             <p className="text-sm text-slate-400">Our AI agents will navigate the portal, fill required forms, and apply a Sovereign virtual card to secure the item instantly.</p>
          </div>
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
             <Truck className="w-8 h-8 text-purple-500 mb-4" />
             <h3 className="font-bold text-white mb-2">Global Logistics</h3>
             <p className="text-sm text-slate-400">Physical goods are routed through our secure logistics network for direct delivery to your specified residence or pickup location.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const insertIndex = content.indexOf('export function ValourianDashboard');

if (insertIndex !== -1) {
    let newFile = content.slice(0, insertIndex) + newComponents + '\n\n' + content.slice(insertIndex);
    
    // Now replace the tab ternary
    const endTernary = '              </div>\n            ) : null}';
    const newEndTernary = `              </div>
            ) : activeTab === "vouchers" ? (
                <VouchersAndPrintTab />
            ) : activeTab === "concierge" ? (
                <PurchaseConciergeTab />
            ) : null}`;
            
    if (newFile.includes(endTernary)) {
       newFile = newFile.replace(endTernary, newEndTernary);
       fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', newFile);
       console.log("Components added successfully.");
    } else {
       console.log("Could not find the ternary end string.");
    }
} else {
    console.log("Could not find ValourianDashboard export.");
}

