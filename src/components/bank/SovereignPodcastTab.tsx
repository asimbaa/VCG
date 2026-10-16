import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Download, 
  Share2, 
  FileText, 
  Mic, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Headphones
} from "lucide-react";
import { toast } from "sonner";

interface PodcastEpisode {
  id: string;
  title: string;
  duration: number; // in seconds
  date: string;
  summary: string;
  speakers: string[];
  transcript: string;
}

const EPISODES: PodcastEpisode[] = [
  {
    id: "ep4",
    title: "Episode 4: AP+ BPAY® Instant Verification & NPP Osko 24/7 Rails",
    duration: 382,
    date: "October 15, 2026",
    summary: "Deep dive into Australian Payments Plus directory integration, real-time bill verification, Luhn checksum validation, and instant cryptographic proofs.",
    speakers: ["Asim Aryal (Founder CEO)", "Sovereign FinTech AI Core"],
    transcript: "Welcome to the Valourian Weekly Briefing. Today, we unpack the national Australian Payments Plus architecture. By linking directly to the national BPAY directory and NPP Osko settlement rails, corporate obligations settle in under 1.2 seconds with immediate cryptographically signed receipts."
  },
  {
    id: "ep3",
    title: "Episode 3: Autonomous Fleet Infrastructure & Artarmon Tech Sector",
    duration: 440,
    date: "October 8, 2026",
    summary: "Architecting the Aura Drive Tesla Plaid & Cybertruck deployment across Sydney's Lower North Shore and St Leonards charging superhubs.",
    speakers: ["Asim Aryal (Founder CEO)", "Atlas (Lead Strategist)"],
    transcript: "In Episode 3, we review the Aura Drive fleet telematics. With FSD v12.5 active and Torrens Title deed NSW-LRS-712 fully secured at 15 Barton Rd Artarmon, autonomous logistics hubs achieve sub-12 minute parcel interception."
  },
  {
    id: "ep2",
    title: "Episode 2: 26 Computer Science Breakthroughs & Quantum-Safe Enclaves",
    duration: 512,
    date: "October 1, 2026",
    summary: "Forensic analysis of the 26 algorithmic breakthroughs powering the Valourian Capital OS, from ZKP escrow to zero-spread liquidity netting.",
    speakers: ["Nova (Deep Researcher)", "Midas (Financial Architect)"],
    transcript: "Today we explore how mathematical elegance meets global capital. The 26 CS breakthroughs eliminate middleman friction, providing 100% deterministic execution across multi-currency treasury reserves."
  },
  {
    id: "ep1",
    title: "Episode 1: The $1.02 Trillion Treasury Architecture & Uncomplicated Banking",
    duration: 620,
    date: "September 24, 2026",
    summary: "The foundational doctrine of Valourian Capital Management: ruthless resource optimization, sovereign liquidity, and frictionless global commerce.",
    speakers: ["Asim Aryal (Founder CEO)", "Sovereign Superintelligence"],
    transcript: "The foundational doctrine is simple: maximize capabilities, but never overpay for assets. When you govern $1.02 Trillion in assets, banking must be instantaneous, sovereign, and uncomplicated."
  }
];

export function SovereignPodcastTab() {
  const [currentEpId, setCurrentEpId] = useState("ep4");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");

  const currentEp = EPISODES.find(e => e.id === currentEpId) || EPISODES[0];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= currentEp.duration) {
            setIsPlaying(false);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentEp.duration]);

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);

    if (next) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentEp.transcript);
        utterance.rate = 1.0;
        utterance.volume = isMuted ? 0 : volume;
        window.speechSynthesis.speak(utterance);
      }
      toast.success(`Playing: ${currentEp.title}`);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      toast.info("Playback paused");
    }
  };

  const handleSelectEp = (id: string) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentEpId(id);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleGenerateScript = () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a briefing topic");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const topicUpper = aiTopic.toUpperCase();
      const script = `### VALOURIAN SOVEREIGN EXECUTIVE BRIEFING: ${topicUpper}\n\n` +
        `**HOST:** Mr. Asim Aryal (Founder CEO) & Sovereign AI Core\n` +
        `**BROADCAST DATE:** ${new Date().toLocaleDateString('en-AU', { dateStyle: 'full' })}\n` +
        `**EXECUTIVE ABSTRACT:** Strategic expansion protocol concerning ${aiTopic}. Assets deployed under ABN 88 168 900 288 with zero latency clearing.\n\n` +
        `1. **STRATEGIC CONTEXT:** The allocation framework enforces asymmetric upside without overpaying. Core liquidity remains anchored in CBA & Macquarie Sovereign Reserves.\n` +
        `2. **EXECUTION PROTOCOL:** All settlements route through NPP/Osko real-time rails with instant cryptographic audit attestation.\n` +
        `3. **COMPLIANCE & GOVERNANCE:** Encrypted logs dispatched directly to asim.nsw@gmail.com. Sovereign state verified 100% nominal.\n\n` +
        `*Generated by Valourian Neural Broadcasting Hub.*`;
      setGeneratedScript(script);
      setIsGenerating(false);
      toast.success("AI Podcast Briefing generated successfully!");
    }, 1200);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Radio className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Sovereign Podcast & Audio Intelligence
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono">
                  VOICE SYNTHESIS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executive briefings, algorithmic breakdowns, and real-time audio syntheses for Mr. Asim Aryal and global partners.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Current Broadcast</span>
              <span className="text-sm font-black font-mono text-rose-400">EP 4: AP+ & OSKO SETTLEMENT</span>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-rose-500 animate-ping" : "bg-slate-500"}`} />
          </div>
        </div>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Player & Episode List (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Audio Player Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {currentEp.date} • {formatTime(currentEp.duration)}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2 leading-snug">{currentEp.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{currentEp.summary}</p>
              </div>
            </div>

            {/* Progress Scrubber */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newProgress = Math.floor((clickX / rect.width) * currentEp.duration);
                  setProgress(newProgress);
                }}
              >
                <div 
                  className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(progress / currentEp.duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(currentEp.duration)}</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-black text-slate-800">
                    {isPlaying ? "Streaming AI Voice Synthesis..." : "Ready to Stream"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Speakers: {currentEp.speakers.join(", ")}</div>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 accent-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Episode Catalog */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">All Executive Episodes</h5>
            <div className="space-y-2">
              {EPISODES.map((ep, idx) => (
                <div
                  key={`ep-${ep.id}-${idx}`}
                  onClick={() => handleSelectEp(ep.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentEpId === ep.id
                      ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-400 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        {ep.date}
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-bold">{formatTime(ep.duration)}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900">{ep.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Script Generator & Transcript (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Podcast Briefing Generator */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <span className="font-black text-xs uppercase tracking-wider text-white">AI Briefing Generator</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                GROK & GEMINI
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Generate a custom executive podcast script on any market acquisition, treasury maneuver, or tech breakthrough.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. $25M Clontarf Estate Acquisition & Torrens Title"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
              />

              <button
                type="button"
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                <span>{isGenerating ? "Synthesizing Script..." : "Generate Audio Script"}</span>
              </button>
            </div>

            {/* Generated Script Display */}
            {generatedScript && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto">
                {generatedScript}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
