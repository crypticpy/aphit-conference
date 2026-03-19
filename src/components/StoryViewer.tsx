import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Globe,
  BarChart3,
  Server,
  ShieldCheck,
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
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

interface Props {
  story: TileStory;
  onBack: () => void;
}

/* ------------------------------------------------------------------ */
/*  CountUp — animated number for the hero slide                       */
/* ------------------------------------------------------------------ */
function CountUp({
  target,
  suffix,
  duration = 1800,
}: {
  target: number;
  suffix: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState('0');
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // cubic ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(current.toLocaleString());
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <>{display}{suffix}</>
  );
}

/* ------------------------------------------------------------------ */
/*  Parse heroStat into a numeric target + suffix for CountUp          */
/* ------------------------------------------------------------------ */
function parseHeroStat(raw: string): { target: number; suffix: string } | null {
  // Match patterns like "500K+", "1,200+", "30+", "100%", "6", "200+"
  const m = raw.match(/^([\d,]+)(K?)\s*([+%]?)$/i);
  if (!m) return null;
  let num = parseInt(m[1].replace(/,/g, ''), 10);
  const kSuffix = m[2].toUpperCase();
  const trail = m[3];
  if (kSuffix === 'K') num = num * 1000;
  // Build the suffix that goes after the animated number
  // e.g. "500K+" → target=500, suffix="K+"
  if (kSuffix === 'K') {
    return { target: num / 1000, suffix: `K${trail}` };
  }
  return { target: num, suffix: trail };
}

/* ------------------------------------------------------------------ */
/*  StoryViewer — full-screen slideshow                                */
/* ------------------------------------------------------------------ */
export default function StoryViewer({ story, onBack }: Props) {
  const Icon = iconMap[story.icon] || Sparkles;
  const accentVar = story.accentColor;
  const totalSlides = 1 + story.sections.length; // slide 0 = hero, 1..N = sections

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideVisible, setSlideVisible] = useState(true);
  const [slideKey, setSlideKey] = useState(0); // forces re-mount for stagger animations

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const navLeftRef = useRef<HTMLButtonElement>(null);
  const navRightRef = useRef<HTMLButtonElement>(null);

  /* ---- navigation helpers ---- */
  const resetAutoTimer = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  }, []);

  const goTo = useCallback((next: number, dir: 'forward' | 'backward') => {
    if (isTransitioning) return;
    resetAutoTimer();
    setDirection(dir);
    setSlideVisible(false);
    setIsTransitioning(true);

    transitionTimerRef.current = setTimeout(() => {
      setCurrentSlide(next);
      setSlideKey((k) => k + 1);
      setDirection(dir);
      setSlideVisible(true);
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, resetAutoTimer]);

  const goForward = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      goTo(currentSlide + 1, 'forward');
    }
  }, [currentSlide, totalSlides, goTo]);

  const goBackward = useCallback(() => {
    if (currentSlide > 0) {
      goTo(currentSlide - 1, 'backward');
    }
  }, [currentSlide, goTo]);

  /* ---- auto-advance timer ---- */
  useEffect(() => {
    resetAutoTimer();
    if (currentSlide < totalSlides - 1) {
      // Normal slides: 30s
      autoTimerRef.current = setTimeout(goForward, 30000);
    } else {
      // Last slide: 10s then go back to grid
      autoTimerRef.current = setTimeout(onBack, 10000);
    }
    return () => resetAutoTimer();
  }, [currentSlide, totalSlides, goForward, onBack, resetAutoTimer]);

  /* ---- keyboard navigation ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      resetAutoTimer();
      if (e.key === 'ArrowRight') goForward();
      else if (e.key === 'ArrowLeft') goBackward();
      else if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goForward, goBackward, onBack, resetAutoTimer]);

  /* ---- cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  /* ---- click zones (left half / right half) ---- */
  const handleAreaClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a')
    ) return;
    resetAutoTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      goBackward();
    } else {
      goForward();
    }
  }, [goForward, goBackward, resetAutoTimer]);

  /* ---- transition styles ---- */
  const getSlideTransform = (): React.CSSProperties => {
    if (!slideVisible) {
      // Exiting: slide out
      const tx = direction === 'forward' ? -100 : 100;
      return {
        transform: `translateX(${tx}px)`,
        opacity: 0,
        transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      };
    }
    // Entering: start offset, animate to center
    return {
      transform: 'translateX(0)',
      opacity: 1,
      transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  /* ---- render current slide content ---- */
  const renderSlideContent = () => {
    if (currentSlide === 0) {
      return <HeroSlide story={story} Icon={Icon} accentVar={accentVar} />;
    }
    const sectionIndex = currentSlide - 1;
    const section = story.sections[sectionIndex];
    return (
      <SectionSlide
        section={section}
        index={sectionIndex}
        accentVar={accentVar}
      />
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        cursor: 'default',
      }}
      onClick={handleAreaClick}
    >
      <style>{`
        @keyframes sv-topBarSlide {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sv-fadeIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sv-statPop {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          60%  { transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sv-countUp {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sv-dividerGrow {
          from { width: 0; }
          to   { width: 80px; }
        }
        @keyframes sv-dotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>

      {/* Gradient backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(${accentVar}) 8%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(0,48,84,0.3) 0%, transparent 60%),
            var(--aph-navy)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Secondary radial accent behind slide content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(${accentVar}) 4%, transparent) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          animation: 'sv-topBarSlide 0.4s ease 0.1s both',
        }}
      >
        {/* Left: back button */}
        <button
          ref={backButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-heading)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'var(--aph-white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          <ArrowLeft size={16} />
          All Topics
        </button>

        {/* Center: icon + title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Icon size={24} color={`var(${accentVar})`} strokeWidth={1.8} />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: `var(${accentVar})`,
            }}
          >
            {story.title}
          </span>
        </div>

        {/* Right: slide counter */}
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '1px',
            minWidth: 48,
            textAlign: 'right',
          }}
        >
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Slide content area */}
      <div
        key={slideKey}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 80,
          paddingBottom: 80,
          ...getSlideTransform(),
        }}
      >
        {renderSlideContent()}
      </div>

      {/* Left arrow nav */}
      {currentSlide > 0 && (
        <button
          ref={navLeftRef}
          onClick={(e) => {
            e.stopPropagation();
            resetAutoTimer();
            goBackward();
          }}
          style={{
            position: 'absolute',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `color-mix(in srgb, var(${accentVar}) 20%, transparent)`;
            e.currentTarget.style.borderColor = `color-mix(in srgb, var(${accentVar}) 40%, transparent)`;
            e.currentTarget.style.color = `var(${accentVar})`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Right arrow nav */}
      {currentSlide < totalSlides - 1 && (
        <button
          ref={navRightRef}
          onClick={(e) => {
            e.stopPropagation();
            resetAutoTimer();
            goForward();
          }}
          style={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `color-mix(in srgb, var(${accentVar}) 20%, transparent)`;
            e.currentTarget.style.borderColor = `color-mix(in srgb, var(${accentVar}) 40%, transparent)`;
            e.currentTarget.style.color = `var(${accentVar})`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Progress dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {Array.from({ length: totalSlides }).map((_, i) => {
          const isActive = i === currentSlide;
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                resetAutoTimer();
                if (i !== currentSlide) {
                  goTo(i, i > currentSlide ? 'forward' : 'backward');
                }
              }}
              style={{
                width: isActive ? 28 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: isActive
                  ? `var(${accentVar})`
                  : 'rgba(255,255,255,0.2)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: isActive ? 1 : 0.6,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  HeroSlide                                                          */
/* ================================================================== */
function HeroSlide({
  story,
  Icon,
  accentVar,
}: {
  story: TileStory;
  Icon: LucideIcon;
  accentVar: string;
}) {
  const parsed = parseHeroStat(story.heroStat);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 800,
        padding: '0 32px',
      }}
    >
      {/* Icon + label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 40,
          animation: 'sv-fadeIn 0.6s ease 0ms both',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `color-mix(in srgb, var(${accentVar}) 12%, transparent)`,
            border: `1px solid color-mix(in srgb, var(${accentVar}) 20%, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={28} color={`var(${accentVar})`} strokeWidth={1.6} />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: `var(${accentVar})`,
          }}
        >
          {story.title}
        </span>
      </div>

      {/* Giant hero stat */}
      <div
        style={{
          animation: 'sv-countUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(72px, 10vw, 120px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-3px',
            background: `linear-gradient(135deg, var(${accentVar}), color-mix(in srgb, var(${accentVar}) 55%, white))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {parsed ? (
            <CountUp target={parsed.target} suffix={parsed.suffix} duration={2000} />
          ) : (
            story.heroStat
          )}
        </span>
      </div>

      {/* Hero stat label */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(16px, 2vw, 24px)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: 'rgba(255,255,255,0.6)',
          marginTop: 16,
          animation: 'sv-fadeIn 0.6s ease 0.35s both',
        }}
      >
        {story.heroStatLabel}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 18,
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.6,
          marginTop: 24,
          maxWidth: 500,
          animation: 'sv-fadeIn 0.6s ease 0.5s both',
        }}
      >
        {story.tagline}
      </div>

      {/* Accent divider */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: `var(${accentVar})`,
          marginTop: 36,
          opacity: 0.5,
          animation: 'sv-dividerGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  SectionSlide                                                       */
/* ================================================================== */
function SectionSlide({
  section,
  index,
  accentVar,
}: {
  section: TileStory['sections'][number];
  index: number;
  accentVar: string;
}) {
  const sectionNumber = String(index + 1).padStart(2, '0');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 800,
        padding: '0 48px',
      }}
    >
      {/* Section number */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 60,
          fontWeight: 200,
          color: `var(${accentVar})`,
          opacity: 0.25,
          lineHeight: 1,
          marginBottom: 24,
          animation: 'sv-fadeIn 0.6s ease 0ms both',
        }}
      >
        {sectionNumber}
      </div>

      {/* Section title */}
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(24px, 3.5vw, 40px)',
          fontWeight: 700,
          color: 'var(--aph-white)',
          lineHeight: 1.2,
          marginBottom: 24,
          letterSpacing: '-0.5px',
          animation: 'sv-fadeIn 0.6s ease 0ms both',
        }}
      >
        {section.title}
      </h2>

      {/* Body text */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(16px, 1.8vw, 22px)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.7,
          maxWidth: 680,
          marginBottom: section.stat ? 36 : 0,
          animation: 'sv-fadeIn 0.6s ease 150ms both',
        }}
      >
        {section.body}
      </p>

      {/* Stat badge */}
      {section.stat && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 12,
            padding: '16px 28px',
            background: `color-mix(in srgb, var(${accentVar}) 10%, transparent)`,
            borderRadius: 14,
            border: `1px solid color-mix(in srgb, var(${accentVar}) 18%, transparent)`,
            animation: 'sv-statPop 0.7s cubic-bezier(0.16, 1, 0.3, 1) 300ms both',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 48,
              fontWeight: 800,
              color: `var(${accentVar})`,
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            {section.stat}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
            }}
          >
            {section.statLabel}
          </span>
        </div>
      )}
    </div>
  );
}
