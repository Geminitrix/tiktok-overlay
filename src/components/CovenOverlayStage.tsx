import React, { useEffect, useMemo, useState } from 'react';
import {
  MORGANA_ASSET_PATH,
  OverlayConfig,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  clampOpacity,
  generateDeterministicEmbers,
  generateDeterministicFeathers,
  generateRuneRing,
} from '../utils/overlayConfig';

interface CovenOverlayStageProps {
  config: OverlayConfig;
  scale: number;
  previewBackdrop?: 'none' | 'simulated' | 'checkerboard';
  ravenTrigger?: number;
  surgeTrigger?: number;
}

interface SpectralRavenInstance {
  id: number;
  top: number;
  direction: 'ltr' | 'rtl';
}

interface OrbRipple {
  id: number;
  cx: number;
  cy: number;
}

const CORNER_FRAMES = [
  // Top webcam frame (x=60, y=190, w=960, h=540)
  { x: 54, y: 184, sx: 1, sy: 1, key: 'cam-tl' },
  { x: 1026, y: 184, sx: -1, sy: 1, key: 'cam-tr' },
  { x: 54, y: 736, sx: 1, sy: -1, key: 'cam-bl' },
  { x: 1026, y: 736, sx: -1, sy: -1, key: 'cam-br' },
  // Bottom gameplay frame (x=40, y=892, w=1000, h=563)
  { x: 34, y: 886, sx: 1, sy: 1, key: 'game-tl' },
  { x: 1046, y: 886, sx: -1, sy: 1, key: 'game-tr' },
  { x: 34, y: 1461, sx: 1, sy: -1, key: 'game-bl' },
  { x: 1046, y: 1461, sx: -1, sy: -1, key: 'game-br' },
] as const;

function CornerScythe({ x, y, sx, sy }: { x: number; y: number; sx: number; sy: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
      <path
        d="M-4,-4 C-40,-20 -64,-64 -52,-120 C-42,-74 -28,-40 -4,-4 Z"
        fill="url(#co_silver)"
        stroke="#221d2b"
        strokeWidth="1.15"
      />
      <path
        d="M-4,-4 C-20,-40 -64,-64 -120,-52 C-74,-42 -40,-28 -4,-4 Z"
        fill="url(#co_silver)"
        stroke="#221d2b"
        strokeWidth="1.15"
      />
      <path
        d="M-12,-12 C-34,-26 -46,-54 -38,-88 C-32,-56 -22,-32 -12,-12 Z"
        fill="url(#co_crimson_blade)"
        opacity="0.88"
      />
      <path
        d="M6,-15 C64,-24 134,-20 206,-15 C134,-10 64,-8 6,-15 Z"
        fill="url(#co_gold)"
      />
      <path
        d="M-15,6 C-24,64 -20,134 -15,206 C-10,134 -8,64 -15,6 Z"
        fill="url(#co_gold)"
      />
      <path
        d="M-15,-15 C-15,24 24,24 38,6"
        fill="none"
        stroke="url(#co_gold)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M-15,-15 C24,-15 24,24 6,38"
        fill="none"
        stroke="url(#co_gold)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="14" cy="-15" r="2.5" fill="#f4e4bc" />
      <circle cx="-15" cy="14" r="2.5" fill="#f4e4bc" />
      <g transform="translate(-15,-15)">
        <path
          className="coven-gem"
          d="M0,-15 L9.4,0 L0,15 L-9.4,0 Z"
          fill="url(#co_gem)"
          stroke="url(#co_gold)"
          strokeWidth="2"
          filter="url(#co_softglow)"
        />
        <path d="M0,-9 L4.5,0 L0,9 L-4.5,0 Z" fill="#ffb0c0" opacity="0.48" />
      </g>
    </g>
  );
}

function FeatherWing({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const sign = isLeft ? -1 : 1;
  const originX = isLeft ? 392 : 688;

  return (
    <g
      className={isLeft ? 'coven-wing-l' : 'coven-wing-r'}
      style={{ transformOrigin: `${originX}px 168px` }}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const tx = isLeft ? 358 + i * 5.5 : 722 - i * 5.5;
        const ty = 186 - i * 3;
        const rot = sign * (82 - i * 11);
        const len = 92 + i * 10;
        return (
          <g key={i} transform={`translate(${tx.toFixed(1)},${ty.toFixed(1)}) rotate(${rot})`}>
            <path
              d={`M0,0 C25,${(-len * 0.25).toFixed(1)} 22,${(-len * 0.75).toFixed(1)} 0,${-len} C-13,${(-len * 0.8).toFixed(1)} -22,${(-len * 0.35).toFixed(1)} 0,0 Z`}
              fill="url(#co_feather)"
              stroke="#8b8399"
              strokeWidth="1.15"
              strokeOpacity="0.62"
            />
            <path
              d={`M0,0 Q2,${(-len * 0.5).toFixed(1)} 0,${(-len * 0.94).toFixed(1)}`}
              stroke="url(#co_gold)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.72"
            />
          </g>
        );
      })}
    </g>
  );
}

function RitualCandle({ x, y, alt = false }: { x: number; y: number; alt?: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse
        cx="0"
        cy="-24"
        rx="56"
        ry="50"
        fill="url(#co_candle_halo)"
        className="coven-candle-halo"
      />
      <path d="M-16,44 L16,44 L11,54 L-11,54 Z" fill="url(#co_gold)" />
      <rect x="-22" y="41" width="44" height="5" rx="2" fill="url(#co_gold)" />
      <path
        d="M-9,41 L-8,-4 C-8,-8 8,-8 8,-4 L9,41 Z"
        fill="url(#co_wax)"
        stroke="#362b24"
        strokeWidth="1"
      />
      <path
        d="M-8,2 C-5,8 -6,15 -8,18 M6,-1 C4,5 5,11 7,14"
        stroke="#ddd1bf"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.72"
      />
      <line x1="0" y1="-6" x2="0" y2="-13" stroke="#181115" strokeWidth="1.8" />
      <g className={alt ? 'coven-candle-flame-alt' : 'coven-candle-flame'}>
        <path
          d="M0,-42 C10,-28 11,-17 0,-11 C-11,-17 -10,-28 0,-42 Z"
          fill="url(#co_flame_outer)"
          filter="url(#co_softglow)"
        />
        <path d="M0,-33 C5,-24 5,-17 0,-13 C-5,-17 -5,-24 0,-33 Z" fill="#fff5d6" />
      </g>
    </g>
  );
}

export const CovenOverlayStage: React.FC<CovenOverlayStageProps> = ({
  config,
  scale,
  previewBackdrop = 'none',
  ravenTrigger = 0,
  surgeTrigger = 0,
}) => {
  const [ravens, setRavens] = useState<SpectralRavenInstance[]>([]);
  const [ripples, setRipples] = useState<OrbRipple[]>([]);
  const [activeSurgeId, setActiveSurgeId] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [artLoadFailed, setArtLoadFailed] = useState(false);

  const outerRunes = useMemo(() => generateRuneRing(540, 821, 444, 24), []);
  const altarRunes = useMemo(() => generateRuneRing(540, 1710, 272, 20), []);
  const embers = useMemo(() => generateDeterministicEmbers(46), []);
  const feathers = useMemo(() => generateDeterministicFeathers(7), []);

  const spawnRaven = (preferredTop?: number) => {
    const id = Date.now() + Math.floor(Math.random() * 10000);
    const direction: 'ltr' | 'rtl' = id % 2 === 0 ? 'ltr' : 'rtl';
    const top =
      preferredTop ?? (id % 3 === 0 ? 44 + (id % 68) : 1560 + (id % 210));
    setRavens((prev) => [...prev.slice(-3), { id, top, direction }]);
    window.setTimeout(() => {
      setRavens((prev) => prev.filter((item) => item.id !== id));
    }, 6900);
  };

  const triggerOrbPulse = (cx: number, cy: number) => {
    if (!config.interativo) return;
    const id = Date.now() + Math.floor(Math.random() * 10000);
    setRipples((prev) => [...prev.slice(-4), { id, cx, cy }]);
    if (config.corvos) {
      spawnRaven(64);
    }
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1450);
  };

  // Ambient spectral ravens
  useEffect(() => {
    if (!config.corvos) {
      setRavens([]);
      return;
    }
    const firstTimer = window.setTimeout(() => spawnRaven(64), 1600);
    const interval = window.setInterval(() => spawnRaven(), 14500);
    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(interval);
    };
  }, [config.corvos]);

  // Manual raven trigger from Studio
  useEffect(() => {
    if (ravenTrigger > 0) {
      spawnRaven(ravenTrigger % 2 === 0 ? 1580 : 60);
    }
  }, [ravenTrigger]);

  // Manual arcane surge trigger from Studio
  useEffect(() => {
    if (surgeTrigger > 0) {
      setActiveSurgeId(surgeTrigger);
      setActiveHotspot('surge');
      const t = window.setTimeout(() => setActiveHotspot(null), 1500);
      return () => window.clearTimeout(t);
    }
  }, [surgeTrigger]);

  const displayName = (config.nome || 'LUMOX').trim().toUpperCase();
  const displaySub = (config.sub || 'MAIN MORGANA · SUPORTE').trim().toUpperCase();
  const displayFooter = (config.rodape || 'BEM-VINDOS À CONGREGAÇÃO').trim().toUpperCase();
  const artOpacity = clampOpacity(config.arteOpacidade) / 100;

  return (
    <div
      data-testid="coven-overlay-stage"
      data-interactive={config.interativo ? 'true' : 'false'}
      style={{
        width: `${STAGE_WIDTH}px`,
        height: `${STAGE_HEIGHT}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
      className="relative select-none overflow-hidden"
    >
      {/* Optional Studio-only backdrop behind transparent cutouts */}
      {previewBackdrop === 'checkerboard' && (
        <div className="studio-checkerboard absolute inset-0 pointer-events-none" />
      )}

      {previewBackdrop === 'simulated' && (
        <div className="absolute inset-0 pointer-events-none bg-[#09080d]">
          {/* Simulated Webcam 16:9 */}
          <div
            style={{ left: 60, top: 190, width: 960, height: 540 }}
            className="absolute overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#2a2234_0%,#15121d_56%,#09080e_100%)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_22%,rgba(227,30,65,0.22),transparent_48%),radial-gradient(circle_at_24%_70%,rgba(28,88,108,0.28),transparent_52%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 rounded-full border border-[#c59e54]/30 bg-[#14101c]/70 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-[#c59e54]/20" />
              </div>
              <p className="mt-5 font-coven text-[22px] tracking-[0.28em] text-[#e7dcc4]/75">
                CÂMERA 16:9
              </p>
              <p className="mt-1.5 text-[16px] tracking-[0.12em] text-[#9b93aa]/65">
                RECORTE TRANSPARENTE · 960 × 540
              </p>
            </div>
          </div>

          {/* Simulated Gameplay 16:9 */}
          <div
            style={{ left: 40, top: 892, width: 1000, height: 563 }}
            className="absolute overflow-hidden bg-[radial-gradient(circle_at_50%_46%,#122831_0%,#0c171f_55%,#07090f_100%)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_32%,rgba(227,30,65,0.18),transparent_42%),radial-gradient(circle_at_78%_74%,rgba(197,158,84,0.16),transparent_48%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-coven text-[24px] tracking-[0.28em] text-[#e7dcc4]/75">
                GAMEPLAY LEAGUE OF LEGENDS
              </p>
              <p className="mt-2 text-[16px] tracking-[0.12em] text-[#9b93aa]/65">
                RECORTE TRANSPARENTE · 1000 × 563
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Background, Forest Mist, Elder God Monoliths, Morgana Art, and Rune Circles (clipped outside cutouts) */}
      {config.fundo && (
        <div className="coven-particles-clip absolute inset-0 pointer-events-none">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1080 1920"
            width="1080"
            height="1920"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="co_bg_void" cx="540" cy="840" r="1280" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#191321" />
                <stop offset="0.38" stopColor="#0d0c13" />
                <stop offset="0.72" stopColor="#090b10" />
                <stop offset="1" stopColor="#040406" />
              </radialGradient>
              <radialGradient id="co_teal_velvet" cx="540" cy="1760" r="560" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#1b3e4c" stopOpacity="0.34" />
                <stop offset="0.6" stopColor="#101c24" stopOpacity="0.16" />
                <stop offset="1" stopColor="#040406" stopOpacity="0" />
              </radialGradient>
              <filter id="co_blur42" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="42" />
              </filter>
            </defs>

            <rect width="1080" height="1920" fill="url(#co_bg_void)" />
            <rect width="1080" height="1920" fill="url(#co_teal_velvet)" />

            {/* Swirling Coven Forest Mist */}
            <ellipse
              className="coven-mist-a"
              cx="160"
              cy="960"
              rx="410"
              ry="260"
              fill="#a81432"
              opacity="0.20"
              filter="url(#co_blur42)"
            />
            <ellipse
              className="coven-mist-b"
              cx="920"
              cy="760"
              rx="380"
              ry="240"
              fill="#183d4b"
              opacity="0.26"
              filter="url(#co_blur42)"
            />
            <ellipse
              className="coven-mist-a"
              cx="540"
              cy="1720"
              rx="580"
              ry="250"
              fill="#9c102b"
              opacity="0.22"
              filter="url(#co_blur42)"
            />
            <ellipse
              className="coven-mist-b"
              cx="540"
              cy="110"
              rx="520"
              ry="180"
              fill="#2b2136"
              opacity="0.30"
              filter="url(#co_blur42)"
            />
            <ellipse
              className="coven-mist-a"
              cx="960"
              cy="1560"
              rx="320"
              ry="260"
              fill="#b81b3a"
              opacity="0.16"
              filter="url(#co_blur42)"
            />

            {/* Twin Elder God Monoliths (inspired by Morgana's Coven splash art) */}
            <g opacity="0.72">
              <path
                d="M22,1920 L28,1590 L74,1546 L112,1608 L104,1920 Z"
                fill="#0d0b11"
                stroke="#362c3d"
                strokeWidth="1.5"
              />
              <path
                className="coven-monolith-rune"
                d="M68,1624 L68,1712 M56,1648 C56,1634 80,1634 80,1648 C80,1668 56,1678 56,1696"
                stroke="#ff355b"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M1058,1920 L1052,1590 L1006,1546 L968,1608 L976,1920 Z"
                fill="#0d0b11"
                stroke="#362c3d"
                strokeWidth="1.5"
              />
              <path
                className="coven-monolith-rune"
                d="M1012,1624 L1012,1712 M1000,1648 C1000,1634 1024,1634 1024,1648 C1024,1668 1000,1678 1000,1696"
                stroke="#ff355b"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>

          {/* Coven Morgana Splash Art blended seamlessly into the lower altar sanctuary */}
          {config.arte && !artLoadFailed && (
            <div
              className="absolute inset-x-0 bottom-0 h-[415px] overflow-hidden transition-opacity duration-300"
              style={{ opacity: artOpacity }}
            >
              <img
                src={MORGANA_ASSET_PATH}
                alt="Morgana Congregação das Bruxas"
                onError={() => setArtLoadFailed(true)}
                className="coven-art-breathe absolute left-1/2 bottom-0 h-[420px] w-[1080px] max-w-none -translate-x-1/2 object-cover object-[50%_10%] contrast-[1.08] saturate-[1.02] brightness-[0.90]"
                style={{
                  maskImage:
                    'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.88) 68%, rgba(0,0,0,0.22) 92%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.88) 68%, rgba(0,0,0,0.22) 92%, transparent 100%)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 68% 72% at 50% 42%, rgba(7,6,10,0.08) 0%, rgba(7,6,10,0.52) 66%, rgba(5,4,8,0.92) 100%)',
                }}
              />
            </div>
          )}

          {/* Counter-rotating Ancient Rune Astrolabes */}
          {config.runas && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1080 1920"
              width="1080"
              height="1920"
              aria-hidden="true"
            >
              <g opacity="0.22" color="#e3264a">
                <g className="coven-spin-cw" style={{ transformOrigin: '540px 821px' }}>
                  <circle cx="540" cy="821" r="474" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <circle
                    cx="540"
                    cy="821"
                    r="416"
                    fill="none"
                    stroke="#c59e54"
                    strokeWidth="1.2"
                    strokeDasharray="6 10"
                  />
                  {outerRunes.map((r, idx) => (
                    <path
                      key={idx}
                      transform={`translate(${r.x},${r.y}) rotate(${r.angle})`}
                      d={r.glyphPath}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                  ))}
                  <path
                    d="M540,398 L722,1202 L209,557 L952,916 L128,916 L871,557 L358,1202 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    opacity="0.65"
                  />
                </g>
              </g>

              <g opacity="0.20" color="#c59e54">
                <g className="coven-spin-ccw" style={{ transformOrigin: '540px 1710px' }}>
                  <circle cx="540" cy="1710" r="298" fill="none" stroke="#e3264a" strokeWidth="1.6" />
                  <circle
                    cx="540"
                    cy="1710"
                    r="246"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeDasharray="4 9"
                  />
                  {altarRunes.map((r, idx) => (
                    <path
                      key={idx}
                      transform={`translate(${r.x},${r.y}) rotate(${r.angle})`}
                      d={r.glyphPath}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                  ))}
                </g>
              </g>
            </svg>
          )}
        </div>
      )}

      {/* Embers & Falling Raven Feathers (strictly clipped outside cutouts) */}
      {config.particulas && (
        <div className="coven-particles-clip absolute inset-0 pointer-events-none" aria-hidden="true">
          {embers.map((e) => (
            <div
              key={e.id}
              className="coven-ember"
              style={
                {
                  width: `${e.size}px`,
                  height: `${e.size}px`,
                  left: `${e.left}px`,
                  top: `${e.top}px`,
                  background:
                    e.variant === 'gold'
                      ? 'radial-gradient(circle, #fff2cc 0%, #d4aa59 45%, rgba(212,170,89,0) 74%)'
                      : 'radial-gradient(circle, #ffd0da 0%, #e82348 46%, rgba(232,35,72,0) 74%)',
                  animationDuration: `${e.duration}s`,
                  animationDelay: `${e.delay}s`,
                  '--dx': `${e.dx}px`,
                  '--dy': `${e.dy}px`,
                  '--o': e.opacity,
                } as React.CSSProperties
              }
            />
          ))}

          {feathers.map((f) => (
            <div
              key={f.id}
              className="coven-feather-fall"
              style={
                {
                  width: `${f.size}px`,
                  height: `${(f.size * 2.7).toFixed(1)}px`,
                  left: `${f.left}px`,
                  top: `${f.top}px`,
                  animationDuration: `${f.duration}s`,
                  animationDelay: `${f.delay}s`,
                  '--dx': `${f.dx}px`,
                  '--r0': `${f.r0}deg`,
                  '--r1': `${f.r1}deg`,
                } as React.CSSProperties
              }
            >
              <div className="coven-feather-inner">
                <svg viewBox="-20 -110 40 115" className="h-full w-full overflow-visible">
                  <path
                    d="M0,0 C18,-25 16,-75 0,-100 C-9,-80 -15,-35 0,0 Z"
                    fill="#181220"
                    stroke="#9e95ad"
                    strokeOpacity="0.58"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M0,0 Q1.5,-50 0,-96"
                    stroke="#d5b36b"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.72"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spectral Ravens Gliding Across Dark Masked Borders */}
      {config.corvos && (
        <div
          data-testid="spectral-ravens-layer"
          className="coven-particles-clip absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {ravens.map((raven) => (
            <div
              key={raven.id}
              className={`coven-raven-flight ${
                raven.direction === 'ltr' ? 'coven-raven-flight-ltr' : 'coven-raven-flight-rtl'
              }`}
              style={{ top: `${raven.top}px`, left: 0 }}
            >
              <svg viewBox="0 0 140 80" width="144" height="82" fill="none">
                <g className="coven-raven-wing-flap">
                  <path
                    d="M68,42 C46,18 22,8 4,14 C24,26 42,36 58,48 Z"
                    fill="#120d17"
                    stroke="#c59e54"
                    strokeOpacity="0.58"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M76,42 C96,16 118,10 136,18 C118,28 100,38 82,48 Z"
                    fill="#120d17"
                    stroke="#c59e54"
                    strokeOpacity="0.58"
                    strokeWidth="1.2"
                  />
                </g>
                <path
                  d="M52,44 C64,38 82,38 96,46 L112,48 L96,52 C82,58 64,58 46,56 L26,64 L40,51 Z"
                  fill="#09070d"
                  stroke="#8a8298"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
                <circle cx="91" cy="46" r="2.4" fill="#ff3b5f" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Foreground Ornate Gothic Frames, Wings, Interactive Orbs, Nameplate & Flickering Candles */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 1080 1920"
        width="1080"
        height="1920"
      >
        <defs>
          <linearGradient id="co_gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6e7be" />
            <stop offset="0.34" stopColor="#c59e54" />
            <stop offset="0.68" stopColor="#755524" />
            <stop offset="1" stopColor="#ebd49b" />
          </linearGradient>
          <linearGradient id="co_silver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5f3fa" />
            <stop offset="0.48" stopColor="#b9b2c7" />
            <stop offset="1" stopColor="#4e485c" />
          </linearGradient>
          <linearGradient id="co_crimson_blade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff496c" />
            <stop offset="0.55" stopColor="#9e0e2a" />
            <stop offset="1" stopColor="#2b040c" />
          </linearGradient>
          <linearGradient id="co_shine" x1="280" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d5c9b0" />
            <stop offset="0.42" stopColor="#f7edd3" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="0.58" stopColor="#f7edd3" />
            <stop offset="1" stopColor="#c9a55c" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-540 0; 540 0; 540 0"
              keyTimes="0;0.44;1"
              dur="5.2s"
              repeatCount="indefinite"
            />
          </linearGradient>
          <linearGradient id="co_feather" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2d2638" />
            <stop offset="0.58" stopColor="#13101a" />
            <stop offset="1" stopColor="#060509" />
          </linearGradient>
          <linearGradient id="co_plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#181220" />
            <stop offset="0.55" stopColor="#0d0a13" />
            <stop offset="1" stopColor="#060409" />
          </linearGradient>
          <radialGradient id="co_gem" cx="0.38" cy="0.34" r="0.72">
            <stop offset="0" stopColor="#ffb2c2" />
            <stop offset="0.36" stopColor="#e82348" />
            <stop offset="1" stopColor="#4d0311" />
          </radialGradient>
          <radialGradient id="co_orb_grad" cx="0.38" cy="0.32" r="0.7">
            <stop offset="0" stopColor="#ffe0c2" />
            <stop offset="0.35" stopColor="#ff355b" />
            <stop offset="0.72" stopColor="#870a24" />
            <stop offset="1" stopColor="#24020a" />
          </radialGradient>
          <radialGradient id="co_candle_halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffae52" stopOpacity="0.62" />
            <stop offset="0.52" stopColor="#c93628" stopOpacity="0.22" />
            <stop offset="1" stopColor="#c93628" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="co_wax" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9e9183" />
            <stop offset="0.45" stopColor="#dfd4c5" />
            <stop offset="1" stopColor="#6b6057" />
          </linearGradient>
          <linearGradient id="co_flame_outer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff0b8" />
            <stop offset="0.5" stopColor="#ff9938" />
            <stop offset="1" stopColor="#d62828" />
          </linearGradient>
          <filter id="co_glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="co_softglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="co_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.88" />
          </filter>
        </defs>

        {/* Top Raven Feather Wings */}
        <FeatherWing side="left" />
        <FeatherWing side="right" />

        {/* Top Frame — Webcam 16:9 (exact cutout x=60, y=190, 960x540) */}
        <rect
          x="44"
          y="174"
          width="992"
          height="572"
          rx="4"
          fill="none"
          stroke="#060409"
          strokeWidth="18"
          filter="url(#co_shadow)"
        />
        <rect
          x="57"
          y="187"
          width="966"
          height="546"
          fill="none"
          stroke="#e82348"
          strokeWidth="2.8"
          filter="url(#co_glow)"
          className="coven-pulse"
        />
        <rect x="51" y="181" width="978" height="558" fill="none" stroke="url(#co_silver)" strokeWidth="1.9" />
        <rect x="40" y="170" width="1000" height="580" fill="none" stroke="url(#co_gold)" strokeWidth="3.4" />
        <path d="M46,396 L53,460 L46,524 L39,460 Z" fill="url(#co_gold)" />
        <path
          className="coven-gem"
          d="M46,448 L53.5,460 L46,472 L38.5,460 Z"
          fill="url(#co_gem)"
          stroke="url(#co_gold)"
          strokeWidth="1.8"
          filter="url(#co_softglow)"
        />
        <path d="M1034,396 L1041,460 L1034,524 L1027,460 Z" fill="url(#co_gold)" />
        <path
          className="coven-gem"
          d="M1034,448 L1041.5,460 L1034,472 L1026.5,460 Z"
          fill="url(#co_gem)"
          stroke="url(#co_gold)"
          strokeWidth="1.8"
          filter="url(#co_softglow)"
        />

        {/* Bottom Frame — Gameplay 16:9 (exact cutout x=40, y=892, 1000x563) */}
        <rect
          x="24"
          y="876"
          width="1032"
          height="595"
          rx="4"
          fill="none"
          stroke="#060409"
          strokeWidth="18"
          filter="url(#co_shadow)"
        />
        <rect
          x="37"
          y="889"
          width="1006"
          height="569"
          fill="none"
          stroke="#e82348"
          strokeWidth="2.8"
          filter="url(#co_glow)"
          className="coven-pulse"
        />
        <rect x="31" y="883" width="1018" height="581" fill="none" stroke="url(#co_silver)" strokeWidth="1.9" />
        <rect x="20" y="872" width="1040" height="603" fill="none" stroke="url(#co_gold)" strokeWidth="3.4" />
        <path d="M26,1112 L33,1174 L26,1236 L19,1174 Z" fill="url(#co_gold)" />
        <path
          className="coven-gem"
          d="M26,1162 L33.5,1174 L26,1186 L18.5,1174 Z"
          fill="url(#co_gem)"
          stroke="url(#co_gold)"
          strokeWidth="1.8"
          filter="url(#co_softglow)"
        />
        <path d="M1054,1112 L1061,1174 L1054,1236 L1047,1174 Z" fill="url(#co_gold)" />
        <path
          className="coven-gem"
          d="M1054,1162 L1061.5,1174 L1054,1186 L1046.5,1174 Z"
          fill="url(#co_gem)"
          stroke="url(#co_gold)"
          strokeWidth="1.8"
          filter="url(#co_softglow)"
        />
        <path d="M412,1475 C496,1477 518,1484 540,1504 C562,1484 584,1477 668,1475 Z" fill="url(#co_gold)" />
        <path
          className="coven-gem"
          d="M540,1475 L546.8,1486 L540,1497 L533.2,1486 Z"
          fill="url(#co_gem)"
          stroke="url(#co_gold)"
          strokeWidth="1.8"
          filter="url(#co_softglow)"
        />

        {/* 8 Sculpted Scythe-Wing Corner Brackets */}
        {CORNER_FRAMES.map((c) => (
          <CornerScythe key={c.key} x={c.x} y={c.y} sx={c.sx} sy={c.sy} />
        ))}

        {/* Top Interactive Lunar Crest & Hover-Illuminated Runes */}
        <g
          className={config.interativo ? 'coven-interactive-sigil pointer-events-auto' : ''}
          data-active={activeHotspot === 'crest' || activeHotspot === 'surge' ? 'true' : 'false'}
          onClick={() => triggerOrbPulse(540, 128)}
        >
          <path d="M60,150 L414,150" stroke="url(#co_gold)" strokeWidth="1.4" opacity="0.68" />
          <path d="M666,150 L1020,150" stroke="url(#co_gold)" strokeWidth="1.4" opacity="0.68" />
          <path d="M342,170 C426,164 478,144 510,110 C490,148 430,168 342,170 Z" fill="url(#co_gold)" />
          <path d="M738,170 C654,164 602,144 570,110 C590,148 650,168 738,170 Z" fill="url(#co_gold)" />
          <path
            d="M540,66 C552,106 566,138 580,170 L500,170 C514,138 528,106 540,66 Z"
            fill="#0c0912"
            stroke="url(#co_gold)"
            strokeWidth="3"
          />
          <path
            d="M512,124 A31,31 0 1,0 568,124 A25,25 0 1,1 512,124 Z"
            fill="url(#co_silver)"
            filter="url(#co_softglow)"
          />
          <path
            className="coven-gem"
            d="M540,127 L550,144 L540,161 L530,144 Z"
            fill="url(#co_gem)"
            stroke="url(#co_gold)"
            strokeWidth="2"
            filter="url(#co_softglow)"
          />
          <g className="coven-hover-runes" stroke="#ff5c7c" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <circle cx="540" cy="128" r="56" strokeDasharray="5 7" />
            <path d="M466,128 L480,116 L492,128 L480,140 Z M588,128 L600,116 L614,128 L600,140 Z" />
          </g>
        </g>

        {/* Interactive Glowing Arcane Orbs flanking top crest */}
        <g
          className={config.interativo ? 'coven-interactive-orb pointer-events-auto' : ''}
          data-active={activeHotspot === 'surge' ? 'true' : 'false'}
          transform="translate(274,148)"
          onClick={() => triggerOrbPulse(274, 148)}
        >
          <circle cx="0" cy="0" r="22" fill="#e82348" opacity="0.24" className="coven-orb-glow" />
          <circle
            cx="0"
            cy="0"
            r="10.5"
            fill="url(#co_orb_grad)"
            stroke="url(#co_gold)"
            strokeWidth="1.8"
            filter="url(#co_softglow)"
          />
          <circle cx="-3" cy="-3" r="2.6" fill="#fff3dc" opacity="0.88" />
        </g>

        <g
          className={config.interativo ? 'coven-interactive-orb pointer-events-auto' : ''}
          data-active={activeHotspot === 'surge' ? 'true' : 'false'}
          transform="translate(806,148)"
          onClick={() => triggerOrbPulse(806, 148)}
        >
          <circle cx="0" cy="0" r="22" fill="#e82348" opacity="0.24" className="coven-orb-glow" />
          <circle
            cx="0"
            cy="0"
            r="10.5"
            fill="url(#co_orb_grad)"
            stroke="url(#co_gold)"
            strokeWidth="1.8"
            filter="url(#co_softglow)"
          />
          <circle cx="-3" cy="-3" r="2.6" fill="#fff3dc" opacity="0.88" />
        </g>

        {/* Orb Click Ripples & Arcane Surge Wave */}
        {ripples.map((r) => (
          <circle
            key={r.id}
            cx={r.cx}
            cy={r.cy}
            r="22"
            fill="none"
            stroke="#ff496c"
            strokeWidth="2.5"
            className="coven-ripple"
          />
        ))}
        {activeSurgeId > 0 && (
          <circle
            key={activeSurgeId}
            cx="540"
            cy="821"
            r="220"
            fill="none"
            stroke="#ff3d62"
            className="coven-surge-wave"
          />
        )}

        {/* Swirling Crimson & Antique Gold Arcane Ribbons */}
        <path
          d="M204,818 C142,778 72,848 12,808 C-18,788 -38,812 -48,828"
          fill="none"
          stroke="#e82348"
          strokeWidth="2.8"
          strokeLinecap="round"
          filter="url(#co_glow)"
          opacity="0.9"
          className="coven-swirl"
        />
        <path
          d="M204,828 C132,864 52,800 -14,842"
          fill="none"
          stroke="#f0c97a"
          strokeWidth="1.4"
          strokeLinecap="round"
          filter="url(#co_softglow)"
          opacity="0.7"
          className="coven-swirl-alt"
        />
        <path
          d="M876,818 C938,778 1008,848 1068,808 C1098,788 1118,812 1128,828"
          fill="none"
          stroke="#e82348"
          strokeWidth="2.8"
          strokeLinecap="round"
          filter="url(#co_glow)"
          opacity="0.9"
          className="coven-swirl"
        />
        <path
          d="M876,828 C948,864 1028,800 1094,842"
          fill="none"
          stroke="#f0c97a"
          strokeWidth="1.4"
          strokeLinecap="round"
          filter="url(#co_softglow)"
          opacity="0.7"
          className="coven-swirl-alt"
        />

        {/* Central Gothic Nameplate (Interactive Hover Runes) */}
        <g
          className={config.interativo ? 'coven-interactive-sigil pointer-events-auto' : ''}
          data-active={activeHotspot === 'surge' ? 'true' : 'false'}
          onClick={() => triggerOrbPulse(540, 821)}
        >
          <path
            d="M202,821 L246,770 L834,770 L878,821 L834,872 L246,872 Z"
            fill="url(#co_plate)"
            stroke="url(#co_gold)"
            strokeWidth="3.6"
            filter="url(#co_shadow)"
          />
          <path
            d="M218,821 L256,779 L824,779 L862,821 L824,863 L256,863 Z"
            fill="none"
            stroke="#e82348"
            strokeWidth="1.5"
            opacity="0.82"
          />
          <path
            className="coven-hover-runes"
            d="M236,821 L262,790 M844,821 L818,790 M236,821 L262,852 M844,821 L818,852"
            stroke="#f3d48c"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            className="coven-gem"
            d="M202,804 L212,821 L202,838 L192,821 Z"
            fill="url(#co_gem)"
            stroke="url(#co_gold)"
            strokeWidth="2"
            filter="url(#co_softglow)"
          />
          <path
            className="coven-gem"
            d="M878,804 L888,821 L878,838 L868,821 Z"
            fill="url(#co_gem)"
            stroke="url(#co_gold)"
            strokeWidth="2"
            filter="url(#co_softglow)"
          />
          <text
            data-testid="overlay-nick"
            x="540"
            y="827"
            textAnchor="middle"
            fontFamily="'Cinzel Decorative', 'Cinzel', Georgia, serif"
            fontWeight="700"
            fontSize="48"
            letterSpacing="10"
            fill="url(#co_shine)"
            filter="url(#co_softglow)"
          >
            {displayName}
          </text>
          <text
            data-testid="overlay-sub"
            x="540"
            y="855"
            textAnchor="middle"
            fontFamily="'Cinzel', Georgia, serif"
            fontWeight="700"
            fontSize="15.5"
            letterSpacing="5"
            fill="#f05674"
          >
            {displaySub}
          </text>
        </g>

        {/* Flickering Ritual Candles flanking the lower altar */}
        {config.velas && (
          <g data-testid="overlay-candles">
            <RitualCandle x={144} y={1814} />
            <RitualCandle x={936} y={1814} alt />
          </g>
        )}

        {/* Bottom Gothic Altar Inscription Band */}
        <g>
          <path
            d="M210,1528 L234,1508 L846,1508 L870,1528 L846,1548 L234,1548 Z"
            fill="#08060c"
            fillOpacity="0.82"
            stroke="url(#co_gold)"
            strokeWidth="1.4"
            strokeOpacity="0.72"
          />
          <path d="M242,1528 L316,1528" stroke="url(#co_gold)" strokeWidth="1.8" />
          <path d="M764,1528 L838,1528" stroke="url(#co_gold)" strokeWidth="1.8" />
          <path
            className="coven-gem"
            d="M226,1520 L231.5,1528 L226,1536 L220.5,1528 Z"
            fill="url(#co_gem)"
            stroke="url(#co_gold)"
            strokeWidth="1.6"
          />
          <path
            className="coven-gem"
            d="M854,1520 L859.5,1528 L854,1536 L848.5,1528 Z"
            fill="url(#co_gem)"
            stroke="url(#co_gold)"
            strokeWidth="1.6"
          />
          <text
            data-testid="overlay-footer"
            x="540"
            y="1534"
            textAnchor="middle"
            fontFamily="'Cinzel', Georgia, serif"
            fontWeight="700"
            fontSize="18.5"
            letterSpacing="4"
            fill="#efe6d6"
          >
            {displayFooter}
          </text>
        </g>
      </svg>
    </div>
  );
};
