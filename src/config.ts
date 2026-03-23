/* ============================================
   APHIT Conference Table — Centralized Config

   All mode-specific behavior, magic numbers,
   and breakpoints live here. Edit this file
   instead of hunting through components.
   ============================================ */

// ── Mode types ──────────────────────────────

export type AppModeKey = "tv" | "default";
export type ScreenMode = "attract" | "grid" | "story";

// ── Breakpoints ─────────────────────────────
// Must match media queries in index.css

export const breakpoints = {
  mobile: 480,
  tablet: 768,
} as const;

// ── Mode-specific configuration ─────────────

export interface ParticleConfig {
  enabled: boolean;
  count: number;
  interactive: boolean;
  dimWhenStory: boolean;
}

export interface AutoAdvanceConfig {
  heroMs: number;
  sectionMs: number;
  lastSlideMs: number;
  returnWarningMs: number;
}

export interface ModeSettings {
  startScreen: ScreenMode;
  particles: ParticleConfig;
  idleTimeoutMs: number | null;
  autoAdvance: AutoAdvanceConfig | null;
  showAttractMode: boolean;
  showProgressTimer: boolean;
  showReturnWarning: boolean;
}

export const modeConfig: Record<AppModeKey, ModeSettings> = {
  tv: {
    startScreen: "attract",
    particles: {
      enabled: true,
      count: 140,
      interactive: true,
      dimWhenStory: true,
    },
    idleTimeoutMs: null,
    autoAdvance: {
      heroMs: 10000,
      sectionMs: 15000,
      lastSlideMs: 8000,
      returnWarningMs: 5000,
    },
    showAttractMode: true,
    showProgressTimer: true,
    showReturnWarning: true,
  },
  default: {
    startScreen: "grid",
    particles: {
      enabled: true,
      count: 50,
      interactive: false,
      dimWhenStory: true,
    },
    idleTimeoutMs: null,
    autoAdvance: null,
    showAttractMode: false,
    showProgressTimer: false,
    showReturnWarning: false,
  },
};

// ── Grid layout ─────────────────────────────

export const gridConfig = {
  maxWidth: 1100,
  gap: { desktop: 24, tablet: 20, mobile: 16 },
  wideIndices: [0, 5] as number[],
} as const;

// ── Transitions & interactions ──────────────

export const transitionConfig = {
  slideMs: 350,
  scatterMs: 700,
  scatterCleanupMs: 400,
  swipeThresholdPx: 50,
  entranceDelayBase: 0.15,
  entranceDelayFactor: 0.12,
} as const;

// ── Attract mode timing ─────────────────────
// All durations in ms. Change here, not in components.

export const attractConfig = {
  sceneDurations: {
    particles: 7000,
    numberStorm: 7000,
    dataStream: 7000,
    gradientWaves: 7000,
  },
  crossfadeMs: 700,
  contentDelayFirstMs: 400,
  contentDelayMs: 100,
  contentExitLeadMs: 300,
  edgeGlowMs: 700,
  // ParticlesScene title word reveal
  titleLine1DelayMs: 200,
  titleLine2DelayMs: 500,
  titleWordStaggerMs: 100,
  dividerDelayMs: 800,
  // NumberStorm phases
  numberStorm: {
    swarmMs: 1800,
    impactMs: 500,
    holdMs: 2200,
    scatterMs: 1400,
    convergenceDelayMs: 200,
    swarmDelayMaxMs: 600,
  },
  // WordReveal timing
  wordReveal: {
    staggerMs: 45,
    enterTransformMs: 500,
    enterOpacityMs: 400,
    exitTransformMs: 350,
    exitOpacityMs: 280,
  },
} as const;

// ── Helper: resolve mode from URL ───────────

export function resolveAppMode(): AppModeKey {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "tv" ? "tv" : "default";
}
