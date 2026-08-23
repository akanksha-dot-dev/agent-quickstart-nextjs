'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { BloomLevel } from '@/lib/learner';
import { BLOOM_LABELS, SUBJECT_EMOJIS } from '@/lib/learner';
import type { Subject } from '@/lib/learner';

type TopicNode = {
  topic: string;
  score: number;       // 0-100
  bloomReached: BloomLevel;
};

type KnowledgeGalaxyPanelProps = {
  nodes: TopicNode[];
  subject: Subject;
  bloomLevel: BloomLevel;
  activeTopic?: string | null;
  streakCount: number;
};

const BLOOM_HEX: Record<BloomLevel, string> = {
  1: '#60a5fa',
  2: '#34d399',
  3: '#4ade80',
  4: '#fbbf24',
  5: '#fb923c',
  6: '#a78bfa',
};

function scoreToRadius(score: number): number {
  // Min 10px, max 34px
  return 10 + (score / 100) * 24;
}

function scoreToColor(score: number, bloomReached: BloomLevel): string {
  return BLOOM_HEX[bloomReached] ?? '#6366f1';
}

/** Deterministic pseudo-random from topic string. */
function topicToSeed(topic: string): number {
  let h = 0;
  for (let i = 0; i < topic.length; i++) {
    h = (Math.imul(31, h) + topic.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number, i: number): number {
  const x = Math.sin(seed + i) * 10000;
  return x - Math.floor(x);
}

export function KnowledgeGalaxyPanel({
  nodes,
  subject,
  bloomLevel,
  activeTopic,
  streakCount,
}: KnowledgeGalaxyPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  const drawRef = useRef<() => void>(() => {});

  useEffect(() => {
    drawRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const phase = phaseRef.current;

      ctx.clearRect(0, 0, W, H);

      // Deep space background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bg.addColorStop(0, 'hsl(245 50% 10%)');
      bg.addColorStop(1, 'hsl(230 35% 4%)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Star field (static based on canvas size)
      for (let i = 0; i < 60; i++) {
        const sx = seededRandom(i * 7, 1) * W;
        const sy = seededRandom(i * 7, 2) * H;
        const ss = seededRandom(i * 7, 3) * 1.5 + 0.3;
        const sa = 0.3 + seededRandom(i * 7, 4) * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${sa})`;
        ctx.fill();
      }

      if (nodes.length === 0) {
        // Empty state: pulsing center orb
        const pulse = 1 + Math.sin(phase * 0.04) * 0.06;
        const r = 28 * pulse;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
        grd.addColorStop(0, 'rgba(99, 102, 241, 0.55)');
        grd.addColorStop(0.5, 'rgba(99, 102, 241, 0.18)');
        grd.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.65)';
        ctx.fill();

        ctx.font = '22px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(SUBJECT_EMOJIS[subject], cx, cy);

        ctx.font = '10px Inter, system-ui';
        ctx.fillStyle = 'rgba(180, 180, 255, 0.5)';
        ctx.fillText('Start talking to grow your galaxy', cx, cy + 44);

        phaseRef.current += 1;
        rafRef.current = requestAnimationFrame(drawRef.current);
        return;
      }

      // Arrange nodes in orbit rings
      const total = nodes.length;
      const nodePositions: Array<{ x: number; y: number; node: TopicNode }> = [];

      nodes.forEach((node, i) => {
        const seed = topicToSeed(node.topic);
        const angle = (i / total) * Math.PI * 2 + seededRandom(seed, 0) * 0.3;
        const ringVariation = seededRandom(seed, 1) * 0.2 - 0.1;
        const minR = 45;
        const maxR = Math.min(cx, cy) - 38;
        const ring = minR + (node.score / 100) * (maxR - minR) * (1 + ringVariation);
        nodePositions.push({
          x: cx + Math.cos(angle) * ring,
          y: cy + Math.sin(angle) * ring,
          node,
        });
      });

      // Draw constellation lines
      nodePositions.forEach((p1, i) => {
        nodePositions.forEach((p2, j) => {
          if (j <= i) return;
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 90)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Center glow
      const centerGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
      centerGrd.addColorStop(0, 'rgba(99,102,241,0.4)');
      centerGrd.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = centerGrd;
      ctx.fill();

      // Draw nodes
      nodePositions.forEach(({ x, y, node }) => {
        const isActive = node.topic === activeTopic;
        const pulse = isActive ? 1 + Math.sin(phase * 0.06) * 0.12 : 1;
        const r = scoreToRadius(node.score) * pulse;
        const color = scoreToColor(node.score, node.bloomReached);

        const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
        grd.addColorStop(0, color + '55');
        grd.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color + 'cc';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();

        if (r > 16) {
          ctx.font = `bold ${Math.max(9, r * 0.55)}px Inter, system-ui`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillText(`${node.score}`, x, y);
        }

        ctx.font = '9px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isActive ? 'rgba(255,255,255,0.95)' : 'rgba(180,180,255,0.65)';
        const label = node.topic.length > 14 ? node.topic.slice(0, 13) + '…' : node.topic;
        ctx.fillText(label, x, y + r + 5);
      });

      if (streakCount > 0) {
        const bx = W - 12;
        const by = 12;
        ctx.font = 'bold 11px Inter, system-ui';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'hsl(45 95% 60%)';
        ctx.fillText(`🔥 ${streakCount}`, bx, by);
      }

      ctx.font = '10px Inter, system-ui';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = BLOOM_HEX[bloomLevel] + 'cc';
      ctx.fillText(`L${bloomLevel} · ${BLOOM_LABELS[bloomLevel]}`, 10, 10);

      phaseRef.current += 1;
      rafRef.current = requestAnimationFrame(drawRef.current);
    };
  }, [nodes, subject, bloomLevel, activeTopic, streakCount]);


  // Start the animation loop; restart whenever drawRef updates (deps changed)
  useEffect(() => {
    const loop = () => {
      drawRef.current();
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [nodes, subject, bloomLevel, activeTopic, streakCount]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <p
        className="text-xs font-semibold tracking-wider uppercase px-1"
        style={{ color: 'hsl(245 30% 55%)' }}
      >
        Knowledge Galaxy
      </p>
      <canvas
        ref={canvasRef}
        width={280}
        height={220}
        className="w-full rounded-2xl"
        style={{
          border: '1px solid hsl(245 100% 70% / 0.12)',
          background: 'hsl(230 35% 4%)',
        }}
        aria-label="Knowledge galaxy — visual map of your topic mastery"
        role="img"
      />
    </div>
  );
}
