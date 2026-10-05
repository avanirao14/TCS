import React, { useState } from 'react';
import { 
  UserCheck, 
  Check, 
  X, 
  Edit3, 
  Save, 
  Sparkles, 
  FileCheck, 
  Send,
  AlertCircle
} from 'lucide-react';
import { FullAnalysisReport, InlineAnnotation } from '../types/essay';

interface TeacherReviewPanelProps {
  report: FullAnalysisReport;
  onUpdateReport: (updated: FullAnalysisReport) => void;
  onApproveAndExport: () => void;
}

export const TeacherReviewPanel: React.FC<TeacherReviewPanelProps> = ({
  report,
  onUpdateReport,
  onApproveAndExport
}) => {
  const [overallScore, setOverallScore] = useState<number>(report.overallScore);
  const [teacherNotes, setTeacherNotes] = useState<string>(report.teacherNotes || '');
  const [grammarScore, setGrammarScore] = useState<number>(report.rubricScores.grammar.score);
  const [coherenceScore, setCoherenceScore] = useState<number>(report.rubricScores.coherence.score);
  const [argumentScore, setArgumentScore] = useState<number>(report.rubricScores.argumentStrength.score);
  const [originalityScore, setOriginalityScore] = useState<number>(report.rubricScores.originality.score);
  const [approvedAnnotations, setApprovedAnnotations] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    report.inlineAnnotations.forEach(a => {
      map[a.id] = a.approvedByTeacher !== false;
    });
    return map;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleAnnotationApproval = (id: string) => {
    setApprovedAnnotations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveChanges = () => {
    const updatedAnnotations = report.inlineAnnotations.map(a => ({
      ...a,
      approvedByTeacher: approvedAnnotations[a.id] ?? true
    }));

    const updated: FullAnalysisReport = {
      ...report,
      overallScore,
      teacherNotes,
      teacherApproved: true,
      rubricScores: {
        ...report.rubricScores,
        grammar: { ...report.rubricScores.grammar, score: grammarScore },
        coherence: { ...report.rubricScores.coherence, score: coherenceScore },
        argumentStrength: { ...report.rubricScores.argumentStrength, score: argumentScore },
        originality: { ...report.rubricScores.originality, score: originalityScore },
      },
      inlineAnnotations: updatedAnnotations
    };

    onUpdateReport(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-5">
      
      {/* Teacher Mode Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Human-in-the-Loop: Teacher Review & Calibration
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Teacher Authority
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Review, edit, or adjust AI scoring and pedagogical suggestions before releasing the feedback to the student.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-indigo-500" />
            {savedSuccess ? 'Changes Saved!' : 'Save Adjustments'}
          </button>

          <button
            type="button"
            onClick={() => {
              handleSaveChanges();
              onApproveAndExport();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Approve & Export
          </button>
        </div>
      </div>

      {/* Score Overrides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        
        {/* Overall Score Override */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:col-span-1 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Overall Score (0-100)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={overallScore}
              onChange={(e) => setOverallScore(Number(e.target.value))}
              className="w-full text-center text-xl font-black p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400"
            />
          </div>
          <span className="text-[10px] text-slate-400 block text-center">
            AI suggested: {report.overallScore}
          </span>
        </div>

        {/* 4 Rubric Sliders / Inputs */}
        {[
          { label: 'Grammar', val: grammarScore, set: setGrammarScore, raw: report.rubricScores.grammar.score },
          { label: 'Coherence', val: coherenceScore, set: setCoherenceScore, raw: report.rubricScores.coherence.score },
          { label: 'Argument', val: argumentScore, set: setArgumentScore, raw: report.rubricScores.argumentStrength.score },
          { label: 'Originality', val: originalityScore, set: setOriginalityScore, raw: report.rubricScores.originality.score },
        ].map((dim, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
              <span>{dim.label}</span>
              <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                {dim.val.toFixed(1)} / 4
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={0.1}
              value={dim.val}
              onChange={(e) => dim.set(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>1: Emerging</span>
              <span>4: Advanced</span>
            </div>
          </div>
        ))}

      </div>

      {/* Teacher Personalized Notes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-amber-500" />
          Teacher Personalized Comments & Conference Notes:
        </label>
        <textarea
          value={teacherNotes}
          onChange={(e) => setTeacherNotes(e.target.value)}
          placeholder="Add personalized notes for this student (e.g. 'Great improvement since draft 1! For our 1-on-1 conference, let us discuss revising the evidence in paragraph 2.')..."
          rows={3}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Review & Approve Individual AI Suggestions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Approve / Dismiss AI Suggestions
            </h4>
            <p className="text-[11px] text-slate-500">
              Dismiss any AI suggestion you feel does not apply to this student.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {Object.values(approvedAnnotations).filter(Boolean).length} of {report.inlineAnnotations.length} Approved
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1 space-y-1">
          {report.inlineAnnotations.map((anno) => {
            const isApproved = approvedAnnotations[anno.id] ?? true;

            return (
              <div
                key={anno.id}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors ${
                  isApproved
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    : 'opacity-40 bg-slate-100/60 dark:bg-slate-800/40 line-through'
                }`}
              >
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase text-[10px] text-slate-500">
                      [{anno.category}]
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {anno.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    "{anno.originalSnippet}" → {anno.comment}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAnnotationApproval(anno.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isApproved ? (
                    <>
                      <Check className="w-3 h-3" /> Approved
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" /> Dismissed
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
