import React, { useState } from 'react';
import { 
  GitFork, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight, 
  Sparkles,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { ArgumentResult, ClaimNode, EvidenceNode } from '../types/essay';

interface ArgumentMapProps {
  argumentData: ArgumentResult;
}

export const ArgumentMap: React.FC<ArgumentMapProps> = ({ argumentData }) => {
  const [selectedNode, setSelectedNode] = useState<{
    type: 'thesis' | 'claim' | 'evidence';
    title: string;
    data: any;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'supported':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60',
          border: 'border-emerald-400 dark:border-emerald-700',
          text: 'text-emerald-700 dark:text-emerald-300',
          badge: 'bg-emerald-500 text-white',
          svgStroke: '#10b981',
          label: 'Supported'
        };
      case 'weak':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60',
          border: 'border-amber-400 dark:border-amber-700',
          text: 'text-amber-700 dark:text-amber-300',
          badge: 'bg-amber-500 text-white',
          svgStroke: '#f59e0b',
          label: 'Weak'
        };
      case 'unsupported':
      default:
        return {
          bg: 'bg-red-50 dark:bg-red-950/60',
          border: 'border-red-400 dark:border-red-700',
          text: 'text-red-700 dark:text-red-300',
          badge: 'bg-red-500 text-white',
          svgStroke: '#ef4444',
          label: 'Unsupported'
        };
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Controls & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-indigo-500" />
            Argument Architecture
          </span>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Supported
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Weak
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-red-700 dark:text-red-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              Unsupported
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-[11px] font-mono font-medium text-slate-500">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Canvas + Inspector Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Visual Graph View (SVG Tree) */}
        <div className="lg:col-span-2 bg-slate-900/5 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-x-auto min-h-[460px] flex flex-col justify-center relative">
          
          <div 
            className="transition-transform duration-200 origin-top-left space-y-6"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            
            {/* LEVEL 1: Central Thesis Root Node */}
            <div className="flex justify-center">
              <div
                onClick={() => setSelectedNode({
                  type: 'thesis',
                  title: 'Core Thesis Statement',
                  data: {
                    thesis: argumentData.thesisStatement,
                    clarity: argumentData.thesisClarity,
                    feedback: argumentData.overallFeedback,
                    counterarguments: argumentData.counterargumentsAddressed,
                    counterargumentNote: argumentData.counterargumentNote
                  }
                })}
                className="w-full max-w-md p-4 rounded-xl border-2 border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-900 shadow-md hover:shadow-indigo-500/20 cursor-pointer transition-all hover:scale-[1.02] text-center group"
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  Central Thesis Statement
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 font-extrabold">
                    {argumentData.thesisClarity}
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                  "{argumentData.thesisStatement}"
                </p>
                <div className="text-[10px] text-indigo-500 font-semibold mt-1 opacity-80 group-hover:opacity-100">
                  Click to inspect thesis & counterargument balance →
                </div>
              </div>
            </div>

            {/* Connecting Vertical Stem */}
            <div className="flex justify-center -my-2">
              <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* LEVEL 2 & 3: Claims and Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {argumentData.claims.map((claim, idx) => {
                const style = getStatusColor(claim.status);

                return (
                  <div key={claim.id || `claim-${idx}`} className="space-y-3">
                    
                    {/* Claim Node Card */}
                    <div
                      onClick={() => setSelectedNode({
                        type: 'claim',
                        title: `Claim ${idx + 1}`,
                        data: claim
                      })}
                      className={`p-3.5 rounded-xl border-2 ${style.border} ${style.bg} shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          Claim {idx + 1} (Para {claim.paragraphIndex})
                        </span>
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3">
                        {claim.claimText}
                      </p>

                      {claim.logicalFallacy && claim.logicalFallacy !== 'None' && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-100/70 dark:bg-red-950/70 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          Fallacy: {claim.logicalFallacy}
                        </div>
                      )}
                    </div>

                    {/* Connecting line to evidence */}
                    <div className="flex justify-center -my-1">
                      <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700" />
                    </div>

                    {/* Evidence Nodes */}
                    <div className="space-y-1.5 pl-3 border-l-2 border-dashed border-slate-300 dark:border-slate-700">
                      {claim.evidence && claim.evidence.length > 0 ? (
                        claim.evidence.map((ev, evIdx) => (
                          <div
                            key={ev.id || `ev-${evIdx}`}
                            onClick={() => setSelectedNode({
                              type: 'evidence',
                              title: `Evidence for Claim ${idx + 1}`,
                              data: ev
                            })}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] cursor-pointer hover:border-indigo-400 transition-colors shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Evidentiary Support
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-1.5 rounded-sm ${
                                ev.strength === 'strong' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                ev.strength === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              }`}>
                                {ev.strength}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                              {ev.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-[11px] text-red-600 dark:text-red-400 italic">
                          No direct empirical evidence identified for this claim.
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Node Inspector Drawer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              Node Inspector
            </h4>
            {selectedNode && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                {selectedNode.type}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {selectedNode.title}
                </h5>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 italic font-serif-paper text-sm">
                  "{selectedNode.type === 'thesis' ? selectedNode.data.thesis :
                    selectedNode.type === 'claim' ? selectedNode.data.claimText :
                    selectedNode.data.text}"
                </div>
              </div>

              {/* Status / Fallacy info */}
              {selectedNode.type === 'claim' && (
                <>
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Coaching Feedback:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">
                      {selectedNode.data.feedback}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-1">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Suggested Enhancement:
                    </span>
                    <p className="text-indigo-800 dark:text-indigo-200">
                      {selectedNode.data.suggestionToStrengthen}
                    </p>
                  </div>
                </>
              )}

              {selectedNode.type === 'thesis' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Counterargument Handling:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {selectedNode.data.counterargumentNote || (selectedNode.data.counterarguments
                        ? 'Counterarguments were acknowledged and effectively addressed.'
                        : 'No opposing perspectives acknowledged. Consider addressing counterarguments.')}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === 'evidence' && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Critique:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200">
                    {selectedNode.data.critique}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <GitFork className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">
                Select any Thesis, Claim, or Evidence node in the graph to inspect detailed pedagogical feedback.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
