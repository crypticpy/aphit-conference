import { useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  fact: string;
  visible: boolean;
  accentColor?: string;
}

interface RainDrop {
  x: number;           // column x position
  headY: number;       // current position of the leading character
  speed: number;       // pixels per frame the head moves down
  trailLength: number; // how many characters in the trail
  chars: string[];     // character at each trail position (cycled randomly)
  charSize: number;    // font size for this column
  colorR: number;
  colorG: number;
  colorB: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const CHARS = '0123456789ABCDEFabcdef<>{}[]|/\\=+-*@#$%ァイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');

const COLUMN_COLORS = [
  { r: 0, g: 123, b: 131 },   // --aph-teal
  { r: 77, g: 168, b: 218 },  // --aph-sky-blue
  { r: 94, g: 198, b: 195 },  // --aph-light-teal
  { r: 120, g: 190, b: 32 },  // --aph-green
];

const COLUMN_COUNT = 35;
const TRAIL_LENGTH_MIN = 12;
const TRAIL_LENGTH_MAX = 25;
const FONT_SIZE_MIN = 13;
const FONT_SIZE_MAX = 16;
const SPEED_MIN = 1.5;
const SPEED_MAX = 4.0;
const CHAR_CYCLE_CHANCE = 0.15; // ~15% chance per char per frame to cycle to a new glyph
const MONO_FONT = "'Source Code Pro', 'Fira Code', monospace";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomChar(): string {
  return pickRandom(CHARS);
}

// ═══════════════════════════════════════════════════════════════════════════
// Word-by-word stagger reveal (matches project pattern from AttractMode)
// ═══════════════════════════════════════════════════════════════════════════

function WordReveal({
  text,
  visible,
  staggerMs = 50,
}: {
  text: string;
  visible: boolean;
  staggerMs?: number;
}) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            marginRight: '0.3em',
            verticalAlign: 'top',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: visible ? 'translateY(0)' : 'translateY(110%)',
              opacity: visible ? 1 : 0,
              transition: `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerMs}ms, opacity 0.4s ease ${i * staggerMs}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RainDrop factory
// ═══════════════════════════════════════════════════════════════════════════

function createRainDrop(x: number, screenHeight: number, staggerStart: boolean): RainDrop {
  const color = pickRandom(COLUMN_COLORS);
  const charSize = randomInt(FONT_SIZE_MIN, FONT_SIZE_MAX);
  const trailLength = randomInt(TRAIL_LENGTH_MIN, TRAIL_LENGTH_MAX);
  const speed = randomBetween(SPEED_MIN, SPEED_MAX);
  const charSpacing = charSize * 1.2;

  // Build the initial character array for the trail
  const chars: string[] = [];
  for (let i = 0; i < trailLength; i++) {
    chars.push(randomChar());
  }

  // Stagger start: some drops begin mid-screen, others start above
  const headY = staggerStart
    ? -Math.random() * (screenHeight + trailLength * charSpacing)
    : -(Math.random() * trailLength * charSpacing);

  return {
    x,
    headY,
    speed,
    trailLength,
    chars,
    charSize,
    colorR: color.r,
    colorG: color.g,
    colorB: color.b,
  };
}

function createAllDrops(width: number, height: number): RainDrop[] {
  const gap = width / COLUMN_COUNT;
  const drops: RainDrop[] = [];
  for (let i = 0; i < COLUMN_COUNT; i++) {
    // Evenly spaced with slight random offset
    const x = gap * i + gap * 0.5 + (Math.random() - 0.5) * gap * 0.25;
    drops.push(createRainDrop(x, height, true));
  }
  return drops;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function DataStream({ fact, visible, accentColor = '--aph-teal' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<RainDrop[]>([]);
  const animFrameRef = useRef<number>(0);
  const dprRef = useRef(1);

  // ── Build / rebuild drops on resize ──
  const initDrops = useCallback((width: number, height: number) => {
    dropsRef.current = createAllDrops(width, height);
  }, []);

  // ── Canvas setup + animation loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (dropsRef.current.length === 0) {
        initDrops(w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Animation loop ──
    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const drops = dropsRef.current;

      // Fade-to-black: semi-transparent fill preserves trailing ghost effect
      ctx.clearRect(0, 0, w, h);

      for (let d = 0; d < drops.length; d++) {
        const drop = drops[d];
        const charSpacing = drop.charSize * 1.2;

        // ── 1. Move headY down by speed ──
        drop.headY += drop.speed;

        // ── 2. Cycle individual characters — each char has a chance to change every frame ──
        for (let ci = 0; ci < drop.trailLength; ci++) {
          if (Math.random() < CHAR_CYCLE_CHANCE) {
            drop.chars[ci] = randomChar();
          }
        }

        // ── 3. Draw subtle column glow behind the trail ──
        const glowTop = drop.headY - drop.trailLength * charSpacing;
        const glowBottom = drop.headY;
        if (glowBottom > 0 && glowTop < h) {
          const gradient = ctx.createLinearGradient(drop.x, Math.max(glowTop, 0), drop.x, Math.min(glowBottom, h));
          gradient.addColorStop(0, `rgba(${drop.colorR},${drop.colorG},${drop.colorB},0)`);
          gradient.addColorStop(0.3, `rgba(${drop.colorR},${drop.colorG},${drop.colorB},0.04)`);
          gradient.addColorStop(0.7, `rgba(${drop.colorR},${drop.colorG},${drop.colorB},0.04)`);
          gradient.addColorStop(1, `rgba(${drop.colorR},${drop.colorG},${drop.colorB},0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(drop.x - drop.charSize * 0.4, Math.max(glowTop, 0), drop.charSize * 0.8, Math.min(glowBottom, h) - Math.max(glowTop, 0));

          // Subtle 1px column glow line
          ctx.strokeStyle = `rgba(${drop.colorR},${drop.colorG},${drop.colorB},0.04)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(drop.x, Math.max(glowTop, 0));
          ctx.lineTo(drop.x, Math.min(glowBottom, h));
          ctx.stroke();
        }

        // ── 4. Draw characters from head going upward ──
        ctx.font = `600 ${drop.charSize}px ${MONO_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < drop.trailLength; i++) {
          const charY = drop.headY - i * charSpacing;

          // Skip if off-screen
          if (charY < -charSpacing || charY > h + charSpacing) continue;

          const char = drop.chars[i];

          if (i === 0) {
            // ── Head character: brightest, white-tinted, with glow ──
            // Mix 50% white into the column color for the head
            const headR = Math.round(drop.colorR + (255 - drop.colorR) * 0.5);
            const headG = Math.round(drop.colorG + (255 - drop.colorG) * 0.5);
            const headB = Math.round(drop.colorB + (255 - drop.colorB) * 0.5);

            ctx.shadowColor = `rgba(${drop.colorR},${drop.colorG},${drop.colorB},0.8)`;
            ctx.shadowBlur = 16;
            ctx.fillStyle = `rgba(${headR},${headG},${headB},0.95)`;
            ctx.fillText(char, drop.x, charY);

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          } else {
            // ── Trail characters: exponential decay from 0.91 to 0.1 ──
            // t goes from 0 (just behind head) to 1 (end of trail)
            const t = i / (drop.trailLength - 1);
            // Exponential decay: alpha = 0.91 * e^(-k*t) where k tunes the curve
            // We want alpha(0) ~= 0.91 and alpha(1) ~= 0.1
            // 0.1 = 0.91 * e^(-k) => k = -ln(0.1/0.91) = ln(9.1) ~= 2.208
            const k = 2.208;
            const alpha = 0.91 * Math.exp(-k * t);

            ctx.fillStyle = `rgba(${drop.colorR},${drop.colorG},${drop.colorB},${alpha.toFixed(3)})`;
            ctx.fillText(char, drop.x, charY);
          }
        }

        // ── 5. Reset when head goes past screen + full trail length ──
        if (drop.headY > h + drop.trailLength * charSpacing) {
          const color = pickRandom(COLUMN_COLORS);
          drop.headY = -(Math.random() * drop.trailLength * charSpacing);
          drop.speed = randomBetween(SPEED_MIN, SPEED_MAX);
          drop.trailLength = randomInt(TRAIL_LENGTH_MIN, TRAIL_LENGTH_MAX);
          drop.colorR = color.r;
          drop.colorG = color.g;
          drop.colorB = color.b;
          drop.charSize = randomInt(FONT_SIZE_MIN, FONT_SIZE_MAX);

          // Rebuild chars array for new trail length
          drop.chars = [];
          for (let j = 0; j < drop.trailLength; j++) {
            drop.chars.push(randomChar());
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initDrops]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      {/* Rain canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette overlay to soften edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 20%, rgba(0,4,8,0.8) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Fact overlay text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 48px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: 800,
            color: 'var(--aph-white)',
            textAlign: 'center',
            lineHeight: 1.25,
            letterSpacing: '-0.5px',
            maxWidth: 900,
            textShadow: `
              0 0 40px rgba(0,4,8,0.95),
              0 0 80px rgba(0,4,8,0.8),
              0 2px 4px rgba(0,0,0,0.5)
            `,
          }}
        >
          <WordReveal text={fact} visible={visible} staggerMs={55} />
        </p>
      </div>
    </div>
  );
}
