import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import ParticleCanvas from "./components/ParticleCanvas";
import AttractMode from "./components/AttractMode";
import TileGrid from "./components/TileGrid";
import StoryViewer from "./components/StoryViewer";
import { stories, attractFacts, type TileStory } from "./data/stories";
import { useIdleTimer } from "./hooks/useIdleTimer";
import { useMediaQuery } from "./hooks/useMediaQuery";
import {
  resolveAppMode,
  modeConfig,
  breakpoints,
  transitionConfig,
  type ScreenMode,
} from "./config";
import type { TileRect } from "./components/shared/types";

interface ScatterTile {
  id: string;
  rect: TileRect;
  accentColor: string;
  // Computed scatter direction
  tx: number; // translate X target (offscreen)
  ty: number; // translate Y target (offscreen)
  rotate: number;
  isClicked: boolean;
}

export default function App() {
  const appModeKey = useMemo(() => resolveAppMode(), []);
  const cfg = modeConfig[appModeKey];
  const isTvMode = appModeKey === "tv";
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.mobile}px)`);

  const [mode, setMode] = useState<ScreenMode>(cfg.startScreen);
  const [selectedStory, setSelectedStory] = useState<TileStory | null>(null);

  // ── Visited stories tracking ──
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);

  // ── Beat signal for particle pulse ──
  const [beatTimestamp, setBeatTimestamp] = useState(0);
  const handleHeroBeat = useCallback(() => {
    setBeatTimestamp(Date.now());
  }, []);

  // ── Scatter transition state ──
  const [scatterTiles, setScatterTiles] = useState<ScatterTile[]>([]);
  const [scatterPhase, setScatterPhase] = useState<
    "idle" | "initial" | "scatter" | "done"
  >("idle");
  const scatterTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearScatterTimers = () => {
    scatterTimersRef.current.forEach(clearTimeout);
    scatterTimersRef.current = [];
  };

  const goToAttract = useCallback(() => {
    clearScatterTimers();
    setSelectedStory(null);
    setScatterTiles([]);
    setScatterPhase("idle");
    setVisitedIds(new Set()); // Reset visited on return to attract
    setMode("attract");
  }, []);

  const goToGrid = useCallback(() => {
    clearScatterTimers();
    // Capture which story was just viewed for re-highlight on grid
    setSelectedStory((prev) => {
      if (prev) setLastViewedId(prev.id);
      return null;
    });
    setScatterTiles([]);
    setScatterPhase("idle");
    setMode("grid");
  }, []);

  const handleSelectTile = useCallback(
    (
      story: TileStory,
      clickedRect?: TileRect,
      allRects?: Map<string, TileRect>,
    ) => {
      if (clickedRect && allRects) {
        // Compute scatter directions for all tiles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const tiles: ScatterTile[] = [];

        allRects.forEach((rect, id) => {
          const isClicked = id === story.id;
          const tileCenterX = rect.x + rect.width / 2;
          const tileCenterY = rect.y + rect.height / 2;
          // Direction from center to tile, amplified for offscreen scatter
          const dx = tileCenterX - centerX;
          const dy = tileCenterY - centerY;
          const angle = Math.atan2(dy, dx);
          const distance = 1200; // fly far offscreen

          const matchingStory = stories.find((s) => s.id === id);

          tiles.push({
            id,
            rect,
            accentColor: matchingStory?.accentColor || "--aph-teal",
            tx: isClicked ? 0 : Math.cos(angle) * distance,
            ty: isClicked ? 0 : Math.sin(angle) * distance,
            rotate: isClicked
              ? 0
              : (dx > 0 ? 1 : -1) * (15 + Math.random() * 15),
            isClicked,
          });
        });

        setScatterTiles(tiles);
        setScatterPhase("initial");
        setVisitedIds((prev) => new Set(prev).add(story.id));

        // Frame 1: paint overlay tiles at their original grid positions
        // Frame 2: trigger scatter + expand animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setScatterPhase("scatter");

            // Start fading in the story behind the overlay
            const t0 = setTimeout(() => {
              setSelectedStory(story);
              setMode("story");
            }, 300);
            scatterTimersRef.current.push(t0);

            // Scatter is done, clean up overlay
            const t1 = setTimeout(() => {
              setScatterPhase("done");
              const t2 = setTimeout(() => {
                setScatterTiles([]);
                setScatterPhase("idle");
              }, transitionConfig.scatterCleanupMs);
              scatterTimersRef.current.push(t2);
            }, transitionConfig.scatterMs);
            scatterTimersRef.current.push(t1);
          });
        });
      } else {
        setSelectedStory(story);
        setMode("story");
      }
    },
    [],
  );

  // Idle timer: return to attract after configured timeout (grid only).
  // Story mode has its own auto-advance timers, so we skip the global reset there.
  const idleCallback = useCallback(() => {
    if (mode === "grid" && cfg.idleTimeoutMs !== null) goToAttract();
  }, [mode, goToAttract, cfg.idleTimeoutMs]);
  useIdleTimer(idleCallback, cfg.idleTimeoutMs);

  // Expose navigation for testing
  const navRef = useRef({ goToAttract, goToGrid, handleSelectTile, stories });
  navRef.current = { goToAttract, goToGrid, handleSelectTile, stories };
  useEffect(() => {
    (window as any).__aphit = {
      goToAttract: () => navRef.current.goToAttract(),
      goToGrid: () => navRef.current.goToGrid(),
      selectStory: (id: string) => {
        const story = stories.find((s) => s.id === id);
        if (story) navRef.current.handleSelectTile(story);
      },
    };
  }, []);

  // Clean up on unmount
  useEffect(() => () => clearScatterTimers(), []);

  // ── Panic reset: 3× Escape within 1500ms reloads the page ──
  const escTimestampsRef = useRef<number[]>([]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const now = Date.now();
      escTimestampsRef.current.push(now);
      // Keep only timestamps within the last 1500ms
      escTimestampsRef.current = escTimestampsRef.current.filter(
        (t) => now - t <= 1500,
      );
      if (escTimestampsRef.current.length >= 3) {
        window.location.reload();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Particle background */}
      {cfg.particles.enabled && !isMobile && (
        <ParticleCanvas
          interactive={cfg.particles.interactive && mode === "attract"}
          dimmed={cfg.particles.dimWhenStory && mode === "story"}
          beatTimestamp={beatTimestamp}
          count={cfg.particles.count}
        />
      )}

      {/* Background atmosphere */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `
          radial-gradient(ellipse at 20% 20%, rgba(0,123,131,0.10) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(107,76,154,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 100%, rgba(242,169,0,0.04) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,6,12,0.6) 100%)
        `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Global noise/grain texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.035,
          mixBlendMode: "overlay" as const,
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="globalGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#globalGrain)" />
        </svg>
      </div>

      {/* ═══ Scene layers ═══ */}

      {/* Attract mode */}
      {cfg.showAttractMode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1,
            opacity: mode === "attract" ? 1 : 0,
            pointerEvents: mode === "attract" ? "auto" : "none",
            transition: "opacity 0.6s ease",
          }}
        >
          <AttractMode
            facts={attractFacts}
            stories={stories}
            onInteract={goToGrid}
            onHeroBeat={handleHeroBeat}
          />
        </div>
      )}

      {/* Grid mode — no transition when scatter is active (overlay handles it) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2,
          opacity: mode === "grid" && scatterPhase === "idle" ? 1 : 0,
          pointerEvents:
            mode === "grid" && scatterPhase === "idle" ? "auto" : "none",
          transition: scatterPhase !== "idle" ? "none" : "opacity 0.5s ease",
        }}
      >
        <TileGrid
          stories={stories}
          onSelectTile={handleSelectTile}
          visitedIds={visitedIds}
          lastViewedId={lastViewedId ?? undefined}
        />
      </div>

      {/* Story mode */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 3,
          opacity: mode === "story" ? 1 : 0,
          pointerEvents: mode === "story" ? "auto" : "none",
          transition: "opacity 0.4s ease",
        }}
      >
        {selectedStory && (
          <StoryViewer
            key={selectedStory.id}
            story={selectedStory}
            onBack={goToGrid}
            isTvMode={isTvMode}
          />
        )}
      </div>

      {/* ═══ Scatter transition overlay ═══ */}
      {scatterTiles.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {scatterTiles.map((tile) => {
            const isScattering =
              scatterPhase === "scatter" || scatterPhase === "done";
            const isDone = scatterPhase === "done";

            if (tile.isClicked) {
              // Clicked tile expands to fill screen
              return (
                <div
                  key={tile.id}
                  style={{
                    position: "absolute",
                    left: isScattering ? 0 : tile.rect.x,
                    top: isScattering ? 0 : tile.rect.y,
                    width: isScattering ? "100vw" : tile.rect.width,
                    height: isScattering ? "100vh" : tile.rect.height,
                    borderRadius: isScattering ? 0 : 20,
                    background: "var(--aph-navy)",
                    border: `1px solid color-mix(in srgb, var(${tile.accentColor}) 20%, transparent)`,
                    transition:
                      "left 0.6s cubic-bezier(0.16,1,0.3,1), top 0.6s cubic-bezier(0.16,1,0.3,1), width 0.6s cubic-bezier(0.16,1,0.3,1), height 0.6s cubic-bezier(0.16,1,0.3,1), border-radius 0.5s ease, opacity 0.3s ease",
                    opacity: isDone ? 0 : 1,
                  }}
                />
              );
            }

            // Other tiles scatter offscreen
            return (
              <div
                key={tile.id}
                style={{
                  position: "absolute",
                  left: tile.rect.x,
                  top: tile.rect.y,
                  width: tile.rect.width,
                  height: tile.rect.height,
                  borderRadius: 10,
                  background: "rgba(0,8,16,0.85)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transform: isScattering
                    ? `translate(${tile.tx}px, ${tile.ty}px) rotate(${tile.rotate}deg) scale(0.6)`
                    : "translate(0, 0) rotate(0deg) scale(1)",
                  opacity: isScattering ? 0 : 0.8,
                  transition:
                    "transform 0.5s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.4s ease",
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
