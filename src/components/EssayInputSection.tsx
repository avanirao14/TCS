import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  GraduationCap, 
  BookMarked, 
  Globe2, 
  AlertCircle,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AnalysisOptions, GradeLevel, FeedbackMode, LanguageStyle } from '../types/essay';
import { SAMPLE_ESSAYS, SampleEssay } from '../data/sampleEssays';

interface EssayInputSectionProps {
  essayText: string;
  setEssayText: (text: string) => void;
  options: AnalysisOptions;
  setOptions: React.Dispatch<React.SetStateAction<AnalysisOptions>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  selectedSampleId: string;
  setSelectedSampleId: (id: string) => void;
  hasRevisions?: boolean;
}

export const EssayInputSection: React.FC<EssayInputSectionProps> = ({
  essayText,
  setEssayText,
  options,
  setOptions,
  onAnalyze,
  isAnalyzing,
  selectedSampleId,
  setSelectedSampleId,
  hasRevisions
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Compute metrics
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = essayText.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSelectSample = (sample: SampleEssay) => {
    setSelectedSampleId(sample.id);
    setEssayText(sample.text);
    setOptions(prev => ({
      ...prev,
      gradeLevel: sample.recommendedGrade
    }));
    setDropdownOpen(false);
  };

  const handleClear = () => {
    setEssayText('');
    setSelectedSampleId('');
  };

  const isValidLength = wordCount >= 40;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      
      {/* Top Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Sample Essay Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Load Benchmark Sample Essay
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full sm:w-80 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-2xs text-left"
              >
                <div className="flex items-center gap-2 truncate">
                  <BookMarked className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">
                    {selectedSampleId 
                      ? SAMPLE_ESSAYS.find(s => s.id === selectedSampleId)?.title 
                      : 'Choose a sample essay (Weak, Avg, Strong)...'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-84 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 p-1.5 space-y-1">
                  {SAMPLE_ESSAYS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                        selectedSampleId === sample.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {sample.title}
                        </span>
                        <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-sm ${
                          sample.tier === 'weak'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : sample.tier === 'average'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {sample.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {sample.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {wordCount}
              </span> words
            </div>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {charCount}
              </span> chars
            </div>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              ~<span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {estimatedReadTime}
              </span> min read
            </div>
            {essayText.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-red-500 text-xs font-medium ml-1 transition-colors"
                title="Clear essay text"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Options Row (Grade level, Feedback mode, Language style) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          
          {/* Grade Level */}
          <div>
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              Target Grade Level
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['Middle School', 'High School', 'College'] as GradeLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setOptions({ ...options, gradeLevel: level })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    options.gradeLevel === level
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {level.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Mode */}
          <div>
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              Pedagogical Mode
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['Direct', 'Socratic'] as FeedbackMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setOptions({ ...options, feedbackMode: mode })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    options.feedbackMode === mode
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {mode === 'Direct' ? 'Direct Fixes' : 'Socratic Inquiry'}
                </button>
              ))}
            </div>
          </div>

          {/* Language Style */}
          <div>
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
              Language Style
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['Normal', 'Simple English (ESL)'] as LanguageStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setOptions({ ...options, languageStyle: style })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    options.languageStyle === style
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {style.includes('ESL') ? 'ESL Accessible' : 'Standard'}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Main Text Area / Essay Workspace */}
      <div className="p-4 sm:p-6 space-y-3">
        <div className="relative">
          <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Type, write, or paste the student's essay here (or load one of the synthetic benchmark essays above)..."
            rows={12}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-serif-paper text-base leading-relaxed placeholder:font-sans placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-y shadow-inner"
          />
        </div>

        {/* Action Button & Disclaimer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {isValidLength
                ? 'Ready for multi-agent synthesis. All analysis is private; no personal data stored.'
                : 'Please provide at least 40-50 words for meaningful multi-agent analysis.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !isValidLength}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              isAnalyzing || !isValidLength
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Running Specialist Agents...</span>
              </>
            ) : hasRevisions ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Analyze Revised Draft</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Essay with Multi-Agent AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  );
};
