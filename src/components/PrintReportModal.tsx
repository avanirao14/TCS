import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Award, 
  GraduationCap, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { FullAnalysisReport } from '../types/essay';

interface PrintReportModalProps {
  report: FullAnalysisReport;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ report, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const md = `# EssayLens Evaluation Report: ${report.essayTitle}
**Date:** ${new Date(report.timestamp).toLocaleDateString()}
**Grade Level:** ${report.options.gradeLevel}
**Feedback Mode:** ${report.options.feedbackMode}
**Word Count:** ${report.wordCount} words

---

## 🏆 Overall Composite Score: ${report.overallScore} / 100 (Grade ${report.letterGrade})

### 📊 Rubric Breakdown (Scale 1.0 - 4.0):
- **Grammar & Mechanics:** ${report.rubricScores.grammar.score} / 4.0 (${report.rubricScores.grammar.level})
  *Justification:* ${report.rubricScores.grammar.justification}
- **Coherence & Transitions:** ${report.rubricScores.coherence.score} / 4.0 (${report.rubricScores.coherence.level})
  *Justification:* ${report.rubricScores.coherence.justification}
- **Argument Strength & Rhetoric:** ${report.rubricScores.argumentStrength.score} / 4.0 (${report.rubricScores.argumentStrength.level})
  *Justification:* ${report.rubricScores.argumentStrength.justification}
- **Originality & Voice:** ${report.rubricScores.originality.score} / 4.0 (${report.rubricScores.originality.level})
  *Justification:* ${report.rubricScores.originality.justification}

---

## 🌟 Top 3 Core Strengths:
1. ${report.topStrengths[0] || 'N/A'}
2. ${report.topStrengths[1] || 'N/A'}
3. ${report.topStrengths[2] || 'N/A'}

## 🎯 Top 3 Areas for Growth:
1. ${report.topImprovements[0] || 'N/A'}
2. ${report.topImprovements[1] || 'N/A'}
3. ${report.topImprovements[2] || 'N/A'}

---

## 👩‍🏫 Encouraging Teacher Summary:
"${report.encouragingTeacherSummary}"

${report.teacherNotes ? `\n**Personalized Teacher Note:**\n${report.teacherNotes}\n` : ''}

---

## 📝 Original Essay Text:
${report.essayText}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EssayLens-Report-${report.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 relative">
        
        {/* Modal Top Actions (no-print) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Official Essay Evaluation Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Print or export to PDF formatted for academic records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Markdown
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SHEET CONTAINER */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-slate-900 dark:text-slate-100 print:bg-white print:border-none print:p-0">
          
          {/* Academic Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-200 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <span className="text-lg font-black tracking-tight">EssayLens Academic Report</span>
              </div>
              <p className="text-xs text-slate-500">
                Automated Pedagogical Assessment • TCS Technology Day Edition
              </p>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div><strong>Date:</strong> {new Date(report.timestamp).toLocaleDateString()}</div>
              <div><strong>Target Grade:</strong> {report.options.gradeLevel}</div>
              <div><strong>Word Count:</strong> {report.wordCount} words</div>
            </div>
          </div>

          {/* Title & Score Summary */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Essay Title</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {report.essayTitle}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {report.overallScore}
              </span>
              <span className="text-xs font-bold text-slate-400"> / 100 (Grade {report.letterGrade})</span>
            </div>
          </div>

          {/* 4 Rubric Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-500 block mb-1">Grammar</span>
              <div className="text-base font-black text-red-600 dark:text-red-400">
                {report.rubricScores.grammar.score.toFixed(1)} / 4.0
              </div>
              <span className="text-[10px] text-slate-400">{report.rubricScores.grammar.level}</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-500 block mb-1">Coherence</span>
              <div className="text-base font-black text-blue-600 dark:text-blue-400">
                {report.rubricScores.coherence.score.toFixed(1)} / 4.0
              </div>
              <span className="text-[10px] text-slate-400">{report.rubricScores.coherence.level}</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-500 block mb-1">Argument</span>
              <div className="text-base font-black text-orange-600 dark:text-orange-400">
                {report.rubricScores.argumentStrength.score.toFixed(1)} / 4.0
              </div>
              <span className="text-[10px] text-slate-400">{report.rubricScores.argumentStrength.level}</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-500 block mb-1">Originality</span>
              <div className="text-base font-black text-purple-600 dark:text-purple-400">
                {report.rubricScores.originality.score.toFixed(1)} / 4.0
              </div>
              <span className="text-[10px] text-slate-400">{report.rubricScores.originality.level}</span>
            </div>
          </div>

          {/* Teacher Summary Note */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Educator Feedback Summary
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-serif-paper leading-relaxed italic">
              "{report.encouragingTeacherSummary}"
            </p>
            {report.teacherNotes && (
              <div className="mt-2 text-xs font-medium text-amber-900 dark:text-amber-200 pt-2 border-t border-slate-100 dark:border-slate-800">
                <strong>Teacher Addendum:</strong> {report.teacherNotes}
              </div>
            )}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                {report.topStrengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Priority Next Steps
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                {report.topImprovements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {/* Teacher Sign-off Footer */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span>Instructor / Reviewer Signature: ___________________________</span>
            </div>
            <div>
              <span>Date: ________________</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
