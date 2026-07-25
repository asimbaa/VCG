const fs = require('fs');
let lines = fs.readFileSync('src/components/pay/RapidPay.tsx.bak', 'utf8').split('\n');

// The backup has 2418 lines.
// We know that TS gets completely lost around line 2116 where the `form` starts.
// The real issue might be that a `div` or `form` was never closed due to an earlier patch removing it.
// Let's replace the whole bottom part of the file with a cleanly reconstructed version that we KNOW is syntactically valid.

let form_start = lines.findIndex(l => l.includes('<form onSubmit={handleSendRequest} className="space-y-4">'));
if (form_start !== -1) {
    let clean_tail = `
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Recipient Details
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-slate-800 font-semibold"
                  placeholder="e.g. Acme Corp or john@example.com"
                  disabled={status !== "idle"}
                />
              </div>
              <button
                type="button"
                onClick={handleValidate}
                disabled={status === "validating"}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-md mt-2 flex items-center justify-center"
              >
                {status === "validating" ? "Processing..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <AIGuide />
    </div>
  );
}
`;
    // Find the enclosing div we are replacing from
    let split_idx = lines.findIndex(l => l.includes('<div className="grid md:grid-cols-2 gap-8">'));
    if (split_idx !== -1) {
        let new_lines = lines.slice(0, split_idx + 1);
        new_lines.push('          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">');
        new_lines.push('            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">');
        new_lines.push('              <Send className="w-5 h-5 text-yellow-600" />');
        new_lines.push('              Send Secure Transfer');
        new_lines.push('            </h3>');
        new_lines.push(clean_tail);
        
        fs.writeFileSync('src/components/pay/RapidPay.tsx', new_lines.join('\n'));
        console.log("Reconstructed bottom half of the file.");
    }
}
