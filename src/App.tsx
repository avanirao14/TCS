import React, { useState, useEffect, useRef } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { EssayInputSection } from './components/EssayInputSection';
import { AgentPipelineTracker } from './components/AgentPipelineTracker';
import { FeedbackReport } from './components/FeedbackReport';
import { RevisionComparison } from './components/RevisionComparison';
import { RevisionHistoryView } from './components/RevisionHistoryView';
import { AccuracyEvaluationView } from './components/AccuracyEvaluationView';
import { ArchitectureView } from './components/ArchitectureView';
import { PrintReportModal } from './components/PrintReportModal';
import { 
  AnalysisOptions, 
  AgentProgress, 
  FullAnalysisReport, 
  SubmissionHistoryItem 
} from './types/essay';
import { SAMPLE_ESSAYS } from './data/sampleEssays';
import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';

const INITIAL_AGENTS: AgentProgress[] = [
  { key: 'segmenter', name: 'Segmenter Agent', role: 'Structural decomposition', status: 'idle' },
  { key: 'grammar', name: 'Grammar Agent', role: 'Conventions & syntax', status: 'idle' },
  { key: 'coherence', name: 'Coherence Agent', role: 'Flow & transitions', status: 'idle' },
  { key: 'argument', name: 'Argument Agent', role: 'Thesis, claims & logic', status: 'idle' },
  { key: 'originality', name: 'Originality Agent', role: 'Voice & cliché detection', status: 'idle' },
  { key: 'editor', name: 'Editor Agent', role: 'Holistic report synthesis', status: 'idle' },
];

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('essaylens-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('essaylens-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('essaylens-theme', 'light');
    }
  }, [isDark]);

  // Active navigation view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');

  // Teacher Review Mode
  const [teacherMode, setTeacherMode] = useState<boolean>(false);

  // Print Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Input state (defaults to Sample 1 Weak for instant demonstration)
  const defaultSample = SAMPLE_ESSAYS[0];
  const [essayText, setEssayText] = useState<string>(defaultSample.text);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(defaultSample.id);
  const [options, setOptions] = useState<AnalysisOptions>({
    gradeLevel: defaultSample.recommendedGrade,
    feedbackMode: 'Direct',
    languageStyle: 'Normal',
  });

  // Analysis Pipeline state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [agents, setAgents] = useState<AgentProgress[]>(INITIAL_AGENTS);
  const [currentStepMessage, setCurrentStepMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Report & Previous Report (for revision loop)
  const [currentReport, setCurrentReport] = useState<FullAnalysisReport | null>(null);
  const [previousReport, setPreviousReport] = useState<FullAnalysisReport | null>(null);

  // Submission History
  const [history, setHistory] = useState<SubmissionHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('essaylens-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('essaylens-history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage:', e);
    }
  }, [history]);

  // Audio Text-to-Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentReport) return;

    window.speechSynthesis.cancel();

    const textToSpeak = `Here is your EssayLens feedback summary. Overall score is ${currentReport.overallScore} out of 100, letter grade ${currentReport.letterGrade}. Teacher feedback: ${currentReport.encouragingTeacherSummary}. Your top strengths include: ${currentReport.topStrengths.join('. ')}. Areas for growth: ${currentReport.topImprovements.join('. ')}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Run the multi-agent analysis pipeline
  const handleAnalyze = async () => {
    if (!essayText || essayText.trim().split(/\s+/).filter(Boolean).length < 40) {
      setErrorMessage('Please provide an essay with at least 40-50 words for complete analysis.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    // Reset agent statuses
    setAgents([
      { key: 'segmenter', name: 'Segmenter Agent', role: 'Structural decomposition', status: 'running' },
      { key: 'grammar', name: 'Grammar Agent', role: 'Conventions & syntax', status: 'idle' },
      { key: 'coherence', name: 'Coherence Agent', role: 'Flow & transitions', status: 'idle' },
      { key: 'argument', name: 'Argument Agent', role: 'Thesis, claims & logic', status: 'idle' },
      { key: 'originality', name: 'Originality Agent', role: 'Voice & cliché detection', status: 'idle' },
      { key: 'editor', name: 'Editor Agent', role: 'Holistic report synthesis', status: 'idle' },
    ]);
    setCurrentStepMessage('Segmenter Agent: Parsing structural thesis, body, and conclusion blocks...');

    try {
      // Attempt SSE streaming first for live step-by-step progress
      const response = await fetch('/api/analyze-essay-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayText, options }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed, falling back to standard pipeline.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedFinalReport: FullAnalysisReport | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const matchEvent = block.match(/^event:\s*(.+)$/m);
          const matchData = block.match(/^data:\s*(.+)$/m);

          if (matchEvent && matchData) {
            const eventType = matchEvent[1].trim();
            let parsedData: any = null;
            try {
              parsedData = JSON.parse(matchData[1]);
            } catch {
              continue;
            }

            if (eventType === 'agent_start') {
              setAgents(prev => prev.map(a => a.key === parsedData.agent ? { ...a, status: 'running' } : a));
              setCurrentStepMessage(`${parsedData.name}: ${parsedData.role || 'Evaluating...'}`);
            } else if (eventType === 'agent_complete') {
              setAgents(prev => prev.map(a => a.key === parsedData.agent ? {
                ...a,
                status: 'completed',
                findingsCount: parsedData.findingsCount,
                durationMs: parsedData.durationMs,
              } : a));
            } else if (eventType === 'parallel_start') {
              setAgents(prev => prev.map(a =>
                ['grammar', 'coherence', 'argument', 'originality'].includes(a.key)
                  ? { ...a, status: 'running' }
                  : a
              ));
              setCurrentStepMessage('Running 4 specialist agents in parallel via Gemini 2.5 Flash...');
            } else if (eventType === 'pipeline_complete') {
              receivedFinalReport = parsedData;
            }
          }
        }
      }

      if (!receivedFinalReport) {
        // Fallback to standard POST
        const fallbackRes = await fetch('/api/analyze-essay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ essayText, options }),
        });
        if (!fallbackRes.ok) throw new Error('Analysis request failed.');
        receivedFinalReport = await fallbackRes.json();
      }

      if (!receivedFinalReport) {
        throw new Error('No final report received from analysis pipeline.');
      }

      // Mark all agents completed
      setAgents(prev => prev.map(a => ({ ...a, status: 'completed' })));
      setCurrentStepMessage('All 5 specialist agents and Editor synthesis completed.');

      // Save previous report for before/after comparison
      if (currentReport) {
        setPreviousReport(currentReport);
      }

      // Set active report
      setCurrentReport(receivedFinalReport);

      // Add to submission history
      const newVersion = history.length + 1;
      const historyItem: SubmissionHistoryItem = {
        id: receivedFinalReport.id,
        version: newVersion,
        timestamp: receivedFinalReport.timestamp,
        essayTitle: receivedFinalReport.essayTitle,
        essaySnippet: essayText.slice(0, 80) + '...',
        overallScore: receivedFinalReport.overallScore,
        rubricScores: {
          grammar: receivedFinalReport.rubricScores.grammar.score,
          coherence: receivedFinalReport.rubricScores.coherence.score,
          argumentStrength: receivedFinalReport.rubricScores.argumentStrength.score,
          originality: receivedFinalReport.rubricScores.originality.score,
        },
        wordCount: receivedFinalReport.wordCount,
        report: receivedFinalReport,
      };

      setHistory(prev => [...prev, historyItem]);

    } catch (err: any) {
      console.warn('API Stream failed, executing fallback analysis:', err);
      // Run direct POST
      try {
        const fallbackRes = await fetch('/api/analyze-essay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ essayText, options }),
        });
        if (!fallbackRes.ok) throw new Error('Analysis service unreachable.');
        const data: FullAnalysisReport = await fallbackRes.json();

        setAgents(prev => prev.map(a => ({ ...a, status: 'completed' })));
        if (currentReport) setPreviousReport(currentReport);
        setCurrentReport(data);

        const newVersion = history.length + 1;
        setHistory(prev => [
          ...prev,
          {
            id: data.id,
            version: newVersion,
            timestamp: data.timestamp,
            essayTitle: data.essayTitle,
            essaySnippet: essayText.slice(0, 80) + '...',
            overallScore: data.overallScore,
            rubricScores: {
              grammar: data.rubricScores.grammar.score,
              coherence: data.rubricScores.coherence.score,
              argumentStrength: data.rubricScores.argumentStrength.score,
              originality: data.rubricScores.originality.score,
            },
            wordCount: data.wordCount,
            report: data,
          },
        ]);
      } catch (postErr: any) {
        setErrorMessage('Failed to connect to the analysis engine. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler for applying an inline suggestion directly into the essay text
  const handleApplyFix = (originalSnippet: string, replacement: string) => {
    if (!originalSnippet || !replacement) return;
    setEssayText(prev => {
      if (prev.includes(originalSnippet)) {
        return prev.replace(originalSnippet, replacement);
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        teacherMode={teacherMode}
        setTeacherMode={setTeacherMode}
        hasActiveReport={!!currentReport}
        onPrintExport={() => setIsPrintModalOpen(true)}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        submissionCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* VIEW 1: FEEDBACK STUDIO */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="font-bold underline text-red-600 dark:text-red-400"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Essay Input Section */}
            <EssayInputSection
              essayText={essayText}
              setEssayText={setEssayText}
              options={options}
              setOptions={setOptions}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              selectedSampleId={selectedSampleId}
              setSelectedSampleId={setSelectedSampleId}
              hasRevisions={history.length > 0}
            />

            {/* Agent Live Progress Tracker (visible when analyzing or completed) */}
            {(isAnalyzing || currentReport) && (
              <AgentPipelineTracker
                agents={agents}
                isAnalyzing={isAnalyzing}
                currentStepMessage={currentStepMessage}
              />
            )}

            {/* Revision Comparison (if at least 2 revisions exist) */}
            {currentReport && previousReport && (
              <RevisionComparison
                currentReport={currentReport}
                previousReport={previousReport}
                history={history}
              />
            )}

            {/* Full Feedback Report */}
            {currentReport && (
              <FeedbackReport
                report={currentReport}
                onUpdateReport={(updated) => setCurrentReport(updated)}
                onApplyFix={handleApplyFix}
                isTeacherMode={teacherMode}
                onApproveAndExport={() => setIsPrintModalOpen(true)}
                isSpeaking={isSpeaking}
                onToggleSpeech={handleToggleSpeech}
              />
            )}

          </div>
        )}

        {/* VIEW 2: REVISION HISTORY */}
        {activeTab === 'history' && (
          <RevisionHistoryView
            history={history}
            currentReportId={currentReport?.id}
            onSelectReport={(rep) => {
              setCurrentReport(rep);
              setEssayText(rep.essayText);
              setActiveTab('studio');
            }}
            onNewEssay={() => setActiveTab('studio')}
          />
        )}

        {/* VIEW 3: ACCURACY & EVALUATION */}
        {activeTab === 'evaluation' && (
          <AccuracyEvaluationView />
        )}

        {/* VIEW 4: ARCHITECTURE & SCALABILITY */}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}

      </main>

      {/* Printable PDF Modal */}
      {isPrintModalOpen && currentReport && (
        <PrintReportModal
          report={currentReport}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>EssayLens</strong>: AI Essay Feedback Coach • TCS Technology Day
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Structured JSON Rubrics</span>
            <span>•</span>
            <span>No Student PII Stored</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
