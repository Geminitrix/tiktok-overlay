import {
  CUTOUT_CLIP_PATH,
  DEFAULT_REPO_NAME,
  OverlayConfig,
  buildGithubPagesUrl,
  clampOpacity,
  escapeHtml,
  generateRuneRing,
  sanitizeGithubUsername,
  sanitizeRepoName,
} from './overlayConfig';

function buildRuneRingSvg(cx: number, cy: number, radius: number, count: number): string {
  const runes = generateRuneRing(cx, cy, radius, count);
  return runes
    .map(
      (r) =>
        `<path transform="translate(${r.x},${r.y}) rotate(${r.angle})" d="${r.glyphPath}" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
    )
    .join('');
}

function buildCornerScytheSvg(x: number, y: number, sx: number, sy: number): string {
  return `<g transform="translate(${x},${y}) scale(${sx},${sy})">
    <path d="M-4,-4 C-40,-20 -64,-64 -52,-120 C-42,-74 -28,-40 -4,-4 Z" fill="url(#c_silver)" stroke="#231e2c" stroke-width="1.1"/>
    <path d="M-4,-4 C-20,-40 -64,-64 -120,-52 C-74,-42 -40,-28 -4,-4 Z" fill="url(#c_silver)" stroke="#231e2c" stroke-width="1.1"/>
    <path d="M-12,-12 C-34,-26 -46,-54 -38,-88 C-32,-56 -22,-32 -12,-12 Z" fill="url(#c_crimson_blade)" opacity="0.88"/>
    <path d="M6,-15 C64,-24 134,-20 206,-15 C134,-10 64,-8 6,-15 Z" fill="url(#c_gold)"/>
    <path d="M-15,6 C-24,64 -20,134 -15,206 C-10,134 -8,64 -15,6 Z" fill="url(#c_gold)"/>
    <path d="M-15,-15 C-15,24 24,24 38,6" fill="none" stroke="url(#c_gold)" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M-15,-15 C24,-15 24,24 6,38" fill="none" stroke="url(#c_gold)" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="14" cy="-15" r="2.5" fill="#f3e3ba"/>
    <circle cx="-15" cy="14" r="2.5" fill="#f3e3ba"/>
    <g transform="translate(-15,-15)">
      <path class="c-gem" d="M0,-15 L9.4,0 L0,15 L-9.4,0 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="2" filter="url(#c_softglow)"/>
      <path d="M0,-9 L4.5,0 L0,9 L-4.5,0 Z" fill="#ff9fb2" opacity="0.45"/>
    </g>
  </g>`;
}

function buildFeatherWingSvg(side: 'left' | 'right'): string {
  const isLeft = side === 'left';
  const sign = isLeft ? -1 : 1;
  const originX = isLeft ? 392 : 688;
  const feathers = Array.from({ length: 7 }, (_, i) => {
    const tx = isLeft ? 358 + i * 5.5 : 722 - i * 5.5;
    const ty = 186 - i * 3;
    const rot = sign * (82 - i * 11);
    const len = 92 + i * 10;
    return `<g transform="translate(${tx.toFixed(1)},${ty.toFixed(1)}) rotate(${rot})">
      <path d="M0,0 C25,${(-len * 0.25).toFixed(1)} 22,${(-len * 0.75).toFixed(1)} 0,${-len} C-13,${(-len * 0.8).toFixed(1)} -22,${(-len * 0.35).toFixed(1)} 0,0 Z" fill="url(#c_feather)" stroke="#8b8399" stroke-width="1.15" stroke-opacity="0.6"/>
      <path d="M0,0 Q2,${(-len * 0.5).toFixed(1)} 0,${(-len * 0.94).toFixed(1)}" stroke="url(#c_gold)" stroke-width="1.2" fill="none" opacity="0.72"/>
    </g>`;
  }).join('');

  return `<g class="${isLeft ? 'c-wing-l' : 'c-wing-r'}" style="transform-origin:${originX}px 168px">${feathers}</g>`;
}

function buildCandleSvg(x: number, y: number, alt: boolean): string {
  const flameClass = alt ? 'c-flame-alt' : 'c-flame';
  return `<g transform="translate(${x},${y})" class="c-candle-group">
    <ellipse cx="0" cy="-24" rx="54" ry="48" fill="url(#c_candle_halo)" class="c-halo"/>
    <path d="M-16,44 L16,44 L11,54 L-11,54 Z" fill="url(#c_gold)"/>
    <rect x="-22" y="41" width="44" height="5" rx="2" fill="url(#c_gold)"/>
    <path d="M-9,41 L-8,-4 C-8,-8 8,-8 8,-4 L9,41 Z" fill="url(#c_wax)" stroke="#382c26" stroke-width="1"/>
    <path d="M-8,2 C-5,8 -6,15 -8,18 M6,-1 C4,5 5,11 7,14" stroke="#d8ccb9" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.7"/>
    <line x1="0" y1="-6" x2="0" y2="-13" stroke="#1a1215" stroke-width="1.8"/>
    <g class="${flameClass}">
      <path d="M0,-42 C10,-28 11,-17 0,-11 C-11,-17 -10,-28 0,-42 Z" fill="url(#c_flame_outer)" filter="url(#c_softglow)"/>
      <path d="M0,-33 C5,-24 5,-17 0,-13 C-5,-17 -5,-24 0,-33 Z" fill="#fff5d6"/>
    </g>
  </g>`;
}

export function generateStandaloneOverlayHtml(
  config: OverlayConfig,
  artSrc = 'assets/morgana-coven.png'
): string {
  const nome = escapeHtml((config.nome || 'LUMOX').trim().toUpperCase());
  const sub = escapeHtml((config.sub || 'MAIN MORGANA · SUPORTE').trim().toUpperCase());
  const rodape = escapeHtml(
    (config.rodape || 'BEM-VINDOS À CONGREGAÇÃO').trim().toUpperCase()
  );
  const safeArtSrc = escapeHtml(artSrc);
  const artOpacity = (clampOpacity(config.arteOpacidade) / 100).toFixed(2);
  const outerRingRunes = buildRuneRingSvg(540, 821, 444, 24);
  const altarRingRunes = buildRuneRingSvg(540, 1710, 272, 20);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Overlay TikTok Live — ${nome} · Congregação das Bruxas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  /* ===== Congregação das Bruxas — Coven Morgana TikTok Vertical Overlay (1080x1920) =====
     Parâmetros rápidos na URL:
       ?fundo=0        → remove o fundo escuro (mantém molduras, runas e partículas)
       ?nome=SeuNick   → altera o nome principal na placa
       ?sub=Texto      → altera o subtítulo
       ?rodape=Texto   → altera a inscrição inferior
       ?arte=0         → oculta a arte da Morgana no altar
       ?opacidade=72   → ajusta a opacidade da arte (0 a 100)
       ?particulas=0   → desliga brasas e penas
       ?corvos=0       → desliga os corvos espectrais
       ?velas=0        → desliga as velas trêmulas
       ?runas=0        → desliga os círculos rúnicos
       ?interativo=0   → desliga hover/cliques interativos
  */
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent !important;
  }
  #stage {
    position: absolute;
    left: 0;
    top: 0;
    width: 1080px;
    height: 1920px;
    transform-origin: top left;
    user-select: none;
    overflow: hidden;
  }
  .layer {
    position: absolute;
    inset: 0;
    width: 1080px;
    height: 1920px;
    pointer-events: none;
  }
  .cutout-clip {
    clip-path: path(evenodd, "${CUTOUT_CLIP_PATH}");
  }
  #art-layer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 415px;
    overflow: hidden;
    opacity: ${config.arte ? artOpacity : '0'};
    transition: opacity 0.4s ease;
  }
  #art-layer img {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 1080px;
    max-width: none;
    height: 420px;
    object-fit: cover;
    object-position: 50% 10%;
    transform: translateX(-50%);
    filter: contrast(1.08) saturate(1.02) brightness(0.90);
    mask-image: linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.88) 68%, rgba(0,0,0,0.22) 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.88) 68%, rgba(0,0,0,0.22) 92%, transparent 100%);
    animation: art-breathe 12s ease-in-out infinite alternate;
  }
  .c-pulse { animation: pulse 3.2s ease-in-out infinite; }
  .c-gem { animation: gem 3.4s ease-in-out infinite; }
  .c-orb { animation: orb-pulse 4.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .c-spin-cw { animation: spin 130s linear infinite; transform-box: view-box; }
  .c-spin-ccw { animation: spin 96s linear infinite reverse; transform-box: view-box; }
  .c-wing-l { animation: sway-l 6.8s ease-in-out infinite; transform-box: view-box; }
  .c-wing-r { animation: sway-r 6.8s ease-in-out infinite; transform-box: view-box; }
  .c-swirl { stroke-dasharray: 220 75; animation: swirl 4.4s linear infinite; }
  .c-swirl-alt { stroke-dasharray: 160 90; animation: swirl 6.4s linear infinite reverse; }
  .c-mist-a { animation: drift-a 19s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
  .c-mist-b { animation: drift-b 25s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
  .c-flame { animation: flicker 2.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center bottom; }
  .c-flame-alt { animation: flicker 1.85s ease-in-out infinite -0.7s; transform-box: fill-box; transform-origin: center bottom; }
  .c-halo { animation: halo-breathe 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .c-monolith { animation: monolith-glow 4.6s ease-in-out infinite; }

  /* Elementos interativos (hover / clique suave) */
  .interactive-on .hotspot { pointer-events: auto; cursor: pointer; }
  .hotspot .hover-runes { opacity: 0.14; transition: opacity 0.4s ease, filter 0.4s ease; }
  .interactive-on .hotspot:hover .hover-runes,
  .hotspot.active .hover-runes {
    opacity: 0.96;
    filter: drop-shadow(0 0 10px rgba(255, 62, 98, 0.85));
  }
  .orb-btn { transition: transform 0.35s ease, filter 0.35s ease; transform-box: fill-box; transform-origin: center; }
  .interactive-on .orb-btn:hover,
  .orb-btn.active {
    transform: scale(1.16);
    filter: drop-shadow(0 0 14px rgba(255, 62, 98, 0.95));
  }

  /* Partículas */
  .ember {
    position: absolute;
    border-radius: 9999px;
    opacity: 0;
    animation: rise linear infinite;
    will-change: transform, opacity;
  }
  .fall {
    position: absolute;
    opacity: 0;
    animation: fall linear forwards;
    will-change: transform, opacity;
  }
  .fall > div {
    width: 100%;
    height: 100%;
    animation: flutter 2.7s ease-in-out infinite alternate;
  }
  .raven-flight {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
  }
  .raven-ltr { animation: raven-ltr 6.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .raven-rtl { animation: raven-rtl 6.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .raven-wings { animation: wing-beat 0.56s ease-in-out infinite alternate; transform-origin: 50% 52%; }

  @keyframes art-breathe { from { transform: translateX(-50%) scale(1); } to { transform: translateX(-50%) scale(1.032) translateY(-5px); } }
  @keyframes pulse { 0%,100% { opacity: 0.48; } 50% { opacity: 0.98; } }
  @keyframes gem { 0%,100% { opacity: 0.78; } 50% { opacity: 1; } }
  @keyframes orb-pulse { 0%,100% { opacity: 0.64; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.08); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes sway-l { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-3.2deg); } }
  @keyframes sway-r { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(3.2deg); } }
  @keyframes swirl { to { stroke-dashoffset: -295; } }
  @keyframes drift-a { from { transform: translate(-34px,12px) scale(1); } to { transform: translate(42px,-24px) scale(1.14); } }
  @keyframes drift-b { from { transform: translate(34px,-16px) scale(1.08); } to { transform: translate(-38px,22px) scale(0.96); } }
  @keyframes flicker {
    0%,100% { transform: scaleY(0.96) scaleX(1.02) skewX(-1.5deg); opacity: 0.92; }
    24% { transform: scaleY(1.07) scaleX(0.95) skewX(2deg); opacity: 1; }
    50% { transform: scaleY(0.92) scaleX(1.04) skewX(-2deg); opacity: 0.88; }
    76% { transform: scaleY(1.05) scaleX(0.97) skewX(1.2deg); opacity: 0.98; }
  }
  @keyframes halo-breathe { 0%,100% { opacity: 0.34; transform: scale(0.94); } 50% { opacity: 0.62; transform: scale(1.08); } }
  @keyframes monolith-glow { 0%,100% { opacity: 0.45; } 50% { opacity: 0.95; } }
  @keyframes rise {
    0% { transform: translate(0,0) scale(0.75); opacity: 0; }
    12% { opacity: var(--o); }
    52% { transform: translate(var(--dx), calc(var(--dy) * 0.5)) scale(1.05); }
    86% { opacity: var(--o); }
    100% { transform: translate(calc(var(--dx) * -0.45), var(--dy)) scale(0.5); opacity: 0; }
  }
  @keyframes fall {
    0% { transform: translate(0,0) rotate(var(--r0)); opacity: 0; }
    12% { opacity: 0.88; }
    84% { opacity: 0.82; }
    100% { transform: translate(var(--dx), 780px) rotate(var(--r1)); opacity: 0; }
  }
  @keyframes flutter { from { transform: rotate(-20deg); } to { transform: rotate(20deg); } }
  @keyframes raven-ltr {
    0% { transform: translate(-180px, 32px) scale(0.84) rotate(-6deg); opacity: 0; }
    12% { opacity: 0.82; }
    50% { transform: translate(540px, -22px) scale(1.02) rotate(3deg); opacity: 0.88; }
    86% { opacity: 0.72; }
    100% { transform: translate(1260px, -54px) scale(0.86) rotate(-4deg); opacity: 0; }
  }
  @keyframes raven-rtl {
    0% { transform: translate(1260px, 28px) scaleX(-0.84) scaleY(0.84) rotate(-6deg); opacity: 0; }
    12% { opacity: 0.82; }
    50% { transform: translate(540px, -18px) scaleX(-1.02) scaleY(1.02) rotate(3deg); opacity: 0.88; }
    86% { opacity: 0.72; }
    100% { transform: translate(-180px, -50px) scaleX(-0.86) scaleY(0.86) rotate(-4deg); opacity: 0; }
  }
  @keyframes wing-beat { from { transform: scaleY(1); } to { transform: scaleY(0.52) translateY(6px); } }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
  }
</style>
</head>
<body>
<div id="stage" class="${config.interativo ? 'interactive-on' : ''}">
  <!-- Fundo escuro + névoa + arte da Morgana + círculos rúnicos (com recortes transparentes exatos) -->
  <div id="fundo" class="layer cutout-clip" style="display:${config.fundo ? 'block' : 'none'}">
    <svg class="layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
      <defs>
        <radialGradient id="bg_void" cx="540" cy="840" r="1280" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#191321"/>
          <stop offset="0.38" stop-color="#0d0c13"/>
          <stop offset="0.72" stop-color="#090b10"/>
          <stop offset="1" stop-color="#040406"/>
        </radialGradient>
        <radialGradient id="bg_teal_glow" cx="540" cy="1760" r="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#1b3e4c" stop-opacity="0.34"/>
          <stop offset="0.6" stop-color="#101c24" stop-opacity="0.16"/>
          <stop offset="1" stop-color="#040406" stop-opacity="0"/>
        </radialGradient>
        <filter id="bg_blur42" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="42"/></filter>
      </defs>
      <rect width="1080" height="1920" fill="url(#bg_void)"/>
      <rect width="1080" height="1920" fill="url(#bg_teal_glow)"/>
      <!-- Névoa mística da floresta antiga -->
      <ellipse class="c-mist-a" cx="160" cy="960" rx="410" ry="260" fill="#a81432" opacity="0.20" filter="url(#bg_blur42)"/>
      <ellipse class="c-mist-b" cx="920" cy="760" rx="380" ry="240" fill="#183d4b" opacity="0.26" filter="url(#bg_blur42)"/>
      <ellipse class="c-mist-a" cx="540" cy="1720" rx="580" ry="250" fill="#9c102b" opacity="0.22" filter="url(#bg_blur42)"/>
      <ellipse class="c-mist-b" cx="540" cy="110" rx="520" ry="180" fill="#2b2136" opacity="0.30" filter="url(#bg_blur42)"/>
      <ellipse class="c-mist-a" cx="960" cy="1560" rx="320" ry="260" fill="#b81b3a" opacity="0.16" filter="url(#bg_blur42)"/>
      <!-- Monólitos do Deus Antigo (inspirados na splash art) -->
      <g opacity="0.72">
        <path d="M22,1920 L28,1590 L74,1546 L112,1608 L104,1920 Z" fill="#0d0b11" stroke="#362c3d" stroke-width="1.5"/>
        <path class="c-monolith" d="M68,1624 L68,1712 M56,1648 C56,1634 80,1634 80,1648 C80,1668 56,1678 56,1696" stroke="#ff355b" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M1058,1920 L1052,1590 L1006,1546 L968,1608 L976,1920 Z" fill="#0d0b11" stroke="#362c3d" stroke-width="1.5"/>
        <path class="c-monolith" d="M1012,1624 L1012,1712 M1000,1648 C1000,1634 1024,1634 1024,1648 C1024,1668 1000,1678 1000,1696" stroke="#ff355b" stroke-width="4" stroke-linecap="round" fill="none"/>
      </g>
    </svg>

    <!-- Arte da Morgana Congregação das Bruxas integrada no altar inferior -->
    <div id="art-layer">
      <img src="${safeArtSrc}" alt="" />
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 68% 72% at 50% 42%, rgba(7,6,10,0.08) 0%, rgba(7,6,10,0.52) 66%, rgba(5,4,8,0.92) 100%);"></div>
    </div>

    <!-- Círculos rúnicos arcanos giratórios -->
    <svg id="runas-layer" class="layer" style="display:${config.runas ? 'block' : 'none'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
      <g opacity="0.22" color="#e3264a">
        <g class="c-spin-cw" style="transform-origin:540px 821px">
          <circle cx="540" cy="821" r="474" fill="none" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="540" cy="821" r="416" fill="none" stroke="#c59e54" stroke-width="1.2" stroke-dasharray="6 10"/>
          ${outerRingRunes}
          <path d="M540,398 L722,1202 L209,557 L952,916 L128,916 L871,557 L358,1202 Z" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.65"/>
        </g>
      </g>
      <g opacity="0.20" color="#c59e54">
        <g class="c-spin-ccw" style="transform-origin:540px 1710px">
          <circle cx="540" cy="1710" r="298" fill="none" stroke="#e3264a" stroke-width="1.6"/>
          <circle cx="540" cy="1710" r="246" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 9"/>
          ${altarRingRunes}
        </g>
      </g>
    </svg>
  </div>

  <!-- Partículas, penas negras e corvos espectrais (recortados fora da webcam e gameplay) -->
  <div id="particulas" class="layer cutout-clip"></div>
  <div id="corvos-layer" class="layer cutout-clip"></div>

  <!-- Molduras góticas, asas metálicas, placa LUMOX, orbes interativos e velas -->
  <svg id="moldura" class="layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="c_gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f6e7be"/>
        <stop offset="0.34" stop-color="#c59e54"/>
        <stop offset="0.68" stop-color="#755524"/>
        <stop offset="1" stop-color="#ebd49b"/>
      </linearGradient>
      <linearGradient id="c_silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f5f3fa"/>
        <stop offset="0.48" stop-color="#b9b2c7"/>
        <stop offset="1" stop-color="#4e485c"/>
      </linearGradient>
      <linearGradient id="c_crimson_blade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff496c"/>
        <stop offset="0.55" stop-color="#9e0e2a"/>
        <stop offset="1" stop-color="#2b040c"/>
      </linearGradient>
      <linearGradient id="c_shine" x1="280" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#d5c9b0"/>
        <stop offset="0.42" stop-color="#f7edd3"/>
        <stop offset="0.5" stop-color="#ffffff"/>
        <stop offset="0.58" stop-color="#f7edd3"/>
        <stop offset="1" stop-color="#c9a55c"/>
        <animateTransform attributeName="gradientTransform" type="translate" values="-540 0; 540 0; 540 0" keyTimes="0;0.44;1" dur="5.2s" repeatCount="indefinite"/>
      </linearGradient>
      <linearGradient id="c_feather" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2d2638"/>
        <stop offset="0.58" stop-color="#13101a"/>
        <stop offset="1" stop-color="#060509"/>
      </linearGradient>
      <linearGradient id="c_plate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#181220"/>
        <stop offset="0.55" stop-color="#0d0a13"/>
        <stop offset="1" stop-color="#060409"/>
      </linearGradient>
      <radialGradient id="c_gem" cx="0.38" cy="0.34" r="0.72">
        <stop offset="0" stop-color="#ffb2c2"/>
        <stop offset="0.36" stop-color="#e82348"/>
        <stop offset="1" stop-color="#4d0311"/>
      </radialGradient>
      <radialGradient id="c_orb_grad" cx="0.38" cy="0.32" r="0.7">
        <stop offset="0" stop-color="#ffe0c2"/>
        <stop offset="0.35" stop-color="#ff355b"/>
        <stop offset="0.72" stop-color="#870a24"/>
        <stop offset="1" stop-color="#24020a"/>
      </radialGradient>
      <radialGradient id="c_candle_halo" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffae52" stop-opacity="0.62"/>
        <stop offset="0.52" stop-color="#c93628" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#c93628" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="c_wax" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#9e9183"/>
        <stop offset="0.45" stop-color="#dfd4c5"/>
        <stop offset="1" stop-color="#6b6057"/>
      </linearGradient>
      <linearGradient id="c_flame_outer" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff0b8"/>
        <stop offset="0.5" stop-color="#ff9938"/>
        <stop offset="1" stop-color="#d62828"/>
      </linearGradient>
      <filter id="c_glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="c_softglow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.8" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="c_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.88"/>
      </filter>
    </defs>

    <!-- Asas de penas escuras no topo -->
    ${buildFeatherWingSvg('left')}
    ${buildFeatherWingSvg('right')}

    <!-- Moldura Superior (Webcam 16:9 — recorte exato x=60, y=190, w=960, h=540) -->
    <rect x="44" y="174" width="992" height="572" rx="4" fill="none" stroke="#060409" stroke-width="18" filter="url(#c_shadow)"/>
    <rect x="57" y="187" width="966" height="546" fill="none" stroke="#e82348" stroke-width="2.8" filter="url(#c_glow)" class="c-pulse"/>
    <rect x="51" y="181" width="978" height="558" fill="none" stroke="url(#c_silver)" stroke-width="1.9"/>
    <rect x="40" y="170" width="1000" height="580" fill="none" stroke="url(#c_gold)" stroke-width="3.4"/>
    <path d="M46,396 L53,460 L46,524 L39,460 Z" fill="url(#c_gold)"/>
    <path class="c-gem" d="M46,448 L53.5,460 L46,472 L38.5,460 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="1.8" filter="url(#c_softglow)"/>
    <path d="M1034,396 L1041,460 L1034,524 L1027,460 Z" fill="url(#c_gold)"/>
    <path class="c-gem" d="M1034,448 L1041.5,460 L1034,472 L1026.5,460 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="1.8" filter="url(#c_softglow)"/>
    ${buildCornerScytheSvg(54, 184, 1, 1)}
    ${buildCornerScytheSvg(1026, 184, -1, 1)}
    ${buildCornerScytheSvg(54, 736, 1, -1)}
    ${buildCornerScytheSvg(1026, 736, -1, -1)}

    <!-- Coroa / Brasão superior interativo -->
    <g class="hotspot" id="crest-hotspot">
      <path d="M60,150 L414,150" stroke="url(#c_gold)" stroke-width="1.4" opacity="0.68"/>
      <path d="M666,150 L1020,150" stroke="url(#c_gold)" stroke-width="1.4" opacity="0.68"/>
      <path d="M342,170 C426,164 478,144 510,110 C490,148 430,168 342,170 Z" fill="url(#c_gold)"/>
      <path d="M738,170 C654,164 602,144 570,110 C590,148 650,168 738,170 Z" fill="url(#c_gold)"/>
      <path d="M540,66 C552,106 566,138 580,170 L500,170 C514,138 528,106 540,66 Z" fill="#0c0912" stroke="url(#c_gold)" stroke-width="3"/>
      <path d="M512,124 A31,31 0 1,0 568,124 A25,25 0 1,1 512,124 Z" fill="url(#c_silver)" filter="url(#c_softglow)"/>
      <path class="c-gem" d="M540,127 L550,144 L540,161 L530,144 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="2" filter="url(#c_softglow)"/>
      <!-- Símbolos arcanos que acendem ao passar o mouse -->
      <g class="hover-runes" stroke="#ff5c7c" stroke-width="1.8" fill="none" stroke-linecap="round">
        <circle cx="540" cy="128" r="56" stroke-dasharray="5 7"/>
        <path d="M466,128 L480,116 L492,128 L480,140 Z M588,128 L600,116 L614,128 L600,140 Z"/>
      </g>
    </g>

    <!-- Orbes arcanos pulsantes flanqueando o brasão (clicáveis para invocar pulso/corvo) -->
    <g class="hotspot orb-btn" data-orb="left" transform="translate(274,148)">
      <circle cx="0" cy="0" r="22" fill="#e82348" opacity="0.22" class="c-orb"/>
      <circle cx="0" cy="0" r="10.5" fill="url(#c_orb_grad)" stroke="url(#c_gold)" stroke-width="1.8" filter="url(#c_softglow)"/>
      <circle cx="-3" cy="-3" r="2.6" fill="#fff3dc" opacity="0.85"/>
    </g>
    <g class="hotspot orb-btn" data-orb="right" transform="translate(806,148)">
      <circle cx="0" cy="0" r="22" fill="#e82348" opacity="0.22" class="c-orb"/>
      <circle cx="0" cy="0" r="10.5" fill="url(#c_orb_grad)" stroke="url(#c_gold)" stroke-width="1.8" filter="url(#c_softglow)"/>
      <circle cx="-3" cy="-3" r="2.6" fill="#fff3dc" opacity="0.85"/>
    </g>

    <!-- Moldura Inferior (Gameplay 16:9 — recorte exato x=40, y=892, w=1000, h=563) -->
    <rect x="24" y="876" width="1032" height="595" rx="4" fill="none" stroke="#060409" stroke-width="18" filter="url(#c_shadow)"/>
    <rect x="37" y="889" width="1006" height="569" fill="none" stroke="#e82348" stroke-width="2.8" filter="url(#c_glow)" class="c-pulse"/>
    <rect x="31" y="883" width="1018" height="581" fill="none" stroke="url(#c_silver)" stroke-width="1.9"/>
    <rect x="20" y="872" width="1040" height="603" fill="none" stroke="url(#c_gold)" stroke-width="3.4"/>
    <path d="M26,1112 L33,1174 L26,1236 L19,1174 Z" fill="url(#c_gold)"/>
    <path class="c-gem" d="M26,1162 L33.5,1174 L26,1186 L18.5,1174 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="1.8" filter="url(#c_softglow)"/>
    <path d="M1054,1112 L1061,1174 L1054,1236 L1047,1174 Z" fill="url(#c_gold)"/>
    <path class="c-gem" d="M1054,1162 L1061.5,1174 L1054,1186 L1046.5,1174 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="1.8" filter="url(#c_softglow)"/>
    <path d="M412,1475 C496,1477 518,1484 540,1504 C562,1484 584,1477 668,1475 Z" fill="url(#c_gold)"/>
    <path class="c-gem" d="M540,1475 L546.8,1486 L540,1497 L533.2,1486 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="1.8" filter="url(#c_softglow)"/>
    ${buildCornerScytheSvg(34, 886, 1, 1)}
    ${buildCornerScytheSvg(1046, 886, -1, 1)}
    ${buildCornerScytheSvg(34, 1461, 1, -1)}
    ${buildCornerScytheSvg(1046, 1461, -1, -1)}

    <!-- Energia arcana carmesim ao redor da placa -->
    <path d="M204,818 C142,778 72,848 12,808 C-18,788 -38,812 -48,828" fill="none" stroke="#e82348" stroke-width="2.8" stroke-linecap="round" filter="url(#c_glow)" opacity="0.9" class="c-swirl"/>
    <path d="M204,828 C132,864 52,800 -14,842" fill="none" stroke="#f0c97a" stroke-width="1.4" stroke-linecap="round" filter="url(#c_softglow)" opacity="0.7" class="c-swirl-alt"/>
    <path d="M876,818 C938,778 1008,848 1068,808 C1098,788 1118,812 1128,828" fill="none" stroke="#e82348" stroke-width="2.8" stroke-linecap="round" filter="url(#c_glow)" opacity="0.9" class="c-swirl"/>
    <path d="M876,828 C948,864 1028,800 1094,842" fill="none" stroke="#f0c97a" stroke-width="1.4" stroke-linecap="round" filter="url(#c_softglow)" opacity="0.7" class="c-swirl-alt"/>

    <!-- Placa Central Interativa (LUMOX) -->
    <g class="hotspot" id="nameplate-hotspot">
      <path d="M202,821 L246,770 L834,770 L878,821 L834,872 L246,872 Z" fill="url(#c_plate)" stroke="url(#c_gold)" stroke-width="3.6" filter="url(#c_shadow)"/>
      <path d="M218,821 L256,779 L824,779 L862,821 L824,863 L256,863 Z" fill="none" stroke="#e82348" stroke-width="1.5" opacity="0.82"/>
      <path class="hover-runes" d="M236,821 L262,790 M844,821 L818,790 M236,821 L262,852 M844,821 L818,852" stroke="#f3d48c" stroke-width="1.8" stroke-linecap="round"/>
      <path class="c-gem" d="M202,804 L212,821 L202,838 L192,821 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="2" filter="url(#c_softglow)"/>
      <path class="c-gem" d="M878,804 L888,821 L878,838 L868,821 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="2" filter="url(#c_softglow)"/>
      <text id="nick" x="540" y="827" text-anchor="middle" font-family="'Cinzel Decorative','Cinzel',Georgia,serif" font-weight="700" font-size="48" letter-spacing="10" fill="url(#c_shine)" filter="url(#c_softglow)">${nome}</text>
      <text id="sub" x="540" y="855" text-anchor="middle" font-family="'Cinzel',Georgia,serif" font-weight="700" font-size="15.5" letter-spacing="5" fill="#f05674">${sub}</text>
    </g>

    <!-- Altar Inferior: Velas trêmulas + Inscrição da Congregação -->
    <g id="velas-layer" style="display:${config.velas ? 'block' : 'none'}">
      ${buildCandleSvg(144, 1814, false)}
      ${buildCandleSvg(936, 1814, true)}
    </g>

    <g id="footer-band">
      <path d="M210,1528 L234,1508 L846,1508 L870,1528 L846,1548 L234,1548 Z" fill="#08060c" fill-opacity="0.82" stroke="url(#c_gold)" stroke-width="1.4" stroke-opacity="0.72"/>
      <path d="M242,1528 L316,1528" stroke="url(#c_gold)" stroke-width="1.8"/>
      <path d="M764,1528 L838,1528" stroke="url(#c_gold)" stroke-width="1.8"/>
      <path class="c-gem" d="M226,1520 L231.5,1528 L226,1536 L220.5,1528 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="1.6"/>
      <path class="c-gem" d="M854,1520 L859.5,1528 L854,1536 L848.5,1528 Z" fill="url(#c_gem)" stroke="url(#c_gold)" stroke-width="1.6"/>
      <text id="rodape" x="540" y="1534" text-anchor="middle" font-family="'Cinzel',Georgia,serif" font-weight="700" font-size="18.5" letter-spacing="4" fill="#efe6d6">${rodape}</text>
    </g>
  </svg>
</div>

<script>
(function () {
  var q = new URLSearchParams(location.search);
  var stage = document.getElementById('stage');

  function fit() {
    var s = Math.min(innerWidth / 1080, innerHeight / 1920);
    var x = (innerWidth - 1080 * s) / 2;
    var y = (innerHeight - 1920 * s) / 2;
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  addEventListener('resize', fit);
  fit();

  if (q.get('fundo') === '0') document.getElementById('fundo').style.display = 'none';
  if (q.get('arte') === '0') document.getElementById('art-layer').style.display = 'none';
  if (q.get('opacidade')) {
    var op = Math.max(0, Math.min(100, Number(q.get('opacidade')) || 72));
    document.getElementById('art-layer').style.opacity = (op / 100).toFixed(2);
  }
  if (q.get('velas') === '0') document.getElementById('velas-layer').style.display = 'none';
  if (q.get('runas') === '0') document.getElementById('runas-layer').style.display = 'none';
  if (q.get('interativo') === '0') stage.classList.remove('interactive-on');
  if (q.get('nome')) document.getElementById('nick').textContent = q.get('nome').slice(0, 26).toUpperCase();
  if (q.get('sub')) document.getElementById('sub').textContent = q.get('sub').slice(0, 48).toUpperCase();
  if (q.get('rodape')) document.getElementById('rodape').textContent = q.get('rodape').slice(0, 52).toUpperCase();

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // Corvos espectrais cruzando suavemente as bordas escuras
  var corvosBox = document.getElementById('corvos-layer');
  var RAVEN_SVG = '<svg viewBox="0 0 140 80" width="140" height="80" fill="none"><g class="raven-wings"><path d="M68,42 C46,18 22,8 4,14 C24,26 42,36 58,48 Z" fill="#120d17" stroke="#c59e54" stroke-opacity="0.55" stroke-width="1.2"/><path d="M76,42 C96,16 118,10 136,18 C118,28 100,38 82,48 Z" fill="#120d17" stroke="#c59e54" stroke-opacity="0.55" stroke-width="1.2"/></g><path d="M52,44 C64,38 82,38 96,46 L112,48 L96,52 C82,58 64,58 46,56 L26,64 L40,51 Z" fill="#09070d" stroke="#8a8298" stroke-opacity="0.45" stroke-width="1"/><circle cx="91" cy="46" r="2.2" fill="#ff3b5f"/></svg>';
  function spawnRaven(forceTop) {
    if (!corvosBox) return;
    var r = document.createElement('div');
    var ltr = Math.random() > 0.5;
    r.className = 'raven-flight ' + (ltr ? 'raven-ltr' : 'raven-rtl');
    r.style.top = (forceTop != null ? forceTop : (Math.random() > 0.45 ? rnd(35, 118) : rnd(1555, 1780))) + 'px';
    r.style.left = '0px';
    r.innerHTML = RAVEN_SVG;
    corvosBox.appendChild(r);
    setTimeout(function () { r.remove(); }, 7200);
  }

  var allowRavens = q.get('corvos') !== '0' && ${config.corvos ? 'true' : 'false'};
  if (allowRavens) {
    setTimeout(function () { spawnRaven(64); }, 1800);
    setInterval(function () { spawnRaven(null); }, 15000);
  }

  // Cliques interativos nos orbes e brasão
  var orbs = document.querySelectorAll('.orb-btn');
  for (var j = 0; j < orbs.length; j++) {
    orbs[j].addEventListener('click', function () {
      if (!stage.classList.contains('interactive-on')) return;
      var el = this;
      el.classList.add('active');
      spawnRaven(70);
      setTimeout(function () { el.classList.remove('active'); }, 900);
    });
  }

  var allowParticles = q.get('particulas') !== '0' && ${config.particulas ? 'true' : 'false'};
  if (!allowParticles) return;

  var box = document.getElementById('particulas');
  for (var i = 0; i < 46; i++) {
    var e = document.createElement('div');
    var size = rnd(3.5, 9.5);
    var gold = i % 3 === 0;
    e.className = 'ember';
    e.style.width = e.style.height = size + 'px';
    e.style.left = rnd(18, 1062) + 'px';
    e.style.top = rnd(240, 1940) + 'px';
    e.style.background = gold
      ? 'radial-gradient(circle, #fff2cc 0%, #d4aa59 45%, rgba(212,170,89,0) 74%)'
      : 'radial-gradient(circle, #ffd0da 0%, #e82348 46%, rgba(232,35,72,0) 74%)';
    e.style.setProperty('--dx', rnd(-55, 55) + 'px');
    e.style.setProperty('--dy', -rnd(230, 620) + 'px');
    e.style.setProperty('--o', rnd(0.42, 0.92).toFixed(2));
    e.style.animationDuration = rnd(6.5, 14) + 's';
    e.style.animationDelay = -rnd(0, 14) + 's';
    box.appendChild(e);
  }

  var FEATHER = '<svg viewBox="-20 -110 40 115" width="100%" height="100%" style="overflow:visible"><path d="M0,0 C18,-25 16,-75 0,-100 C-9,-80 -15,-35 0,0 Z" fill="#181220" stroke="#9e95ad" stroke-opacity="0.58" stroke-width="1.2"/><path d="M0,0 Q1.5,-50 0,-96" stroke="#d5b36b" stroke-width="1.2" fill="none" opacity="0.72"/></svg>';
  function feather() {
    var f = document.createElement('div');
    var sz = rnd(22, 40);
    f.className = 'fall';
    f.style.width = sz + 'px';
    f.style.height = sz * 2.7 + 'px';
    f.style.left = rnd(25, 1035) + 'px';
    f.style.top = rnd(-120, 960) + 'px';
    f.style.setProperty('--dx', rnd(-120, 120) + 'px');
    f.style.setProperty('--r0', rnd(-50, 50) + 'deg');
    f.style.setProperty('--r1', rnd(-160, 160) + 'deg');
    var d = rnd(10, 15);
    f.style.animationDuration = d + 's';
    f.innerHTML = '<div>' + FEATHER + '</div>';
    box.appendChild(f);
    setTimeout(function () { f.remove(); }, d * 1000 + 250);
  }
  for (var k = 0; k < 3; k++) setTimeout(feather, k * 1100);
  setInterval(feather, 3200);
})();
</script>
</body>
</html>
`;
}

export function generateGithubReadme(
  config: OverlayConfig,
  repoName = DEFAULT_REPO_NAME,
  githubUser = ''
): string {
  const cleanRepo = sanitizeRepoName(repoName);
  const cleanUser = sanitizeGithubUsername(githubUser) || 'seu-usuario';
  const pagesUrl = buildGithubPagesUrl(cleanUser, cleanRepo, config);

  return `# ${cleanRepo}

Overlay vertical **1080×1920** para **TikTok LIVE Studio / OBS**, inspirado no tema **Congregação das Bruxas (Coven Morgana — League of Legends)**.

Vertical **1080×1920** TikTok LIVE overlay inspired by **League of Legends — Coven Morgana (Witch's Gathering)**.

---

## Destaques Visuais e Interativos / Highlights

- **Recortes transparentes exatos (16:9)**:
  - Webcam: \`x=60, y=190, 960×540\`
  - Gameplay: \`x=40, y=892, 1000×563\`
- **Paleta oficial Coven Morgana**: obsidiana, fumaça de floresta, prata forjada em asas-foice, ouro envelhecido, carmesim arcano e tons de veludo petróleo.
- **Animações leves (GPU)**: névoa flutuante, círculos rúnicos contra-rotativos, velas trêmulas no altar, brasas carmesim/douradas, penas negras caindo e corvos espectrais planando nas bordas escuras.
- **Elementos interativos sutis**: orbes arcanos pulsantes e runas no brasão/placa que se iluminam suavemente ao interagir sem atrapalhar a live.

---

## Como usar no GitHub Pages + TikTok LIVE Studio

1. Crie um repositório público no GitHub com o nome \`${cleanRepo}\`.
2. Faça upload do arquivo \`index.html\` (versão completa com arte embutida) e deste \`README.md\` na branch \`main\`.
3. Acesse **Settings → Pages**, em **Build and deployment** selecione **Branch: main** e **/ (root)** e clique em **Save**.
4. Aguarde ~1 minuto e copie o endereço publicado:
   \`\`\`text
   ${pagesUrl}
   \`\`\`
5. No **TikTok LIVE Studio**, adicione uma fonte **Link / Browser Source** com resolução **1080 × 1920** e cole a URL acima.

---

## Personalização rápida via URL / URL Query Parameters

| Parâmetro | Exemplo | Efeito |
| :--- | :--- | :--- |
| \`nome\` | \`?nome=${encodeURIComponent(config.nome || 'LUMOX')}\` | Altera o nick principal na placa |
| \`sub\` | \`?sub=${encodeURIComponent(config.sub || 'MAIN MORGANA · SUPORTE')}\` | Altera o subtítulo |
| \`rodape\` | \`?rodape=${encodeURIComponent(config.rodape || 'BEM-VINDOS À CONGREGAÇÃO')}\` | Altera a inscrição do altar inferior |
| \`fundo\` | \`?fundo=0\` | Remove o fundo escuro (mantém molduras e partículas) |
| \`arte\` | \`?arte=0\` | Oculta a arte da Morgana no altar inferior |
| \`opacidade\` | \`?opacidade=${clampOpacity(config.arteOpacidade)}\` | Ajusta a opacidade da arte (0–100) |
| \`particulas\` | \`?particulas=0\` | Desliga brasas e penas |
| \`corvos\` | \`?corvos=0\` | Desliga os corvos espectrais |
| \`velas\` | \`?velas=0\` | Desliga as velas trêmulas |
| \`runas\` | \`?runas=0\` | Desliga os círculos rúnicos |
| \`interativo\` | \`?interativo=0\` | Desliga hover/cliques nos sigilos e orbes |
`;
}
