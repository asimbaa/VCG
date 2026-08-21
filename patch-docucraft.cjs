const fs = require('fs');
let content = fs.readFileSync('src/components/bank/DocuCraftAI.tsx', 'utf8');

const target = `{activeContract === 'payslips-executive' ? (`;

const repl = `{activeContract === 'job-contract-ceo' ? (
                          <div className="text-left font-sans">
                            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                               <div>
                                 <h3 className="text-2xl font-black tracking-tight text-slate-900">EXECUTIVE EMPLOYMENT AGREEMENT</h3>
                                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Valourian Capital LLC</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-xs text-slate-500">Effective Date: <strong className="text-slate-800">January 1, 2026</strong></p>
                               </div>
                            </div>
                               
                            <div className="mb-6 space-y-4">
                               <p className="text-sm font-bold text-slate-800">BETWEEN:</p>
                               <p className="text-sm text-slate-600 pl-4 border-l-2 border-slate-200"><strong className="text-slate-800">Valourian Capital LLC</strong> (the "Company")</p>
                               <p className="text-sm font-bold text-slate-800">AND:</p>
                               <p className="text-sm text-slate-600 pl-4 border-l-2 border-emerald-500"><strong className="text-slate-800">Asim Aryal</strong> (the "Executive")</p>
                            </div>

                            <div className="space-y-4 text-xs text-slate-700 leading-relaxed text-justify mb-8">
                               <h4 className="font-bold text-sm text-slate-900">1. POSITION AND DUTIES</h4>
                               <p>The Company hereby employs the Executive as Chief Executive Officer (CEO). The Executive shall report directly to the Board of Directors and shall have general supervision, direction, and control of the business and affairs of the Company.</p>
                               
                               <h4 className="font-bold text-sm text-slate-900">2. TERM</h4>
                               <p>This Agreement shall be for a term of twenty-five (25) years, commencing on the Effective Date, unless terminated earlier in accordance with Section 5.</p>
                               
                               <h4 className="font-bold text-sm text-slate-900">3. COMPENSATION</h4>
                               <ul className="list-disc pl-5 space-y-1">
                                 <li><strong>Base Salary:</strong> $15,000,000 AUD per annum, payable in monthly installments.</li>
                                 <li><strong>Equity Grants:</strong> 4,000,000 fully vested Class A Shares upon execution.</li>
                                 <li><strong>Allowances:</strong> Unlimited corporate expense account for travel, transportation (Uber/Uber Eats Corporate limits bypassed), and logistics.</li>
                               </ul>
                               
                               <h4 className="font-bold text-sm text-slate-900">4. CONFIDENTIALITY & QUANTUM SECURITY</h4>
                               <p>The Executive acknowledges that they will have access to proprietary AI models (Sovereign AI, DocuCraft) and Valourian Global Treasury routing algorithms. All such data is protected under Quantum Encryption Protocols.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                               <div className="text-center">
                                 <div className="border-b border-slate-400 mb-2 pb-4">
                                   <span className="font-script text-2xl text-blue-900">V. Capital Board</span>
                                 </div>
                                 <p className="text-xs font-bold text-slate-600 uppercase">Valourian Capital LLC</p>
                               </div>
                               <div className="text-center">
                                 <div className="border-b border-slate-400 mb-2 pb-4">
                                   <span className="font-script text-2xl text-emerald-700">Asim Aryal</span>
                                 </div>
                                 <p className="text-xs font-bold text-slate-600 uppercase">Asim Aryal, CEO</p>
                               </div>
                            </div>
                          </div>
                       ) : activeContract === 'payslips-executive' ? (`;

content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/DocuCraftAI.tsx', content);
console.log("DocuCraftAI patched successfully.");
