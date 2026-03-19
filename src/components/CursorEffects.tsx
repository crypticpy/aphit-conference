import { useRef, useEffect } from 'react';

interface Ripple {
  x: number;
  y: number;
  startTime: number;
}

interface Props {
  enabled?: boolean; // default true, allows disabling on TV mode
}

const GLOW_RADIUS = 100;
const LERP_FACTOR = 0.15;
const RIPPLE_DURATION = 600; // ms
const RIPPLE_MAX_RADIUS = 120;
const RIPPLE_STROKE_WIDTH = 1.5;

export default function CursorEffects({ enabled = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const ripplesRef = useRef<Ripple[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        startTime: performance.now(),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const now = performance.now();

      ctx.clearRect(0, 0, w, h);

      // --- Cursor glow with lerp ---
      const target = mouseRef.current;
      const smooth = smoothMouseRef.current;

      smooth.x += (target.x - smooth.x) * LERP_FACTOR;
      smooth.y += (target.y - smooth.y) * LERP_FACTOR;

      // Only draw glow if cursor is within or near the viewport
      if (smooth.x > -GLOW_RADIUS && smooth.x < w + GLOW_RADIUS &&
          smooth.y > -GLOW_RADIUS && smooth.y < h + GLOW_RADIUS) {
        const gradient = ctx.createRadialGradient(
          smooth.x, smooth.y, 0,
          smooth.x, smooth.y, GLOW_RADIUS,
        );
        gradient.addColorStop(0, 'rgba(94, 198, 195, 0.12)');
        gradient.addColorStop(1, 'rgba(94, 198, 195, 0)');

        ctx.beginPath();
        ctx.arc(smooth.x, smooth.y, GLOW_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // --- Click ripples ---
      const ripples = ripplesRef.current;
      let i = ripples.length;

      while (i--) {
        const ripple = ripples[i];
        const elapsed = now - ripple.startTime;

        if (elapsed >= RIPPLE_DURATION) {
          ripples.splice(i, 1);
          continue;
        }

        const progress = elapsed / RIPPLE_DURATION;
        const radius = progress * RIPPLE_MAX_RADIUS;
        const opacity = 1 - progress;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 123, 131, ${opacity})`;
        ctx.lineWidth = RIPPLE_STROKE_WIDTH;
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
