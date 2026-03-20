import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { TileStory } from "../data/stories";
import { iconMap } from "./shared/iconMap";
import { modeConfig, breakpoints, transitionConfig } from "../config";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  story: TileStory;
  onBack: () => void;
  isTvMode?: boolean;
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
  const [display, setDisplay] = useState("0");
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
    <>
      {display}
      {suffix}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Parse heroStat into a numeric target + suffix for CountUp          */
/* ------------------------------------------------------------------ */
function parseHeroStat(raw: string): { target: number; suffix: string } | null {
  // Match patterns like "500K+", "1,200+", "30+", "100%", "6", "200+"
  const m = raw.match(/^([\d,]+)(K?)\s*([+%]?)$/i);
  if (!m) return null;
  let num = parseInt(m[1].replace(/,/g, ""), 10);
  const kSuffix = m[2].toUpperCase();
  const trail = m[3];
  if (kSuffix === "K") num = num * 1000;
  // Build the suffix that goes after the animated number
  // e.g. "500K+" → target=500, suffix="K+"
  if (kSuffix === "K") {
    return { target: num / 1000, suffix: `K${trail}` };
  }
  return { target: num, suffix: trail };
}

/* ------------------------------------------------------------------ */
/*  ProgressTimerBar — thin bar at the very bottom of the screen       */
/* ------------------------------------------------------------------ */
function ProgressTimerBar({
  slideKey,
  accentVar,
  durationMs,
}: {
  slideKey: number;
  accentVar: string;
  durationMs: number;
}) {
  const [width, setWidth] = useState("0%");
  const [transition, setTransition] = useState("none");

  useEffect(() => {
    // Reset to 0 with no transition
    setTransition("none");
    setWidth("0%");

    // Force a reflow then animate to 100%
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransition(`width ${durationMs / 1000}s linear`);
        setWidth("100%");
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [slideKey, durationMs]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "rgba(255,255,255,0.06)",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width,
          background: `var(${accentVar})`,
          transition,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StoryViewer — full-screen slideshow                                */
/* ------------------------------------------------------------------ */
export default function StoryViewer({
  story,
  onBack,
  isTvMode = false,
}: Props) {
  const cfg = isTvMode ? modeConfig.tv : modeConfig.default;
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.mobile}px)`);

  const Icon = iconMap[story.icon] || Sparkles;
  const accentVar = story.accentColor;
  const totalSlides = 1 + story.sections.length; // slide 0 = hero, 1..N = sections

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideVisible, setSlideVisible] = useState(true);
  const [slideKey, setSlideKey] = useState(0); // forces re-mount for stagger animations

  const [showReturnWarning, setShowReturnWarning] = useState(false);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const navLeftRef = useRef<HTMLButtonElement>(null);
  const navRightRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Determine auto-advance duration for current slide
  const isLastSlide = currentSlide >= totalSlides - 1;
  const isHeroSlide = currentSlide === 0;
  const autoAdvanceDuration = cfg.autoAdvance
    ? isLastSlide
      ? cfg.autoAdvance.lastSlideMs
      : isHeroSlide
        ? cfg.autoAdvance.heroMs
        : cfg.autoAdvance.sectionMs
    : 0;

  /* ---- navigation helpers ---- */
  const resetAutoTimer = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  }, []);

  const goTo = useCallback(
    (next: number, dir: "forward" | "backward") => {
      if (isTransitioning) return;
      resetAutoTimer();
      setShowReturnWarning(false);
      if (returnWarningTimerRef.current) {
        clearTimeout(returnWarningTimerRef.current);
        returnWarningTimerRef.current = null;
      }
      setDirection(dir);
      setSlideVisible(false);
      setIsTransitioning(true);

      transitionTimerRef.current = setTimeout(() => {
        setCurrentSlide(next);
        setSlideKey((k) => k + 1);
        setDirection(dir);
        setSlideVisible(true);
        setIsTransitioning(false);
      }, transitionConfig.slideMs);
    },
    [isTransitioning, resetAutoTimer],
  );

  const goForward = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      goTo(currentSlide + 1, "forward");
    } else {
      // Last slide — loop back to tile grid
      onBack();
    }
  }, [currentSlide, totalSlides, goTo, onBack]);

  const goBackward = useCallback(() => {
    if (currentSlide > 0) {
      goTo(currentSlide - 1, "backward");
    }
  }, [currentSlide, goTo]);

  /* ---- swipe gesture support ---- */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      // Only trigger swipe if horizontal movement exceeds vertical (and threshold)
      if (
        Math.abs(dx) > Math.abs(dy) &&
        Math.abs(dx) > transitionConfig.swipeThresholdPx
      ) {
        resetAutoTimer();
        if (dx < 0) {
          goForward(); // swipe left = next
        } else {
          goBackward(); // swipe right = previous
        }
      }
    },
    [goForward, goBackward, resetAutoTimer],
  );

  /* ---- auto-advance timer ---- */
  useEffect(() => {
    resetAutoTimer();
    if (!cfg.autoAdvance) return; // No auto-advance in default mode

    if (currentSlide < totalSlides - 1) {
      const advanceMs =
        currentSlide === 0 ? cfg.autoAdvance.heroMs : cfg.autoAdvance.sectionMs;
      autoTimerRef.current = setTimeout(goForward, advanceMs);
    } else {
      autoTimerRef.current = setTimeout(onBack, cfg.autoAdvance.lastSlideMs);
    }
    return () => resetAutoTimer();
  }, [
    currentSlide,
    totalSlides,
    goForward,
    onBack,
    resetAutoTimer,
    cfg.autoAdvance,
  ]);

  /* ---- last-slide return warning ---- */
  useEffect(() => {
    if (returnWarningTimerRef.current) {
      clearTimeout(returnWarningTimerRef.current);
      returnWarningTimerRef.current = null;
    }
    setShowReturnWarning(false);

    if (isLastSlide && cfg.showReturnWarning && cfg.autoAdvance) {
      returnWarningTimerRef.current = setTimeout(() => {
        setShowReturnWarning(true);
      }, cfg.autoAdvance.returnWarningMs);
    }
    return () => {
      if (returnWarningTimerRef.current) {
        clearTimeout(returnWarningTimerRef.current);
      }
    };
  }, [currentSlide, isLastSlide, cfg.showReturnWarning, cfg.autoAdvance]);

  /* ---- keyboard navigation (arrows, space, escape) ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      resetAutoTimer();
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault(); // prevent space from scrolling
        goForward();
      } else if (e.key === "ArrowLeft") goBackward();
      else if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goForward, goBackward, onBack, resetAutoTimer]);

  /* ---- cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (returnWarningTimerRef.current)
        clearTimeout(returnWarningTimerRef.current);
    };
  }, []);

  /* ---- transition styles ---- */
  const getSlideTransform = (): React.CSSProperties => {
    if (!slideVisible) {
      // Exiting: slide out (accelerating out, shorter)
      const tx = direction === "forward" ? -100 : 100;
      return {
        transform: `translateX(${tx}px)`,
        opacity: 0,
        transition:
          "transform 300ms cubic-bezier(0.55, 0, 1, 0.45), opacity 250ms ease",
      };
    }
    // Entering: start offset, animate to center (decelerating in, slightly longer)
    return {
      transform: "translateX(0)",
      opacity: 1,
      transition:
        "transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms ease",
    };
  };

  /* ---- click handler ---- */
  const handleClick = (e: React.MouseEvent) => {
    // Click anywhere advances — unless clicking a button or link
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    resetAutoTimer();
    goForward();
  };

  /* ---- render current slide content ---- */
  const renderSlideContent = () => {
    if (currentSlide === 0) {
      return (
        <HeroSlide
          story={story}
          Icon={Icon}
          accentVar={accentVar}
          isMobile={isMobile}
        />
      );
    }
    const sectionIndex = currentSlide - 1;
    const section = story.sections[sectionIndex];
    return (
      <SectionSlide
        section={section}
        index={sectionIndex}
        accentVar={accentVar}
        isMobile={isMobile}
      />
    );
  };

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        cursor: "pointer",
      }}
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
        @keyframes sv-fadeInSimple {
          from { opacity: 0; }
          to   { opacity: 1; }
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
        @keyframes sv-dotPulseIn {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes sv-dividerGrow {
          from { width: 0; }
          to   { width: 80px; }
        }
        @keyframes sv-dotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes sv-heroGlow {
          0%, 100% { opacity: 0.1; }
          50%      { opacity: 0.2; }
        }
        .sv-nav-btn:active {
          background: rgba(255,255,255,0.15) !important;
          transform: translateY(-50%) scale(0.95);
        }
        .sv-back-btn:active {
          background: rgba(255,255,255,0.1) !important;
        }
      `}</style>

      {/* Gradient backdrop — fades in for atmospheric reveal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(${accentVar}) 18%, transparent) 0%, transparent 70%),
            radial-gradient(ellipse at 70% 80%, color-mix(in srgb, var(${accentVar}) 10%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(0,16,32,0.3) 0%, transparent 60%),
            var(--aph-navy)
          `,
          pointerEvents: "none",
          animation: "sv-fadeInSimple 1.2s ease 0s both",
        }}
      />

      {/* Secondary radial accent behind slide content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(${accentVar}) 4%, transparent) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "16px 16px" : "24px 48px",
          background: "rgba(0,6,12,0.5)",
          animation: "sv-topBarSlide 0.4s ease 0.1s both",
        }}
      >
        {/* Left: back button */}
        <button
          ref={backButtonRef}
          className="sv-back-btn"
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "var(--font-heading)",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s ease, color 0.15s ease",
          }}
        >
          <ArrowLeft size={18} />
          All Topics
        </button>

        {/* Center: icon + title — hidden on mobile to prevent overlap */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Icon size={26} color={`var(${accentVar})`} strokeWidth={1.8} />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: `var(${accentVar})`,
              }}
            >
              {story.title}
            </span>
          </div>
        )}

        {/* Right: slide counter */}
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--aph-warm-gray)",
            letterSpacing: "1px",
            minWidth: 48,
            textAlign: "right",
          }}
        >
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Slide content area */}
      <div
        key={slideKey}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: isMobile ? 60 : 80,
          paddingBottom: isMobile ? 40 : 80,
          overflowY: "auto",
          opacity: showReturnWarning ? 0.85 : 1,
          transition: "opacity 0.6s ease",
          ...getSlideTransform(),
        }}
      >
        {renderSlideContent()}
      </div>

      {/* Left arrow nav */}
      {currentSlide > 0 && (
        <button
          ref={navLeftRef}
          className="sv-nav-btn"
          onClick={(e) => {
            e.stopPropagation();
            resetAutoTimer();
            goBackward();
          }}
          style={{
            position: "absolute",
            left: isMobile ? 8 : 24,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: isMobile ? 36 : 48,
            height: isMobile ? 36 : 48,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition:
              "background 0.2s ease, border-color 0.2s ease, color 0.15s ease",
          }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Right arrow nav — always visible; on last slide it returns to grid */}
      {
        <button
          ref={navRightRef}
          className="sv-nav-btn"
          onClick={(e) => {
            e.stopPropagation();
            resetAutoTimer();
            goForward();
          }}
          style={{
            position: "absolute",
            right: isMobile ? 8 : 24,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: isMobile ? 36 : 48,
            height: isMobile ? 36 : 48,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition:
              "background 0.2s ease, border-color 0.2s ease, color 0.15s ease",
          }}
        >
          <ChevronRight size={22} />
        </button>
      }

      {/* QR code placeholder (bottom-right) — hidden on mobile */}
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 32,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {/* "Learn More" micro-label */}
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Learn More
          </span>
          <svg
            width={48}
            height={48}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.35 }}
          >
            <rect
              x={0}
              y={0}
              width={48}
              height={48}
              rx={8}
              fill="rgba(255,255,255,0.9)"
            />
            {/* Top-left finder pattern */}
            <rect
              x={4}
              y={4}
              width={14}
              height={14}
              rx={2}
              stroke="#111"
              strokeWidth={2.5}
              fill="none"
            />
            <rect x={7} y={7} width={8} height={8} rx={1} fill="#111" />
            {/* Top-right finder pattern */}
            <rect
              x={30}
              y={4}
              width={14}
              height={14}
              rx={2}
              stroke="#111"
              strokeWidth={2.5}
              fill="none"
            />
            <rect x={33} y={7} width={8} height={8} rx={1} fill="#111" />
            {/* Bottom-left finder pattern */}
            <rect
              x={4}
              y={30}
              width={14}
              height={14}
              rx={2}
              stroke="#111"
              strokeWidth={2.5}
              fill="none"
            />
            <rect x={7} y={33} width={8} height={8} rx={1} fill="#111" />
            {/* Data modules */}
            <rect x={22} y={4} width={4} height={4} fill="#111" />
            <rect x={22} y={12} width={4} height={4} fill="#111" />
            <rect x={22} y={22} width={4} height={4} fill="#111" />
            <rect x={30} y={22} width={4} height={4} fill="#111" />
            <rect x={38} y={22} width={4} height={4} fill="#111" />
            <rect x={22} y={30} width={4} height={4} fill="#111" />
            <rect x={30} y={30} width={4} height={4} fill="#111" />
            <rect x={38} y={30} width={4} height={4} fill="#111" />
            <rect x={22} y={38} width={4} height={4} fill="#111" />
            <rect x={30} y={38} width={4} height={4} fill="#111" />
            <rect x={38} y={38} width={4} height={4} fill="#111" />
            <rect x={4} y={22} width={4} height={4} fill="#111" />
            <rect x={12} y={22} width={4} height={4} fill="#111" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              marginTop: 5,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            austinpublichealth.org/hit
          </span>
        </div>
      )}

      {/* Return warning text */}
      {showReturnWarning && cfg.showReturnWarning && (
        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.5px",
            }}
          >
            Returning to topics...
          </span>
        </div>
      )}

      {/* Progress dots */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
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
                  goTo(i, i > currentSlide ? "forward" : "backward");
                }
              }}
              style={{
                width: isActive ? 28 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: isActive
                  ? `var(${accentVar})`
                  : "rgba(255,255,255,0.2)",
                transition:
                  "width 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, opacity 0.3s ease",
                opacity: isActive ? 1 : 0.6,
                boxShadow: isActive
                  ? `inset 0 1px 3px rgba(255,255,255,0.25), 0 0 8px color-mix(in srgb, var(${accentVar}) 40%, transparent)`
                  : "none",
                animation: isActive
                  ? "sv-dotPulseIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              }}
            />
          );
        })}
      </div>

      {/* Progress timer bar at the very bottom — only in modes with auto-advance */}
      {cfg.showProgressTimer && cfg.autoAdvance && (
        <ProgressTimerBar
          slideKey={slideKey}
          accentVar={accentVar}
          durationMs={autoAdvanceDuration}
        />
      )}
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
  isMobile,
}: {
  story: TileStory;
  Icon: LucideIcon;
  accentVar: string;
  isMobile: boolean;
}) {
  const parsed = parseHeroStat(story.heroStat);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: 1000,
        padding: isMobile ? "0 16px" : "0 48px",
      }}
    >
      {/* Icon + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 40,
          animation: "sv-fadeIn 0.6s ease 0ms both",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            background: `color-mix(in srgb, var(${accentVar}) 12%, transparent)`,
            border: `1px solid color-mix(in srgb, var(${accentVar}) 20%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={28} color={`var(${accentVar})`} strokeWidth={1.6} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: `var(${accentVar})`,
          }}
        >
          {story.title}
        </span>
      </div>

      {/* Giant hero stat with pulsing glow */}
      <div
        style={{
          position: "relative",
          animation:
            "sv-countUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both",
        }}
      >
        {/* Pulsing glow behind the stat */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "calc(100% + 200px)",
            height: "calc(100% + 100px)",
            background: `radial-gradient(ellipse at center, var(${accentVar}), transparent 70%)`,
            filter: "blur(40px)",
            animation: "sv-heroGlow 3s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "relative",
            fontFamily: "var(--font-heading)",
            fontStyle: "normal",
            fontSize: "clamp(48px, 14vw, 160px)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-3px",
            background: `linear-gradient(135deg, var(${accentVar}), color-mix(in srgb, var(${accentVar}) 55%, white))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {parsed ? (
            <CountUp
              target={parsed.target}
              suffix={parsed.suffix}
              duration={2000}
            />
          ) : (
            story.heroStat
          )}
        </span>
      </div>

      {/* Hero stat label */}
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(18px, 2.5vw, 28px)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "3px",
          color: "var(--aph-warm-gray)",
          marginTop: 28,
          animation: "sv-fadeIn 0.6s ease 0.35s both",
        }}
      >
        {story.heroStatLabel}
      </div>

      {/* Thin separator — visual pause between stat and tagline */}
      <div
        style={{
          width: 48,
          height: 2,
          background: "rgba(255,255,255,0.15)",
          margin: "20px auto 0",
          borderRadius: 1,
          animation: "sv-fadeIn 0.6s ease 0.4s both",
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(18px, 2vw, 24px)",
          color: "var(--aph-warm-gray)",
          lineHeight: 1.6,
          marginTop: 24,
          maxWidth: 600,
          animation: "sv-fadeIn 0.6s ease 0.5s both",
        }}
      >
        {story.tagline}
      </div>

      {/* Accent divider */}
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: `var(${accentVar})`,
          marginTop: 36,
          boxShadow: `0 0 12px color-mix(in srgb, var(${accentVar}) 50%, transparent), 0 0 4px var(${accentVar})`,
          animation:
            "sv-dividerGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both",
          overflow: "hidden",
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
  isMobile,
}: {
  section: TileStory["sections"][number];
  index: number;
  accentVar: string;
  isMobile: boolean;
}) {
  const sectionNumber = String(index + 1).padStart(2, "0");
  // Odd sections (index 0, 2 → sections 1, 3) are left-aligned
  // Even sections (index 1, 3 → sections 2, 4) are center-aligned
  const isOddSection = index % 2 === 0; // index 0 = section 1 (odd), index 1 = section 2 (even)
  const isLeftAligned = isOddSection;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: isLeftAligned ? "flex-start" : "center",
        textAlign: isLeftAligned ? "left" : "center",
        maxWidth: 1000,
        padding: isMobile ? "0 16px" : "0 48px",
      }}
    >
      {/* Decorative accent line on the right for left-aligned sections */}
      {isLeftAligned && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "30%",
            height: "40%",
            width: 4,
            background: `color-mix(in srgb, var(${accentVar}) 40%, transparent)`,
            borderRadius: 1,
          }}
        />
      )}

      {/* Section number */}
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: isMobile ? 36 : 72,
          fontWeight: 400,
          fontStyle: "italic" as const,
          color: "var(--aph-warm-gray)",
          opacity: 0.3,
          lineHeight: 1,
          marginBottom: 24,
          animation: "sv-fadeIn 0.6s ease 0ms both",
        }}
      >
        {sectionNumber}
      </div>

      {/* Section title */}
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 700,
          color: "var(--aph-white)",
          lineHeight: 1.2,
          marginBottom: 24,
          letterSpacing: "-0.5px",
          animation: "sv-fadeIn 0.6s ease 0ms both",
        }}
      >
        {section.title}
      </h2>

      {/* Hero stat for this section — displayed prominently before body text */}
      {section.stat && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isLeftAligned ? "flex-start" : "center",
            gap: 6,
            marginBottom: 28,
            animation:
              "sv-statPop 0.7s cubic-bezier(0.22, 1, 0.36, 1) 100ms both",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontStyle: "normal",
              fontSize: "clamp(56px, 7vw, 80px)",
              fontWeight: 800,
              color: `var(${accentVar})`,
              letterSpacing: "-1px",
              lineHeight: 1,
            }}
          >
            {section.stat}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--aph-gold)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: 600,
            }}
          >
            {section.statLabel}
          </span>
        </div>
      )}

      {/* Body text — shows fully, naturally caps at ~3 lines */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(18px, 2vw, 24px)",
          fontWeight: 400,
          color: "rgba(255,255,255,0.8)",
          lineHeight: 1.6,
          maxWidth: 780,
          whiteSpace: "pre-line",
          animation: "sv-fadeIn 0.6s ease 150ms both",
        }}
      >
        {section.body}
      </div>
    </div>
  );
}
