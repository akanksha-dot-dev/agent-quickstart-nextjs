'use client';

import type { BloomLevel } from '@/lib/learner';
import { BLOOM_LABELS, BLOOM_DESCRIPTIONS } from '@/lib/learner';

type BloomHUDPanelProps = {
  bloomLevel: BloomLevel;
  streakCount: number;
};

const BLOOM_COLORS: Record<BloomLevel, { hsl: string; hex: string }> = {
  1: { hsl: 'hsl(214 89% 60%)', hex: '#60a5fa' },
  2: { hsl: 'hsl(173 80% 44%)', hex: '#2dd4bf' },
  3: { hsl: 'hsl(142 71% 45%)', hex: '#4ade80' },
  4: { hsl: 'hsl(38 92% 50%)',  hex: '#fbbf24' },
  5: { hsl: 'hsl(24 95% 55%)',  hex: '#fb923c' },
  6: { hsl: 'hsl(270 70% 60%)', hex: '#a78bfa' },
};

const LEVEL_LABELS: BloomLevel[] = [1, 2, 3, 4, 5, 6];

export function BloomHUDPanel({ bloomLevel, streakCount }: BloomHUDPanelProps) {
  const color = BLOOM_COLORS[bloomLevel];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold tracking-wider uppercase"
          style={{ color: 'hsl(245 30% 55%)' }}
        >
          Bloom&apos;s Level
        </p>
        {streakCount > 0 && (
          <span
            className="animate-streak-pop flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              background: 'hsl(45 95% 60% / 0.15)',
              color: 'hsl(45 95% 65%)',
              border: '1px solid hsl(45 95% 60% / 0.3)',
            }}
          >
            🔥 {streakCount}
          </span>
        )}
      </div>

      {/* Main level indicator */}
      <div
        className="rounded-2xl p-3"
        style={{
          background: `${color.hex}0f`,
          border: `1px solid ${color.hex}30`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="h-2 w-2 rounded-full animate-galaxy-pulse"
            style={{ background: color.hsl }}
          />
          <span className="text-sm font-semibold" style={{ color: color.hsl }}>
            Level {bloomLevel} — {BLOOM_LABELS[bloomLevel]}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'hsl(245 20% 55%)' }}>
          {BLOOM_DESCRIPTIONS[bloomLevel]}
        </p>
      </div>

      {/* 6-step progress bar */}
      <div className="flex gap-1">
        {LEVEL_LABELS.map((level) => {
          const c = BLOOM_COLORS[level];
          const isActive = level === bloomLevel;
          const isPast = level < bloomLevel;
          return (
            <div
              key={level}
              title={`Level ${level}: ${BLOOM_LABELS[level]}`}
              className="flex-1 rounded-full transition-all duration-500"
              style={{
                height: isActive ? '6px' : '4px',
                background: isPast
                  ? `${c.hex}80`
                  : isActive
                  ? c.hsl
                  : 'hsl(245 30% 18%)',
                boxShadow: isActive ? `0 0 8px ${c.hex}80` : 'none',
                marginTop: isActive ? '0px' : '1px',
              }}
            />
          );
        })}
      </div>

      {/* Level labels */}
      <div className="flex justify-between px-0.5">
        {LEVEL_LABELS.map((level) => (
          <span
            key={level}
            className="text-[9px] text-center transition-all duration-300"
            style={{
              color:
                level === bloomLevel
                  ? BLOOM_COLORS[level].hsl
                  : level < bloomLevel
                  ? 'hsl(245 20% 45%)'
                  : 'hsl(245 20% 28%)',
              fontWeight: level === bloomLevel ? 600 : 400,
            }}
          >
            {BLOOM_LABELS[level].slice(0, 4)}
          </span>
        ))}
      </div>
    </div>
  );
}
