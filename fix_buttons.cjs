const fs = require('fs');

let content = fs.readFileSync('src/components/logistics/LogisticsDashboard.tsx', 'utf8');

const doubleBtn = `              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>
              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>`;
              
const singleBtn = `              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>`;

content = content.replace(doubleBtn, singleBtn);

const noNavBtn = `              <button 
                onClick={() => simulateEmail(item.trackingId)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Email Me
              </button>
            </div>
          </motion.div>
        ))}
      </div>`;
      
const withNavBtn = `              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>
              <button 
                onClick={() => simulateEmail(item.trackingId)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Email Me
              </button>
            </div>
          </motion.div>
        ))}
      </div>`;

content = content.replace(noNavBtn, withNavBtn);

fs.writeFileSync('src/components/logistics/LogisticsDashboard.tsx', content);
