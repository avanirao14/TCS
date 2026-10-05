import React, { useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  GitCompare, 
  Sparkles,
  ChevronRight,
  SplitSquareVertical
} from 'lucide-react';
import { FullAnalysisReport, SubmissionHistoryItem } from '../types/essay';

interface RevisionComparisonProps {
  currentReport: FullAnalysisReport;
  previousReport?: FullAnalysisReport;
  history: SubmissionHistoryItem[];
  onSelectPreviousReport?: (report: FullAnalysisReport) => void;
}

export const RevisionComparison: React.FC<RevisionComparisonProps> = ({
  currentReport,
  previousReport,
  history,
  onSelectPreviousReport
}) => {
  const [viewMode, setViewMode] = useState<'diff' | 'side-by-side'>('side-by-side');

  // If no explicit previousReport, take the most recent earlier history item
  const prev = previousReport || (history.length > 1 ? history[history.length - 2]?.report : null);

  if (!prev) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <GitCompare className="w-10 h-10 text-indigo-400 mx-auto" />
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
          First Draft Submitted
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          You are viewing your initial draft analysis. When you edit your essay in the editor and click "Analyze Revised Draft", EssayLens will automatically compute before & after score deltas and improvement badges!
        </p>
      </div>
    );
  }

  const scoreDelta = currentReport.overallScore - prev.overallScore;
  const grammarDelta = currentReport.rubricScores.grammar.score - prev.rubricScores.grammar.score;
  const coherenceDelta = currentReport.rubricScores.coherence.score - prev.rubricScores.coherence.score;
  const argumentDelta = currentReport.rubricScores.argumentStrength.score - prev.rubricScores.argumentStrength.score;
  const originalityDelta = currentReport.rubricScores.originality.score - prev.rubricScores.originality.score;

  // Improvement badges
  const badges: string[] = [];
  if (scoreDelta > 0) badges.push(`+${scoreDelta} Overall Score Boost`);
  if (grammarDelta > 0) badges.push('Syntax & Grammar Polished');
  if (coherenceDelta > 0) badges.push('Smoother Paragraph Transitions');
  if (argumentDelta > 0) badges.push('Strengthened Evidentiary Claims');
  if (originalityDelta > 0) badges.push('Stock Clichés Eliminated');
  if (badges.length === 0) badges.push('Revised & Resubmitted for Assessment');

  return (
    <div className="space-y-5">
      
      {/* Score Delta Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-emerald-500/10 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Revision Progress Assessment
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Comparing Draft v{history.length - 1} ({new Date(prev.timestamp).toLocaleTimeString()}) with Current Draft v{history.length}
            </p>
          </div>

          {/* Delta Pill */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-center font-bold text-sm border ${
              scoreDelta >= 0
                ? 'bg-emerald-500/15 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/15 border-amber-400 text-amber-700 dark:text-amber-300'
            }`}>
              <div className="text-[10px] uppercase font-extrabold tracking-wider">Score Delta</div>
              <div className="text-lg">
                {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Badges */}
        <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center gap-2">
          {badges.map((b, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
            >
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* 4 Rubric Dimension Delta Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Grammar', prev: prev.rubricScores.grammar.score, curr: currentReport.rubricScores.grammar.score, delta: grammarDelta },
          { label: 'Coherence', prev: prev.rubricScores.coherence.score, curr: currentReport.rubricScores.coherence.score, delta: coherenceDelta },
          { label: 'Argument', prev: prev.rubricScores.argumentStrength.score, curr: currentReport.rubricScores.argumentStrength.score, delta: argumentDelta },
          { label: 'Originality', prev: prev.rubricScores.originality.score, curr: currentReport.rubricScores.originality.score, delta: originalityDelta },
        ].map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              {item.label}
            </span>
            <div className="flex items-baseline justify-between">
              <div className="text-xs text-slate-400">
                {item.prev.toFixed(1)} → <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.curr.toFixed(1)}</span>
              </div>
              <span className={`text-xs font-bold ${
                item.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                item.delta < 0 ? 'text-red-500' : 'text-slate-400'
              }`}>
                {item.delta > 0 ? `+${item.delta.toFixed(1)}` : item.delta.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-Side Comparison of Text */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SplitSquareVertical className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Side-by-Side Draft Comparison
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {prev.wordCount} words → {currentReport.wordCount} words
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 p-4 gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>Previous Draft</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                Score: {prev.overallScore}
              </span>
            </div>
            <div className="font-serif-paper text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto pr-2 bg-slate-50/50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
              {prev.essayText}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center justify-between">
              <span>Current Revised Draft</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 font-bold">
                Score: {currentReport.overallScore}
              </span>
            </div>
            <div className="font-serif-paper text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto pr-2 bg-white dark:bg-slate-950 p-3 rounded-xl border border-indigo-100 dark:border-indigo-950">
              {currentReport.essayText}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
