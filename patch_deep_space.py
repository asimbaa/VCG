import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Add a Deep Space AI button in the main mobile header as requested
mobile_btn = """          <button 
            onClick={() => setActiveTab('aicluster')}
            className="md:hidden ml-auto mr-4 p-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-colors flex items-center justify-center border border-indigo-500/30"
            title="Open Deep Space Cluster AI"
          >
            <Cpu className="w-5 h-5" />
          </button>"""

# Find a place in the mobile header to put it. The mobile header usually has a menu button.
# `          <button className="p-2 md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>`
content = content.replace(
    '<button className="p-2 md:hidden hover:bg-slate-800 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>',
    mobile_btn + '\n          <button className="p-2 md:hidden hover:bg-slate-800 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>'
)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
