const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetStr = `                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors mt-2">
                        Allocate Sponsor Range
                      </button>
                    </div>
                  </div>
                </div>
        </div>
      </div>
    </div>
  );
}`;

const replaceStr = `                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors mt-2">
                        Allocate Sponsor Range
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
