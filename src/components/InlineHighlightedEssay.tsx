import React, { useState, useMemo } from 'react';
import { 
  Check, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  X, 
  SlidersHorizontal,
  SpellCheck,
  GitMerge,
  ShieldAlert,
  Lightbulb
} from 'lucide-react';
import { InlineAnnotation } from '../types/essay';

interface InlineHighlightedEssayProps {
  essayText: string;
  annotations: InlineAnnotation[];
  isSocraticMode?: boolean;
  onApplyFix?: (originalSnippet: string, replacement: string) => void;
  onSelectSocraticQuestion?: (prompt: string) => void;
}

type CategoryFilter = 'all' | 'grammar' | 'coherence' | 'argument' | 'originality';

export const InlineHighlightedEssay: React.FC<InlineHighlightedEssayProps> = ({
  essayText,
  annotations,
  isSocraticMode,
  onApplyFix,
  onSelectSocraticQuestion
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedAnnotation, setSelectedAnnotation] = useState<InlineAnnotation | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());

  // Filter annotations based on active pill
  const filteredAnnotations = useMemo(() => {
    if (activeCategory === 'all') return annotations;
    return annotations.filter(a => a.category === activeCategory);
  }, [annotations, activeCategory]);

  // Counts by category
  const counts = useMemo(() => {
    return {
      all: annotations.length,
      grammar: annotations.filter(a => a.category === 'grammar').length,
      coherence: annotations.filter(a => a.category === 'coherence').length,
      argument: annotations.filter(a => a.category === 'argument').length,
      originality: annotations.filter(a => a.category === 'originality').length,
    };
  }, [annotations]);

  const handleApply = (anno: InlineAnnotation) => {
    if (!anno.suggestedFix || !onApplyFix) return;
    onApplyFix(anno.originalSnippet, anno.suggestedFix);
    setAppliedFixes(prev => new Set([...prev, anno.id]));
    setSelectedAnnotation(null);
  };

  // Build segmented text blocks with inline highlights
  const renderedContent = useMemo(() => {
    if (!essayText) return null;

    // Find occurrences of valid snippets in text
    interface HighlightRange {
      start: number;
      end: number;
      annotation: InlineAnnotation;
    }

    const ranges: HighlightRange[] = [];

    filteredAnnotations.forEach((anno) => {
      const snippet = anno.originalSnippet.trim();
      if (!snippet || snippet.length < 3) return;

      let startIndex = 0;
      const lowerEssay = essayText.toLowerCase();
      const lowerSnippet = snippet.toLowerCase();

      while (startIndex < essayText.length) {
        const found = lowerEssay.indexOf(lowerSnippet, startIndex);
        if (found === -1) break;

        // Check if overlaps with existing range
        const overlaps = ranges.some(
          r => (found >= r.start && found < r.end) || (found + snippet.length > r.start && found + snippet.length <= r.end)
        );

        if (!overlaps) {
          ranges.push({
            start: found,
            end: found + snippet.length,
            annotation: anno
          });
          break; // First occurrence
        }
        startIndex = found + 1;
      }
    });

    // Sort ranges by start position
    ranges.sort((a, b) => a.start - b.start);

    // Slice essay text into pieces
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    ranges.forEach((range, idx) => {
      // Unhighlighted text before this highlight
      if (range.start > lastIdx) {
        elements.push(
          <span key={`text-${lastIdx}-${idx}`}>
            {essayText.slice(lastIdx, range.start)}
          </span>
        );
      }

      // Highlighted span
      const anno = range.annotation;
      const snippetText = essayText.slice(range.start, range.end);
      const isApplied = appliedFixes.has(anno.id);

      const colorClass = 
        anno.category === 'grammar' ? 'highlight-grammar' :
        anno.category === 'coherence' ? 'highlight-coherence' :
        anno.category === 'argument' ? 'highlight-argument' : 'highlight-originality';

      elements.push(
        <mark
          key={`highlight-${anno.id}-${range.start}`}
          onClick={() => setSelectedAnnotation(anno)}
          className={`${colorClass} ${isApplied ? 'opacity-50 line-through' : ''} inline cursor-pointer select-text`}
          title={`${anno.title}: ${anno.comment}`}
        >
          {snippetText}
        </mark>
      );

      lastIdx = range.end;
    });

    // Remaining trailing text
    if (lastIdx < essayText.length) {
      elements.push(
        <span key={`text-end-${lastIdx}`}>
          {essayText.slice(lastIdx)}
        </span>
      );
    }

    return elements;
  }, [essayText, filteredAnnotations, appliedFixes]);

  return (
    <div className="space-y-4">
      
      {/* Category Filter Pills & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            All Suggestions ({counts.all})
          </button>

          <button
            onClick={() => setActiveCategory('grammar')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'grammar'
                ? 'bg-red-500 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <SpellCheck className="w-3.5 h-3.5" />
            Grammar ({counts.grammar})
          </button>

          <button
            onClick={() => setActiveCategory('coherence')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'coherence'
                ? 'bg-blue-500 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            Coherence ({counts.coherence})
          </button>

          <button
            onClick={() => setActiveCategory('argument')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'argument'
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Argument ({counts.argument})
          </button>

          <button
            onClick={() => setActiveCategory('originality')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'originality'
                ? 'bg-purple-500 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Originality ({counts.originality})
          </button>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
          Click any highlighted text to view coach suggestions
        </div>

      </div>

      {/* Main Paper Viewer */}
      <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="font-serif-paper text-slate-900 dark:text-slate-100 text-lg leading-relaxed whitespace-pre-line select-text">
          {renderedContent}
        </div>

        {/* Selected Annotation Inspector Popover / Card */}
        {selectedAnnotation && (
          <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/95 dark:bg-slate-900/95 shadow-xl transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white ${
                  selectedAnnotation.category === 'grammar' ? 'bg-red-500' :
                  selectedAnnotation.category === 'coherence' ? 'bg-blue-500' :
                  selectedAnnotation.category === 'argument' ? 'bg-orange-500' : 'bg-purple-500'
                }`}>
                  {selectedAnnotation.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {selectedAnnotation.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedAnnotation(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {selectedAnnotation.comment}
            </p>

            {/* Direct Fix vs Socratic Question */}
            {isSocraticMode && selectedAnnotation.socraticPrompt ? (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Socratic Guiding Question
                </div>
                <p className="text-blue-800 dark:text-blue-200">
                  {selectedAnnotation.socraticPrompt}
                </p>
                {onSelectSocraticQuestion && (
                  <button
                    onClick={() => onSelectSocraticQuestion(selectedAnnotation.socraticPrompt!)}
                    className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Answer in Socratic Reflection Studio <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : selectedAnnotation.suggestedFix ? (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                    Suggested Replacement:
                  </span>
                  <div className="font-mono-code text-[11px] text-emerald-800 dark:text-emerald-200 mt-0.5 bg-emerald-100/60 dark:bg-emerald-900/60 px-2 py-1 rounded-sm">
                    "{selectedAnnotation.suggestedFix}"
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(selectedAnnotation)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Fix to Draft
                </button>
              </div>
            ) : null}
          </div>
        )}

      </div>

    </div>
  );
};
