import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  History, 
  BarChart3, 
  Cpu, 
  Sun, 
  Moon, 
  GraduationCap, 
  UserCheck, 
  Volume2, 
  VolumeX,
  FileDown
} from 'lucide-react';

export type ActiveTab = 'studio' | 'history' | 'evaluation' | 'architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  teacherMode: boolean;
  setTeacherMode: (val: boolean) => void;
  hasActiveReport: boolean;
  onPrintExport?: () => void;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
  submissionCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  teacherMode,
  setTeacherMode,
  hasActiveReport,
  onPrintExport,
  isSpeaking,
  onToggleSpeech,
  submissionCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('studio')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 dark:from-indigo-400 dark:via-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
                EssayLens
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                AI Coach
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              TCS Education • Automated Pedagogical Feedback
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Feedback Studio
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Revisions
            {submissionCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500 text-white font-bold">
                {submissionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'evaluation'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Accuracy & Rubric
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Scalability
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          
          {/* Audio TTS Button */}
          {hasActiveReport && onToggleSpeech && (
            <button
              onClick={onToggleSpeech}
              title={isSpeaking ? "Pause Audio Summary" : "Listen to Audio Summary"}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                isSpeaking
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Speaking' : 'Listen'}</span>
            </button>
          )}

          {/* Export / Print Button */}
          {hasActiveReport && onPrintExport && (
            <button
              onClick={onPrintExport}
              title="Print or Export PDF"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Teacher Review Mode Toggle */}
          <div className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <button
              onClick={() => setTeacherMode(!teacherMode)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-all ${
                teacherMode
                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                  : 'text-amber-800 dark:text-amber-300 hover:text-amber-900'
              }`}
              title="Human-in-the-loop: Teacher review & editing"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Teacher Mode</span>
            </button>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center py-1 px-2 rounded font-medium ${
            activeTab === 'studio' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          Studio
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center py-1 px-2 rounded font-medium ${
            activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <History className="w-4 h-4 mb-0.5" />
          Revisions
        </button>
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`flex flex-col items-center py-1 px-2 rounded font-medium ${
            activeTab === 'evaluation' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          Accuracy
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex flex-col items-center py-1 px-2 rounded font-medium ${
            activeTab === 'architecture' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Cpu className="w-4 h-4 mb-0.5" />
          Scalability
        </button>
      </div>
    </header>
  );
};
