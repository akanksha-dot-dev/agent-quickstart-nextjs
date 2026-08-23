'use client';

import { useMemo } from 'react';
import { TrendingUp, Clock, Target, Flame } from 'lucide-react';
import type { LearnerProfile } from '@/lib/learner';
import { SUBJECT_LABELS, SUBJECT_EMOJIS, BLOOM_LABELS } from '@/lib/learner';

type SessionSummaryPanelProps = {
  profile: LearnerProfile;
  sessionStartTime: number;
  topicsDiscussed: string[];
};

export function SessionSummaryPanel({
  profile,
  sessionStartTime,
  topicsDiscussed,
}: SessionSummaryPanelProps) {
  const elapsedMinutes = useMemo(() => {
    const ms = Date.now() - sessionStartTime;
    return Math.max(0, Math.floor(ms / 60000));
  }, [sessionStartTime]);

  const masteryEntries = useMemo(() => {
    return Object.entries(profile.masteryScores)
      .filter(([topic]) => topicsDiscussed.includes(topic))
      .map(([topic, m]) => ({ topic, score: m.score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [profile.masteryScores, topicsDiscussed]);

  return (
    <div className="space-y-3">
      <p
        className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: 'hsl(245 30% 55%)' }}
      >
        Session Summary
      </p>

      {/* Key stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatChip
          icon={<Clock className="h-3 w-3" />}
          value={`${elapsedMinutes}m`}
          label="Duration"
          color="hsl(214 89% 65%)"
        />
        <StatChip
          icon={<Flame className="h-3 w-3" />}
          value={String(profile.streakCount)}
          label="Streak"
          color="hsl(45 95% 60%)"
        />
        <StatChip
          icon={<Target className="h-3 w-3" />}
          value={`L${profile.bloomLevel}`}
          label={BLOOM_LABELS[profile.bloomLevel]}
          color={`hsl(var(--bloom-${profile.bloomLevel}))`}
        />
      </div>

      {/* Subject badge */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: 'hsl(245 30% 8%)',
          border: '1px solid hsl(245 30% 18%)',
        }}
      >
        <span className="text-lg">{SUBJECT_EMOJIS[profile.subject]}</span>
        <div>
          <p className="text-xs font-semibold text-white">
            {SUBJECT_LABELS[profile.subject]}
          </p>
          <p className="text-[10px]" style={{ color: 'hsl(245 20% 50%)' }}>
            Session {profile.totalSessions}
          </p>
        </div>
      </div>

      {/* Topics mastery */}
      {masteryEntries.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium" style={{ color: 'hsl(245 20% 45%)' }}>
            Topics this session
          </p>
          {masteryEntries.map(({ topic, score }) => (
            <div key={topic} className="flex items-center gap-2">
              <TrendingUp
                className="h-3 w-3 shrink-0"
                style={{ color: 'hsl(142 65% 50%)' }}
              />
              <span
                className="flex-1 truncate text-[10px]"
                style={{ color: 'hsl(245 20% 70%)' }}
              >
                {topic}
              </span>
              <div className="flex items-center gap-1">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${score * 0.5}px`,
                    background: `hsl(var(--bloom-${Math.min(6, Math.max(1, Math.ceil(score / 17)))}))`,
                    minWidth: '4px',
                  }}
                />
                <span className="text-[9px] font-semibold" style={{ color: 'hsl(245 20% 65%)' }}>
                  {score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {masteryEntries.length === 0 && (
        <p className="text-[10px] text-center py-2" style={{ color: 'hsl(245 20% 40%)' }}>
          Topics appear here as you learn
        </p>
      )}
    </div>
  );
}

function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-xl p-2 gap-1"
      style={{
        background: 'hsl(245 30% 8%)',
        border: '1px solid hsl(245 30% 16%)',
      }}
    >
      <div style={{ color }}>{icon}</div>
      <span className="text-sm font-bold leading-none" style={{ color }}>
        {value}
      </span>
      <span className="text-[9px] text-center leading-none" style={{ color: 'hsl(245 20% 45%)' }}>
        {label}
      </span>
    </div>
  );
}
