import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_str = """import { VoiceInputButton } from './components/shared/VoiceInputButton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
"""

if "VoiceInputButton" not in content:
    content = content.replace("import { AIGuide } from \"./components/AIGuide\";", import_str + "\nimport { AIGuide } from \"./components/AIGuide\";")

state_str = """  const [isNavVoiceListening, setIsNavVoiceListening] = useState(false);
  
  const handleVoiceNav = (text: string) => {
    const command = text.toLowerCase();
    if (command.includes("message") || command.includes("mail")) {
      setActiveTab("messagecenter");
      toast.success("Voice Command: Opened Message Center");
    } else if (command.includes("pay") || command.includes("rapid") || command.includes("send money")) {
      setActiveTab("payments");
      toast.success("Voice Command: Opened RapidPay");
    } else if (command.includes("core") || command.includes("bank")) {
      setActiveTab("bank");
      toast.success("Voice Command: Opened Valourian Core");
    } else if (command.includes("capital") || command.includes("management") || command.includes("dashboard")) {
      setActiveTab("commbank");
      toast.success("Voice Command: Opened Valourian Capital Management");
    } else if (command.includes("doc") || command.includes("craft")) {
      setActiveTab("docucraft");
      toast.success("Voice Command: Opened DocuCraft");
    } else if (command.includes("web") || command.includes("site") || command.includes("deployment")) {
      setActiveTab("websites");
      toast.success("Voice Command: Opened Websites");
    } else {
      toast.info(`Voice Command not recognized: "${text}"`);
    }
  };
"""

if "isNavVoiceListening" not in content:
    content = content.replace("  const [showInstallBanner, setShowInstallBanner] = useState(false);", "  const [showInstallBanner, setShowInstallBanner] = useState(false);\n" + state_str)

nav_voice_ui = """                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 ml-2 bg-emerald-50 border border-emerald-200 rounded-md">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Neural Link Enabled</span>
                </div>
                <div className="ml-4 flex items-center bg-slate-900 rounded-full px-3 py-1.5 border border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Voice Command:</span>
                  <VoiceInputButton 
                    isListening={isNavVoiceListening}
                    setIsListening={setIsNavVoiceListening}
                    onTranscript={handleVoiceNav}
                  />
                </div>"""

content = content.replace("""                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 ml-2 bg-emerald-50 border border-emerald-200 rounded-md">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Neural Link Enabled</span>
                </div>""", nav_voice_ui)

main_content_target = """        <main className="flex-1 overflow-hidden relative">
          <React.Suspense fallback={<div className="h-full flex items-center justify-center bg-[#0a0f18]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>}>
            {activeTab === "bank" && <BankDashboard user={user} />}
            {activeTab === "commbank" && <ValourianDashboard user={user} />}
            {activeTab === "docucraft" && <DocuCraft user={user} />}
            {activeTab === "websites" && <Deployments user={user} />}
            {activeTab === "payments" && <RapidPay user={user} />}
            {activeTab === "messagecenter" && <MessageCenter user={user} />}
          </React.Suspense>
        </main>"""

main_content_replace = """        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full w-full"
            >
              <React.Suspense fallback={<div className="h-full flex items-center justify-center bg-[#0a0f18]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>}>
                {activeTab === "bank" && <BankDashboard user={user} />}
                {activeTab === "commbank" && <ValourianDashboard user={user} />}
                {activeTab === "docucraft" && <DocuCraft user={user} />}
                {activeTab === "websites" && <Deployments user={user} />}
                {activeTab === "payments" && <RapidPay user={user} />}
                {activeTab === "messagecenter" && <MessageCenter user={user} />}
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </main>"""

content = content.replace(main_content_target, main_content_replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)
