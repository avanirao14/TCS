import React from 'react';
import { 
  History, 
  TrendingUp, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Sparkles,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { SubmissionHistoryItem, FullAnalysisReport } from '../types/essay';

interface RevisionHistoryViewProps {
  history: SubmissionHistoryItem[];
  currentReportId?: string;
  onSelectReport: (report: FullAnalysisReport) => void;
  onNewEssay: () => void;
}

export const RevisionHistoryView: React.FC<RevisionHistoryViewProps> = ({
  history,
  currentReportId,
  onSelectReport,
  onNewEssay
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <History className="w-12 h-12 text-indigo-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          No Essay Submissions Yet
        </h3>
        <p className="text-xs text-slate-500">
          Once you analyze an essay, your revision versions and score progression over time will be tracked here with interactive trend lines.
        </p>
        <button
          onClick={onNewEssay}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          Go to Feedback Studio
        </button>
      </div>
    );
  }

  // Format data for Recharts Line Chart
  const chartData = history.map((item, index) => ({
    name: `v${item.version}`,
    timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    overall: item.overallScore,
    grammar: Math.round(item.rubricScores.grammar * 25), // scaled to 100 for easy visual alignment
    coherence: Math.round(item.rubricScores.coherence * 25),
    argument: Math.round(item.rubricScores.argumentStrength * 25),
    originality: Math.round(item.rubricScores.originality * 25),
    rawItem: item
  }));

  const initialScore = history[0]?.overallScore || 0;
  const latestScore = history[history.length - 1]?.overallScore || 0;
  const totalGrowth = latestScore - initialScore;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Essay Score Trajectory & Growth Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Tracking {history.length} revision drafts over time. Scores reflect standard multi-agent rubric evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Total Growth</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {totalGrowth >= 0 ? `+${totalGrowth}` : totalGrowth} pts
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Current Best</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {Math.max(...history.map(h => h.overallScore))} pts
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            Progression Over Revision Rounds (0 to 100 Scale)
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="overall"
                  name="Overall Score"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="grammar"
                  name="Grammar (scaled)"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="coherence"
                  name="Coherence (scaled)"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="argument"
                  name="Argument (scaled)"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Items List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          Submission Version Archives
        </h3>

        <div className="space-y-3">
          {history.map((item) => {
            const isSelected = item.report.id === currentReportId;

            return (
              <div
                key={item.id}
                onClick={() => onSelectReport(item.report)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-700 shadow-xs ring-1 ring-indigo-400/20'
                    : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                      Draft v{item.version}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                      {item.essayTitle}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic font-serif-paper">
                    "{item.essaySnippet}"
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>{item.wordCount} words</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {item.overallScore} / 100
                    </div>
                    <div className="text-[10px] text-slate-400">
                      G: {item.rubricScores.grammar.toFixed(1)} • C: {item.rubricScores.coherence.toFixed(1)} • A: {item.rubricScores.argumentStrength.toFixed(1)}
                    </div>
                  </div>

                  <button className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
