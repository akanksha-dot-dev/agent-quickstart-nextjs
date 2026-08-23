'use client';

import { useState, useEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import type { Subject } from '@/lib/learner';
import { SUBJECT_LABELS, SUBJECT_EMOJIS } from '@/lib/learner';

type LearningFactTickerProps = {
  subject: Subject;
};

const SUBJECT_FACTS: Record<Subject, string[]> = {
  mathematics: [
    'Zero is the only number that is neither positive nor negative.',
    'A prime number has exactly two divisors: 1 and itself.',
    'Pi (π) is irrational — its digits never repeat or terminate.',
    'The Fibonacci sequence appears in flower petal counts in nature.',
    'Euler\'s identity: e^(iπ) + 1 = 0 — called the most beautiful equation.',
    'There are more possible chess games than atoms in the observable universe.',
    'A googol (10^100) is far larger than the number of atoms in the universe.',
    'Fractal geometry describes the irregular shapes found throughout nature.',
  ],
  computer_science: [
    'The first computer bug was a real moth found in a Harvard relay in 1947.',
    'Binary is base-2 — every number is expressed with just 0s and 1s.',
    'A recursive function calls itself to break problems into smaller pieces.',
    'Moore\'s Law predicted transistor counts would double every ~2 years.',
    'The internet was originally called ARPANET, built in 1969.',
    'Quick sort has an average time complexity of O(n log n).',
    'Quantum computers can exist in superposition — solving some problems exponentially faster.',
    'SHA-256 is used to secure Bitcoin transactions cryptographically.',
  ],
  physics: [
    'Light travels 299,792,458 metres per second in a vacuum.',
    'Einstein\'s E=mc² shows mass and energy are interchangeable.',
    'Quantum entanglement links particles regardless of distance.',
    'The Higgs boson (discovered 2012) gives other particles mass.',
    'Entropy always increases in a closed system — the second law of thermodynamics.',
    'A neutron star is so dense a teaspoon would weigh ~10 million tonnes.',
    'Time slows down near massive objects — gravitational time dilation.',
    'Absolute zero (−273.15 °C) is the coldest possible temperature.',
  ],
  history: [
    'The Great Wall of China took over 1,000 years to fully construct.',
    'Cleopatra lived closer in time to the Moon landing than to the pyramids.',
    'The Roman Empire lasted for over 1,000 years (27 BC – 1453 AD).',
    'The printing press (c.1440) caused an information revolution in Europe.',
    'The Black Death killed an estimated 30–60% of Europe\'s population.',
    'The shortest war in history lasted 38–45 minutes (Anglo-Zanzibar War, 1896).',
    'Ancient Egyptians had 42 laws, not just the famous 10 commandments.',
    'Napoleon Bonaparte was actually of average height for his time — 1.68 m.',
  ],
  english_literature: [
    'Shakespeare invented over 1,700 words we still use today.',
    'The first novel is widely considered Murasaki Shikibu\'s "The Tale of Genji" (c. 1000 AD).',
    'A "round" character changes and grows; a "flat" character stays the same.',
    'The Odyssey by Homer was composed orally before being written down.',
    'Iambic pentameter has 10 syllables per line: da-DUM da-DUM da-DUM da-DUM da-DUM.',
    'George Orwell\'s "1984" coined the term "doublethink" and "Big Brother".',
    'Jane Austen began writing at age 11 and never attended a formal school.',
    'Haiku poems have 3 lines: 5, 7, and 5 syllables respectively.',
  ],
  biology: [
    'The human body contains more bacterial cells than human cells.',
    'DNA is only about 2 nanometres wide, yet stretched out it\'s ~2 metres long.',
    'Mitochondria have their own DNA — evidence they were once independent bacteria.',
    'Octopuses have three hearts and blue, copper-based blood.',
    'Neurons in the brain can fire up to 200 times per second.',
    'A slime mould (no brain) can solve mazes to find food efficiently.',
    'All life on Earth shares the same genetic code (codons → amino acids).',
    'Trees communicate through underground fungal networks called "the wood wide web".',
  ],
  chemistry: [
    'Water (H₂O) is the only substance that naturally exists as solid, liquid, and gas on Earth.',
    'Gold is so unreactive it was found as pure metal by ancient civilisations.',
    'The periodic table has 118 confirmed elements, 94 occurring naturally.',
    'Hydrogen is the most abundant element in the universe (~75% of all matter).',
    'Diamond and graphite are both pure carbon — just arranged differently.',
    'Helium is the only element that cannot be solidified at normal pressure.',
    'A catalyst speeds up a reaction without being consumed itself.',
    'pH 7 is neutral; below is acidic, above is alkaline (basic).',
  ],
};

const ROTATION_INTERVAL = 12_000; // ms per fact

export function LearningFactTicker({ subject }: LearningFactTickerProps) {
  const facts = SUBJECT_FACTS[subject] ?? SUBJECT_FACTS.mathematics;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % facts.length);
        setVisible(true);
      }, 400);
    }, ROTATION_INTERVAL);
    return () => clearTimeout(timerRef.current);
  }, [index, facts.length]);

  const currentFact = facts[index];

  return (
    <div
      className="flex items-start gap-2.5 rounded-2xl px-4 py-3"
      style={{
        background: 'hsl(245 30% 8%)',
        border: '1px solid hsl(245 30% 16%)',
        minHeight: 70,
      }}
    >
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: 'hsl(45 95% 60% / 0.12)',
          border: '1px solid hsl(45 95% 60% / 0.25)',
        }}
      >
        <Lightbulb className="h-3.5 w-3.5" style={{ color: 'hsl(45 95% 65%)' }} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'hsl(45 95% 55%)' }}
        >
          {SUBJECT_EMOJIS[subject]} {SUBJECT_LABELS[subject]} Fact
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{
            color: 'hsl(245 15% 70%)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          {currentFact}
        </p>
      </div>
    </div>
  );
}
