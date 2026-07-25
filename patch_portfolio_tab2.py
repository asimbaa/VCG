import re

with open('src/components/bank/BankDashboard.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { ExpertAgentsView }" not in content:
    content = content.replace('import { HistoricalYieldComparison } from "./HistoricalYieldComparison";', 'import { HistoricalYieldComparison } from "./HistoricalYieldComparison";\nimport { ExpertAgentsView } from "./ExpertAgentsView";')

# Inject into portfolio tab
portfolio_insert = """                  <HistoricalYieldComparison />
                  <ExpertAgentsView />
                </div>
              </>
            ) : activeTab === "logistics" ? ("""

target_find = """                  <HistoricalYieldComparison />
                </div>
              </>
            ) : activeTab === "logistics" ? ("""

content = content.replace(target_find, portfolio_insert)

with open('src/components/bank/BankDashboard.tsx', 'w') as f:
    f.write(content)
