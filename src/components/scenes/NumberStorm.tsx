import type React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Props {
  stat: string;        // e.g. "500K+", "200+", "30+", "80+"
  label: string;       // e.g. "HEALTH RECORDS PROTECTED"
  accentColor: string; // CSS variable name like "--aph-teal"
  onComplete?: () => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SwarmNumber {
  id: number;
  char: string;
  startX: number;   // % from left edge
  startY: number;   // % from top edge
  size: number;      // px
  opacity: number;
  color: string;
  rotX: number;      // initial rotation degrees
  rotY: number;
  rotZ: number;
  spinX: number;     // rotation speed multiplier
  spinY: number;
  spinZ: number;
  delay: number;     // stagger delay in ms
  depth: number;     // translateZ for 3D depth
}

interface ScatterChar {
  char: string;
  index: number;
  exitX: number;
  exitY: number;
  exitRotation: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SWARM_COUNT = 80;
const BRAND_COLORS = [
  'var(--aph-teal)',
  'var(--aph-sky-blue)',
  'var(--aph-light-teal)',
  'var(--aph-green)',
];

// Phase timing (ms)
const SWARM_DURATION = 2500;
const IMPACT_DURATION = 500;
const HOLD_DURATION = 3000;
const SCATTER_DURATION = 2000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomEdgePosition(): { x: number; y: number } {
  // Spawn numbers from outside the visible area on all sides
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: return { x: randomRange(-20, 120), y: randomRange(-30, -10) };   // top
    case 1: return { x: randomRange(-20, 120), y: randomRange(110, 130) };   // bottom
    case 2: return { x: randomRange(-30, -10), y: randomRange(-20, 120) };   // left
    default: return { x: randomRange(110, 130), y: randomRange(-20, 120) };  // right
  }
}

function generateSwarmNumbers(): SwarmNumber[] {
  return Array.from({ length: SWARM_COUNT }, (_, i) => {
    const pos = randomEdgePosition();
    return {
      id: i,
      char: String(Math.floor(Math.random() * 10)),
      startX: pos.x,
      startY: pos.y,
      size: randomRange(20, 60),
      opacity: randomRange(0.3, 0.8),
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      rotX: randomRange(-180, 180),
      rotY: randomRange(-180, 180),
      rotZ: randomRange(-180, 180),
      spinX: randomRange(-720, 720),
      spinY: randomRange(-720, 720),
      spinZ: randomRange(-540, 540),
      delay: randomRange(0, 800),
      depth: randomRange(-400, 200),
    };
  });
}

// ─── Keyframe Styles ─────────────────────────────────────────────────────────

const keyframeStyles = `
  @keyframes ns-screenShake {
    0% { transform: translate(0, 0); }
    15% { transform: translate(-3px, 2px); }
    30% { transform: translate(3px, -2px); }
    45% { transform: translate(-2px, -3px); }
    60% { transform: translate(2px, 3px); }
    75% { transform: translate(-1px, 1px); }
    100% { transform: translate(0, 0); }
  }

  @keyframes ns-impactScale {
    0% { transform: scale(1.4); opacity: 0; }
    40% { transform: scale(1.05); opacity: 1; }
    60% { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes ns-flashPulse {
    0% { opacity: 0; transform: scale(0.3); }
    30% { opacity: 0.7; }
    100% { opacity: 0; transform: scale(2.5); }
  }

  @keyframes ns-glowPulse {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 20px currentColor); }
    50% { filter: brightness(1.15) drop-shadow(0 0 40px currentColor); }
  }

  @keyframes ns-labelFadeIn {
    from { opacity: 0; transform: translateY(12px); letter-spacing: 6px; }
    to { opacity: 1; transform: translateY(0); letter-spacing: 3px; }
  }

  @keyframes ns-labelFadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(8px); }
  }
`;

// ═════════════════════════════════════════════════════════════════════════════
// NumberStorm Component
// ═════════════════════════════════════════════════════════════════════════════

export default function NumberStorm({ stat, label, accentColor, onComplete }: Props) {
  const [phase, setPhase] = useState<'swarm' | 'impact' | 'hold' | 'scatter' | 'done'>('swarm');
  const [swarmConverged, setSwarmConverged] = useState(false);
  const [scatterChars, setScatterChars] = useState<ScatterChar[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Generate swarm numbers once on mount
  const swarmNumbers = useMemo(() => generateSwarmNumbers(), []);

  // Generate scatter directions for stat characters
  const buildScatterChars = useCallback((): ScatterChar[] => {
    return stat.split('').map((char, index) => ({
      char,
      index,
      exitX: randomRange(-600, 600),
      exitY: randomRange(-600, 600),
      exitRotation: randomRange(-360, 360),
    }));
  }, [stat]);

  // ── Phase orchestration ──
  useEffect(() => {
    const addTimeout = (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay);
      timeoutsRef.current.push(t);
      return t;
    };

    // Trigger convergence animation partway through swarm phase
    addTimeout(() => {
      setSwarmConverged(true);
    }, 200);

    // Phase: swarm -> impact
    addTimeout(() => {
      setPhase('impact');
    }, SWARM_DURATION);

    // Phase: impact -> hold
    addTimeout(() => {
      setPhase('hold');
    }, SWARM_DURATION + IMPACT_DURATION);

    // Phase: hold -> scatter
    addTimeout(() => {
      setScatterChars(buildScatterChars());
      setPhase('scatter');
    }, SWARM_DURATION + IMPACT_DURATION + HOLD_DURATION);

    // Phase: scatter -> done
    addTimeout(() => {
      setPhase('done');
      onCompleteRef.current?.();
    }, SWARM_DURATION + IMPACT_DURATION + HOLD_DURATION + SCATTER_DURATION);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [buildScatterChars]);

  // ── Swarm number styles ──
  const getSwarmNumberStyle = useCallback(
    (num: SwarmNumber): React.CSSProperties => {
      const converged = swarmConverged && (phase === 'swarm');
      const visible = phase === 'swarm';

      if (!visible) {
        return { display: 'none' };
      }

      const transitionDuration = SWARM_DURATION - 200 - num.delay;

      return {
        position: 'absolute',
        left: converged ? '50%' : `${num.startX}%`,
        top: converged ? '50%' : `${num.startY}%`,
        transform: converged
          ? `translate(-50%, -50%) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.2)`
          : `translate(-50%, -50%) translateZ(${num.depth}px) rotateX(${num.rotX + num.spinX}deg) rotateY(${num.rotY + num.spinY}deg) rotateZ(${num.rotZ + num.spinZ}deg)`,
        fontSize: num.size,
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        color: num.color,
        opacity: converged ? 0 : num.opacity,
        willChange: 'transform, opacity',
        transition: converged
          ? `left ${transitionDuration}ms cubic-bezier(0.23, 1, 0.32, 1) ${num.delay}ms, top ${transitionDuration}ms cubic-bezier(0.23, 1, 0.32, 1) ${num.delay}ms, transform ${transitionDuration}ms cubic-bezier(0.23, 1, 0.32, 1) ${num.delay}ms, opacity ${transitionDuration * 0.6}ms ease ${num.delay + transitionDuration * 0.4}ms`
          : 'none',
        pointerEvents: 'none' as const,
        textShadow: `0 0 12px ${num.color}`,
        userSelect: 'none' as const,
        zIndex: 1,
      };
    },
    [swarmConverged, phase],
  );

  // ── Stat character style (for scatter phase) ──
  const getStatCharStyle = useCallback(
    (sc: ScatterChar, isScattering: boolean): React.CSSProperties => {
      return {
        display: 'inline-block',
        transition: isScattering
          ? `transform ${SCATTER_DURATION * 0.8}ms cubic-bezier(0.55, 0, 1, 0.45), opacity ${SCATTER_DURATION * 0.6}ms ease`
          : 'none',
        transform: isScattering
          ? `translate(${sc.exitX}px, ${sc.exitY}px) rotate(${sc.exitRotation}deg) scale(0.3)`
          : 'none',
        opacity: isScattering ? 0 : 1,
        willChange: isScattering ? 'transform, opacity' : undefined,
      };
    },
    [],
  );

  const showStat = phase === 'impact' || phase === 'hold' || phase === 'scatter';
  const isImpact = phase === 'impact';
  const isScattering = phase === 'scatter';
  const showLabel = phase === 'hold';
  const isLabelExiting = phase === 'scatter';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        perspective: '1000px',
        animation: isImpact ? 'ns-screenShake 200ms ease-out' : undefined,
      }}
    >
      <style>{keyframeStyles}</style>

      {/* ── Swarm numbers ── */}
      {phase === 'swarm' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            perspective: '800px',
            perspectiveOrigin: '50% 50%',
            transformStyle: 'preserve-3d',
          }}
        >
          {swarmNumbers.map((num) => (
            <div key={num.id} style={getSwarmNumberStyle(num)}>
              {num.char}
            </div>
          ))}
        </div>
      )}

      {/* ── Impact flash ── */}
      {isImpact && (
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, color-mix(in srgb, var(${accentColor}) 40%, transparent), transparent 70%)`,
            animation: 'ns-flashPulse 500ms ease-out forwards',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* ── Stat display ── */}
      {showStat && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Stat number */}
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(80px, 12vw, 140px)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-4px',
              background: `linear-gradient(135deg, var(${accentColor}), color-mix(in srgb, var(${accentColor}) 60%, white))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: isImpact
                ? 'ns-impactScale 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
                : phase === 'hold'
                  ? 'ns-glowPulse 2s ease-in-out infinite'
                  : undefined,
              color: `var(${accentColor})`,
              textShadow: 'none',
              userSelect: 'none',
            }}
          >
            {isScattering ? (
              scatterChars.map((sc) => (
                <span key={sc.index} style={getStatCharStyle(sc, true)}>
                  {sc.char === ' ' ? '\u00A0' : sc.char}
                </span>
              ))
            ) : (
              stat
            )}
          </div>

          {/* Label */}
          <div
            style={{
              marginTop: 16,
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px, 2vw, 24px)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              color: 'rgba(255, 255, 255, 0.6)',
              animation: showLabel
                ? 'ns-labelFadeIn 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both'
                : isLabelExiting
                  ? 'ns-labelFadeOut 400ms ease forwards'
                  : undefined,
              opacity: (showLabel || isLabelExiting) ? undefined : 0,
              userSelect: 'none',
            }}
          >
            {label}
          </div>
        </div>
      )}

      {/* ── Ambient glow behind stat during hold ── */}
      {phase === 'hold' && (
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, color-mix(in srgb, var(${accentColor}) 12%, transparent), transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
    </div>
  );
}
