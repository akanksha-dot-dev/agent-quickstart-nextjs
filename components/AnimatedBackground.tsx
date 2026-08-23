'use client';

/**
 * AnimatedBackground — floating nebula orbs + dot grid overlay.
 * Pure CSS-driven, SSR-safe, no canvas, zero JS after mount.
 */

const ORBS = [
  { size: 520, x: 8,  y: 15, delay: 0,    duration: 20, animKey: 'a', opacity: 0.55 },
  { size: 380, x: 75, y: 55, delay: 4,    duration: 25, animKey: 'b', opacity: 0.40 },
  { size: 600, x: 45, y: 85, delay: 8,    duration: 32, animKey: 'c', opacity: 0.30 },
  { size: 280, x: 88, y: 10, delay: 2,    duration: 18, animKey: 'a', opacity: 0.38 },
  { size: 340, x: 18, y: 68, delay: 12,   duration: 28, animKey: 'b', opacity: 0.35 },
  { size: 200, x: 58, y: 30, delay: 6,    duration: 22, animKey: 'c', opacity: 0.25 },
];

const ORB_COLORS = [
  'radial-gradient(circle, hsl(245 80% 28%) 0%, transparent 70%)',
  'radial-gradient(circle, hsl(270 60% 22%) 0%, transparent 70%)',
  'radial-gradient(circle, hsl(220 50% 18%) 0%, transparent 70%)',
  'radial-gradient(circle, hsl(290 55% 20%) 0%, transparent 70%)',
  'radial-gradient(circle, hsl(260 65% 24%) 0%, transparent 70%)',
  'radial-gradient(circle, hsl(194 70% 16%) 0%, transparent 70%)',
];

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: 'translate(-50%, -50%)',
            background: ORB_COLORS[i % ORB_COLORS.length],
            opacity: orb.opacity,
            filter: 'blur(72px)',
            animation: `edex-orb-${orb.animKey} ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(245 60% 65% / 0.045) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-x-0 top-0 h-48"
        style={{
          background:
            'linear-gradient(to bottom, hsl(230 35% 4%) 0%, transparent 100%)',
        }}
      />
      {/* Bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            'linear-gradient(to top, hsl(230 35% 4%) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
