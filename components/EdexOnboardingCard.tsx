'use client';

import { useState, useCallback } from 'react';
import { Loader2, BookOpen, Brain, Zap, ChevronRight, ChevronLeft, Sparkles, Users, GraduationCap, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  LearnerProfile,
  Subject,
  BloomLevel,
  AnalogyDomain,
  LearningMode,
} from '@/lib/learner';
import {
  SUBJECT_LABELS,
  SUBJECT_EMOJIS,
  BLOOM_LABELS,
  BLOOM_DESCRIPTIONS,
  ANALOGY_LABELS,
  LEARNING_MODE_LABELS,
  LEARNING_MODE_DESCRIPTIONS,
  LEARNING_MODE_EMOJIS,
  createDefaultProfile,
  LearnerProfileManager,
} from '@/lib/learner';

type EdexOnboardingCardProps = {
  isLoading: boolean;
  error: string | null;
  onStartConversation: (profile: LearnerProfile) => void;
  savedProfile: LearnerProfile | null;
};

const SUBJECTS = Object.keys(SUBJECT_LABELS) as Subject[];
const BLOOM_LEVELS = [1, 2, 3, 4, 5, 6] as BloomLevel[];
const ANALOGY_DOMAINS = Object.keys(ANALOGY_LABELS) as AnalogyDomain[];

const BLOOM_COLORS: Record<BloomLevel, string> = {
  1: 'hsl(var(--bloom-1))',
  2: 'hsl(var(--bloom-2))',
  3: 'hsl(var(--bloom-3))',
  4: 'hsl(var(--bloom-4))',
  5: 'hsl(var(--bloom-5))',
  6: 'hsl(var(--bloom-6))',
};

const LEARNING_MODES = Object.keys(LEARNING_MODE_LABELS) as LearningMode[];

const MODE_ICONS: Record<LearningMode, React.ReactNode> = {
  study_partner: <Users className="h-4 w-4" />,
  viva_prep:     <GraduationCap className="h-4 w-4" />,
  quiz_mode:     <Zap className="h-4 w-4" />,
  revision:      <RefreshCcw className="h-4 w-4" />,
};

type Step = 'welcome' | 'subject' | 'mode' | 'bloom' | 'analogy' | 'ready';

export function EdexOnboardingCard({
  isLoading,
  error,
  onStartConversation,
  savedProfile,
}: EdexOnboardingCardProps) {
  const [step, setStep] = useState<Step>(savedProfile ? 'welcome' : 'subject');
  const [name, setName] = useState(savedProfile?.name ?? '');
  const [subject, setSubject] = useState<Subject>(savedProfile?.subject ?? 'mathematics');
  const [learningMode, setLearningMode] = useState<LearningMode>(savedProfile?.learningMode ?? 'study_partner');
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>(savedProfile?.bloomLevel ?? 1);
  const [analogyDomain, setAnalogyDomain] = useState<AnalogyDomain>(
    savedProfile?.analogyDomain ?? 'sports',
  );

  const handleContinueWithSaved = useCallback(() => {
    if (savedProfile) {
      onStartConversation(savedProfile);
    }
  }, [savedProfile, onStartConversation]);

  const handleStartFresh = useCallback(() => {
    LearnerProfileManager.clear();
    setStep('subject');
  }, []);

  const handleStartLearning = useCallback(() => {
    const profile = createDefaultProfile(
      name.trim() || 'Learner',
      subject,
      bloomLevel,
      analogyDomain,
      learningMode,
    );
    const manager = new LearnerProfileManager(profile);
    manager.startSession();
    manager.save();
    onStartConversation(manager.getProfile());
  }, [name, subject, bloomLevel, analogyDomain, learningMode, onStartConversation]);


  const stepIndex = ['subject', 'mode', 'bloom', 'analogy', 'ready'].indexOf(step);

  return (
    <div
      className="edex-font-body mx-auto w-[min(94vw,30rem)] animate-fade-up overflow-hidden rounded-3xl"
      style={{
        background:
          'linear-gradient(160deg, hsl(230 35% 6%) 0%, hsl(245 50% 10%) 60%, hsl(270 40% 8%) 100%)',
        border: '1px solid hsl(245 100% 70% / 0.18)',
        boxShadow:
          '0 0 0 1px hsl(245 100% 70% / 0.06), 0 24px 64px hsl(245 60% 8% / 0.8), 0 8px 24px hsl(245 100% 70% / 0.08)',
      }}
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--edex-glow))' }} />
          <span className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: 'hsl(var(--edex-glow))' }}>
            EdexConvoAI
          </span>
        </div>
        <h1
          className="edex-font-heading text-2xl font-semibold leading-tight text-white"
        >
          {step === 'welcome' && savedProfile
            ? `Welcome back, ${savedProfile.name}!`
            : step === 'subject'
            ? 'What are you learning?'
            : step === 'bloom'
            ? 'Your challenge level'
            : step === 'analogy'
            ? 'Your learning style'
            : 'Ready to learn?'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(245 30% 65%)' }}>
          {step === 'welcome' && savedProfile
            ? `${SUBJECT_EMOJIS[savedProfile.subject]} ${SUBJECT_LABELS[savedProfile.subject]} · Bloom Level ${savedProfile.bloomLevel}: ${BLOOM_LABELS[savedProfile.bloomLevel]}`
            : step === 'subject'
            ? 'Pick a subject to explore with Lexi, your AI tutor'
            : step === 'bloom'
            ? 'Choose your current cognitive challenge level'
            : step === 'analogy'
            ? 'Lexi will explain concepts using your chosen domain'
            : 'Lexi will personalize every response just for you'}
        </p>
      </div>

      {/* Step progress bar (skip on welcome) */}
      {step !== 'welcome' && (
        <div className="mx-8 mb-5 flex gap-1.5">
          {['subject', 'bloom', 'analogy', 'ready'].map((s, i) => (
            <div
              key={s}
              className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{
                background:
                  i <= stepIndex
                    ? 'hsl(var(--edex-glow))'
                    : 'hsl(245 30% 20%)',
              }}
            />
          ))}
        </div>
      )}

      {/* Panel content */}
      <div className="px-8 pb-8">
        {/* Welcome / returning learner step */}
        {step === 'welcome' && savedProfile && (
          <div className="animate-step-enter space-y-3">
            <button
              onClick={handleContinueWithSaved}
              className="w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'hsl(var(--edex-glow) / 0.08)',
                border: '1px solid hsl(var(--edex-glow) / 0.25)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Continue last session</p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(245 30% 65%)' }}>
                    {SUBJECT_EMOJIS[savedProfile.subject]}{' '}
                    {SUBJECT_LABELS[savedProfile.subject]} ·{' '}
                    {savedProfile.streakCount} streak · Session {savedProfile.totalSessions}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4" style={{ color: 'hsl(var(--edex-glow))' }} />
              </div>
            </button>

            <button
              onClick={handleStartFresh}
              className="w-full rounded-2xl p-3 text-left text-sm transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: 'transparent',
                border: '1px solid hsl(245 30% 22%)',
                color: 'hsl(245 30% 65%)',
              }}
            >
              Start a new session instead →
            </button>
          </div>
        )}

        {/* Subject selection */}
        {step === 'subject' && (
          <div className="animate-step-enter space-y-3">
            {/* Name input */}
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all"
              style={{
                background: 'hsl(245 30% 10%)',
                border: '1px solid hsl(245 30% 22%)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--edex-glow) / 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'hsl(245 30% 22%)';
              }}
            />
            {/* Subject grid */}
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className="group rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      subject === s
                        ? 'hsl(var(--edex-glow) / 0.14)'
                        : 'hsl(245 30% 8%)',
                    border:
                      subject === s
                        ? '1px solid hsl(var(--edex-glow) / 0.5)'
                        : '1px solid hsl(245 30% 18%)',
                  }}
                >
                  <div className="text-lg mb-0.5">{SUBJECT_EMOJIS[s]}</div>
                  <div
                    className="text-xs font-medium leading-tight"
                    style={{
                      color: subject === s ? 'hsl(var(--edex-star))' : 'hsl(245 20% 60%)',
                    }}
                  >
                    {SUBJECT_LABELS[s]}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep('mode')}
              className="w-full mt-1 rounded-xl font-semibold text-sm h-10"
              style={{
                background: 'hsl(var(--edex-glow))',
                color: 'hsl(230 35% 4%)',
                border: 'none',
              }}
            >
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Learning Mode selection */}
        {step === 'mode' && (
          <div className="animate-step-enter space-y-2.5">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'hsl(245 30% 50%)' }}>How do you want to learn today?</p>
            </div>
            {LEARNING_MODES.map((m) => (
              <button
                key={m}
                onClick={() => setLearningMode(m)}
                className="w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: learningMode === m ? 'hsl(245 100% 70% / 0.1)' : 'hsl(245 30% 8%)',
                  border: learningMode === m ? '1px solid hsl(245 100% 70% / 0.45)' : '1px solid hsl(245 30% 18%)',
                }}
                aria-pressed={learningMode === m}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: learningMode === m ? 'hsl(245 100% 70% / 0.2)' : 'hsl(245 30% 14%)',
                      color: learningMode === m ? 'hsl(245 100% 75%)' : 'hsl(245 30% 50%)',
                    }}
                  >
                    {MODE_ICONS[m]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: learningMode === m ? 'hsl(240 60% 95%)' : 'hsl(245 20% 75%)' }}>
                        {LEARNING_MODE_EMOJIS[m]} {LEARNING_MODE_LABELS[m]}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'hsl(245 20% 50%)' }}>
                      {LEARNING_MODE_DESCRIPTIONS[m]}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={() => setStep('subject')}
                variant="ghost"
                className="flex-1 rounded-xl h-10 text-sm"
                style={{ color: 'hsl(245 30% 55%)', border: '1px solid hsl(245 30% 20%)' }}
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
              </Button>
              <Button
                onClick={() => setStep('bloom')}
                className="flex-[2] rounded-xl font-semibold text-sm h-10"
                style={{ background: 'hsl(var(--edex-glow))', color: 'hsl(230 35% 4%)', border: 'none' }}
              >
                Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Bloom level selection */}
        {step === 'bloom' && (
          <div className="animate-step-enter space-y-2">
            {BLOOM_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setBloomLevel(level)}
                className="w-full rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background:
                    bloomLevel === level
                      ? `${BLOOM_COLORS[level]}18`
                      : 'hsl(245 30% 8%)',
                  border:
                    bloomLevel === level
                      ? `1px solid ${BLOOM_COLORS[level]}80`
                      : '1px solid hsl(245 30% 18%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: BLOOM_COLORS[level] }}
                  />
                  <div>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color:
                          bloomLevel === level
                            ? BLOOM_COLORS[level]
                            : 'hsl(245 20% 55%)',
                      }}
                    >
                      Level {level} — {BLOOM_LABELS[level]}
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(245 20% 45%)' }}>
                      {BLOOM_DESCRIPTIONS[level]}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                onClick={() => setStep('subject')}
                className="flex-1 rounded-xl text-sm h-10"
                style={{ color: 'hsl(245 30% 55%)' }}
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
              </Button>
              <Button
                onClick={() => setStep('analogy')}
                className="flex-[2] rounded-xl font-semibold text-sm h-10"
                style={{
                  background: 'hsl(var(--edex-glow))',
                  color: 'hsl(230 35% 4%)',
                  border: 'none',
                }}
              >
                Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Analogy domain selection */}
        {step === 'analogy' && (
          <div className="animate-step-enter space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {ANALOGY_DOMAINS.map((domain) => {
                const emojis: Record<AnalogyDomain, string> = {
                  sports: '⚽',
                  music: '🎵',
                  food: '🍕',
                  travel: '✈️',
                  gaming: '🎮',
                  movies: '🎬',
                };
                return (
                  <button
                    key={domain}
                    onClick={() => setAnalogyDomain(domain)}
                    className="rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background:
                        analogyDomain === domain
                          ? 'hsl(var(--edex-glow) / 0.12)'
                          : 'hsl(245 30% 8%)',
                      border:
                        analogyDomain === domain
                          ? '1px solid hsl(var(--edex-glow) / 0.45)'
                          : '1px solid hsl(245 30% 18%)',
                    }}
                  >
                    <div className="text-xl mb-1">{emojis[domain]}</div>
                    <div
                      className="text-xs font-medium"
                      style={{
                        color:
                          analogyDomain === domain
                            ? 'hsl(var(--edex-star))'
                            : 'hsl(245 20% 55%)',
                      }}
                    >
                      {ANALOGY_LABELS[domain]}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                onClick={() => setStep('bloom')}
                className="flex-1 rounded-xl text-sm h-10"
                style={{ color: 'hsl(245 30% 55%)' }}
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
              </Button>
              <Button
                onClick={() => setStep('ready')}
                className="flex-[2] rounded-xl font-semibold text-sm h-10"
                style={{
                  background: 'hsl(var(--edex-glow))',
                  color: 'hsl(230 35% 4%)',
                  border: 'none',
                }}
              >
                Preview <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Ready / summary step */}
        {step === 'ready' && (
          <div className="animate-step-enter space-y-3">
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ background: 'hsl(245 30% 8%)', border: '1px solid hsl(245 30% 18%)' }}
            >
              <SummaryRow icon={<BookOpen className="h-3.5 w-3.5" />} label="Subject">
                {SUBJECT_EMOJIS[subject]} {SUBJECT_LABELS[subject]}
              </SummaryRow>
              <SummaryRow
                icon={<Brain className="h-3.5 w-3.5" />}
                label="Bloom Level"
              >
                <span style={{ color: BLOOM_COLORS[bloomLevel] }}>
                  Level {bloomLevel} — {BLOOM_LABELS[bloomLevel]}
                </span>
              </SummaryRow>
              <SummaryRow icon={<Zap className="h-3.5 w-3.5" />} label="Analogy Domain">
                {ANALOGY_LABELS[analogyDomain]}
              </SummaryRow>
              {name.trim() && (
                <SummaryRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Learner">
                  {name.trim()}
                </SummaryRow>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setStep('analogy')}
                className="flex-1 rounded-xl text-sm h-11"
                style={{ color: 'hsl(245 30% 55%)' }}
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
              </Button>
              <Button
                onClick={handleStartLearning}
                disabled={isLoading}
                className="flex-[2] rounded-xl font-bold text-sm h-11 transition-all duration-200"
                style={{
                  background: isLoading
                    ? 'hsl(var(--edex-glow) / 0.5)'
                    : 'hsl(var(--edex-glow))',
                  color: 'hsl(230 35% 4%)',
                  border: 'none',
                  boxShadow: isLoading
                    ? 'none'
                    : '0 0 20px hsl(var(--edex-glow) / 0.35)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Lexi…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Start Learning
                  </>
                )}
              </Button>
            </div>

            {error && (
              <p className="mt-2 text-center text-xs text-red-400">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5" style={{ color: 'hsl(245 30% 50%)' }}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium text-white">{children}</span>
    </div>
  );
}
