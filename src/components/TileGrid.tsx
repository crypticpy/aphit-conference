import { useRef } from 'react';
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
}

export default function TileGrid({ stories, onSelectTile, onBack }: Props) {
  const tileRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleTileClick = (story: TileStory) => {
    const clickedEl = tileRefs.current.get(story.id);
    let clickedRect: TileRect | undefined;
    if (clickedEl) {
      const r = clickedEl.getBoundingClientRect();
      clickedRect = { x: r.x, y: r.y, width: r.width, height: r.height };
    }

    // Build a Map of ALL tile rects
    const allRects = new Map<string, TileRect>();
    tileRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      allRects.set(id, { x: r.x, y: r.y, width: r.width, height: r.height });
    });

    onSelectTile(story, clickedRect, allRects);
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
        .tg-tile-card {
          transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),
                      background 0.3s ease,
                      border-color 0.3s ease,
                      box-shadow 0.3s ease;
        }
        .tg-tile-card:hover {
          transform: translateY(-6px) scale(1.03);
        }
        .tg-tile-card:active {
          transform: scale(0.97);
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
              }}
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
              }}
            >
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

              {/* Hero stat */}
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
                    {story.heroStat}
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

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          marginTop: 32,
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
