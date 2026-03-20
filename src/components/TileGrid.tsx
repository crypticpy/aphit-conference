import { useRef, useState, useEffect, useCallback } from 'react';
import type { TileStory } from '../data/stories';
import { iconMap } from './shared/iconMap';
import type { TileRect } from './shared/types';

interface Props {
  stories: TileStory[];
  onSelectTile: (story: TileStory, clickedRect?: TileRect, allRects?: Map<string, TileRect>) => void;
  onBack: () => void;
  visitedIds?: Set<string>;
}

/* ------------------------------------------------------------------ */
/*  Unique SVG background patterns per tile                            */
/* ------------------------------------------------------------------ */

function getTilePattern(storyId: string, accentVar: string): React.ReactNode {
  const color = `var(${accentVar})`;

  switch (storyId) {
    // AI & Analytics — neural network: connected dots with lines
    case 'ai':
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            pointerEvents: 'none',
            opacity: 0.12,
          }}
        >
          {/* Nodes */}
          <circle cx="30" cy="30" r="4" fill={color} />
          <circle cx="90" cy="25" r="4" fill={color} />
          <circle cx="60" cy="65" r="5" fill={color} />
          <circle cx="95" cy="90" r="4" fill={color} />
          {/* Connections */}
          <line x1="30" y1="30" x2="60" y2="65" stroke={color} strokeWidth="1.5" />
          <line x1="90" y1="25" x2="60" y2="65" stroke={color} strokeWidth="1.5" />
          <line x1="60" y1="65" x2="95" y2="90" stroke={color} strokeWidth="1.5" />
          <line x1="30" y1="30" x2="90" y2="25" stroke={color} strokeWidth="1" />
        </svg>
      );

    // GIS & Geospatial — topographic contour lines
    case 'gis':
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            pointerEvents: 'none',
            opacity: 0.12,
          }}
        >
          <circle cx="70" cy="60" r="15" fill="none" stroke={color} strokeWidth="1.2" />
          <circle cx="65" cy="55" r="28" fill="none" stroke={color} strokeWidth="1.2" />
          <circle cx="60" cy="50" r="42" fill="none" stroke={color} strokeWidth="1.2" />
          <circle cx="58" cy="48" r="55" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      );

    // Dashboards & Data — bar chart silhouette / horizontal data lines
    case 'dashboards':
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            pointerEvents: 'none',
            opacity: 0.12,
          }}
        >
          {/* Bar chart bars */}
          <rect x="20" y="70" width="14" height="40" rx="2" fill={color} />
          <rect x="40" y="45" width="14" height="65" rx="2" fill={color} />
          <rect x="60" y="55" width="14" height="55" rx="2" fill={color} />
          <rect x="80" y="30" width="14" height="80" rx="2" fill={color} />
          {/* Baseline */}
          <line x1="15" y1="110" x2="100" y2="110" stroke={color} strokeWidth="1.5" />
        </svg>
      );

    // Devices & Infrastructure — circuit board traces
    case 'infrastructure':
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            pointerEvents: 'none',
            opacity: 0.12,
          }}
        >
          {/* Perpendicular traces */}
          <line x1="20" y1="30" x2="60" y2="30" stroke={color} strokeWidth="1.5" />
          <line x1="60" y1="30" x2="60" y2="70" stroke={color} strokeWidth="1.5" />
          <line x1="60" y1="70" x2="100" y2="70" stroke={color} strokeWidth="1.5" />
          <line x1="40" y1="50" x2="80" y2="50" stroke={color} strokeWidth="1.5" />
          <line x1="80" y1="50" x2="80" y2="100" stroke={color} strokeWidth="1.5" />
          <line x1="30" y1="85" x2="60" y2="85" stroke={color} strokeWidth="1.5" />
          {/* Junction dots */}
          <circle cx="60" cy="30" r="3" fill={color} />
          <circle cx="60" cy="70" r="3" fill={color} />
          <circle cx="80" cy="50" r="3" fill={color} />
          <circle cx="40" cy="50" r="3" fill={color} />
          <circle cx="60" cy="85" r="3" fill={color} />
        </svg>
      );

    // Cybersecurity & Privacy — shield outline
    case 'security':
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            pointerEvents: 'none',
            opacity: 0.12,
          }}
        >
          <path
            d="M60 15 L95 35 L95 65 Q95 95 60 110 Q25 95 25 65 L25 35 Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          {/* Keyhole accent */}
          <circle cx="60" cy="58" r="8" fill="none" stroke={color} strokeWidth="1.5" />
          <rect x="57" y="65" width="6" height="14" rx="2" fill={color} />
        </svg>
      );

    // Digital Services — broadcast signal / concentric expanding circles
    case 'services':
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            pointerEvents: 'none',
            opacity: 0.12,
          }}
        >
          <circle cx="60" cy="90" r="4" fill={color} />
          <path d="M40 75 A28 28 0 0 1 80 75" fill="none" stroke={color} strokeWidth="1.5" />
          <path d="M28 62 A42 42 0 0 1 92 62" fill="none" stroke={color} strokeWidth="1.5" />
          <path d="M16 49 A56 56 0 0 1 104 49" fill="none" stroke={color} strokeWidth="1.2" />
        </svg>
      );

    default:
      return null;
  }
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
/*  Helper: get tile-specific styles                                   */
/* ------------------------------------------------------------------ */

function getTileBackground(storyId: string, index: number, isWide: boolean): string {
  if (index === 0) return 'var(--aph-teal)';
  if (storyId === 'security') return 'rgba(0,6,12,0.9)';
  return 'rgba(0,10,20,0.8)';
}

function getTileBorder(storyId: string, index: number): string {
  if (index === 0) return '1px solid var(--aph-teal)';
  if (storyId === 'security') return 'none';
  return '1px solid rgba(255,255,255,0.08)';
}

function getTileBorderLeft(storyId: string): string | undefined {
  if (storyId === 'security') return '2px solid var(--aph-coral)';
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  TileGrid                                                           */
/* ------------------------------------------------------------------ */

export default function TileGrid({ stories, onSelectTile, onBack, visitedIds }: Props) {
  const tileRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [tiltState, setTiltState] = useState<Record<string, { rx: number; ry: number }>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
        @keyframes tg-gradientBarGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes tg-checkFadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .tg-tile-card {
          transform-style: preserve-3d;
          transition: transform 0.25s ease,
                      background 0.35s ease,
                      border-width 0.2s ease;
        }
        .tg-tile-card:active {
          transform: scale(0.97) !important;
        }
        .tg-tile-card:not(:hover) {
          animation-name: tg-tileEntrance !important;
        }
        /* Top gradient bar opacity transitions */
        .tg-top-gradient-bar {
          transition: opacity 0.25s ease;
        }
        .tg-tile-card:hover .tg-top-gradient-bar {
          opacity: 1 !important;
        }
      `}</style>

      {/* Header — left-aligned */}
      <div style={{
        textAlign: 'left',
        marginBottom: 40,
        width: '100%',
        maxWidth: 1100,
        paddingLeft: 0,
        animation: 'tg-headerEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 14,
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
          fontSize: 'clamp(28px, 3.5vw, 44px)',
          fontWeight: 700,
          color: 'var(--aph-white)',
          letterSpacing: '-0.5px',
        }}>
          The Story of Health IT
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 18,
          color: 'var(--aph-warm-gray)',
          marginTop: 8,
        }}>
          Select a topic to learn more
        </p>
      </div>

      {/* Completion tracker */}
      {(visitedIds?.size ?? 0) >= 1 && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'var(--aph-warm-gray)',
          letterSpacing: '1px',
          textAlign: 'left',
          width: '100%',
          maxWidth: 1100,
          marginBottom: 12,
        }}>
          {visitedIds?.size || 0} of 6 explored
        </div>
      )}

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
          const Icon = iconMap[story.icon] || iconMap['Sparkles'];
          const accentVar = story.accentColor;
          const delay = 0.15 + index * 0.1;
          const tilt = tiltState[story.id] || { rx: 0, ry: 0 };
          const gradientBarDelay = 0.4 + index * 0.1;
          const counterDelay = 0.3 + index * 0.15;
          const isVisited = visitedIds?.has(story.id) ?? false;
          const isWide = index === 0 || index === 5;
          const isHovered = hoveredId === story.id;

          const isFeaturedAI = index === 0;
          const isSecurity = story.id === 'security';

          // Per-tile background
          const tileBg = getTileBackground(story.id, index, isWide);
          const tileBorder = getTileBorder(story.id, index);
          const tileBorderLeft = getTileBorderLeft(story.id);

          // Per-tile text colors
          const iconColor = isFeaturedAI ? '#FFFFFF' : `var(${accentVar})`;
          const statColor = isFeaturedAI ? '#FFFFFF' : `var(${accentVar})`;
          const statLabelColor = isFeaturedAI ? 'var(--aph-gold)' : 'var(--aph-gold)';
          const taglineColor = isFeaturedAI ? 'rgba(255,255,255,0.8)' : 'var(--aph-warm-gray)';

          // Radius hierarchy
          const borderRadius = isWide ? 16 : 10;
          const iconBorderRadius = 10;

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
                flexDirection: isWide ? 'row' : 'column',
                alignItems: isWide ? 'center' : 'flex-start',
                padding: 32,
                background: tileBg,
                border: tileBorder,
                borderLeft: tileBorderLeft || undefined,
                borderRadius,
                cursor: 'pointer',
                textAlign: 'left',
                overflow: 'hidden',
                minHeight: isWide ? 180 : 240,
                fontFamily: 'inherit',
                color: 'inherit',
                outline: 'none',
                gridColumn: isWide ? 'span 2' : undefined,
                animation: isHovered
                  ? `tg-tileEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`
                  : `tg-tileEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
                transform: isHovered
                  ? `translateY(0) scale(1) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
                  : undefined,
              }}
              onMouseMove={(e) => handleMouseMove(e, story.id)}
              onMouseEnter={(e) => {
                setHoveredId(story.id);
                const el = e.currentTarget;

                if (isFeaturedAI) {
                  // AI tile: darken slightly, subtle lift, no border glow
                  el.style.filter = 'brightness(1.1)';
                  el.style.transform = `translateY(-2px) scale(1) rotateX(0deg) rotateY(0deg)`;
                  el.style.boxShadow = 'none';
                } else if (isSecurity) {
                  // Security tile: coral left border thickens, background lightens
                  el.style.borderLeft = '4px solid var(--aph-coral)';
                  el.style.background = 'rgba(0,8,16,0.9)';
                  el.style.transform = `translateY(0) scale(1) rotateX(0deg) rotateY(0deg)`;
                  el.style.boxShadow = 'none';
                } else {
                  // Other tiles: top gradient bar becomes fully opaque (via CSS class),
                  // subtle box-shadow in accent color
                  el.style.boxShadow = `0 4px 24px color-mix(in srgb, var(${accentVar}) 25%, transparent)`;
                  el.style.transform = `translateY(0) scale(1) rotateX(0deg) rotateY(0deg)`;
                }
              }}
              onMouseLeave={(e) => {
                setHoveredId(null);
                const el = e.currentTarget;

                if (isFeaturedAI) {
                  el.style.filter = '';
                  el.style.transform = '';
                  el.style.boxShadow = '';
                } else if (isSecurity) {
                  el.style.borderLeft = '2px solid var(--aph-coral)';
                  el.style.background = 'rgba(0,6,12,0.9)';
                  el.style.transform = '';
                  el.style.boxShadow = '';
                } else {
                  el.style.boxShadow = 'none';
                  el.style.transform = '';
                }
                handleMouseLeaveTilt(story.id);
              }}
            >
              {/* Top-edge gradient bar (replaces left accent stripe) */}
              {!isFeaturedAI && (
                <div
                  className="tg-top-gradient-bar"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 3,
                    background: `linear-gradient(to right, var(${accentVar}), transparent)`,
                    opacity: 0.6,
                    borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
                    animation: `tg-gradientBarGrow 0.6s ease-out ${gradientBarDelay}s both`,
                    transformOrigin: 'left',
                  }}
                />
              )}

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

              {/* Unique SVG background pattern per tile */}
              {getTilePattern(story.id, accentVar)}

              {/* ---- Wide tile layout (index 0 & 5): horizontal ---- */}
              {isWide ? (
                <>
                  {/* Icon container */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: iconBorderRadius,
                    background: isFeaturedAI
                      ? 'rgba(255,255,255,0.15)'
                      : `color-mix(in srgb, var(${accentVar}) 15%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginRight: 28,
                  }}>
                    <Icon size={28} color={iconColor} strokeWidth={1.8} />
                  </div>

                  {/* Center: title + tagline */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(22px, 2.5vw, 30px)',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: 8,
                      letterSpacing: '-0.3px',
                    }}>
                      {story.title}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'clamp(15px, 1.5vw, 18px)',
                      color: taglineColor,
                      lineHeight: 1.5,
                    }}>
                      {story.tagline}
                    </p>
                  </div>

                  {/* Right: hero stat */}
                  <div style={{
                    flexShrink: 0,
                    marginLeft: 28,
                    textAlign: 'right',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(28px, 3vw, 38px)',
                      fontWeight: 800,
                      color: statColor,
                      letterSpacing: '-0.5px',
                      lineHeight: 1,
                      display: 'block',
                    }}>
                      <TileCountUp stat={story.heroStat} delay={counterDelay} />
                    </span>
                    <div style={{
                      width: 40,
                      height: 2,
                      background: isFeaturedAI ? 'rgba(255,255,255,0.4)' : `var(${accentVar})`,
                      opacity: isFeaturedAI ? 1 : 0.5,
                      borderRadius: 1,
                      marginTop: 6,
                      marginBottom: 4,
                      marginLeft: 'auto',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      color: statLabelColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {story.heroStatLabel}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* ---- Standard tile layout (vertical) ---- */}

                  {/* Icon container */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: iconBorderRadius,
                    background: `color-mix(in srgb, var(${accentVar}) 15%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}>
                    <Icon size={28} color={`var(${accentVar})`} strokeWidth={1.8} />
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(20px, 2.2vw, 26px)',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: 8,
                    letterSpacing: '-0.3px',
                  }}>
                    {story.title}
                  </h3>

                  {/* Tagline */}
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(15px, 1.5vw, 18px)',
                    color: 'var(--aph-warm-gray)',
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
                        fontSize: 'clamp(28px, 3vw, 38px)',
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
                        fontSize: 14,
                        color: 'var(--aph-gold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {story.heroStatLabel}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcut hint */}
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 14,
        color: 'var(--aph-warm-gray)',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginTop: 24,
        animation: 'tg-fadeIn 0.5s ease 1.2s both',
      }}>
        Press 1&ndash;6 to select a topic
      </div>

      {/* Back button — pill shape with gold border */}
      <button
        onClick={onBack}
        style={{
          marginTop: 12,
          padding: '12px 32px',
          background: 'transparent',
          border: '1px solid var(--aph-gold)',
          borderRadius: 24,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'var(--font-heading)',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, color 0.2s ease',
          animation: 'tg-fadeIn 0.5s ease 1s both',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--aph-gold)';
          e.currentTarget.style.color = 'var(--aph-gold)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--aph-gold)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
        }}
      >
        ← Restart
      </button>
    </div>
  );
}
