export type GradeLevel = 'Middle School' | 'High School' | 'College';
export type FeedbackMode = 'Direct' | 'Socratic';
export type LanguageStyle = 'Normal' | 'Simple English (ESL)';

export interface AnalysisOptions {
  gradeLevel: GradeLevel;
  feedbackMode: FeedbackMode;
  languageStyle: LanguageStyle;
}

export type AgentKey = 'segmenter' | 'grammar' | 'coherence' | 'argument' | 'originality' | 'editor';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface AgentProgress {
  key: AgentKey;
  name: string;
  role: string;
  status: AgentStatus;
  detail?: string;
  findingsCount?: number;
  durationMs?: number;
}

export interface SegmenterParagraph {
  index: number;
  role: 'introduction' | 'body' | 'conclusion';
  topicSentence: string;
  text: string;
  purpose: string;
}

export interface SegmenterResult {
  introduction: string;
  thesis: string;
  bodyParagraphs: SegmenterParagraph[];
  conclusion: string;
  summary: string;
}

export interface GrammarIssue {
  id: string;
  originalText: string;
  correctedText: string;
  ruleExplanation: string;
  category: 'spelling' | 'punctuation' | 'subject-verb agreement' | 'tense consistency' | 'syntax' | 'word choice';
  severity: 'minor' | 'moderate' | 'critical';
  paragraphIndex?: number;
}

export interface GrammarResult {
  score: number; // 1 - 4
  issues: GrammarIssue[];
  overallFeedback: string;
}

export interface CoherenceParagraphNote {
  paragraphIndex: number;
  unity: 'High' | 'Moderate' | 'Low';
  transitionQuality: 'Smooth' | 'Adequate' | 'Abrupt';
  critique: string;
  suggestedTransition?: string;
}

export interface CoherenceIssue {
  id: string;
  originalText: string;
  issueType: 'missing transition' | 'abrupt shift' | 'off-topic sentence' | 'repetitive flow';
  explanation: string;
  suggestion: string;
}

export interface CoherenceResult {
  score: number; // 1 - 4
  flowRating: string;
  paragraphNotes: CoherenceParagraphNote[];
  transitionWordsUsed: string[];
  coherenceIssues: CoherenceIssue[];
  overallFeedback: string;
}

export interface EvidenceNode {
  id: string;
  text: string;
  strength: 'strong' | 'moderate' | 'weak';
  critique: string;
}

export interface ClaimNode {
  id: string;
  claimText: string;
  paragraphIndex: number;
  status: 'supported' | 'weak' | 'unsupported';
  evidence: EvidenceNode[];
  logicalFallacy?: string; // e.g. 'Circular reasoning', 'Hasty generalization', 'None'
  feedback: string;
  suggestionToStrengthen: string;
}

export interface ArgumentResult {
  score: number; // 1 - 4
  thesisStatement: string;
  thesisClarity: 'Clear & Debatable' | 'Somewhat Clear' | 'Vague' | 'Missing';
  claims: ClaimNode[];
  counterargumentsAddressed: boolean;
  counterargumentNote: string;
  overallFeedback: string;
}

export interface ClicheItem {
  id: string;
  originalText: string;
  whyGeneric: string;
  suggestedFreshAlternative: string;
}

export interface AISoundingPattern {
  id: string;
  originalText: string;
  patternType: 'formulaic transition' | 'hollow buzzword' | 'excessive parallelism' | 'generic boilerplate';
  pedagogicalGuidance: string;
  howToHumanize: string;
}

export interface OriginalityResult {
  score: number; // 1 - 4
  voiceDescription: string;
  cliches: ClicheItem[];
  aiSoundingPatterns: AISoundingPattern[];
  overallFeedback: string;
}

export interface RubricDimension {
  score: number; // 1 - 4
  level: 'Emerging' | 'Developing' | 'Proficient' | 'Advanced';
  justification: string;
}

export interface NextStepTask {
  id: string;
  task: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Grammar' | 'Coherence' | 'Argument' | 'Originality';
  completed?: boolean;
}

export interface InlineAnnotation {
  id: string;
  originalSnippet: string;
  category: 'grammar' | 'coherence' | 'argument' | 'originality';
  title: string;
  comment: string;
  suggestedFix?: string;
  socraticPrompt?: string;
  approvedByTeacher?: boolean;
}

export interface SocraticQuestionItem {
  id: string;
  question: string;
  focusArea: string;
  guidingTip: string;
  studentReflection?: string;
}

export interface FullAnalysisReport {
  id: string;
  timestamp: string;
  essayTitle: string;
  essayText: string;
  options: AnalysisOptions;
  wordCount: number;
  readingTimeMinutes: number;

  overallScore: number; // 0 - 100
  letterGrade: string; // e.g. A, B+, B, C
  rubricScores: {
    grammar: RubricDimension;
    coherence: RubricDimension;
    argumentStrength: RubricDimension;
    originality: RubricDimension;
  };

  topStrengths: string[];
  topImprovements: string[];
  nextStepsChecklist: NextStepTask[];
  encouragingTeacherSummary: string;
  socraticQuestions: SocraticQuestionItem[];

  // Intermediate agent outputs
  segmenter: SegmenterResult;
  grammar: GrammarResult;
  coherence: CoherenceResult;
  argument: ArgumentResult;
  originality: OriginalityResult;

  inlineAnnotations: InlineAnnotation[];

  // Teacher mode overrides
  teacherNotes?: string;
  teacherScoreAdjustment?: number;
  teacherApproved?: boolean;
}

export interface SubmissionHistoryItem {
  id: string;
  version: number;
  timestamp: string;
  essayTitle: string;
  essaySnippet: string;
  overallScore: number;
  rubricScores: {
    grammar: number;
    coherence: number;
    argumentStrength: number;
    originality: number;
  };
  wordCount: number;
  report: FullAnalysisReport;
}

export interface EvaluationBenchmark {
  id: string;
  title: string;
  topic: string;
  gradeLevel: GradeLevel;
  wordCount: number;
  humanScores: {
    grammar: number;
    coherence: number;
    argumentStrength: number;
    originality: number;
    overall: number;
  };
  aiScores: {
    grammar: number;
    coherence: number;
    argumentStrength: number;
    originality: number;
    overall: number;
  };
  notes: string;
}
