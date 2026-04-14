"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  CloudUpload, FileText, CircleCheck, CircleAlert, Loader2, 
  Building, Calendar, DollarSign, User, Activity, 
  Cpu, Zap, ShieldCheck, Layers, Sparkles, ChevronRight, Info, Copy, Check,
  Box, Terminal, Binary, Server, Code, Gauge, Globe
} from "lucide-react";

type AnalysisResult = {
  summary: string;
  category?: string;
  entities: {
    names: string[];
    organizations: string[];
    dates: string[];
    amounts: string[];
  };
  sentiment: "Positive" | "Negative" | "Neutral";
};

/* 3D Tilt Wrapper */
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative perspective-container ${className}`}
    >
      <div style={{ transform: "translateZ(80px)" }}>{children}</div>
    </motion.div>
  );
};

const Navbar = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="w-full h-20 px-8 flex items-center justify-between realistic-3d-card border-b border-white/5 sticky top-0 z-50 overflow-hidden">
      <div className="absolute inset-0 surface-noise pointer-events-none" />
      <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg glow-edge">
          <Cpu size={24} strokeWidth={2.5}/>
        </div>
        <span className="text-2xl font-bold tracking-tight font-outfit text-sharp">
          Omni<span className="text-white">Doc</span> <span className="text-indigo-400 font-light opacity-80">PRO</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-12 text-sm font-black uppercase tracking-[0.3em] text-slate-500 relative z-10">
        <button onClick={() => scrollTo('neural-hub')} className="hover:text-indigo-400 transition-colors">Neural Hub</button>
        <button onClick={() => scrollTo('data-streams')} className="hover:text-pink-400 transition-colors">Data Streams</button>
        <button onClick={() => scrollTo('matrix-api')} className="hover:text-white transition-colors">Matrix API</button>
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="px-6 py-2 rounded-sm bg-white/5 border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-widest hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Node
        </div>
      </div>
    </nav>
  );
};

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const configs = {
    Positive: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    Negative: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
    Neutral: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400" }
  };
  const config = configs[sentiment as keyof typeof configs] || configs.Neutral;

  return (
    <div className={`px-6 py-2 rounded-sm border flex items-center gap-3 ${config.bg} ${config.border} ${config.text} text-xs font-black uppercase tracking-[0.1em]`}>
       <div className={`w-2 h-2 rounded-full ${config.text.replace('text', 'bg')}`} />
       {sentiment}
    </div>
  );
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile);
    setResult(null);
    setError(null);
    setLoadingStep("Mapping Document Topography...");

    const getBase64 = (f: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    try {
      const base64String = await getBase64(uploadedFile);
      await new Promise(r => setTimeout(r, 800)); 
      setLoadingStep("Executing Neural Extraction...");
      
      let fileExt = uploadedFile.name.split('.').pop() || "unknown";
      if (fileExt.match(/^(png|jpg|jpeg)$/i)) fileExt = "image";
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

      const response = await fetch(`${backendUrl}/api/document-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { "x-api-key": apiKey }),
        },

        body: JSON.stringify({
          fileName: uploadedFile.name,
          fileType: fileExt,
          fileBase64: base64String
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Neural handshake failed.");
      }

      const data = await response.json();
      setLoadingStep("Finalizing High-Fidelity Results...");
      await new Promise(r => setTimeout(r, 600));
      setResult(data);
      setLoadingStep(null);
    } catch (err: any) {
      setError(err.message || "Matrix communication failure.");
      setLoadingStep(null);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-black scroll-smooth">
      <div className="fixed inset-0 surface-noise opacity-20 pointer-events-none z-50" />
      <Navbar />

      <main className="flex-grow relative z-10">
        
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-indigo-500/50 to-transparent opacity-20 pointer-events-none" />

          {!result && !loadingStep && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-20"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 font-outfit uppercase text-sharp">
                Intelligence<br />
                <span className="text-indigo-400 opacity-50">Physicalized.</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.5em] max-w-xl mx-auto opacity-60">
                High-frequency document analysis for mission-critical operations.
              </p>
            </motion.div>
          )}

          {/* Action Zone */}
          {!result && (
            <TiltCard className="w-full max-w-2xl mx-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={handleDrop}
                className={`relative realistic-3d-card p-20 text-center cursor-pointer transition-all duration-500 border-white/5 ${
                  isHovering ? "border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.2)]" : ""
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
                <div className="absolute inset-0 surface-noise opacity-10 pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  {loadingStep ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                      <div className="relative mx-auto w-24 h-24">
                          <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin" />
                          <div className="absolute inset-4 border-b-2 border-pink-500 rounded-full animate-spin-slow" />
                          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" size={32} />
                      </div>
                      <div className="space-y-2">
                          <p className="text-lg font-black tracking-widest text-indigo-400 uppercase italic">{loadingStep}</p>
                          <div className="flex gap-1 justify-center opacity-30">
                            {Array.from({length:3}).map((_,i) => <motion.div key={i} animate={{scale:[1,1.5,1]}} transition={{repeat:Infinity, delay:i*0.2}} className="w-1 h-1 bg-white" />)}
                          </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-12 glow-edge border border-white/10 group-hover:bg-indigo-500/10 transition-colors">
                        <CloudUpload size={40} className="text-white/60" />
                      </div>
                      <h3 className="text-4xl font-black mb-6 tracking-tight text-white uppercase italic text-sharp">Analyze Matrix</h3>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Drop PDF / DOCX / Image</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TiltCard>
          )}

          {result && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="space-y-12 py-20"
             >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-l-4 border-indigo-500 pl-12">
                  <div>
                    <h2 className="text-6xl font-black tracking-tighter text-sharp flex items-center gap-6">
                      Extraction <span className="text-indigo-400">Complete</span>
                    </h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.4em] mt-3 italic">Class: <span className="text-white">{result.category || "Unclassified"}</span> // Node-ID: {file?.name.slice(0,10)}...</p>
                  </div>
                  <div className="flex gap-4">
                    <SentimentBadge sentiment={result.sentiment} />
                    <button onClick={() => {setResult(null); setFile(null);}} className="text-xs font-black uppercase tracking-[0.2em] px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-all rounded-sm flex items-center gap-3">
                       Reload <ChevronRight size={16}/>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3 realistic-3d-card p-10 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 surface-noise opacity-10 pointer-events-none" />
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-4">
                         <Zap size={18}/> Semantic Core
                       </h3>
                       <button onClick={handleCopy} className="p-2 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-all text-slate-500 hover:text-white group relative">
                          <AnimatePresence mode="wait">
                            {isCopied ? (
                              <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                <Check size={14} className="text-emerald-400"/>
                              </motion.div>
                            ) : (
                              <motion.div key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                <Copy size={14}/>
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </button>
                    </div>
                    <p className="text-3xl font-black tracking-tight leading-snug text-slate-200 indent-24 first-letter:text-5xl first-letter:font-black first-letter:text-indigo-400">
                      {result.summary}
                    </p>
                    <div className="mt-20 flex justify-between items-end relative z-10 pt-12 border-t border-white/5 opacity-40">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Summary Density: 94.2%</div>
                      <Info size={16}/>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <EntityPanel title="Organizations" list={result.entities.organizations} icon={<Building size={14}/>}/>
                    <EntityPanel title="Neural Entities" list={result.entities.names} icon={<User size={14}/>}/>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="realistic-3d-card p-6 flex flex-col justify-between h-40 border-white/5">
                       <DollarSign className="text-indigo-400" size={20}/>
                       <div className="text-3xl font-black text-white italic">{result.entities.amounts[0] || "$0"}</div>
                       <div className="text-xs font-bold text-slate-700 uppercase tracking-[0.1em]">Financial</div>
                    </div>
                    <div className="realistic-3d-card p-6 flex flex-col justify-between h-40 border-white/5">
                       <Calendar className="text-pink-400" size={20}/>
                       <div className="text-3xl font-black text-white italic">{result.entities.dates[0] || "N/A"}</div>
                       <div className="text-xs font-bold text-slate-700 uppercase tracking-[0.1em]">Timeline</div>
                    </div>
                    </div>
                  </div>
                </div>
             </motion.div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-12 p-8 realistic-3d-card border-rose-500/30 max-w-2xl mx-auto flex gap-6">
                <div className="p-4 bg-rose-500/20 text-rose-500 rounded-sm self-start"><CircleAlert size={32}/></div>
                <div>
                  <h4 className="text-2xl font-black italic tracking-tighter text-rose-400 uppercase">Extraction Blocked</h4>
                  <p className="text-rose-200/50 mt-2 text-xs font-medium leading-relaxed">{error}</p>
                  <button onClick={() => {setError(null); setFile(null);}} className="mt-6 text-[10px] font-black uppercase text-rose-500 hover:text-rose-400 tracking-[0.2em] transition-colors border-b-2 border-rose-500/20">Reset Matrix Link</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* NEURAL HUB (FEATURES) */}
        <section id="neural-hub" className="py-32 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full border-t border-white/5">
           <div className="flex flex-col md:flex-row gap-20">
              <div className="w-full md:w-1/3">
                 <h2 className="text-7xl font-black uppercase tracking-tighter text-sharp">Neural<br/><span className="text-indigo-400">Hub</span></h2>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.4em] mt-10 leading-loose opacity-60">The core intelligence cluster powering multi-modal document extraction.</p>
              </div>
              <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <FeatureItem icon={<Binary className="text-indigo-400"/>} title="Automated Classification" desc="Neural-net driven categorization of invoices, resumes, and contracts." />
                 <FeatureItem icon={<Box className="text-pink-400"/>} title="Hardware OCR" desc="High-frequency text recognition from physical documents via Tesseract." />
                 <FeatureItem icon={<Gauge className="text-indigo-400"/>} title="Sentiment Mapping" desc="Real-time emotional tone mapping for executive decision making." />
                 <FeatureItem icon={<Globe className="text-emerald-400"/>} title="Global Entity Linking" desc="Deep extraction of global organizations, people, and timelines." />
              </div>
           </div>
        </section>

        {/* DATA STREAMS (TECH STACK) */}
        <section id="data-streams" className="py-32 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full border-t border-white/5 bg-indigo-500/[0.02]">
           <div className="text-center mb-24">
              <div className="inline-block px-6 py-2 rounded-sm bg-white/5 border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-widest mb-8">Execution Layer</div>
              <h2 className="text-6xl font-black uppercase tracking-tight text-white mb-6">High-Frequency Stack</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <StackCard icon={<Server/>} title="FastAPI" desc="Ultra-low latency python framework for document routing." />
              <StackCard icon={<Sparkles/>} title="Gemini Flash" desc="State-of-the-art LLM core for semantic intelligence." />
              <StackCard icon={<Code/>} title="Next.js 15" desc="High-performance React environment for 3D UI." />
              <StackCard icon={<Terminal/>} title="Tesseract" desc="Deep-learning OCR engine for physical data vision." />
           </div>
        </section>

        {/* MATRIX API (DOCS) */}
        <section id="matrix-api" className="py-32 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full border-t border-white/5">
           <div className="realistic-3d-card overflow-hidden p-1 bg-gradient-to-r from-indigo-500/20 to-pink-500/20">
              <div className="bg-black p-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5"><Terminal size={300}/></div>
                 <div className="relative z-10">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Matrix Integration</h3>
                    <div className="space-y-6">
                       <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl">Integrate OmniDoc into your proprietary workflows with a single neural handshake. Our RESTful API supports Base64 payloads and provides multi-modal structured extraction in milliseconds.</p>
                       <div className="p-8 bg-white/5 border border-white/10 font-mono text-sm text-indigo-300 space-y-4">
                          <div className="flex gap-6"><span>POST</span> <span className="text-white">/api/document-analyze</span></div>
                          <div className="text-slate-600">-- Headers: x-api-key: [Your_Key]</div>
                          <div className="text-slate-600">-- Payload: {"{ \"fileBase64\": \"...\", \"fileType\": \"pdf\" }"}</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer className="w-full py-24 text-center border-t border-white/5">
        <div className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-6">OmniDoc Peripheral OS // Stable Build 2.4.1</div>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest group">Engineered for Guvi Hackathon 2026 // <span className="text-indigo-500">CodyRohith7</span></p>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-10 realistic-3d-card border-white/5 hover:border-white/20 transition-all group">
       <div className="w-14 h-14 mb-8 flex items-center justify-center bg-white/5 rounded-sm border border-white/10 group-hover:scale-110 transition-transform">
         {icon}
       </div>
       <h4 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tight">{title}</h4>
       <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function StackCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="text-center p-12 realistic-3d-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
       <div className="w-20 h-20 mx-auto mb-10 flex items-center justify-center text-indigo-400 bg-white/5 rounded-full border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
         {icon}
       </div>
       <h4 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">{title}</h4>
       <p className="text-slate-600 text-xs font-bold uppercase tracking-widest leading-loose">{desc}</p>
    </div>
  );
}

function EntityPanel({ title, list, icon }: { title: string, list: string[], icon: React.ReactNode }) {
  return (
    <div className="realistic-3d-card p-8 border-white/5">
       <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
         {icon} {title}
       </h4>
       <div className="flex flex-col gap-3">
         {list.length > 0 ? list.map((item, i) => (
           <div key={i} className="text-sm font-bold text-white/80 border-l-2 border-white/10 pl-4 py-1 hover:border-indigo-500 transition-colors">
              {item}
           </div>
         )) : <span className="text-xs font-bold text-slate-800 italic">Static. void.</span>}
       </div>
    </div>
  );
}
