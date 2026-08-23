/**
 * lib/learner.ts
 * Core learner state management for EdexConvoAI.
 * Encapsulates the knowledge graph, Ebbinghaus forgetting curves,
 * and Bloom's Taxonomy progression — all persisted in localStorage.
 */

export type BloomLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const BLOOM_LABELS: Record<BloomLevel, string> = {
  1: 'Remember',
  2: 'Understand',
  3: 'Apply',
  4: 'Analyze',
  5: 'Evaluate',
  6: 'Create',
};

export const BLOOM_DESCRIPTIONS: Record<BloomLevel, string> = {
  1: 'Recall facts and basic concepts',
  2: 'Explain ideas or concepts',
  3: 'Use information in new situations',
  4: 'Draw connections and identify patterns',
  5: 'Justify decisions and make judgments',
  6: 'Produce new or original work',
};

export type Subject =
  | 'mathematics'
  | 'computer_science'
  | 'physics'
  | 'history'
  | 'english_literature'
  | 'biology'
  | 'chemistry';

export const SUBJECT_LABELS: Record<Subject, string> = {
  mathematics: 'Mathematics',
  computer_science: 'Computer Science',
  physics: 'Physics',
  history: 'History',
  english_literature: 'English Literature',
  biology: 'Biology',
  chemistry: 'Chemistry',
};

export const SUBJECT_EMOJIS: Record<Subject, string> = {
  mathematics: '📐',
  computer_science: '💻',
  physics: '⚛️',
  history: '📜',
  english_literature: '📚',
  biology: '🧬',
  chemistry: '🧪',
};

export type AnalogyDomain =
  | 'sports'
  | 'music'
  | 'food'
  | 'travel'
  | 'gaming'
  | 'movies';

export const ANALOGY_LABELS: Record<AnalogyDomain, string> = {
  sports: 'Sports & Athletics',
  music: 'Music & Sound',
  food: 'Food & Cooking',
  travel: 'Travel & Geography',
  gaming: 'Gaming & Puzzles',
  movies: 'Movies & Stories',
};

/** Mastery score for a single topic, 0-100. */
export interface TopicMastery {
  score: number;          // 0-100
  lastSeen: number;       // Unix timestamp ms
  bloomReached: BloomLevel;
  attempts: number;
}

export interface LearnerProfile {
  version: number;
  name: string;
  subject: Subject;
  bloomLevel: BloomLevel;
  analogyDomain: AnalogyDomain;
  masteryScores: Record<string, TopicMastery>;  // topic slug → mastery
  streakCount: number;
  totalSessions: number;
  lastSessionAt: number | null;  // Unix timestamp ms
  currentTopic: string | null;
}

const STORAGE_KEY = 'edex_convoai_learner_v1';
const CURRENT_VERSION = 1;

/** Ebbinghaus stability constant: score after 1 day without review. */
const EBBINGHAUS_DAILY_RETENTION = 0.9;

/** Mastery threshold to advance Bloom level (0-100). */
const BLOOM_ADVANCE_THRESHOLD = 75;

/**
 * Apply Ebbinghaus forgetting curve decay to a mastery score.
 * score(t) = score * retention^days
 */
function applyDecay(score: number, lastSeenMs: number): number {
  const daysSince = (Date.now() - lastSeenMs) / (1000 * 60 * 60 * 24);
  const decayed = score * Math.pow(EBBINGHAUS_DAILY_RETENTION, daysSince);
  return Math.max(0, Math.round(decayed));
}

export function createDefaultProfile(
  name: string,
  subject: Subject,
  bloomLevel: BloomLevel,
  analogyDomain: AnalogyDomain,
): LearnerProfile {
  return {
    version: CURRENT_VERSION,
    name,
    subject,
    bloomLevel,
    analogyDomain,
    masteryScores: {},
    streakCount: 0,
    totalSessions: 0,
    lastSessionAt: null,
    currentTopic: null,
  };
}

export class LearnerProfileManager {
  private profile: LearnerProfile;

  constructor(profile: LearnerProfile) {
    this.profile = { ...profile };
  }

  /** Load from localStorage, or null if nothing is stored. */
  static load(): LearnerProfileManager | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: LearnerProfile = JSON.parse(raw);
      if (parsed.version !== CURRENT_VERSION) return null;
      return new LearnerProfileManager(parsed);
    } catch {
      return null;
    }
  }

  /** Persist the current profile to localStorage. */
  save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch {
      // Ignore storage errors (quota, private mode, etc.)
    }
  }

  /** Clear saved profile. */
  static clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  getProfile(): LearnerProfile {
    return { ...this.profile };
  }

  /** Get current mastery score for a topic, with Ebbinghaus decay applied. */
  getDecayedScore(topic: string): number {
    const entry = this.profile.masteryScores[topic];
    if (!entry) return 0;
    return applyDecay(entry.score, entry.lastSeen);
  }

  /** Update mastery score for a topic after a learning interaction. */
  updateMastery(topic: string, delta: number): void {
    const existing = this.profile.masteryScores[topic];
    const currentScore = existing
      ? applyDecay(existing.score, existing.lastSeen)
      : 0;

    const newScore = Math.min(100, Math.max(0, currentScore + delta));
    this.profile.masteryScores[topic] = {
      score: newScore,
      lastSeen: Date.now(),
      bloomReached: existing?.bloomReached ?? this.profile.bloomLevel,
      attempts: (existing?.attempts ?? 0) + 1,
    };

    // Check if Bloom level should advance
    if (newScore >= BLOOM_ADVANCE_THRESHOLD && this.profile.bloomLevel < 6) {
      const avgMastery = this.getAverageMastery();
      if (avgMastery >= BLOOM_ADVANCE_THRESHOLD) {
        this.profile.bloomLevel = Math.min(
          6,
          this.profile.bloomLevel + 1,
        ) as BloomLevel;
      }
    }

    this.profile.currentTopic = topic;
  }

  /** Apply Ebbinghaus decay to all stored topic scores (call on session start). */
  applyDecayToAll(): void {
    for (const topic of Object.keys(this.profile.masteryScores)) {
      const entry = this.profile.masteryScores[topic];
      entry.score = applyDecay(entry.score, entry.lastSeen);
      entry.lastSeen = Date.now();
    }
  }

  /** Compute the average mastery across all known topics. */
  getAverageMastery(): number {
    const scores = Object.values(this.profile.masteryScores);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, e) => sum + e.score, 0) / scores.length;
  }

  /** Increment streak counter. */
  incrementStreak(): void {
    this.profile.streakCount += 1;
  }

  /** Reset streak counter (on incorrect/frustrated response). */
  resetStreak(): void {
    this.profile.streakCount = 0;
  }

  /** Record a new session. */
  startSession(): void {
    this.profile.totalSessions += 1;
    this.profile.lastSessionAt = Date.now();
  }

  /** Get all topics with their decayed mastery scores. */
  getAllTopicsWithScores(): Array<{ topic: string; score: number; bloomReached: BloomLevel }> {
    return Object.entries(this.profile.masteryScores).map(([topic, entry]) => ({
      topic,
      score: applyDecay(entry.score, entry.lastSeen),
      bloomReached: entry.bloomReached,
    }));
  }
}
