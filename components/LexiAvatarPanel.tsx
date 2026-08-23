'use client';

import { useMemo } from 'react';
import { AgentVisualizer, type AgentVisualizerState } from 'agora-agent-uikit';
import type { BloomLevel, Subject } from '@/lib/learner';
import { SUBJECT_EMOJIS, BLOOM_LABELS } from '@/lib/learner';

type VisualizerState = AgentVisualizerState;

type LexiAvatarPanelProps = {
  visualizerState: VisualizerState;
  subject?: Subject;
  bloomLevel?: BloomLevel;
  children?: React.ReactNode; // remote user audio nodes
};

const STATE_CONFIG: Record<
  VisualizerState,
  {
    label: string;
    labelColor: string;
    ring1Color: string;
    ring2Color: string;
    glowColor: string;
    ring1Duration: string;
    ring2Duration: string;
    dotColor: string;
  }
> = {
  'not-joined': {
    label: 'Connecting to Lexi…',
    labelColor: 'hsl(38 92% 60%)',
    ring1Color: 'hsl(38 92% 55% / 0.25)',
    ring2Color: 'hsl(38 92% 55% / 0.1)',
    glowColor: 'hsl(38 92% 55% / 0.15)',
    ring1Duration: '3s',
    ring2Duration: '5s',
    dotColor: 'hsl(38 92% 65%)',
  },
  joining: {
    label: 'Joining session…',
    labelColor: 'hsl(38 92% 60%)',
    ring1Color: 'hsl(38 92% 55% / 0.28)',
    ring2Color: 'hsl(38 92% 55% / 0.10)',
    glowColor: 'hsl(38 92% 55% / 0.16)',
    ring1Duration: '2s',
    ring2Duration: '3.5s',
    dotColor: 'hsl(38 92% 65%)',
  },
  ambient: {
    label: 'Ready when you are…',
    labelColor: 'hsl(245 30% 55%)',
    ring1Color: 'hsl(245 60% 55% / 0.18)',
    ring2Color: 'hsl(245 60% 55% / 0.06)',
    glowColor: 'hsl(245 60% 55% / 0.12)',
    ring1Duration: '8s',
    ring2Duration: '14s',
    dotColor: 'hsl(245 60% 65%)',
  },
  listening: {
    label: 'Lexi is listening…',
    labelColor: 'hsl(194 100% 60%)',
    ring1Color: 'hsl(194 100% 55% / 0.30)',
    ring2Color: 'hsl(194 100% 55% / 0.12)',
    glowColor: 'hsl(194 100% 55% / 0.18)',
    ring1Duration: '4s',
    ring2Duration: '7s',
    dotColor: 'hsl(194 100% 65%)',
  },
  analyzing: {
    label: 'Lexi is thinking…',
    labelColor: 'hsl(38 92% 60%)',
    ring1Color: 'hsl(38 92% 55% / 0.28)',
    ring2Color: 'hsl(38 92% 55% / 0.10)',
    glowColor: 'hsl(38 92% 55% / 0.16)',
    ring1Duration: '2.5s',
    ring2Duration: '4s',
    dotColor: 'hsl(38 92% 65%)',
  },
  talking: {
    label: 'Lexi is speaking',
    labelColor: 'hsl(270 70% 70%)',
    ring1Color: 'hsl(270 70% 65% / 0.32)',
    ring2Color: 'hsl(270 70% 65% / 0.14)',
    glowColor: 'hsl(270 70% 65% / 0.20)',
    ring1Duration: '1.8s',
    ring2Duration: '3s',
    dotColor: 'hsl(270 70% 72%)',
  },
  disconnected: {
    label: 'Disconnected',
    labelColor: 'hsl(0 60% 55%)',
    ring1Color: 'hsl(0 60% 50% / 0.2)',
    ring2Color: 'hsl(0 60% 50% / 0.08)',
    glowColor: 'hsl(0 60% 50% / 0.10)',
    ring1Duration: '6s',
    ring2Duration: '10s',
    dotColor: 'hsl(0 60% 60%)',
  },
};

// 8 small dots that orbit the avatar ring
const ORBIT_DOTS = Array.from({ length: 8 }, (_, i) => ({
  angle: (i / 8) * 360,
  delay: (i / 8) * -4,
  size: i % 2 === 0 ? 5 : 3,
}));

export function LexiAvatarPanel({
  visualizerState,
  subject,
  bloomLevel,
  children,
}: LexiAvatarPanelProps) {
  const cfg = STATE_CONFIG[visualizerState] ?? STATE_CONFIG.idle;

  const subjectEmoji = subject ? SUBJECT_EMOJIS[subject] : '🤖';
  const bloomLabel = bloomLevel ? BLOOM_LABELS[bloomLevel] : null;

  const orbitRadius = 132; // px — matches ring size below

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-6 select-none"
      role="region"
      aria-label="AI tutor Lexi status visualization"
    >
      {/* ── Orbital ring system ─────────────────────────────── */}
      <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>

        {/* Outer ambient glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${cfg.glowColor} 0%, transparent 70%)`,
            transform: 'scale(1.3)',
            transition: 'background 0.8s ease',
          }}
        />

        {/* Ring 2 — slow outer dashed ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 16,
            border: `1px dashed ${cfg.ring2Color}`,
            animation: `edex-orbit ${cfg.ring2Duration} linear infinite`,
            transition: 'border-color 0.8s ease',
          }}
        />

        {/* Ring 1 — faster solid ring with orbiting dots */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 40,
            border: `1px solid ${cfg.ring1Color}`,
            animation: `edex-orbit-reverse ${cfg.ring1Duration} linear infinite`,
            transition: 'border-color 0.8s ease',
          }}
        >
          {/* Orbiting dots on ring 1 */}
          {ORBIT_DOTS.map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: dot.size,
                height: dot.size,
                background: cfg.dotColor,
                top: '50%',
                left: '50%',
                marginTop: -dot.size / 2,
                marginLeft: -dot.size / 2,
                transform: `rotate(${dot.angle}deg) translateX(${orbitRadius / 2.2}px)`,
                opacity: i % 2 === 0 ? 0.9 : 0.4,
                transition: 'background 0.8s ease',
                boxShadow: i % 2 === 0 ? `0 0 6px ${cfg.dotColor}` : 'none',
              }}
            />
          ))}
        </div>

        {/* Inner glow ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 65,
            border: `2px solid ${cfg.ring1Color}`,
            boxShadow: `inset 0 0 24px ${cfg.glowColor}, 0 0 24px ${cfg.glowColor}`,
            transition: 'all 0.8s ease',
          }}
        />

        {/* AgentVisualizer at center */}
        <div className="relative z-10 flex items-center justify-center">
          <AgentVisualizer state={visualizerState} size="lg" />
        </div>

        {/* Subject emoji badge — top right of the ring */}
        {subject && (
          <div
            className="absolute text-2xl animate-float"
            style={{ top: 28, right: 28 }}
            title={`Subject: ${subject}`}
          >
            {subjectEmoji}
          </div>
        )}

        {/* Hidden remote user audio nodes */}
        {children}
      </div>

      {/* ── Status label ────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {/* Animated status dot */}
          <span
            className="inline-block h-2 w-2 rounded-full animate-galaxy-pulse"
            style={{ background: cfg.dotColor, transition: 'background 0.8s ease' }}
          />
          <span
            className="text-sm font-medium tracking-wide transition-colors duration-700"
            style={{ color: cfg.labelColor }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Bloom level pill */}
        {bloomLabel && bloomLevel && (
          <span
            className="rounded-full px-3 py-0.5 text-xs font-semibold"
            style={{
              background: `hsl(var(--bloom-${bloomLevel}) / 0.12)`,
              color: `hsl(var(--bloom-${bloomLevel}))`,
              border: `1px solid hsl(var(--bloom-${bloomLevel}) / 0.3)`,
            }}
          >
            {bloomLabel} Level
          </span>
        )}
      </div>
    </div>
  );
}
