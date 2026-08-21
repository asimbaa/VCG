const fs = require('fs');
let file = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const batchBtn = `
                <button
                  onClick={() => {
                     if (cart.length === 0) return toast.error("Cart is empty");
                     toast.loading("Batching all cross-restaurant items into a single Valourian transaction...");
                     setTimeout(() => {
                        toast.success("Batch Consolidated! You can now checkout.");
                     }, 1500);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors mb-3 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Batch All Orders (Logistics Sync)
                </button>
`;

if (file.includes('Checkout ($') && !file.includes('Batch All Orders')) {
    file = file.replace(/(<button[^>]+onClick=\{handleCheckout\}[^>]*>)/, batchBtn + '\n$1');
    fs.writeFileSync('src/components/bank/UberEatsApp.tsx', file);
    console.log("UberEats batch button injected.");
}
