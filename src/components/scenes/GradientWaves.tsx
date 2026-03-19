import { useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Props {
  fact: string;
  visible: boolean;
  accentColor?: string;
}

// ─── Aurora ribbon configuration ─────────────────────────────────────────────
interface AuroraRibbon {
  baseY: number;         // vertical center position (fraction of screen height, 0–1)
  width: number;         // ribbon thickness in px
  color: { r: number; g: number; b: number; a: number };
  waves: Array<{
    frequency: number;   // how tight the waves are (lower = broader)
    amplitude: number;   // how tall the waves are in px
    speed: number;       // how fast the wave moves (radians per frame)
    phase: number;       // starting phase offset
  }>;
  shimmerFreq: number;   // frequency for the vertical curtain shimmer
  shimmerSpeed: number;  // speed of shimmer sweep
}

const RIBBONS: AuroraRibbon[] = [
  {
    baseY: 0.22,
    width: 180,
    color: { r: 0, g: 123, b: 131, a: 0.3 },    // APH Teal
    waves: [
      { frequency: 0.0025, amplitude: 55, speed: 0.008, phase: 0 },
      { frequency: 0.0048, amplitude: 30, speed: 0.012, phase: 1.2 },
      { frequency: 0.0012, amplitude: 70, speed: 0.005, phase: 2.8 },
    ],
    shimmerFreq: 0.006,
    shimmerSpeed: 0.015,
  },
  {
    baseY: 0.30,
    width: 150,
    color: { r: 77, g: 168, b: 218, a: 0.25 },   // Sky Blue
    waves: [
      { frequency: 0.0032, amplitude: 45, speed: 0.010, phase: 0.7 },
      { frequency: 0.0055, amplitude: 25, speed: 0.014, phase: 2.1 },
      { frequency: 0.0015, amplitude: 60, speed: 0.006, phase: 4.0 },
    ],
    shimmerFreq: 0.008,
    shimmerSpeed: 0.018,
  },
  {
    baseY: 0.38,
    width: 130,
    color: { r: 94, g: 198, b: 195, a: 0.2 },    // Light Teal
    waves: [
      { frequency: 0.0020, amplitude: 50, speed: 0.009, phase: 1.5 },
      { frequency: 0.0042, amplitude: 35, speed: 0.013, phase: 3.3 },
      { frequency: 0.0010, amplitude: 65, speed: 0.004, phase: 5.1 },
    ],
    shimmerFreq: 0.007,
    shimmerSpeed: 0.012,
  },
  {
    baseY: 0.26,
    width: 110,
    color: { r: 107, g: 76, b: 154, a: 0.15 },   // Purple
    waves: [
      { frequency: 0.0028, amplitude: 40, speed: 0.007, phase: 2.0 },
      { frequency: 0.0050, amplitude: 20, speed: 0.011, phase: 4.5 },
      { frequency: 0.0014, amplitude: 55, speed: 0.005, phase: 0.3 },
    ],
    shimmerFreq: 0.009,
    shimmerSpeed: 0.020,
  },
];

// Number of control points across the screen width for smooth curves
const NUM_POINTS = 48;

// ─── Word-by-word stagger reveal (matching AttractMode pattern) ──────────────
function WordReveal({
  text,
  visible,
  staggerMs = 55,
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
            marginRight: '0.32em',
            verticalAlign: 'top',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: visible ? 'translateY(0)' : 'translateY(110%)',
              opacity: visible ? 1 : 0,
              transition: `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerMs}ms, opacity 0.5s ease ${i * staggerMs}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── Compute Y position for a ribbon at a given x, using summed sine waves ──
function computeRibbonY(
  x: number,
  ribbon: AuroraRibbon,
  screenHeight: number,
  time: number,
): number {
  let y = ribbon.baseY * screenHeight;
  for (const wave of ribbon.waves) {
    y += Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
  }
  return y;
}

// ═════════════════════════════════════════════════════════════════════════════
// GradientWaves — Aurora / Northern Lights scene
// ═════════════════════════════════════════════════════════════════════════════
export default function GradientWaves({ fact, visible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // ── Canvas setup + animation loop ──
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Animation loop ──
    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const time = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Draw each ribbon back to front
      for (let r = RIBBONS.length - 1; r >= 0; r--) {
        const ribbon = RIBBONS[r];
        const { color } = ribbon;
        const halfWidth = ribbon.width / 2;

        // Pre-compute y-positions at each control point
        const step = w / (NUM_POINTS - 1);
        const topEdge: Array<{ x: number; y: number }> = [];
        const bottomEdge: Array<{ x: number; y: number }> = [];

        for (let i = 0; i < NUM_POINTS; i++) {
          const px = i * step;
          const centerY = computeRibbonY(px, ribbon, h, time);
          topEdge.push({ x: px, y: centerY - halfWidth });
          bottomEdge.push({ x: px, y: centerY + halfWidth });
        }

        // ── Pass 1: Main ribbon fill with vertical gradient ──
        // Create a path: top edge left-to-right, then bottom edge right-to-left
        ctx.save();

        // Build the path using quadratic curves for smoothness
        ctx.beginPath();
        ctx.moveTo(topEdge[0].x, topEdge[0].y);
        for (let i = 1; i < topEdge.length; i++) {
          const prev = topEdge[i - 1];
          const curr = topEdge[i];
          const cpx = (prev.x + curr.x) / 2;
          const cpy = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }
        // Connect to the last top point
        ctx.lineTo(topEdge[topEdge.length - 1].x, topEdge[topEdge.length - 1].y);

        // Bottom edge right-to-left
        ctx.lineTo(bottomEdge[bottomEdge.length - 1].x, bottomEdge[bottomEdge.length - 1].y);
        for (let i = bottomEdge.length - 2; i >= 0; i--) {
          const prev = bottomEdge[i + 1];
          const curr = bottomEdge[i];
          const cpx = (prev.x + curr.x) / 2;
          const cpy = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }
        ctx.lineTo(bottomEdge[0].x, bottomEdge[0].y);
        ctx.closePath();

        // Create a vertical gradient within the ribbon's bounding box:
        // brighter at the bottom edge (light emission), fading toward top
        const minY = Math.min(...topEdge.map(p => p.y));
        const maxY = Math.max(...bottomEdge.map(p => p.y));
        const grad = ctx.createLinearGradient(0, minY, 0, maxY);
        grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${(color.a * 0.15).toFixed(3)})`);
        grad.addColorStop(0.4, `rgba(${color.r},${color.g},${color.b},${(color.a * 0.6).toFixed(3)})`);
        grad.addColorStop(0.75, `rgba(${color.r},${color.g},${color.b},${color.a.toFixed(3)})`);
        grad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},${(color.a * 0.8).toFixed(3)})`);

        ctx.fillStyle = grad;
        ctx.fill();

        // ── Vertical shimmer / curtain effect ──
        // Modulate alpha across x using a sine wave that moves over time
        // Draw thin vertical strips with varying alpha
        ctx.globalCompositeOperation = 'source-atop';
        for (let i = 0; i < NUM_POINTS - 1; i++) {
          const x0 = topEdge[i].x;
          const x1 = topEdge[i + 1].x;
          const midX = (x0 + x1) / 2;

          // Shimmer intensity: combination of two waves for organic feel
          const shimmer1 = Math.sin(midX * ribbon.shimmerFreq + time * ribbon.shimmerSpeed);
          const shimmer2 = Math.sin(midX * ribbon.shimmerFreq * 1.7 + time * ribbon.shimmerSpeed * 0.6 + 1.0);
          const shimmerVal = (shimmer1 * 0.6 + shimmer2 * 0.4) * 0.5 + 0.5; // normalize to 0–1

          // Brighten or dim the strip
          const stripAlpha = shimmerVal * 0.25;

          ctx.fillStyle = `rgba(${Math.min(255, color.r + 80)},${Math.min(255, color.g + 80)},${Math.min(255, color.b + 80)},${stripAlpha.toFixed(3)})`;
          ctx.fillRect(x0, minY - 20, x1 - x0, maxY - minY + 40);
        }

        ctx.restore();

        // ── Pass 2: Additive glow (bloom effect) ──
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.35;

        // Redraw the ribbon path for the glow
        ctx.beginPath();
        ctx.moveTo(topEdge[0].x, topEdge[0].y);
        for (let i = 1; i < topEdge.length; i++) {
          const prev = topEdge[i - 1];
          const curr = topEdge[i];
          const cpx = (prev.x + curr.x) / 2;
          const cpy = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }
        ctx.lineTo(topEdge[topEdge.length - 1].x, topEdge[topEdge.length - 1].y);

        ctx.lineTo(bottomEdge[bottomEdge.length - 1].x, bottomEdge[bottomEdge.length - 1].y);
        for (let i = bottomEdge.length - 2; i >= 0; i--) {
          const prev = bottomEdge[i + 1];
          const curr = bottomEdge[i];
          const cpx = (prev.x + curr.x) / 2;
          const cpy = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }
        ctx.lineTo(bottomEdge[0].x, bottomEdge[0].y);
        ctx.closePath();

        // Wider, softer gradient for glow
        const glowGrad = ctx.createLinearGradient(0, minY - 30, 0, maxY + 30);
        glowGrad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0)`);
        glowGrad.addColorStop(0.3, `rgba(${color.r},${color.g},${color.b},${(color.a * 0.4).toFixed(3)})`);
        glowGrad.addColorStop(0.7, `rgba(${color.r},${color.g},${color.b},${(color.a * 0.6).toFixed(3)})`);
        glowGrad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
        ctx.fillStyle = glowGrad;

        // Apply a soft blur to the glow pass
        ctx.filter = 'blur(8px)';
        ctx.fill();
        ctx.filter = 'none';

        ctx.restore();

        // ── Pass 3: Bright bottom-edge highlight (core emission line) ──
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.2;

        ctx.beginPath();
        ctx.moveTo(bottomEdge[0].x, bottomEdge[0].y);
        for (let i = 1; i < bottomEdge.length; i++) {
          const prev = bottomEdge[i - 1];
          const curr = bottomEdge[i];
          const cpx = (prev.x + curr.x) / 2;
          const cpy = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }

        ctx.strokeStyle = `rgba(${Math.min(255, color.r + 100)},${Math.min(255, color.g + 100)},${Math.min(255, color.b + 100)},${(color.a * 1.5).toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.filter = 'blur(3px)';
        ctx.stroke();
        ctx.filter = 'none';

        ctx.restore();
      }

      // ── Subtle star-like specks in the upper portion ──
      // These are static but shimmer with time; we use a seeded approach
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const starCount = 30;
      for (let i = 0; i < starCount; i++) {
        // Deterministic positions based on index
        const sx = ((i * 137.508) % w); // golden angle spread
        const sy = ((i * 97.31 + 50) % (h * 0.5));
        // Twinkle using sine of time offset by star index
        const twinkle = Math.sin(time * 0.02 + i * 2.1) * 0.5 + 0.5;
        const alpha = twinkle * 0.3 + 0.05;
        const radius = twinkle * 1.2 + 0.4;

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
      ctx.restore();

      // Advance time
      timeRef.current += 1;

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = setupCanvas();
    return cleanup;
  }, [setupCanvas]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#003054',
      }}
    >
      {/* Aurora canvas */}
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

      {/* Vignette overlay for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0, 30, 54, 0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom horizon glow — subtle warm edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '25%',
          background:
            'linear-gradient(to top, rgba(0, 20, 40, 0.8) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Overlay text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 8vw',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4.5vw, 56px)',
            fontWeight: 300,
            lineHeight: 1.35,
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 0 40px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            maxWidth: 1000,
            letterSpacing: '0.2px',
          }}
        >
          <WordReveal text={fact} visible={visible} staggerMs={55} />
        </p>
      </div>
    </div>
  );
}
