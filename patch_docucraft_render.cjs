const fs = require('fs');

let content = fs.readFileSync('src/components/bank/DocuCraftAI.tsx', 'utf8');

const replacement = `
                    <div ref={contractRef} className="space-y-4 font-mono text-sm text-slate-600 mb-10 p-6 bg-white border border-slate-200 shadow-sm rounded-xl" style={{minHeight: '300px'}}>
                       {activeContract === 'payslips-executive' ? (
                          <div className="text-left font-sans">
                            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                               <div>
                                 <h3 className="text-2xl font-black tracking-tight text-slate-900">OFFICIAL PAYSLIP</h3>
                                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Valourian Capital LLC</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-xs text-slate-500">Pay Period: <strong className="text-slate-800">August 2026</strong></p>
                                 <p className="text-xs text-slate-500 mt-1">Payment Date: <strong className="text-slate-800">15 Aug 2026</strong></p>
                               </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 mb-6">
                               <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Employee Details</h4>
                                  <p className="font-bold text-sm text-slate-800">Asim Aryal</p>
                                  <p className="text-xs text-slate-600">Chief Executive Officer</p>
                                  <p className="text-xs text-slate-600">ID: EMP-001</p>
                               </div>
                               <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Banking Details</h4>
                                  <p className="font-bold text-sm text-slate-800">NAB Private Wealth</p>
                                  <p className="text-xs text-slate-600">BSB: 082-902</p>
                                  <p className="text-xs text-slate-600">Acct: •••• 9924</p>
                               </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                               <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                                  <span className="text-xs font-bold text-slate-500 uppercase">Description</span>
                                  <span className="text-xs font-bold text-slate-500 uppercase">Amount (AUD)</span>
                               </div>
                               <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-slate-700">Executive Salary (Monthly)</span>
                                  <span className="text-sm font-mono text-slate-900">$9,000,000.00</span>
                               </div>
                               <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-slate-700">Executive Bonus (Performance)</span>
                                  <span className="text-sm font-mono text-slate-900">$2,500,000.00</span>
                               </div>
                               <div className="flex justify-between items-center py-1 mt-2 border-t border-slate-200 pt-2 text-rose-600">
                                  <span className="text-sm">PAYG Tax Withholding</span>
                                  <span className="text-sm font-mono">-$5,174,990.00</span>
                               </div>
                            </div>
                            
                            <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
                               <span className="font-bold uppercase tracking-widest text-xs">Net Payment</span>
                               <span className="font-black font-mono text-lg">$6,325,010.00</span>
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end">
                               <div>
                                  <p className="text-[10px] text-slate-400 max-w-xs">This document is cryptographically signed and secured by Valourian Capital CA. For tax purposes, refer to ATO guidelines.</p>
                               </div>
                               <div className="text-right">
                                  <p className="font-script text-xl text-blue-800 opacity-80 -mb-1">Valourian CA</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-300 pt-1">Authorized Signatory</p>
                               </div>
                            </div>
                          </div>
                       ) : activeContract === 'job-contract-ceo' ? (
                          <div className="text-left font-sans space-y-4">
                             <div className="text-center mb-6 border-b border-slate-200 pb-4">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Executive Employment Agreement</h3>
                                <p className="text-slate-500 text-sm mt-1">Valourian Capital LLC & Asim Aryal</p>
                             </div>
                             <p className="text-sm text-slate-700">This Executive Employment Agreement (the "Agreement") is entered into effectively as of January 1, 2026, by and between Valourian Capital LLC ("Company") and Asim Aryal ("Executive").</p>
                             <h4 className="font-bold text-slate-900 text-sm mt-4">1. Position & Duties</h4>
                             <p className="text-sm text-slate-700">The Executive shall serve as the Chief Executive Officer (CEO) of Valourian Capital. In this capacity, the Executive shall have ultimate authority over corporate strategy, acquisitions, treasury management, and sovereign computing infrastructure.</p>
                             <h4 className="font-bold text-slate-900 text-sm mt-4">2. Compensation & Term</h4>
                             <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                                <li><strong>Base Salary:</strong> $108,000,000 AUD annually, payable in monthly installments of $9,000,000 AUD.</li>
                                <li><strong>Term:</strong> 25-Year Irrevocable Mandate.</li>
                                <li><strong>Equity:</strong> 100% controlling stake via sovereign holding structure.</li>
                             </ul>
                             <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8">
                                <div>
                                   <p className="font-script text-2xl text-slate-800 mb-1">A. Aryal</p>
                                   <p className="text-xs font-bold text-slate-400 uppercase border-t border-slate-300 pt-1">Asim Aryal (Executive)</p>
                                </div>
                                <div>
                                   <p className="font-script text-2xl text-blue-800 opacity-80 mb-1">V. Board</p>
                                   <p className="text-xs font-bold text-slate-400 uppercase border-t border-slate-300 pt-1">Valourian Board of Directors</p>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <>
                             <p>This legally binding protocol establishes a sovereign partnership bridging Valourian Capital OS and the selected entity.</p>
                             <p>&gt; Target Entity: {contracts.find(c => c.id === activeContract)?.id.split('-')[0].toUpperCase()}</p>
                             <p>&gt; Requested Duration: {activeContract === 'anthropic-25yr' ? '25 YEARS' : 'LIFETIME'}</p>
                             <p>&gt; Payment Terms: Upfront Treasury Settlement</p>
                             <p className="text-emerald-600 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-4">
                               TOTAL COMMITMENT: \${contracts.find(c => c.id === activeContract)?.cost.toLocaleString()} USD
                             </p>
                          </>
                       )}
                    </div>
`;

content = content.replace(/<div className="space-y-4 font-mono text-sm text-slate-600 mb-10">[\s\S]*?TOTAL COMMITMENT: \$\{contracts\.find\(c => c\.id === activeContract\)\?\.cost\.toLocaleString\(\)\} USD[\s\S]*?<\/p>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/bank/DocuCraftAI.tsx', content);
