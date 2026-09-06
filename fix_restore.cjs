const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// The broken part around line 1727 looks like:
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ type: "tween", delay: 0.6 }}
//                     className="relative z-10"
//                   >
//                     <CheckCircle2 className="w-24 h-24 text-white" />
//                   </motion.div>
//                 </div>
//               </div>
//         </div>
//         <div className="text-center">

// We need to restore it back to:
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

const targetStr = `                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "tween", delay: 0.6 }}
                    className="relative z-10"
                  >
                    <CheckCircle2 className="w-24 h-24 text-white" />
                  </motion.div>
                </div>
              </div>
        </div>
        <div className="text-center">`;

const replaceStr = `                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "tween", delay: 0.6 }}
                    className="relative z-10"
                  >
                    <CheckCircle2 className="w-24 h-24 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="text-center">`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
