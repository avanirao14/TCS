import React, { useState } from 'react';
import { 
  HelpCircle, 
  Lightbulb, 
  Send, 
  CheckCircle, 
  MessageSquareQuote,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SocraticQuestionItem } from '../types/essay';

interface SocraticCoachViewProps {
  questions: SocraticQuestionItem[];
  onReflectionSubmit?: (questionId: string, answer: string) => void;
}

export const SocraticCoachView: React.FC<SocraticCoachViewProps> = ({
  questions,
  onReflectionSubmit
}) => {
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string>(questions[0]?.id || '');

  const handleChange = (id: string, text: string) => {
    setReflections(prev => ({ ...prev, [id]: text }));
  };

  const handleSubmit = (id: string) => {
    if (!reflections[id] || reflections[id].trim().length < 10) return;
    setSubmittedIds(prev => new Set([...prev, id]));
    if (onReflectionSubmit) {
      onReflectionSubmit(id, reflections[id]);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Intro banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 dark:border-blue-800/80 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-md">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            Socratic Inquiry Mode: Self-Guided Growth
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            Rather than just correcting words for you, your AI coach asks targeted questions to guide you toward deeper critical thinking. Answer these 5 prompts to formulate revisions in your own authentic voice.
          </p>
        </div>
      </div>

      {/* 5 Socratic Question Cards */}
      <div className="space-y-3">
        {questions.map((item, index) => {
          const isSubmitted = submittedIds.has(item.id);
          const isExpanded = expandedId === item.id;
          const currentText = reflections[item.id] || '';

          return (
            <div
              key={item.id || `sq-${index}`}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isSubmitted
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : item.id)}
                className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.focusArea}
                      </span>
                      {isSubmitted && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Answered
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.question}
                    </h4>
                  </div>
                </div>

                <button className="text-slate-400 p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expandable Coach Prompt & Student Response Box */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3.5 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Guiding tip */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Coach Guidance: </span>
                      {item.guidingTip}
                    </div>
                  </div>

                  {/* Student input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Your Reflection or Draft Sentence Revision:
                    </label>
                    <textarea
                      value={currentText}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      placeholder="Write your thought, revised sentence, or evidence idea here..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {currentText.trim().split(/\s+/).filter(Boolean).length} words
                      </span>

                      <button
                        type="button"
                        onClick={() => handleSubmit(item.id)}
                        disabled={currentText.trim().length < 10}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          currentText.trim().length < 10
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        {isSubmitted ? 'Update Reflection' : 'Save Reflection'}
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
