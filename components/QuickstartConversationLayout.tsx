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
}: QuickstartConversationLayoutProps) {
  const hasEdexPanels = knowledgeGalaxy || bloomHUD || sessionSummary;

  return (
    <div className="flex min-h-0 flex-1 flex-col text-left">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b border-border px-4 py-4 md:h-[76px] md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
        <div className="flex min-w-0 items-center gap-3">
          {/* EdexConvoAI brand */}
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
      </header>

      {/* Main layout: left rail + center + optional EdexConvoAI right rail */}
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
          </div>
        </main>

        {/* RIGHT RAIL: EdexConvoAI panels (optional) */}
        {hasEdexPanels && (
          <aside
            className="order-3 flex h-auto min-h-0 w-full shrink-0 flex-col gap-4 lg:h-full lg:w-[18rem] lg:border-l lg:border-border/80 lg:pl-5 lg:pt-3"
          >
            {bloomHUD}
            {knowledgeGalaxy}
            {sessionSummary}
          </aside>
        )}
      </div>
    </div>
  );
}
