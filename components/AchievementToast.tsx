'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Flame, Zap, Star, BookOpen, Brain, Map } from 'lucide-react';

export type AchievementVariant = 'gold' | 'cyan' | 'purple' | 'green' | 'orange';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  variant: AchievementVariant;
  icon: 'trophy' | 'flame' | 'zap' | 'star' | 'book' | 'brain' | 'map';
};

type ToastItem = Achievement & { dismissing: boolean };

type AchievementToastProps = {
  achievements: Achievement[];
};

const VARIANT_STYLES: Record<
  AchievementVariant,
  { bg: string; border: string; iconColor: string; titleColor: string }
> = {
  gold:   { bg: 'hsl(45 95% 8%)',   border: 'hsl(45 95% 55% / 0.4)',  iconColor: 'hsl(45 95% 60%)',  titleColor: 'hsl(45 95% 75%)' },
  cyan:   { bg: 'hsl(194 80% 8%)',  border: 'hsl(194 80% 50% / 0.4)', iconColor: 'hsl(194 80% 58%)', titleColor: 'hsl(194 80% 75%)' },
  purple: { bg: 'hsl(270 60% 8%)',  border: 'hsl(270 60% 60% / 0.4)', iconColor: 'hsl(270 60% 70%)', titleColor: 'hsl(270 60% 82%)' },
  green:  { bg: 'hsl(142 65% 6%)',  border: 'hsl(142 65% 45% / 0.4)', iconColor: 'hsl(142 65% 52%)', titleColor: 'hsl(142 65% 72%)' },
  orange: { bg: 'hsl(24 90% 7%)',   border: 'hsl(24 90% 52% / 0.4)',  iconColor: 'hsl(24 90% 60%)',  titleColor: 'hsl(24 90% 76%)' },
};

const ICON_MAP: Record<Achievement['icon'], React.FC<{ className?: string }>> = {
  trophy: Trophy,
  flame:  Flame,
  zap:    Zap,
  star:   Star,
  book:   BookOpen,
  brain:  Brain,
  map:    Map,
};

// How long each toast stays before auto-dismissing (ms)
const TOAST_DURATION = 4500;
const DISMISS_ANIM   = 400;

export function AchievementToast({ achievements }: AchievementToastProps) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  // Enqueue new achievements as they arrive
  useEffect(() => {
    const fresh = achievements.filter((a) => !seen.has(a.id));
    if (fresh.length === 0) return;
    setSeen((prev) => {
      const next = new Set(prev);
      fresh.forEach((a) => next.add(a.id));
      return next;
    });
    setQueue((prev) => [...prev, ...fresh.map((a) => ({ ...a, dismissing: false }))]);
  }, [achievements, seen]);

  const dismiss = useCallback((id: string) => {
    // Mark as dismissing (triggers CSS slide-out)
    setQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t)),
    );
    // Remove from queue after animation completes
    setTimeout(() => {
      setQueue((prev) => prev.filter((t) => t.id !== id));
    }, DISMISS_ANIM);
  }, []);

  // Auto-dismiss the oldest toast
  useEffect(() => {
    if (queue.length === 0) return;
    const oldest = queue.find((t) => !t.dismissing);
    if (!oldest) return;
    const timer = setTimeout(() => dismiss(oldest.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [queue, dismiss]);

  if (queue.length === 0) return null;

  return (
    <div
      className="fixed right-4 top-20 z-50 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {queue.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        const Icon = ICON_MAP[toast.icon];
        return (
          <div
            key={toast.id}
            className="edex-font-body flex w-72 items-start gap-3 rounded-2xl p-3 shadow-2xl"
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              backdropFilter: 'blur(16px)',
              animation: toast.dismissing
                ? `achievement-slide-out ${DISMISS_ANIM}ms cubic-bezier(0.4, 0, 1, 1) forwards`
                : 'achievement-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
              boxShadow: `0 8px 32px ${style.border}`,
            }}
            onClick={() => dismiss(toast.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && dismiss(toast.id)}
            aria-label={`Achievement: ${toast.title}. Click to dismiss.`}
          >
            {/* Icon */}
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${style.iconColor}22`, border: `1px solid ${style.iconColor}44` }}
            >
            <span style={{ color: style.iconColor, display: 'flex' }}>
              <Icon className="h-4 w-4" />
            </span>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-none" style={{ color: style.titleColor }}>
                {toast.title}
              </p>
              <p className="mt-1 text-xs leading-snug" style={{ color: 'hsl(245 20% 60%)' }}>
                {toast.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
