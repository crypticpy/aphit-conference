import { useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface Particle {
  x: number;
  y: number;
  z: number;        // depth (0=far, 1=close) — controls size, speed, brightness
  baseSpeed: number;
  radius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface Props {
  interactive?: boolean;
  dimmed?: boolean;
  beatTimestamp?: number; // set to Date.now() when hero stat appears
}

type ParticleMode = 'starfield' | 'wave' | 'rising';

interface ConnectionConfig {
  minZ: number;
  distanceMultiplier: number;
  alphaMultiplier: number;
  curved: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const PARTICLE_COLORS = [
  { r: 0, g: 123, b: 131 },   // APH Teal
  { r: 77, g: 168, b: 218 },  // APH Sky Blue
  { r: 94, g: 198, b: 195 },  // APH Light Teal
  { r: 120, g: 190, b: 32 },  // APH Green
  { r: 107, g: 76, b: 154 },  // APH Purple
  { r: 77, g: 168, b: 218 },  // Sky Blue (weight)
  { r: 94, g: 198, b: 195 },  // Light Teal (weight)
];

const PARTICLE_COUNT = 200;
const CONNECTION_DISTANCE = 120;
const MOUSE_RADIUS = 200;

// Drift direction for starfield mode
const DRIFT_X = 0.25;
const DRIFT_Y = 0.15;

// Mode cycling
const MODE_SEQUENCE: ParticleMode[] = ['starfield', 'wave', 'rising'];
const MODE_CYCLE_DURATION = 2700;   // frames (~45s at 60fps)
const TRANSITION_DURATION = 150;    // frames (~2.5s crossfade)

// Beat pulse
const BEAT_DURATION = 60;           // frames (~1s)
const BEAT_FORCE = 7.0;

// ═══════════════════════════════════════════════════════════════════════════
// Movement functions — pure: (particle, time) => { dx, dy }
// ═══════════════════════════════════════════════════════════════════════════

function starfieldMove(p: Particle, time: number): { dx: number; dy: number } {
  return {
    dx: DRIFT_X * p.baseSpeed + Math.sin(time * 0.005 + p.pulseOffset) * 0.15 * p.baseSpeed,
    dy: DRIFT_Y * p.baseSpeed + Math.cos(time * 0.004 + p.pulseOffset * 1.3) * 0.1 * p.baseSpeed,
  };
}

function waveMove(p: Particle, time: number): { dx: number; dy: number } {
  const flowSpeed = 0.35 * p.baseSpeed;
  const waveAmp = (0.3 + p.z * 0.7) * 1.2;
  return {
    dx: flowSpeed + Math.sin(time * 0.002 + p.pulseOffset) * 0.05,
    dy: Math.cos(time * 0.003 + p.x * 0.008 + p.pulseOffset) * waveAmp * p.baseSpeed,
  };
}

function risingMove(p: Particle, time: number): { dx: number; dy: number } {
  const riseSpeed = -(0.15 + p.baseSpeed * 0.4);
  const wobble = Math.sin(time * 0.006 + p.pulseOffset) * (0.2 + p.z * 0.3);
  return { dx: wobble, dy: riseSpeed };
}

const MOVE_FNS: Record<ParticleMode, (p: Particle, t: number) => { dx: number; dy: number }> = {
  starfield: starfieldMove,
  wave: waveMove,
  rising: risingMove,
};

// ═══════════════════════════════════════════════════════════════════════════
// Connection configs per mode
// ═══════════════════════════════════════════════════════════════════════════

const CONNECTION_CONFIGS: Record<ParticleMode, ConnectionConfig> = {
  starfield: { minZ: 0.3, distanceMultiplier: 1.0, alphaMultiplier: 1.0, curved: false },
  wave:      { minZ: 0.25, distanceMultiplier: 1.6, alphaMultiplier: 0.7, curved: true },
  rising:    { minZ: 0.7, distanceMultiplier: 0.5, alphaMultiplier: 0.3, curved: false },
};

function lerpConfig(a: ConnectionConfig, b: ConnectionConfig, t: number): ConnectionConfig {
  return {
    minZ: a.minZ + (b.minZ - a.minZ) * t,
    distanceMultiplier: a.distanceMultiplier + (b.distanceMultiplier - a.distanceMultiplier) * t,
    alphaMultiplier: a.alphaMultiplier + (b.alphaMultiplier - a.alphaMultiplier) * t,
    curved: t > 0.5 ? b.curved : a.curved,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function ParticleCanvas({ interactive = true, dimmed = false, beatTimestamp }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);
  const dimRef = useRef(false);
  const timeRef = useRef(0);

  // Beat tracking
  const beatFrameRef = useRef(0);
  const beatActiveRef = useRef(false);
  const beatTimestampRef = useRef(0);

  dimRef.current = dimmed;

  // Beat trigger via prop change
  useEffect(() => {
    if (beatTimestamp && beatTimestamp !== beatTimestampRef.current) {
      beatTimestampRef.current = beatTimestamp;
      beatFrameRef.current = timeRef.current;
      beatActiveRef.current = true;
    }
  }, [beatTimestamp]);

  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const colorObj = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      const z = Math.random();
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        baseSpeed: 0.15 + z * 0.6,
        radius: 1 + z * 2.8,
        color: `${colorObj.r},${colorObj.g},${colorObj.b}`,
        alpha: 0.2 + z * 0.6,
        pulseSpeed: Math.random() * 0.015 + 0.003,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(window.innerWidth, window.innerHeight);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (interactive) {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ── Mode cycling state (ref-based, no React re-renders) ──
    let currentModeIndex = 0;
    let prevModeIndex = 0;
    let modeTimer = 0;
    let transitionProgress = -1; // -1 = no transition

    // ── Animation loop ──
    const animate = () => {
      timeRef.current += 1;
      const time = timeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const isDimmed = dimRef.current;

      ctx.clearRect(0, 0, w, h);

      const targetAlpha = isDimmed ? 0.25 : 1;

      // ── Mode cycling logic ──
      modeTimer++;
      if (modeTimer >= MODE_CYCLE_DURATION && transitionProgress < 0) {
        prevModeIndex = currentModeIndex;
        currentModeIndex = (currentModeIndex + 1) % MODE_SEQUENCE.length;
        transitionProgress = 0;
      }
      if (transitionProgress >= 0) {
        transitionProgress++;
        if (transitionProgress >= TRANSITION_DURATION) {
          transitionProgress = -1;
          modeTimer = 0;
        }
      }

      const currentMode = MODE_SEQUENCE[currentModeIndex];
      const prevMode = MODE_SEQUENCE[prevModeIndex];
      const blend = transitionProgress >= 0 ? transitionProgress / TRANSITION_DURATION : 1;
      const isTransitioning = transitionProgress >= 0;

      // ── Beat impulse state ──
      let beatStrength = 0;
      if (beatActiveRef.current) {
        const beatElapsed = time - beatFrameRef.current;
        if (beatElapsed < BEAT_DURATION) {
          const beatProgress = beatElapsed / BEAT_DURATION;
          beatStrength = BEAT_FORCE * (1 - beatProgress) * (1 - beatProgress);
        } else {
          beatActiveRef.current = false;
        }
      }
      const cx = w / 2;
      const cy = h / 2;

      // ── Update and draw particles ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Compute blended movement
        let dx: number, dy: number;
        if (isTransitioning) {
          const prev = MOVE_FNS[prevMode](p, time);
          const curr = MOVE_FNS[currentMode](p, time);
          dx = prev.dx * (1 - blend) + curr.dx * blend;
          dy = prev.dy * (1 - blend) + curr.dy * blend;
        } else {
          const move = MOVE_FNS[currentMode](p, time);
          dx = move.dx;
          dy = move.dy;
        }

        p.x += dx;
        p.y += dy;

        // Beat impulse — radial push from center
        if (beatStrength > 0) {
          const bx = p.x - cx;
          const by = p.y - cy;
          const bDist = Math.sqrt(bx * bx + by * by) || 1;
          p.x += (bx / bDist) * beatStrength * p.z;
          p.y += (by / bDist) * beatStrength * p.z;
        }

        // Mouse: gentle repulsion
        if (interactive && mouse.x > 0) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < MOUSE_RADIUS && mDist > 0) {
            const force = (1 - mDist / MOUSE_RADIUS) * 2;
            p.x += (mdx / mDist) * force;
            p.y += (mdy / mDist) * force;
          }
        }

        // Wrap around all edges
        if (p.x > w + 30) p.x = -30;
        if (p.x < -30) p.x = w + 30;
        if (p.y > h + 30) p.y = -30;
        if (p.y < -30) p.y = h + 30;

        // Pulse alpha
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.2 + 0.8;
        const drawAlpha = p.alpha * pulse * targetAlpha;

        // Draw outer glow (closer particles only)
        if (p.z > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${drawAlpha * 0.05})`;
          ctx.fill();
        }

        // Draw inner glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${drawAlpha * 0.15})`;
        ctx.fill();

        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${drawAlpha})`;
        ctx.fill();

        // Draw bright center (close particles)
        if (p.z > 0.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${drawAlpha * 0.5})`;
          ctx.fill();
        }
      }

      // ── Draw connections (mode-aware) ──
      const connConfig = isTransitioning
        ? lerpConfig(CONNECTION_CONFIGS[prevMode], CONNECTION_CONFIGS[currentMode], blend)
        : CONNECTION_CONFIGS[currentMode];

      for (let i = 0; i < particles.length; i++) {
        if (particles[i].z < connConfig.minZ) continue;
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[j].z < connConfig.minZ) continue;

          const pdx = particles[i].x - particles[j].x;
          const pdy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(pdx * pdx + pdy * pdy);

          const zScale = Math.min(particles[i].z, particles[j].z);
          const effectiveDist = CONNECTION_DISTANCE * (0.8 + zScale * 0.6) * connConfig.distanceMultiplier;

          if (dist < effectiveDist) {
            const distFactor = 1 - dist / effectiveDist;
            const pulsePhase = particles[i].pulseOffset + particles[j].pulseOffset;
            const linePulse = Math.sin(time * 0.012 + pulsePhase) * 0.3 + 0.7;
            const lineAlpha = distFactor * 0.14 * linePulse * connConfig.alphaMultiplier * targetAlpha;

            const grad = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y,
            );
            grad.addColorStop(0, `rgba(${particles[i].color},${lineAlpha})`);
            grad.addColorStop(1, `rgba(${particles[j].color},${lineAlpha})`);

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);

            if (connConfig.curved) {
              // Quadratic curve for wave mode — flowing arc
              const mx = (particles[i].x + particles[j].x) / 2;
              const my = (particles[i].y + particles[j].y) / 2;
              const perpX = -(particles[i].y - particles[j].y) * 0.15;
              const perpY = (particles[i].x - particles[j].x) * 0.15;
              ctx.quadraticCurveTo(mx + perpX, my + perpY, particles[j].x, particles[j].y);
            } else {
              ctx.lineTo(particles[j].x, particles[j].y);
            }

            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [interactive, createParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
