'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

type QuickstartConversationLayoutProps = {
  statusPanel: ReactNode;
  pipelineMetrics: ReactNode;
  transcriptPanel: ReactNode;
  visualizer: ReactNode;
  controls: ReactNode;
  onEndConversation: () => void;
  /** EdexConvoAI: Knowledge Galaxy canvas */
  knowledgeGalaxy?: ReactNode;
  /** EdexConvoAI: Bloom's Taxonomy HUD */
  bloomHUD?: ReactNode;
  /** EdexConvoAI: Session summary stats */
  sessionSummary?: ReactNode;
  /** EdexConvoAI: Rotating subject fact below session summary */
  learningFact?: ReactNode;
  /** EdexConvoAI: XP earned this session (0-100), renders a progress bar in header */
  sessionXP?: number;
};

export function QuickstartConversationLayout({
  statusPanel,
  pipelineMetrics,
  transcriptPanel,
  visualizer,
  controls,
  onEndConversation,
  knowledgeGalaxy,
  bloomHUD,
  sessionSummary,
  learningFact,
  sessionXP,
}: QuickstartConversationLayoutProps) {
  const hasEdexPanels = knowledgeGalaxy || bloomHUD || sessionSummary;

  return (
    <div className="flex min-h-0 flex-1 flex-col text-left">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex shrink-0 flex-col gap-2 border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {/* EdexConvoAI brand badge */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, hsl(245 100% 70% / 0.2) 0%, hsl(270 80% 65% / 0.15) 100%)',
                border: '1px solid hsl(245 100% 70% / 0.25)',
              }}
            >
              <Sparkles className="h-5 w-5" style={{ color: 'hsl(245 100% 72%)' }} />
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-1">
              <span
                className="edex-font-heading truncate text-lg font-semibold leading-none tracking-[-0.025em]"
                style={{ color: 'hsl(240 60% 98%)' }}
              >
                EdexConvoAI
              </span>
              {pipelineMetrics}
            </div>
          </div>

          <div className="flex items-center gap-2 md:pr-1">
            {statusPanel}
            <Button
              variant="destructive"
              size="sm"
              className="h-8 rounded-md border border-destructive bg-transparent px-3 text-xs font-medium text-destructive hover:bg-destructive/10"
              onClick={onEndConversation}
              aria-label="End conversation with AI tutor"
              title="End conversation"
            >
              End Session
            </Button>
          </div>
        </div>

        {/* Session XP bar */}
        {sessionXP !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(245 30% 48%)' }}>
              Session XP
            </span>
            <div
              className="h-1 flex-1 overflow-hidden rounded-full"
              style={{ background: 'hsl(245 30% 14%)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, sessionXP))}%`,
                  background:
                    'linear-gradient(90deg, hsl(245 100% 65%), hsl(270 70% 65%), hsl(45 95% 60%))',
                  boxShadow: '0 0 8px hsl(245 100% 65% / 0.5)',
                }}
                role="progressbar"
                aria-valuenow={sessionXP}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Session XP: ${Math.round(sessionXP)}%`}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: 'hsl(245 100% 72%)' }}>
              {Math.round(sessionXP)}%
            </span>
          </div>
        )}
      </header>

      {/* ── Main layout ──────────────────────────────────────── */}
      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 px-4 pb-4 pt-4 md:px-6 lg:flex-row lg:gap-0">

        {/* LEFT: Transcript */}
        <aside className="order-2 h-64 min-h-0 w-full shrink-0 lg:order-1 lg:h-full lg:w-[24rem]">
          {transcriptPanel}
        </aside>

        {/* CENTER: Visualizer + controls */}
        <main className="order-1 flex min-h-0 flex-1 flex-col lg:order-2 lg:border-l lg:border-border/80 lg:pl-6">
          <div className="flex min-h-0 flex-1 flex-col pb-2 pt-3 md:pb-6">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              {visualizer}
            </div>
            <div className="shrink-0 pt-4">{controls}</div>
            {/* Keyboard shortcut hints — voice-native discovery */}
            <div
              className="mx-auto mt-3 flex items-center gap-4 animate-fade-up"
              style={{ animationDelay: '2s', animationFillMode: 'both', opacity: 0 }}
              aria-label="Keyboard shortcuts"
            >
              <KbHint keys={['Space']} label="Mute / Unmute" />
              <span style={{ color: 'hsl(245 30% 28%)' }}>·</span>
              <KbHint keys={['Esc']} label="Exit fullscreen" />
            </div>
          </div>
        </main>

        {/* RIGHT RAIL: EdexConvoAI panels */}
        {hasEdexPanels && (
          <aside
            className="order-3 flex h-auto min-h-0 w-full shrink-0 flex-col gap-4 lg:h-full lg:w-[18rem] lg:border-l lg:border-border/80 lg:pl-5 lg:pt-3 lg:overflow-y-auto"
          >
            {bloomHUD}
            {knowledgeGalaxy}
            {sessionSummary}
            {learningFact}
          </aside>
        )}
      </div>
    </div>
  );
}

/** Tiny keyboard shortcut badge — rendered inside the conversation view */
function KbHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded px-1.5 text-[10px] font-bold"
          style={{
            background: 'hsl(245 30% 10%)',
            border: '1px solid hsl(245 30% 22%)',
            color: 'hsl(245 30% 55%)',
            fontFamily: 'ui-monospace, monospace',
            boxShadow: '0 1px 0 hsl(245 30% 18%)',
          }}
        >
          {k}
        </kbd>
      ))}
      <span className="text-[10px]" style={{ color: 'hsl(245 30% 38%)' }}>{label}</span>
    </div>
  );
}
