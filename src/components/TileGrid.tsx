import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Globe,
  BarChart3,
  Server,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { TileStory } from '../data/stories';

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Globe,
  BarChart3,
  Server,
  ShieldCheck,
  Users,
};

interface TileRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  stories: TileStory[];
  onSelectTile: (story: TileStory, clickedRect?: TileRect, allRects?: Map<string, TileRect>) => void;
  onBack: () => void;
  visitedIds?: Set<string>;
}

/* ------------------------------------------------------------------ */
/*  TileCountUp - animates a number from 0 to target                  */
/* ------------------------------------------------------------------ */

function parseStat(stat: string): { value: number; suffix: string } {
  const match = stat.match(/^([\d,]+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return { value: 0, suffix: stat };
  const numStr = match[1].replace(/,/g, '');
  return { value: parseFloat(numStr), suffix: match[2] };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function TileCountUp({ stat, delay }: { stat: string; delay: number }) {
  const { value, suffix } = parseStat(stat);
  const [display, setDisplay] = useState('0' + suffix);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const duration = 1500; // ms

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startRef.current === null) startRef.current = timestamp;
        const elapsed = timestamp - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.round(eased * value);
        setDisplay(current.toLocaleString() + suffix);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, suffix, delay]);

  return <>{display}</>;
}

/* ------------------------------------------------------------------ */
/*  TileGrid                                                           */
/* ------------------------------------------------------------------ */

export default function TileGrid({ stories, onSelectTile, onBack, visitedIds }: Props) {
  const tileRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [tiltState, setTiltState] = useState<Record<string, { rx: number; ry: number }>>({});

  const handleTileClick = useCallback(
    (story: TileStory) => {
      const clickedEl = tileRefs.current.get(story.id);
      let clickedRect: TileRect | undefined;
      if (clickedEl) {
        const r = clickedEl.getBoundingClientRect();
        clickedRect = { x: r.x, y: r.y, width: r.width, height: r.height };
      }

      const allRects = new Map<string, TileRect>();
      tileRefs.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        allRects.set(id, { x: r.x, y: r.y, width: r.width, height: r.height });
      });

      onSelectTile(story, clickedRect, allRects);
    },
    [onSelectTile],
  );

  /* ---- Keyboard shortcut: keys 1-6 ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 6) {
        const story = stories[num - 1];
        if (story) handleTileClick(story);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stories, handleTileClick]);

  /* ---- Mouse tilt handlers ---- */
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, storyId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to +1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to +1
    setTiltState((prev) => ({ ...prev, [storyId]: { rx: y * -8, ry: x * 8 } }));
  };

  const handleMouseLeaveTilt = (storyId: string) => {
    setTiltState((prev) => ({ ...prev, [storyId]: { rx: 0, ry: 0 } }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 48px',
      }}
    >
      <style>{`
        @keyframes tg-tileEntrance {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9) rotateX(10deg);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
            filter: blur(0px);
          }
        }
        @keyframes tg-headerEntrance {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes tg-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tg-iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes tg-stripeGrow {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes tg-checkFadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .tg-tile-card {
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),
                      background 0.3s ease,
                      border-color 0.3s ease,
                      box-shadow 0.3s ease;
        }
        .tg-tile-card:active {
          transform: scale(0.97) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 40,
        animation: 'tg-headerEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(94, 198, 195, 0.7)',
          marginBottom: 12,
        }}>
          Explore Our Work
        </div>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 700,
          color: 'var(--aph-white)',
          letterSpacing: '-0.5px',
        }}>
          The Story of Health IT
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'rgba(255,255,255,0.5)',
          marginTop: 8,
        }}>
          Select a topic to learn more
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
        maxWidth: 1100,
        width: '100%',
        perspective: '1200px',
      }}>
        {stories.map((story, index) => {
          const Icon = iconMap[story.icon] || Sparkles;
          const accentVar = story.accentColor;
          const delay = 0.15 + index * 0.1;
          const floatDelay = index * 0.5;
          const tilt = tiltState[story.id] || { rx: 0, ry: 0 };
          const stripeDelay = 0.4 + index * 0.1;
          const counterDelay = 0.3 + index * 0.15;
          const isVisited = visitedIds?.has(story.id) ?? false;

          return (
            <button
              key={story.id}
              ref={(el) => {
                if (el) tileRefs.current.set(story.id, el);
              }}
              className="tg-tile-card"
              onClick={() => handleTileClick(story)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 32,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                cursor: 'pointer',
                textAlign: 'left',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: 220,
                fontFamily: 'inherit',
                color: 'inherit',
                outline: 'none',
                animation: `tg-tileEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
                transform: `translateY(0) scale(1) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              }}
              onMouseMove={(e) => handleMouseMove(e, story.id)}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.08)';
                el.style.borderColor = `var(${accentVar})`;
                el.style.boxShadow = `0 0 40px color-mix(in srgb, var(${accentVar}) 15%, transparent), 0 12px 40px rgba(0,48,84,0.3)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.05)';
                el.style.borderColor = 'rgba(255,255,255,0.08)';
                el.style.boxShadow = 'none';
                handleMouseLeaveTilt(story.id);
              }}
            >
              {/* Left accent stripe with grow animation */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 3,
                height: '100%',
                background: `var(${accentVar})`,
                opacity: 0.6,
                borderRadius: '3px 0 0 3px',
                animation: `tg-stripeGrow 0.6s ease-out ${stripeDelay}s both`,
                transformOrigin: 'top',
              }} />

              {/* Visited checkmark badge */}
              {isVisited && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `color-mix(in srgb, var(${accentVar}) 20%, transparent)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'tg-checkFadeIn 0.3s ease both',
                  zIndex: 2,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7.5L5.5 10L11 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Accent glow blob */}
              <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `radial-gradient(circle, var(${accentVar}), transparent 70%)`,
                opacity: 0.08,
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }} />

              {/* Icon container */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `color-mix(in srgb, var(${accentVar}) 15%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                animation: `tg-iconFloat 3s ease-in-out ${floatDelay}s infinite`,
              }}>
                <Icon size={26} color={`var(${accentVar})`} strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 19,
                fontWeight: 700,
                color: 'var(--aph-white)',
                marginBottom: 6,
                letterSpacing: '-0.2px',
              }}>
                {story.title}
              </h3>

              {/* Tagline */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.5,
                flex: 1,
              }}>
                {story.tagline}
              </p>

              {/* Hero stat with count-up animation */}
              <div style={{ marginTop: 18 }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 28,
                    fontWeight: 800,
                    color: `var(${accentVar})`,
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                  }}>
                    <TileCountUp stat={story.heroStat} delay={counterDelay} />
                  </span>
                  {/* Accent underline bar */}
                  <div style={{
                    width: 40,
                    height: 2,
                    background: `var(${accentVar})`,
                    opacity: 0.5,
                    borderRadius: 1,
                    marginTop: 2,
                    marginBottom: 4,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {story.heroStatLabel}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcut hint */}
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginTop: 20,
        animation: 'tg-fadeIn 0.5s ease 1.2s both',
      }}>
        Press 1&ndash;6 to select a topic
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          marginTop: 12,
          padding: '10px 24px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'var(--font-heading)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          animation: 'tg-fadeIn 0.5s ease 1s both',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--aph-teal)';
          e.currentTarget.style.color = 'var(--aph-light-teal)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
        }}
      >
        Back to Attract
      </button>
    </div>
  );
}
