import React from 'react';
import { 
  Cpu, 
  Layers, 
  ArrowRight, 
  Database, 
  Zap, 
  Users, 
  Globe2, 
  Split, 
  SpellCheck, 
  GitMerge, 
  ShieldAlert, 
  Lightbulb, 
  FileText,
  Server,
  Cloud,
  CheckCircle2
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
              System Engineering & Cloud Scale
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Multi-Agent Orchestration & Enterprise Scalability
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Detailed technical blueprint of the EssayLens pipeline: from client UI through the Express API Gateway, parallel Gemini 2.5 Flash agent workers, and final holistic editor synthesis.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Flowchart: UI -> Orchestrator -> 5 Agents -> Editor -> Report */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              End-to-End Multi-Agent Architecture Diagram
            </h3>
            <p className="text-xs text-slate-500">
              UI → Orchestrator → 5 Parallel & Sequential Agents → Editor Agent → Final Report
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
            Gemini 2.5 Flash
          </span>
        </div>

        {/* Diagram Flow */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4 overflow-x-auto">
          
          {/* Step 1: Client UI */}
          <div className="w-full lg:w-44 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-center space-y-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Client UI
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              React 19 + Tailwind v4 + Recharts + SSE Stream Consumer
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 lg:rotate-0 shrink-0" />

          {/* Step 2: Orchestrator Gateway */}
          <div className="w-full lg:w-48 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-300 dark:border-indigo-800 text-center space-y-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Server className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              API Orchestrator
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Express / Node Gateway, SSE Dispatcher & Session Guard
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 lg:rotate-0 shrink-0" />

          {/* Step 3: 5 Specialist Agents (Stacked / Parallel) */}
          <div className="w-full lg:w-64 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
            <div className="text-center font-bold text-xs text-slate-900 dark:text-slate-100 mb-2">
              5 Specialist Agents
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <Split className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-bold">Segmenter Agent</span>
                <span className="text-[9px] text-slate-400 ml-auto">Sequential</span>
              </div>
              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-900 dark:text-red-300">
                <SpellCheck className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-bold">Grammar Agent</span>
                <span className="text-[9px] text-red-400 ml-auto">Parallel</span>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <GitMerge className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-bold">Coherence Agent</span>
                <span className="text-[9px] text-blue-400 ml-auto">Parallel</span>
              </div>
              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 flex items-center gap-2 text-orange-900 dark:text-orange-300">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="font-bold">Argument Agent</span>
                <span className="text-[9px] text-orange-400 ml-auto">Parallel</span>
              </div>
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center gap-2 text-purple-900 dark:text-purple-300">
                <Lightbulb className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="font-bold">Originality Agent</span>
                <span className="text-[9px] text-purple-400 ml-auto">Parallel</span>
              </div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 lg:rotate-0 shrink-0" />

          {/* Step 4: Editor Agent */}
          <div className="w-full lg:w-48 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-300 dark:border-indigo-800 text-center space-y-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Editor Agent
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Merges outputs, calculates rubrics, generates Socratic prompts
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 lg:rotate-0 shrink-0" />

          {/* Step 5: Report Delivery */}
          <div className="w-full lg:w-44 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 text-center space-y-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Interactive Report
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Radar, Inline highlights, Argument map, Speech TTS
            </p>
          </div>

        </div>
      </div>

      {/* 4 Enterprise Scalability Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Pillar 1: Batch Processing */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                1. High-Throughput Batch Processing
              </h4>
              <p className="text-[11px] text-slate-400">
                District-wide automated exam evaluation
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            During midterms or state standardized writing exams, school districts process upwards of 50,000 essays within a 48-hour window. EssayLens leverages an asynchronous worker queue (Redis / BullMQ) with exponential backoff and rate-limit throttling to batch requests to Gemini 2.5 Flash without dropping packets or exceeding TPM quotas.
          </p>
        </div>

        {/* Pillar 2: Semantic Caching & Deduplication */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. Semantic Caching & Deduplication
              </h4>
              <p className="text-[11px] text-slate-400">
                Sub-50ms repeat latency & 60% API cost reduction
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Students submitting the same standardized prompt frequently make overlapping grammar mistakes (e.g., "there vs their", dangling modifiers) and quote identical source texts. Vector embeddings are used to cache common grammar rules and rubric patterns, slashing API token spend by over 60% while delivering instant feedback.
          </p>
        </div>

        {/* Pillar 3: Class & District Analytics Dashboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                3. Class & Cohort Analytics Dashboard
              </h4>
              <p className="text-[11px] text-slate-400">
                Aggregate pedagogical heatmaps for instructors
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Rather than grading in isolation, teachers can view aggregate cohort dashboards identifying common curriculum gaps (e.g., "72% of 9th-grade students struggled with counterargument rebuttals on essay assignment #3"). This enables targeted classroom micro-lessons based on empirical diagnostic data.
          </p>
        </div>

        {/* Pillar 4: Multi-Language & ESL Support */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                4. Multi-Language & ESL Calibration
              </h4>
              <p className="text-[11px] text-slate-400">
                CEFR-calibrated pedagogical tone
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            For English Language Learners (ESL), standard academic jargon can be overwhelming. In "Simple English" mode, the Editor Agent rewrites feedback using high-frequency vocabulary and syntactic simplicity, encouraging international and bilingual students without confusing grammatical terminology.
          </p>
        </div>

      </div>

    </div>
  );
};
