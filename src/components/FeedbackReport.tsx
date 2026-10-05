import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ListChecks, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  GitFork, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  UserCheck, 
  Check, 
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { FullAnalysisReport, InlineAnnotation, NextStepTask } from '../types/essay';
import { InlineHighlightedEssay } from './InlineHighlightedEssay';
import { ArgumentMap } from './ArgumentMap';
import { SocraticCoachView } from './SocraticCoachView';
import { TeacherReviewPanel } from './TeacherReviewPanel';

interface FeedbackReportProps {
  report: FullAnalysisReport;
  onUpdateReport: (updated: FullAnalysisReport) => void;
  onApplyFix: (originalSnippet: string, replacement: string) => void;
  isTeacherMode: boolean;
  onApproveAndExport: () => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

export type ReportSubTab = 'overview' | 'inline' | 'argument-map' | 'socratic' | 'checklist' | 'teacher';

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  report,
  onUpdateReport,
  onApplyFix,
  isTeacherMode,
  onApproveAndExport,
  isSpeaking,
  onToggleSpeech
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>('overview');
  const [checklist, setChecklist] = useState<NextStepTask[]>(report.nextStepsChecklist || []);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  // Recharts radar data for the 4 skills
  const radarData = [
    {
      skill: 'Grammar',
      score: report.rubricScores.grammar.score,
      fullMark: 4,
    },
    {
      skill: 'Coherence',
      score: report.rubricScores.coherence.score,
      fullMark: 4,
    },
    {
      skill: 'Argument',
      score: report.rubricScores.argumentStrength.score,
      fullMark: 4,
    },
    {
      skill: 'Originality',
      score: report.rubricScores.originality.score,
      fullMark: 4,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-600 text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'from-blue-500 to-indigo-600 text-blue-600 dark:text-blue-400';
    if (score >= 55) return 'from-amber-500 to-orange-600 text-amber-600 dark:text-amber-400';
    return 'from-rose-500 to-red-600 text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Score Banner */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors">
        
        {/* Soft decorative background glows */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left: Overall Score Dial */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border border-slate-700/60 p-1 flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-500/15">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Overall Score
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {report.overallScore}
                </span>
                <span className="text-[11px] font-extrabold text-indigo-400">
                  Grade {report.letterGrade}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {report.options.gradeLevel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {report.options.feedbackMode} Mode
                </span>
                {report.teacherApproved && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Teacher Verified
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {report.essayTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {report.wordCount} words • ~{report.readingTimeMinutes} min reading time • Analyzed at {new Date(report.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Right: Audio Text-to-Speech Player */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={onToggleSpeech}
              className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                isSpeaking
                  ? 'bg-rose-500 text-white shadow-md animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              }`}
            >
              {isSpeaking ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isSpeaking ? 'Stop Audio Feedback' : 'Listen to Coach Summary'}</span>
            </button>
          </div>

        </div>

        {/* Teacher Personalized Summary Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Encouraging Teacher Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-paper">
              "{report.encouragingTeacherSummary}"
            </p>
            {report.teacherNotes && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">Teacher Note: </span> {report.teacherNotes}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'overview', label: 'Rubric & Strengths', icon: Award },
          { key: 'inline', label: `Inline Highlights (${report.inlineAnnotations.length})`, icon: FileText },
          { key: 'argument-map', label: 'Interactive Argument Map', icon: GitFork },
          { key: 'socratic', label: `Socratic Inquiry (5 Questions)`, icon: HelpCircle },
          { key: 'checklist', label: `Next Steps Checklist (${checklist.filter(c => c.completed).length}/${checklist.length})`, icon: ListChecks },
          ...(isTeacherMode ? [{ key: 'teacher', label: 'Teacher Review Panel', icon: UserCheck }] : [])
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as ReportSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. OVERVIEW & RUBRIC */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Radar Chart + 4 Rubric Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recharts Radar Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
                Competency Radar Profile (1 to 4)
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 4]} 
                      tick={{ fill: '#94a3b8', fontSize: 9 }}
                    />
                    <Radar
                      name="Student Score"
                      dataKey="score"
                      stroke="#4f46e5"
                      fill="#6366f1"
                      fillOpacity={0.45}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderRadius: '8px', 
                        color: '#fff',
                        fontSize: '11px',
                        border: 'none'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] text-slate-400 text-center mt-1">
                Calibrated against standard secondary writing benchmarks
              </div>
            </div>

            {/* 4 Rubric Dimension Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { 
                  name: 'Grammar & Conventions', 
                  dim: report.rubricScores.grammar, 
                  color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
                  badge: 'bg-red-500'
                },
                { 
                  name: 'Coherence & Flow', 
                  dim: report.rubricScores.coherence, 
                  color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
                  badge: 'bg-blue-500'
                },
                { 
                  name: 'Argument & Logic', 
                  dim: report.rubricScores.argumentStrength, 
                  color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
                  badge: 'bg-orange-500'
                },
                { 
                  name: 'Originality & Voice', 
                  dim: report.rubricScores.originality, 
                  color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
                  badge: 'bg-purple-500'
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {item.dim.score.toFixed(1)} / 4.0
                      </span>
                      <span className={`text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded-full ${item.badge}`}>
                        {item.dim.level}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.dim.justification}
                  </p>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.badge}`}
                      style={{ width: `${(item.dim.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Top 3 Strengths & Top 3 Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Strengths */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Top 3 Core Strengths
              </h3>
              <ul className="space-y-2.5">
                {report.topStrengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Improvements */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Top 3 Priority Growth Areas
              </h3>
              <ul className="space-y-2.5">
                {report.topImprovements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* 2. INLINE HIGHLIGHTED ESSAY */}
      {activeSubTab === 'inline' && (
        <InlineHighlightedEssay
          essayText={report.essayText}
          annotations={report.inlineAnnotations}
          isSocraticMode={report.options.feedbackMode === 'Socratic'}
          onApplyFix={onApplyFix}
          onSelectSocraticQuestion={() => setActiveSubTab('socratic')}
        />
      )}

      {/* 3. ARGUMENT MAP */}
      {activeSubTab === 'argument-map' && (
        <ArgumentMap argumentData={report.argument} />
      )}

      {/* 4. SOCRATIC COACH VIEW */}
      {activeSubTab === 'socratic' && (
        <SocraticCoachView questions={report.socraticQuestions} />
      )}

      {/* 5. CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-indigo-500" />
                Actionable Next Steps Revision Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Check off items as you revise your draft to systematically elevate your essay score.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
              {checklist.filter(c => c.completed).length} / {checklist.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-400 line-through'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {item.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold">{item.task}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm ${
                    item.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                    item.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {item.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TEACHER REVIEW PANEL */}
      {activeSubTab === 'teacher' && isTeacherMode && (
        <TeacherReviewPanel
          report={report}
          onUpdateReport={onUpdateReport}
          onApproveAndExport={onApproveAndExport}
        />
      )}

    </div>
  );
};
