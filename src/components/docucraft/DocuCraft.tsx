import React, { useState } from "react";
import { User } from "firebase/auth";
import { 
  BrainCircuit, 
  FileText, 
  Search, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  Zap,
  Loader2,
  ChevronRight,
  Download,
  Copy,
  Calculator,
  Receipt,
  BarChart3,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface DocuCraftProps {
  user: User;
}

type AgentType = "strategist" | "researcher" | "risk" | "creative" | "financier";

interface Agent {
  id: AgentType;
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

const AGENTS: Agent[] = [
  {
    id: "strategist",
    name: "Atlas",
    role: "Lead Strategist",
    icon: <Target className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Analyzes your goals and formulates step-by-step actionable plans."
  },
  {
    id: "financier",
    name: "Midas",
    role: "Financial Architect",
    icon: <Calculator className="w-6 h-6" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    description: "Generates invoices, financial reports, and expense summaries with precision."
  },
  {
    id: "researcher",
    name: "Nova",
    role: "Deep Researcher",
    icon: <Search className="w-6 h-6" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    description: "Gathers proofs, data, and explains complex concepts intuitively."
  },
  {
    id: "risk",
    name: "Aegis",
    role: "Risk Analyst",
    icon: <ShieldAlert className="w-6 h-6" />,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    description: "Identifies potential pitfalls and suggests mitigation strategies."
  },
  {
    id: "creative",
    name: "Lyra",
    role: "Creative Director",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    description: "Drafts compelling documents, from business proposals to hobby guides."
  }
];

const SUGGESTIONS = [
  { text: "Generate a professional invoice for a $5,000 consulting project", icon: <Receipt className="w-4 h-4" /> },
  { text: "Create a quarterly financial report for a tech startup", icon: <BarChart3 className="w-4 h-4" /> },
  { text: "Draft a 12-month strategic expansion plan for Europe", icon: <Target className="w-4 h-4" /> },
  { text: "Explain the benefits of decentralized finance (DeFi) simply", icon: <Search className="w-4 h-4" /> },
  { text: "Analyze the risks of entering the commercial real estate market", icon: <ShieldAlert className="w-4 h-4" /> },
];

export function DocuCraft({ user }: DocuCraftProps) {
  const [activeAgent, setActiveAgent] = useState<AgentType>("strategist");
  const [isCollaborationMode, setIsCollaborationMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(SUGGESTIONS);

  // Global Escape key handler for dropdown
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load saved prompt on mount
  React.useEffect(() => {
    const savedPrompt = localStorage.getItem("docucraft_draft_prompt");
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
  }, []);

  // Save prompt to local storage on change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("docucraft_draft_prompt", prompt);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setResult("");

    try {
      const response = await fetch("/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          agents: isCollaborationMode ? AGENTS.map(a => a.role) : [AGENTS.find(a => a.id === activeAgent)?.role]
        })
      });

      if (!response.ok) throw new Error("AURA: Communication failed with Neural Core.");
      
      const data = await response.json();
      if (data.text) {
        setResult(data.text);
      } else {
        toast.error("No response generated.");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  const downloadPDF = async () => {
    const input = document.getElementById("docucraft-pdf-content");
    if (!input) return;
    try {
      toast.info("Generating PDF...", { id: "pdf-toast" });
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("DocuCraft_Document.pdf");
      toast.success("PDF Downloaded successfully!", { id: "pdf-toast" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BrainCircuit className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <BrainCircuit className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">DocuCraft Engine</h2>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Your personal strategy engine powered by 4 specialized AI agents. 
            Get advice on upcoming moves, generate accurate documents, and explore intuitive research proofs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Agents Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
            Select Your Agent
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  activeAgent === agent.id
                    ? `border-${agent.color.split('-')[1]}-500 bg-white shadow-md scale-[1.02]`
                    : "border-transparent bg-slate-50 hover:bg-slate-100 hover:scale-[1.01]"
                }`}
              >
                <div className={`p-3 rounded-xl ${agent.bgColor} ${agent.color} shrink-0`}>
                  {agent.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    {agent.name}
                    {activeAgent === agent.id && (
                      <span className="flex h-2 w-2 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${agent.color.split('-')[1]}-400`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 bg-${agent.color.split('-')[1]}-500`}></span>
                      </span>
                    )}
                  </h4>
                  <p className={`text-xs font-medium mb-1 ${agent.color}`}>{agent.role}</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {agent.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Interaction Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {isCollaborationMode ? (
                  <div className="flex -space-x-2">
                    {AGENTS.map((a, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${a.bgColor} ${a.color} flex items-center justify-center`}>
                        {React.cloneElement(a.icon as any, { className: "w-4 h-4" })}
                      </div>
                    ))}
                  </div>
                ) : (
                  AGENTS.find(a => a.id === activeAgent)?.icon
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {isCollaborationMode ? "Sovereign Executive Council Collaboration" : `Consulting with ${AGENTS.find(a => a.id === activeAgent)?.name}`}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {isCollaborationMode ? "All units active and synchronized" : AGENTS.find(a => a.id === activeAgent)?.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">Council Mode</span>
                <button 
                  onClick={() => setIsCollaborationMode(!isCollaborationMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isCollaborationMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isCollaborationMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
                What do you need assistance with?
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrompt(val);
                    if (val.trim().length > 0) {
                      const filtered = SUGGESTIONS.filter(s => s.text.toLowerCase().includes(val.toLowerCase()));
                      setFilteredSuggestions(filtered);
                      setShowSuggestions(filtered.length > 0);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (prompt.trim().length === 0) {
                      setFilteredSuggestions(SUGGESTIONS);
                      setShowSuggestions(true);
                    } else if (filteredSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="e.g., Draft a business proposal for a new SaaS product, or explain quantum computing intuitively..."
                  className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                  required
                />
                
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Smart Suggestions</p>
                        <Sparkles className="w-3 h-3 text-blue-500" />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPrompt(suggestion.text);
                              setShowSuggestions(false);
                              // Auto-select agent based on suggestion
                              if (suggestion.text.includes("invoice") || suggestion.text.includes("financial")) {
                                setActiveAgent("financier");
                              } else if (suggestion.text.includes("strategic")) {
                                setActiveAgent("strategist");
                              } else if (suggestion.text.includes("Explain")) {
                                setActiveAgent("researcher");
                              } else if (suggestion.text.includes("Analyze")) {
                                setActiveAgent("risk");
                              }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left group border-b border-slate-50 last:border-0"
                          >
                            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              {suggestion.icon}
                            </div>
                            <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors flex-1">{suggestion.text}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isProcessing || !prompt.trim()}
                  className="absolute bottom-4 right-4 px-6 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Quick Templates</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Invoice", icon: <Receipt className="w-4 h-4" />, prompt: "Generate a professional invoice for [Service Name] totaling $[Amount]. Include itemized breakdown." },
                  { label: "Report", icon: <BarChart3 className="w-4 h-4" />, prompt: "Create a detailed financial report for Q1 2026, including revenue, expenses, and growth projections." },
                  { label: "Proposal", icon: <FileText className="w-4 h-4" />, prompt: "Draft a comprehensive business proposal for [Project Name], outlining goals, timeline, and budget." },
                  { label: "Risk Audit", icon: <ShieldAlert className="w-4 h-4" />, prompt: "Perform a risk assessment for [Business Idea], identifying 5 key threats and mitigation plans." }
                ].map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(template.prompt);
                      if (template.label === "Invoice" || template.label === "Report") setActiveAgent("financier");
                      if (template.label === "Proposal") setActiveAgent("creative");
                      if (template.label === "Risk Audit") setActiveAgent("risk");
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
                  >
                    <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                      {template.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">{template.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Generated Output
                    </h4>
                    <div className="flex items-center gap-2">
                       <button
                          onClick={downloadPDF}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                          title="Download as PDF"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                       </button>
                      <button
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          isPreviewMode 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isPreviewMode ? "Edit View" : "Print Preview"}
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`rounded-2xl transition-all duration-500 overflow-auto max-h-[600px] ${
                    isPreviewMode 
                      ? "bg-slate-100 p-8 flex justify-center" 
                      : "bg-slate-50 p-6 border border-slate-200"
                  }`}>
                    <div id="docucraft-pdf-content" className={`transition-all duration-500 ${
                      isPreviewMode 
                        ? "bg-white p-12 shadow-2xl max-w-[800px] w-full min-h-[1056px] print:shadow-none print:p-0" 
                        : "w-full"
                    }`}>
                      <div className={`prose max-w-none ${
                        isPreviewMode 
                          ? "prose-slate prose-headings:font-serif prose-headings:text-slate-900 prose-p:text-slate-800 prose-a:text-blue-600 prose-p:leading-relaxed" 
                          : "prose-slate prose-headings:font-bold prose-a:text-blue-600 prose-p:leading-relaxed"
                      }`}>
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
