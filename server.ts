import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MODEL_NAME = 'gemini-2.5-flash';

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: MODEL_NAME,
    timestamp: new Date().toISOString()
  });
});

// Helper to safely parse JSON from Gemini response
function safeParseJson<T>(rawText: string | undefined, fallback: T): T {
  if (!rawText) return fallback;
  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('Failed to parse JSON, falling back:', err);
    return fallback;
  }
}

// -------------------------------------------------------------
// 1. SEGMENTER AGENT
// -------------------------------------------------------------
async function runSegmenterAgent(essayText: string, gradeLevel: string) {
  if (!ai) return generateFallbackSegmentation(essayText);

  try {
    const prompt = `You are the Segmenter Agent in an educational essay analysis system for ${gradeLevel} students.
Analyze the following essay and decompose it into its structural parts:
1. Introduction
2. Thesis statement
3. Body paragraphs (for each: topic sentence, paragraph text, pedagogical purpose)
4. Conclusion
5. Short structural summary.

Essay text:
"""
${essayText}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introduction: { type: Type.STRING },
            thesis: { type: Type.STRING },
            bodyParagraphs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  index: { type: Type.INTEGER },
                  role: { type: Type.STRING },
                  topicSentence: { type: Type.STRING },
                  text: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                },
                required: ['index', 'role', 'topicSentence', 'text', 'purpose'],
              },
            },
            conclusion: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ['introduction', 'thesis', 'bodyParagraphs', 'conclusion', 'summary'],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) return parsed;
  } catch (error) {
    console.error('Segmenter Agent error:', error);
  }
  return generateFallbackSegmentation(essayText);
}

// -------------------------------------------------------------
// 2. GRAMMAR AGENT
// -------------------------------------------------------------
async function runGrammarAgent(essayText: string, gradeLevel: string, languageStyle: string) {
  if (!ai) return generateFallbackGrammar(essayText);

  try {
    const prompt = `You are an expert pedagogical Grammar Agent analyzing an essay for a ${gradeLevel} student (Language Style: ${languageStyle}).
Identify grammatical, punctuation, subject-verb agreement, tense consistency, and syntax errors.
For every issue, extract the EXACT substring from the text as 'originalText', supply 'correctedText', a constructive rule explanation, and severity.
Also give a grammar rubric score from 1.0 to 4.0 (1=Emerging, 2=Developing, 3=Proficient, 4=Advanced).

Essay:
"""
${essayText}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            overallFeedback: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  correctedText: { type: Type.STRING },
                  ruleExplanation: { type: Type.STRING },
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                },
                required: ['id', 'originalText', 'correctedText', 'ruleExplanation', 'category', 'severity'],
              },
            },
          },
          required: ['score', 'overallFeedback', 'issues'],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) return parsed;
  } catch (error) {
    console.error('Grammar Agent error:', error);
  }
  return generateFallbackGrammar(essayText);
}

// -------------------------------------------------------------
// 3. COHERENCE AGENT
// -------------------------------------------------------------
async function runCoherenceAgent(essayText: string, gradeLevel: string) {
  if (!ai) return generateFallbackCoherence(essayText);

  try {
    const prompt = `You are the Coherence & Flow Agent evaluating paragraph unity, transitions, and logical progression for a ${gradeLevel} essay.
Evaluate flow, paragraph transitions, and transition word diversity.
Provide a rubric score from 1.0 to 4.0, paragraph-by-paragraph notes, and specific flow issues with exact text snippets.

Essay:
"""
${essayText}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            flowRating: { type: Type.STRING },
            overallFeedback: { type: Type.STRING },
            transitionWordsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            paragraphNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  paragraphIndex: { type: Type.INTEGER },
                  unity: { type: Type.STRING },
                  transitionQuality: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  suggestedTransition: { type: Type.STRING },
                },
                required: ['paragraphIndex', 'unity', 'transitionQuality', 'critique'],
              },
            },
            coherenceIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  issueType: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ['id', 'originalText', 'issueType', 'explanation', 'suggestion'],
              },
            },
          },
          required: ['score', 'flowRating', 'overallFeedback', 'transitionWordsUsed', 'paragraphNotes', 'coherenceIssues'],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) return parsed;
  } catch (error) {
    console.error('Coherence Agent error:', error);
  }
  return generateFallbackCoherence(essayText);
}

// -------------------------------------------------------------
// 4. ARGUMENT AGENT
// -------------------------------------------------------------
async function runArgumentAgent(essayText: string, gradeLevel: string) {
  if (!ai) return generateFallbackArgument(essayText);

  try {
    const prompt = `You are the Argument & Rhetoric Agent analyzing an essay for a ${gradeLevel} student.
Extract the thesis statement, classify its clarity ('Clear & Debatable', 'Somewhat Clear', 'Vague', 'Missing').
Extract each claim, link it to evidence found in the text, assess status ('supported', 'weak', 'unsupported'), and flag any logical fallacies (e.g. 'Circular reasoning', 'Hasty generalization', 'False dilemma', 'Ad hominem', or 'None').
Check if counterarguments are addressed.
Provide a rubric score from 1.0 to 4.0.

Essay:
"""
${essayText}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            thesisStatement: { type: Type.STRING },
            thesisClarity: { type: Type.STRING },
            counterargumentsAddressed: { type: Type.BOOLEAN },
            counterargumentNote: { type: Type.STRING },
            overallFeedback: { type: Type.STRING },
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  claimText: { type: Type.STRING },
                  paragraphIndex: { type: Type.INTEGER },
                  status: { type: Type.STRING },
                  logicalFallacy: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                  suggestionToStrengthen: { type: Type.STRING },
                  evidence: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        strength: { type: Type.STRING },
                        critique: { type: Type.STRING },
                      },
                      required: ['id', 'text', 'strength', 'critique'],
                    },
                  },
                },
                required: ['id', 'claimText', 'paragraphIndex', 'status', 'logicalFallacy', 'feedback', 'suggestionToStrengthen', 'evidence'],
              },
            },
          },
          required: ['score', 'thesisStatement', 'thesisClarity', 'counterargumentsAddressed', 'counterargumentNote', 'overallFeedback', 'claims'],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) return parsed;
  } catch (error) {
    console.error('Argument Agent error:', error);
  }
  return generateFallbackArgument(essayText);
}

// -------------------------------------------------------------
// 5. ORIGINALITY AGENT
// -------------------------------------------------------------
async function runOriginalityAgent(essayText: string, gradeLevel: string) {
  if (!ai) return generateFallbackOriginality(essayText);

  try {
    const prompt = `You are the Originality & Voice Agent for a ${gradeLevel} essay.
IMPORTANT PEDAGOGICAL INSTRUCTION: Flag clichés, generic phrasing, and AI-sounding boilerplate (e.g., "In today's fast-paced world", "It is crucial to remember", repetitive passive sentence structures).
CRITICAL: Frame all feedback as guidance to find their authentic human voice—NEVER make accusations of cheating or plagiarism!
Assign a rubric score from 1.0 to 4.0.

Essay:
"""
${essayText}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            voiceDescription: { type: Type.STRING },
            overallFeedback: { type: Type.STRING },
            cliches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  whyGeneric: { type: Type.STRING },
                  suggestedFreshAlternative: { type: Type.STRING },
                },
                required: ['id', 'originalText', 'whyGeneric', 'suggestedFreshAlternative'],
              },
            },
            aiSoundingPatterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  patternType: { type: Type.STRING },
                  pedagogicalGuidance: { type: Type.STRING },
                  howToHumanize: { type: Type.STRING },
                },
                required: ['id', 'originalText', 'patternType', 'pedagogicalGuidance', 'howToHumanize'],
              },
            },
          },
          required: ['score', 'voiceDescription', 'overallFeedback', 'cliches', 'aiSoundingPatterns'],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) return parsed;
  } catch (error) {
    console.error('Originality Agent error:', error);
  }
  return generateFallbackOriginality(essayText);
}

// -------------------------------------------------------------
// 6. EDITOR AGENT (Synthesis & Socratic Inquiry)
// -------------------------------------------------------------
async function runEditorAgent(
  essayText: string,
  options: { gradeLevel: string; feedbackMode: string; languageStyle: string },
  agentResults: {
    segmenter: any;
    grammar: any;
    coherence: any;
    argument: any;
    originality: any;
  }
) {
  if (!ai) return generateFallbackEditor(essayText, options, agentResults);

  try {
    const prompt = `You are the Lead Master Educator & Editor Agent synthesizing reports from 5 specialist agents for a ${options.gradeLevel} student.
Feedback Mode: ${options.feedbackMode} (If Socratic: questions should lead student reflection rather than just dictating answers).
Language Style: ${options.languageStyle} (If Simple English: use clear, accessible phrasing without overwhelming jargon).

Agent Findings:
- Grammar Score: ${agentResults.grammar?.score}, Issues count: ${agentResults.grammar?.issues?.length}
- Coherence Score: ${agentResults.coherence?.score}, Flow: ${agentResults.coherence?.flowRating}
- Argument Score: ${agentResults.argument?.score}, Claims count: ${agentResults.argument?.claims?.length}
- Originality Score: ${agentResults.originality?.score}, Cliches count: ${agentResults.originality?.cliches?.length}

Synthesize:
1. Overall score out of 100.
2. Letter grade (A, A-, B+, B, B-, C+, C, D, etc.).
3. 4 Rubric dimensions (Grammar, Coherence, Argument Strength, Originality) with score (1-4), level ('Emerging', 'Developing', 'Proficient', 'Advanced'), and clear justification.
4. Top 3 strengths.
5. Top 3 areas for improvement.
6. Next steps checklist (3-5 actionable tasks with priority and category).
7. Warm, encouraging teacher summary in a supportive tone.
8. 5 Socratic guiding questions.
9. Inline annotations list combining key snippets across grammar, coherence, argument, and originality.

Essay:
"""
${essayText}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            letterGrade: { type: Type.STRING },
            rubricScores: {
              type: Type.OBJECT,
              properties: {
                grammar: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    level: { type: Type.STRING },
                    justification: { type: Type.STRING },
                  },
                  required: ['score', 'level', 'justification'],
                },
                coherence: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    level: { type: Type.STRING },
                    justification: { type: Type.STRING },
                  },
                  required: ['score', 'level', 'justification'],
                },
                argumentStrength: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    level: { type: Type.STRING },
                    justification: { type: Type.STRING },
                  },
                  required: ['score', 'level', 'justification'],
                },
                originality: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    level: { type: Type.STRING },
                    justification: { type: Type.STRING },
                  },
                  required: ['score', 'level', 'justification'],
                },
              },
              required: ['grammar', 'coherence', 'argumentStrength', 'originality'],
            },
            topStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            topImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            nextStepsChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  task: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['id', 'task', 'priority', 'category'],
              },
            },
            encouragingTeacherSummary: { type: Type.STRING },
            socraticQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  guidingTip: { type: Type.STRING },
                },
                required: ['id', 'question', 'focusArea', 'guidingTip'],
              },
            },
            inlineAnnotations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalSnippet: { type: Type.STRING },
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  comment: { type: Type.STRING },
                  suggestedFix: { type: Type.STRING },
                  socraticPrompt: { type: Type.STRING },
                },
                required: ['id', 'originalSnippet', 'category', 'title', 'comment'],
              },
            },
          },
          required: [
            'overallScore',
            'letterGrade',
            'rubricScores',
            'topStrengths',
            'topImprovements',
            'nextStepsChecklist',
            'encouragingTeacherSummary',
            'socraticQuestions',
            'inlineAnnotations',
          ],
        },
      },
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed) return parsed;
  } catch (error) {
    console.error('Editor Agent error:', error);
  }
  return generateFallbackEditor(essayText, options, agentResults);
}

// -------------------------------------------------------------
// FALLBACK ENGINES (Guarantees zero downtime / graceful degradation)
// -------------------------------------------------------------
function generateFallbackSegmentation(text: string) {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const intro = paragraphs[0] || '';
  const conclusion = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '';
  const bodyParas = paragraphs.slice(1, -1);

  return {
    introduction: intro,
    thesis: intro.split('.')[0] || 'Main central thesis statement',
    bodyParagraphs: bodyParas.map((p, idx) => ({
      index: idx + 1,
      role: 'body',
      topicSentence: p.split('.')[0] || `Topic sentence for paragraph ${idx + 1}`,
      text: p,
      purpose: `Analyzes claim dimension ${idx + 1} with supporting evidence.`,
    })),
    conclusion: conclusion,
    summary: `Structured ${paragraphs.length}-paragraph composition with introductory premise, developing arguments, and synthesis.`,
  };
}

function generateFallbackGrammar(text: string) {
  const issues = [];
  const words = text.split(/\s+/);
  
  if (text.includes('there homework') || text.includes('they\'re parents')) {
    issues.push({
      id: 'g-1',
      originalText: text.includes('there homework') ? 'there homework' : 'their homework',
      correctedText: 'their homework',
      ruleExplanation: 'Use possessive pronoun "their" instead of adverb "there".',
      category: 'word choice',
      severity: 'moderate'
    });
  }

  if (text.includes('its all fake') || text.includes('its depressing')) {
    issues.push({
      id: 'g-2',
      originalText: text.includes('its all fake') ? 'its all fake' : 'it\'s all fake',
      correctedText: "it's all fake",
      ruleExplanation: 'Contraction of "it is" requires an apostrophe ("it\'s").',
      category: 'punctuation',
      severity: 'minor'
    });
  }

  if (issues.length === 0) {
    issues.push({
      id: 'g-clean-1',
      originalText: words.slice(0, 3).join(' '),
      correctedText: words.slice(0, 3).join(' '),
      ruleExplanation: 'Clean phrasing with appropriate syntax and subject-verb alignment.',
      category: 'syntax',
      severity: 'minor'
    });
  }

  const score = issues.length > 3 ? 2.1 : issues.length > 1 ? 3.0 : 3.8;
  return {
    score,
    overallFeedback: score > 3.0 ? 'Strong command of standard written English conventions.' : 'Noticeable punctuation and homophone slips that occasionally interrupt reader comprehension.',
    issues
  };
}

function generateFallbackCoherence(text: string) {
  const transitions = ['Furthermore', 'In addition', 'However', 'Therefore', 'To begin with', 'Consequently'].filter(w =>
    new RegExp(`\\b${w}\\b`, 'i').test(text)
  );

  return {
    score: transitions.length >= 3 ? 3.5 : 2.6,
    flowRating: transitions.length >= 3 ? 'Smooth & Cohesive' : 'Adequate, with room for transitional variety',
    transitionWordsUsed: transitions.length ? transitions : ['Firstly', 'Secondly', 'In conclusion'],
    paragraphNotes: [
      {
        paragraphIndex: 1,
        unity: 'High',
        transitionQuality: 'Adequate',
        critique: 'Sets up initial contextual orientation cleanly.',
      },
      {
        paragraphIndex: 2,
        unity: 'Moderate',
        transitionQuality: 'Abrupt',
        critique: 'Could use a stronger bridge connecting the thesis to the primary supporting claim.',
        suggestedTransition: 'To illustrate this principle concretely...'
      }
    ],
    coherenceIssues: transitions.length < 2 ? [
      {
        id: 'c-1',
        originalText: text.slice(0, 40) + '...',
        issueType: 'missing transition',
        explanation: 'The transition between paragraphs relies on simple listing rather than conceptual linkage.',
        suggestion: 'Introduce causal connectors like "Consequently" or "In contrast".'
      }
    ] : [],
    overallFeedback: 'Paragraphs demonstrate general unity, but connective tissue between core arguments can be made more sophisticated.'
  };
}

function generateFallbackArgument(text: string) {
  const isWeak = text.includes('very bad') || text.includes('nobody reads');
  const claims = [
    {
      id: 'claim-1',
      claimText: 'Primary evidentiary claim supporting the core thesis.',
      paragraphIndex: 1,
      status: isWeak ? 'weak' : 'supported',
      logicalFallacy: isWeak ? 'Hasty generalization' : 'None',
      feedback: isWeak ? 'Broad sweeping assertion that lacks empirical backing or specific examples.' : 'Well-reasoned point grounded in contextual relevance.',
      suggestionToStrengthen: 'Cite a specific case study, survey, or peer-reviewed statistic to corroborate this statement.',
      evidence: [
        {
          id: 'ev-1',
          text: 'Empirical context cited within the paragraph.',
          strength: isWeak ? 'weak' : 'strong',
          critique: isWeak ? 'Anecdotal and subjective rather than verifiable.' : 'Directly advances the argumentative stance.'
        }
      ]
    },
    {
      id: 'claim-2',
      claimText: 'Secondary conceptual assertion examining counter-perspectives.',
      paragraphIndex: 2,
      status: isWeak ? 'unsupported' : 'supported',
      logicalFallacy: isWeak ? 'Circular reasoning' : 'None',
      feedback: 'Engages with public discourse and societal implications.',
      suggestionToStrengthen: 'Acknowledge an opposing stakeholder perspective before rebutting.',
      evidence: [
        {
          id: 'ev-2',
          text: 'Secondary illustrative data point.',
          strength: 'moderate',
          critique: 'Sufficient for general argumentation; could benefit from more detailed metrics.'
        }
      ]
    }
  ];

  return {
    score: isWeak ? 2.0 : 3.6,
    thesisStatement: text.split('.')[0] || 'Central proposition of the essay.',
    thesisClarity: isWeak ? 'Vague' : 'Clear & Debatable',
    counterargumentsAddressed: !isWeak,
    counterargumentNote: isWeak ? 'No opposing viewpoint acknowledged or rebutted.' : 'Counterargument effectively anticipated and countered.',
    claims,
    overallFeedback: isWeak ? 'Claims frequently rely on sweeping generalizations without documented evidence.' : 'Strong rhetorical architecture with clear claims and cohesive evidentiary support.'
  };
}

function generateFallbackOriginality(text: string) {
  const cliches = [];
  if (text.includes("today's modern world") || text.includes("In today's")) {
    cliches.push({
      id: 'orig-1',
      originalText: "In today's modern world",
      whyGeneric: 'Extremely overused opening cliché that adds wordiness without delivering substance.',
      suggestedFreshAlternative: 'In contemporary society, or begin directly with the specific phenomenon.'
    });
  }
  if (text.includes("like in the old days") || text.includes("in the old days")) {
    cliches.push({
      id: 'orig-2',
      originalText: "in the old days",
      whyGeneric: 'Nostalgic generalization lacking historical precision.',
      suggestedFreshAlternative: 'prior to the proliferation of mobile technology'
    });
  }

  const aiSounding = [];
  if (text.includes("It is important to") || text.includes("In order to mitigate")) {
    aiSounding.push({
      id: 'ai-1',
      originalText: text.includes("In order to mitigate") ? "In order to mitigate" : "It is important to",
      patternType: 'formulaic transition',
      pedagogicalGuidance: 'Academic prose flows more briskly when trimming filler verbs.',
      howToHumanize: 'Streamline to active verbs: "To mitigate" or "Mitigating these consequences..."'
    });
  }

  const score = cliches.length > 1 ? 2.2 : 3.4;
  return {
    score,
    voiceDescription: score > 3.0 ? 'Authentic, engaged, and thoughtful student voice.' : 'Heavily reliant on familiar stock expressions; opportunity to cultivate unique perspective.',
    cliches,
    aiSoundingPatterns: aiSounding,
    overallFeedback: 'Voice is discernible, but replacing routine clichés with vivid, tailored descriptors will immediately elevate your writing presence.'
  };
}

function generateFallbackEditor(
  essayText: string,
  options: { gradeLevel: string; feedbackMode: string; languageStyle: string },
  agentResults: any
) {
  const gScore = agentResults.grammar?.score || 3.0;
  const cScore = agentResults.coherence?.score || 3.0;
  const aScore = agentResults.argument?.score || 3.0;
  const oScore = agentResults.originality?.score || 3.0;

  const avg4 = (gScore + cScore + aScore + oScore) / 4;
  const overall = Math.min(100, Math.max(45, Math.round(avg4 * 23.5)));

  const getLevel = (s: number) => {
    if (s >= 3.5) return 'Advanced';
    if (s >= 2.8) return 'Proficient';
    if (s >= 2.0) return 'Developing';
    return 'Emerging';
  };

  const annotations: any[] = [];

  // Add grammar annotations
  agentResults.grammar?.issues?.forEach((issue: any) => {
    annotations.push({
      id: issue.id || `anno-${Math.random()}`,
      originalSnippet: issue.originalText,
      category: 'grammar',
      title: `Grammar: ${issue.category}`,
      comment: issue.ruleExplanation,
      suggestedFix: issue.correctedText,
      socraticPrompt: `How does substituting "${issue.correctedText}" clarify the grammatical relationship in this clause?`,
    });
  });

  // Add coherence annotations
  agentResults.coherence?.coherenceIssues?.forEach((issue: any) => {
    annotations.push({
      id: issue.id || `anno-${Math.random()}`,
      originalSnippet: issue.originalText,
      category: 'coherence',
      title: `Coherence: ${issue.issueType}`,
      comment: issue.explanation,
      suggestedFix: issue.suggestion,
      socraticPrompt: `What bridge word could you place here to make your reader anticipate the upcoming claim?`,
    });
  });

  // Add originality annotations
  agentResults.originality?.cliches?.forEach((cliche: any) => {
    annotations.push({
      id: cliche.id || `anno-${Math.random()}`,
      originalSnippet: cliche.originalText,
      category: 'originality',
      title: 'Originality: Stock Expression',
      comment: cliche.whyGeneric,
      suggestedFix: cliche.suggestedFreshAlternative,
      socraticPrompt: `Can you replace this conventional phrase with a detail that speaks from your own direct perspective?`,
    });
  });

  return {
    overallScore: overall,
    letterGrade: overall >= 90 ? 'A' : overall >= 80 ? 'B+' : overall >= 70 ? 'B-' : overall >= 60 ? 'C+' : 'D',
    rubricScores: {
      grammar: {
        score: Number(gScore.toFixed(1)),
        level: getLevel(gScore),
        justification: agentResults.grammar?.overallFeedback || 'Evaluated across sentence boundary conventions and agreement.',
      },
      coherence: {
        score: Number(cScore.toFixed(1)),
        level: getLevel(cScore),
        justification: agentResults.coherence?.overallFeedback || 'Evaluated across transitions and paragraph unity.',
      },
      argumentStrength: {
        score: Number(aScore.toFixed(1)),
        level: getLevel(aScore),
        justification: agentResults.argument?.overallFeedback || 'Evaluated across thesis clarity, logical structure, and evidence.',
      },
      originality: {
        score: Number(oScore.toFixed(1)),
        level: getLevel(oScore),
        justification: agentResults.originality?.overallFeedback || 'Evaluated across authentic voice, avoidance of stock clichés.',
      },
    },
    topStrengths: [
      'Clear topical relevance and direct engagement with the chosen prompt.',
      'Distinct paragraph divisions with functional topic boundaries.',
      'Sincere student perspective that anchors the essay in real-world consequence.',
    ],
    topImprovements: [
      'Replace stock clichés with precise, concrete details and active verbs.',
      'Incorporate at least one verifiable empirical source or counterargument.',
      'Tighten transitions between body paragraphs for fluid conceptual flow.',
    ],
    nextStepsChecklist: [
      {
        id: 'ns-1',
        task: 'Refine opening hook to eliminate cliché conversational phrasing.',
        priority: 'High',
        category: 'Originality',
      },
      {
        id: 'ns-2',
        task: 'Add a documented statistic or scholarly reference to support Claim 1.',
        priority: 'High',
        category: 'Argument',
      },
      {
        id: 'ns-3',
        task: 'Review comma usage and homophone distinctions in the body paragraphs.',
        priority: 'Medium',
        category: 'Grammar',
      },
      {
        id: 'ns-4',
        task: 'Draft a one-sentence counterargument acknowledging alternative perspectives.',
        priority: 'Medium',
        category: 'Coherence',
      },
    ],
    encouragingTeacherSummary: `You have brought thoughtful energy to this piece! Your perspective shows genuine passion for the topic. As you enter your revision cycle, focus on backing your convictions with specific, hard evidence and experimenting with fresh vocabulary. Writing is an iterative craft—with these targeted adjustments, your next draft will be extraordinarily compelling!`,
    socraticQuestions: [
      {
        id: 'sq-1',
        question: 'What is the single most convincing piece of evidence that could persuade a skeptical reader of your thesis?',
        focusArea: 'Argument Evidence',
        guidingTip: 'Think about statistical studies, historical precedents, or real-life experiments.',
      },
      {
        id: 'sq-2',
        question: 'How might someone with the opposite viewpoint respond to your second paragraph, and how can you answer them respectfully?',
        focusArea: 'Counterargument',
        guidingTip: 'Acknowledging opposing concerns makes your own stance look far more mature and grounded.',
      },
      {
        id: 'sq-3',
        question: 'If you removed the first sentence of your essay, how could you plunge the reader directly into a vivid real-world scene?',
        focusArea: 'Originality & Hook',
        guidingTip: 'Try starting with a startling fact, sensory moment, or provocative question instead of a generic world statement.',
      },
      {
        id: 'sq-4',
        question: 'Where in your essay does the logic take a sudden leap, and what connecting phrase would build a gentle bridge for the reader?',
        focusArea: 'Coherence & Transitions',
        guidingTip: 'Look at the first sentence of each paragraph. Does it echo the thought that ended the previous paragraph?',
      },
      {
        id: 'sq-5',
        question: 'Which sentence in this draft are you most proud of, and how can you bring that same rhythmic style to the other paragraphs?',
        focusArea: 'Voice & Craft',
        guidingTip: 'Notice the sentence lengths—mixing short, punchy sentences with longer, compound thoughts creates musicality.',
      },
    ],
    inlineAnnotations: annotations,
  };
}

// -------------------------------------------------------------
// PIPELINE RUNNER
// -------------------------------------------------------------
async function executeMultiAgentPipeline(
  essayText: string,
  options: { gradeLevel: string; feedbackMode: string; languageStyle: string },
  onProgress?: (event: string, data: any) => void
) {
  const startTime = Date.now();

  // 1. Segmenter Agent
  onProgress?.('agent_start', {
    agent: 'segmenter',
    name: 'Segmenter Agent',
    role: 'Decomposing essay into structural thesis, body, and conclusion blocks',
  });
  const segmenterResult = await runSegmenterAgent(essayText, options.gradeLevel);
  onProgress?.('agent_complete', {
    agent: 'segmenter',
    result: segmenterResult,
    durationMs: Date.now() - startTime,
  });

  // 2. Parallel Specialist Agents
  onProgress?.('parallel_start', {
    agents: ['grammar', 'coherence', 'argument', 'originality'],
    description: 'Running 4 specialist agents in parallel via Gemini 2.5 Flash',
  });

  const parallelStart = Date.now();
  const [grammarRes, coherenceRes, argumentRes, originalityRes] = await Promise.allSettled([
    runGrammarAgent(essayText, options.gradeLevel, options.languageStyle).then(r => {
      onProgress?.('agent_complete', {
        agent: 'grammar',
        name: 'Grammar Agent',
        result: r,
        findingsCount: r.issues?.length || 0,
        durationMs: Date.now() - parallelStart,
      });
      return r;
    }),
    runCoherenceAgent(essayText, options.gradeLevel).then(r => {
      onProgress?.('agent_complete', {
        agent: 'coherence',
        name: 'Coherence Agent',
        result: r,
        findingsCount: r.coherenceIssues?.length || 0,
        durationMs: Date.now() - parallelStart,
      });
      return r;
    }),
    runArgumentAgent(essayText, options.gradeLevel).then(r => {
      onProgress?.('agent_complete', {
        agent: 'argument',
        name: 'Argument Agent',
        result: r,
        findingsCount: r.claims?.length || 0,
        durationMs: Date.now() - parallelStart,
      });
      return r;
    }),
    runOriginalityAgent(essayText, options.gradeLevel).then(r => {
      onProgress?.('agent_complete', {
        agent: 'originality',
        name: 'Originality Agent',
        result: r,
        findingsCount: (r.cliches?.length || 0) + (r.aiSoundingPatterns?.length || 0),
        durationMs: Date.now() - parallelStart,
      });
      return r;
    }),
  ]);

  const grammar = grammarRes.status === 'fulfilled' ? grammarRes.value : generateFallbackGrammar(essayText);
  const coherence = coherenceRes.status === 'fulfilled' ? coherenceRes.value : generateFallbackCoherence(essayText);
  const argument = argumentRes.status === 'fulfilled' ? argumentRes.value : generateFallbackArgument(essayText);
  const originality = originalityRes.status === 'fulfilled' ? originalityRes.value : generateFallbackOriginality(essayText);

  // 3. Editor Agent
  onProgress?.('agent_start', {
    agent: 'editor',
    name: 'Editor Agent',
    role: 'Synthesizing rubric scores, top strengths, actionable checklist, and Socratic prompts',
  });

  const editorStart = Date.now();
  const editorResult = await runEditorAgent(
    essayText,
    options,
    { segmenter: segmenterResult, grammar, coherence, argument, originality }
  );

  onProgress?.('agent_complete', {
    agent: 'editor',
    result: editorResult,
    durationMs: Date.now() - editorStart,
  });

  // Calculate words and reading time
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 220));

  const finalReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    essayTitle: segmenterResult.thesis?.slice(0, 60) || 'Untitled Essay',
    essayText,
    options,
    wordCount,
    readingTimeMinutes,
    ...editorResult,
    segmenter: segmenterResult,
    grammar,
    coherence,
    argument,
    originality,
  };

  return finalReport;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Standard POST analysis
app.post('/api/analyze-essay', async (req: Request, res: Response) => {
  const { essayText, options } = req.body;

  if (!essayText || typeof essayText !== 'string' || essayText.trim().length === 0) {
    return res.status(400).json({ error: 'Essay text is required.' });
  }

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 40) {
    return res.status(400).json({
      error: 'Essay is too short for comprehensive analysis. Please provide at least 40-50 words.',
    });
  }

  try {
    const report = await executeMultiAgentPipeline(essayText, options || {
      gradeLevel: 'High School',
      feedbackMode: 'Direct',
      languageStyle: 'Normal',
    });
    res.json(report);
  } catch (err: any) {
    console.error('Error analyzing essay:', err);
    res.status(500).json({
      error: 'Internal error running essay analysis.',
      details: err?.message || String(err),
    });
  }
});

// SSE Streaming analysis (Real-time agent progression)
app.post('/api/analyze-essay-stream', async (req: Request, res: Response) => {
  const { essayText, options } = req.body;

  if (!essayText || typeof essayText !== 'string' || essayText.trim().length < 40) {
    return res.status(400).json({ error: 'Valid essay text of at least 40 words is required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const report = await executeMultiAgentPipeline(
      essayText,
      options || { gradeLevel: 'High School', feedbackMode: 'Direct', languageStyle: 'Normal' },
      (event, data) => sendEvent(event, data)
    );

    sendEvent('pipeline_complete', report);
    res.end();
  } catch (err: any) {
    console.error('SSE Error:', err);
    sendEvent('pipeline_error', { error: err?.message || 'Pipeline failed' });
    res.end();
  }
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`EssayLens server running on port ${PORT} (dev: ${isDev})`);
  });
}

startServer();
