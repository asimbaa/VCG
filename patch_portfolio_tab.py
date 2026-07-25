import re

with open('src/components/bank/BankDashboard.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { HistoricalYieldComparison }" not in content:
    content = content.replace('import { CryptoPortfolio } from "./CryptoPortfolio";', 'import { CryptoPortfolio } from "./CryptoPortfolio";\nimport { HistoricalYieldComparison } from "./HistoricalYieldComparison";')

# Inject into portfolio tab
portfolio_insert = """                      </div>
                    </div>
                  </div>
                  <HistoricalYieldComparison />
                </div>
              </>
            ) : activeTab === "logistics" ? ("""

target_find = """                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === "logistics" ? ("""

content = content.replace(target_find, portfolio_insert)

with open('src/components/bank/BankDashboard.tsx', 'w') as f:
    f.write(content)
