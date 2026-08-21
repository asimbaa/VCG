const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// I replaced this:
//                     </div>
//                 </div>
//               </div>
//             ) : activeTab === "comms_policy"

// With:
// <ValidatorBlock>
//                     </div>
//                 </div>
//               </div>
//             ) : activeTab === "comms_policy"

// Wait! If the original had:
//                     </div>
//                 </div>
//               </div>
//             ) : activeTab === "comms_policy"

// Wait, the original regex was:
// file = file.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*:\s*activeTab === "comms_policy"/, 

// It matched FOUR `</div>`.
// And I replaced it with:
// '\n' + validationUI + '\n                    </div>\n                </div>\n              </div>\n            ) : activeTab === "comms_policy"'
// Wait, my replacement only has THREE `</div>` closing tags!
// I LOST A DIV CLOSING TAG HERE!
// THAT'S IT!

file = file.replace(
    '                    </div>\n                </div>\n              </div>\n            ) : activeTab === "comms_policy"',
    '                    </div>\n                </div>\n              </div>\n            </div>\n            ) : activeTab === "comms_policy"'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
console.log("Validator block divs fixed.");

