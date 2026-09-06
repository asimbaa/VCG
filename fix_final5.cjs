const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetStr = `            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}`;

const replaceStr = `            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
