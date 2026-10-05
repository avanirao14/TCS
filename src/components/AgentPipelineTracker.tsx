import React from 'react';
import { 
  Sparkles, 
  Split, 
  SpellCheck, 
  GitMerge, 
  ShieldAlert, 
  Lightbulb, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Clock,
  Layers
} from 'lucide-react';
import { AgentProgress } from '../types/essay';

interface AgentPipelineTrackerProps {
  agents: AgentProgress[];
  isAnalyzing: boolean;
  currentStepMessage?: string;
}

export const AgentPipelineTracker: React.FC<AgentPipelineTrackerProps> = ({
  agents,
  isAnalyzing,
  currentStepMessage
}) => {
  const getIcon = (key: string) => {
    switch (key) {
      case 'segmenter':
        return <Split className="w-4 h-4" />;
      case 'grammar':
        return <SpellCheck className="w-4 h-4" />;
      case 'coherence':
        return <GitMerge className="w-4 h-4" />;
      case 'argument':
        return <ShieldAlert className="w-4 h-4" />;
      case 'originality':
        return <Lightbulb className="w-4 h-4" />;
      case 'editor':
        return <FileText className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const completedCount = agents.filter(a => a.status === 'completed').length;
  const progressPct = Math.round((completedCount / agents.length) * 100);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Multi-Agent Pedagogical Pipeline
              {isAnalyzing && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> In Progress
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentStepMessage || 'Sequential structural parsing & parallel specialist analysis with Gemini 2.5 Flash'}
            </p>
          </div>
        </div>

        {/* Overall Progress Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {completedCount} of {agents.length} Agents
            </span>
            <div className="text-[10px] text-slate-400">
              {progressPct}% Completed
            </div>
          </div>
          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent) => {
          const isDone = agent.status === 'completed';
          const isRunning = agent.status === 'running';
          const isPending = agent.status === 'idle';

          return (
            <div
              key={agent.key}
              className={`p-3.5 rounded-xl border transition-all ${
                isRunning
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs ring-1 ring-indigo-400/30'
                  : isDone
                  ? 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isRunning
                        ? 'bg-indigo-500 text-white animate-bounce'
                        : isDone
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {getIcon(agent.key)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {agent.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {agent.role}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isRunning && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Running
                    </span>
                  )}
                  {isDone && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Done
                    </span>
                  )}
                  {isPending && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      <Clock className="w-2.5 h-2.5" /> Queued
                    </span>
                  )}
                </div>
              </div>

              {/* Finding notes or details */}
              {(agent.findingsCount !== undefined || agent.durationMs) && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  {agent.findingsCount !== undefined ? (
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {agent.findingsCount} findings documented
                    </span>
                  ) : <span />}
                  {agent.durationMs && (
                    <span className="text-slate-400">
                      {(agent.durationMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
