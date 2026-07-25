const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
code = code.replace(/<div className="overflow-x-auto">\n\s*<table className="w-full text-sm text-left">[\s\S]*?<\/table>\n\s*<\/div>/, `
                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-4 gap-4 px-6 py-4 text-xs font-semibold text-slate-500 uppercase bg-slate-50 rounded-xl">
                    <div>Domain Name</div>
                    <div>TLD Appraiser</div>
                    <div>Price (USD)</div>
                    <div className="text-right">Action</div>
                  </div>
                  <div className="space-y-2">
                    {availableDomains.map((domain, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="flex justify-between items-center md:block">
                          <span className="text-xs text-slate-500 uppercase font-bold md:hidden">Domain Name</span>
                          <span className="font-medium text-slate-900">
                            {domain.name}
                            {domain.purchased && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                                OWNED
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center md:block">
                          <span className="text-xs text-slate-500 uppercase font-bold md:hidden">TLD Appraiser</span>
                          <span className="text-slate-500 font-mono text-xs">
                            {domain.tld} Network Inc.
                          </span>
                        </div>
                        <div className="flex justify-between items-center md:block">
                          <span className="text-xs text-slate-500 uppercase font-bold md:hidden">Price (USD)</span>
                          <span className="text-slate-900 font-semibold">
                            \${domain.cost.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                          {domain.purchased ? (
                            <Button
                              variant="outline"
                              className="w-full text-xs h-8 border-slate-200 text-slate-500 cursor-not-allowed"
                              disabled
                            >
                              Managing via AWS
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handlePurchaseDomain(idx)}
                              disabled={isProcessing}
                              className="w-full bg-slate-900 hover:bg-blue-600 text-white text-xs h-8 transition-colors"
                            >
                              {isProcessing ? "Acquiring..." : "Acquire IP"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>`);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
