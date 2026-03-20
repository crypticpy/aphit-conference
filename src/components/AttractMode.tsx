import { useState, useEffect, useRef, useCallback } from 'react';
import type { TileStory } from '../data/stories';
import { WordReveal } from './shared/WordReveal';

// Lazy imports — scenes are independent components
import NumberStorm from './scenes/NumberStorm';
import DataStream from './scenes/DataStream';
import GradientWaves from './scenes/GradientWaves';

// ═══════════════════════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  facts: string[];
  stories: TileStory[];
  isTvMode: boolean;
  onInteract: () => void;
  onHeroBeat?: () => void;
}

type SceneType = 'particles' | 'numberStorm' | 'dataStream' | 'gradientWaves';

const SCENE_SEQUENCE: SceneType[] = ['particles', 'numberStorm', 'dataStream', 'gradientWaves'];

const SCENE_DURATIONS: Record<SceneType, number> = {
  particles: 10000,       // 10s — title + fact
  numberStorm: 10000,     // 10s — hero stat with flying numbers
  dataStream: 10000,      // 10s — fact with matrix rain
  gradientWaves: 10000,   // 10s — fact with gradient waves
};

const CROSSFADE_MS = 1500;

// ═══════════════════════════════════════════════════════════════════════════
// Shared sub-components
// ═══════════════════════════════════════════════════════════════════════════

function TitleReveal({ line, delay }: { line: string; delay: number }) {
  const words = line.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: 'inline-block',
            marginRight: '0.28em',
            animation: `titleWordIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 120}ms both`,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #5EC6C3 50%, #4DA8DA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {word}
        </span>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Scene: Particles (title + fact with starfield behind)
// ═══════════════════════════════════════════════════════════════════════════

function ParticlesScene({ fact, visible }: { fact: string; visible: boolean }) {
  const [textReady, setTextReady] = useState(false);
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setTextReady(true), 400);
      return () => clearTimeout(t);
    }
    setTextReady(false);
  }, [visible]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes titleWordIn {
          from { opacity: 0; transform: translateY(40px) rotateX(40deg); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) rotateX(0deg); filter: blur(0px); }
        }
      `}</style>

      <div style={{
        textAlign: 'center',
        maxWidth: 1200,
        padding: '0 64px',
        perspective: '800px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(48px, 7vw, 88px)',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
          marginBottom: 24,
          fontStyle: 'italic',
        }}>
          <span style={{ display: 'block' }}>
            <TitleReveal line="Invisible Infrastructure," delay={400} />
          </span>
          <span style={{ display: 'block' }}>
            <TitleReveal line="Visible Impact" delay={900} />
          </span>
        </h1>

        <div style={{
          width: 80,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--aph-teal), transparent)',
          margin: '0 auto 40px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'all 0.8s ease 1.2s',
        }} />

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(36px, 5vw, 72px)',
          fontWeight: 400,
          color: '#FFFFFF',
          lineHeight: 1.35,
          letterSpacing: '0.3px',
        }}>
          <WordReveal text={fact} visible={textReady} staggerMs={45} />
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main AttractMode — Scene Orchestrator
// ═══════════════════════════════════════════════════════════════════════════

export default function AttractMode({ facts, stories, isTvMode, onInteract, onHeroBeat }: Props) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [prevSceneIndex, setPrevSceneIndex] = useState(-1);
  const [transitioning, setTransitioning] = useState(false);

  // Content indices
  const factIndexRef = useRef(0);
  const storyIndexRef = useRef(0);
  const [currentFact, setCurrentFact] = useState(facts[0] || '');
  const [currentStory, setCurrentStory] = useState(stories[0]);
  const [contentVisible, setContentVisible] = useState(false);

  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;
  const onHeroBeatRef = useRef(onHeroBeat);
  onHeroBeatRef.current = onHeroBeat;

  // Single abort controller for all scene timing
  const abortRef = useRef(false);

  // ── Scene cycling — all timers tracked in one effect ──
  useEffect(() => {
    abortRef.current = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const safeTimeout = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!abortRef.current) fn();
      }, ms);
      timers.push(id);
    };

    const scene = SCENE_SEQUENCE[activeSceneIndex];
    const duration = SCENE_DURATIONS[scene];

    // Show content after initial settle
    safeTimeout(() => setContentVisible(true), activeSceneIndex === 0 ? 1500 : 300);

    // After hold duration, advance to next scene
    safeTimeout(() => {
      const nextIndex = (activeSceneIndex + 1) % SCENE_SEQUENCE.length;
      const nextScene = SCENE_SEQUENCE[nextIndex];

      // Prepare content for the next scene
      if (nextScene === 'numberStorm') {
        storyIndexRef.current = (storyIndexRef.current + 1) % stories.length;
        setCurrentStory(stories[storyIndexRef.current]);
        onHeroBeatRef.current?.();
      } else {
        factIndexRef.current = (factIndexRef.current + 1) % facts.length;
        setCurrentFact(facts[factIndexRef.current]);
      }

      // Start crossfade
      setContentVisible(false);
      setPrevSceneIndex(activeSceneIndex);
      setTransitioning(true);

      safeTimeout(() => {
        setActiveSceneIndex(nextIndex);
        setTransitioning(false);
        setPrevSceneIndex(-1);
      }, CROSSFADE_MS);
    }, duration);

    return () => {
      abortRef.current = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSceneIndex]);

  // ── Click handler (laptop only) ──
  const firedRef = useRef(false);
  useEffect(() => {
    if (isTvMode) return;
    firedRef.current = false;
    const handler = () => {
      if (!firedRef.current) {
        firedRef.current = true;
        onInteractRef.current();
      }
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handler);
      window.addEventListener('touchstart', handler);
    }, 300);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [isTvMode]);

  const activeScene = SCENE_SEQUENCE[activeSceneIndex];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      cursor: isTvMode ? 'default' : 'pointer',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes brandSlideIn {
          from { opacity: 0; transform: translateY(-15px); letter-spacing: 8px; }
          to { opacity: 1; transform: translateY(0); letter-spacing: 4px; }
        }
        @keyframes brandSubSlideIn {
          from { opacity: 0; transform: translateY(-10px); letter-spacing: 5px; }
          to { opacity: 1; transform: translateY(0); letter-spacing: 2.5px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes am-edgeGlow {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Screen-edge glow pulse on scene transitions */}
      {transitioning && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 8,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 80px 20px rgba(242,169,0,0.06)',
          animation: 'am-edgeGlow 1.5s ease both',
        }} />
      )}

      {/* ═══ Scene layers — stacked, crossfade via opacity ═══ */}

      {/* Scene: Particles + Title */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        opacity: activeScene === 'particles' ? 1 : 0,
        transition: `opacity ${CROSSFADE_MS}ms ease`,
        pointerEvents: 'none',
      }}>
        {(activeScene === 'particles' || (prevSceneIndex === 0 && transitioning)) && (
          <ParticlesScene fact={currentFact} visible={contentVisible && activeScene === 'particles'} />
        )}
      </div>

      {/* Scene: NumberStorm */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        opacity: activeScene === 'numberStorm' ? 1 : 0,
        transition: `opacity ${CROSSFADE_MS}ms ease`,
        pointerEvents: 'none',
      }}>
        {(activeScene === 'numberStorm' || (prevSceneIndex === 1 && transitioning)) && currentStory && (
          <NumberStorm
            stat={currentStory.heroStat}
            label={currentStory.heroStatLabel}
            accentColor={currentStory.accentColor}
          />
        )}
      </div>

      {/* Scene: DataStream */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        opacity: activeScene === 'dataStream' ? 1 : 0,
        transition: `opacity ${CROSSFADE_MS}ms ease`,
        pointerEvents: 'none',
      }}>
        {(activeScene === 'dataStream' || (prevSceneIndex === 2 && transitioning)) && (
          <DataStream fact={currentFact} visible={contentVisible && activeScene === 'dataStream'} />
        )}
      </div>

      {/* Scene: GradientWaves */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        opacity: activeScene === 'gradientWaves' ? 1 : 0,
        transition: `opacity ${CROSSFADE_MS}ms ease`,
        pointerEvents: 'none',
      }}>
        {(activeScene === 'gradientWaves' || (prevSceneIndex === 3 && transitioning)) && (
          <GradientWaves fact={currentFact} visible={contentVisible && activeScene === 'gradientWaves'} />
        )}
      </div>

      {/* ═══ Persistent overlays (always visible) ═══ */}

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,8,16,0.7) 100%)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {/* Bottom-edge horizon glow */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'linear-gradient(to top, rgba(0, 123, 131, 0.08), transparent)',
        zIndex: 4,
        pointerEvents: 'none',
      }} />

      {/* Top branding */}
      <div style={{
        position: 'absolute',
        top: 48,
        left: 48,
        textAlign: 'left',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 11,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 4,
          animation: 'brandSubSlideIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        }}>
          City of Austin
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 16,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: 'rgba(94, 198, 195, 0.7)',
          marginBottom: 8,
          animation: 'brandSlideIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        }}>
          Austin Public Health
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 13,
          fontWeight: 500,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          animation: 'brandSubSlideIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
        }}>
          Health Information Technology
        </div>
      </div>

      {/* Scene indicator dots */}
      <div style={{
        position: 'absolute',
        bottom: isTvMode ? 48 : 110,
        left: 0,
        right: 0,
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        {SCENE_SEQUENCE.map((scene, i) => (
          <div
            key={scene}
            style={{
              width: i === activeSceneIndex ? 28 : 10,
              height: 10,
              borderRadius: 4,
              background: i === activeSceneIndex ? 'var(--aph-gold)' : 'rgba(181,168,152,0.3)',
              transition: 'width 0.5s ease, background 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* Bottom prompt (laptop only) */}
      {!isTvMode && (
        <div style={{
          position: 'absolute',
          bottom: 48,
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          animation: 'fadeIn 1s ease 2.2s both',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--aph-gold)',
            animation: 'pulse 3s ease-in-out infinite',
          }}>
            Click anywhere to explore
          </div>
          <div style={{
            marginTop: 12,
            display: 'inline-block',
            animation: 'bounceDown 2s ease-in-out infinite',
          }}>
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
              <path d="M1 1L12 12L23 1" stroke="rgba(242,169,0,0.6)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
