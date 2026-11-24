export interface OverlayConfig {
  nome: string;
  sub: string;
  rodape: string;
  fundo: boolean;
  particulas: boolean;
  arte: boolean;
  arteOpacidade: number; // 0 to 100
  corvos: boolean;
  velas: boolean;
  runas: boolean;
  interativo: boolean;
}

export const STAGE_WIDTH = 1080;
export const STAGE_HEIGHT = 1920;

export const CUTOUTS = {
  webcam: { x: 60, y: 190, width: 960, height: 540 },
  gameplay: { x: 40, y: 892, width: 1000, height: 563 },
} as const;

export const CUTOUT_CLIP_PATH =
  'M0 0H1080V1920H0Z M60 190h960v540h-960Z M40 892h1000v563h-1000Z';

export const MORGANA_ASSET_PATH = '/assets/aistudio/Morgana_26_8d452fd4.png';

export const DEFAULT_REPO_NAME = 'tiktok-overlay';

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  nome: 'LUMOX',
  sub: 'MAIN MORGANA · SUPORTE',
  rodape: 'BEM-VINDOS À CONGREGAÇÃO',
  fundo: true,
  particulas: true,
  arte: true,
  arteOpacidade: 72,
  corvos: true,
  velas: true,
  runas: true,
  interativo: true,
};

export function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_OVERLAY_CONFIG.arteOpacidade;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeRepoName(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || DEFAULT_REPO_NAME;
}

export function sanitizeGithubUsername(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9-]/g, '');
}

export function isOverlayLiveMode(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('modo') === 'overlay' || params.get('live') === '1';
}

export function parseOverlayParams(search: string): OverlayConfig {
  const q = new URLSearchParams(search);
  const parseBool = (key: string, fallback: boolean): boolean => {
    const val = q.get(key);
    if (val === '0' || val === 'false') return false;
    if (val === '1' || val === 'true') return true;
    return fallback;
  };

  const rawOp = q.get('opacidade');
  const parsedOp =
    rawOp !== null && rawOp.trim() !== ''
      ? clampOpacity(Number(rawOp))
      : DEFAULT_OVERLAY_CONFIG.arteOpacidade;

  const nome = q.get('nome')?.trim();
  const sub = q.get('sub')?.trim();
  const rodape = q.get('rodape')?.trim();

  return {
    nome: nome ? nome.slice(0, 26).toUpperCase() : DEFAULT_OVERLAY_CONFIG.nome,
    sub: sub ? sub.slice(0, 48).toUpperCase() : DEFAULT_OVERLAY_CONFIG.sub,
    rodape: rodape
      ? rodape.slice(0, 52).toUpperCase()
      : DEFAULT_OVERLAY_CONFIG.rodape,
    fundo: parseBool('fundo', DEFAULT_OVERLAY_CONFIG.fundo),
    particulas: parseBool('particulas', DEFAULT_OVERLAY_CONFIG.particulas),
    arte: parseBool('arte', DEFAULT_OVERLAY_CONFIG.arte),
    arteOpacidade: parsedOp,
    corvos: parseBool('corvos', DEFAULT_OVERLAY_CONFIG.corvos),
    velas: parseBool('velas', DEFAULT_OVERLAY_CONFIG.velas),
    runas: parseBool('runas', DEFAULT_OVERLAY_CONFIG.runas),
    interativo: parseBool('interativo', DEFAULT_OVERLAY_CONFIG.interativo),
  };
}

export function buildOverlayQuery(
  config: OverlayConfig,
  options?: { includeLiveFlag?: boolean }
): string {
  const q = new URLSearchParams();
  if (options?.includeLiveFlag) {
    q.set('modo', 'overlay');
  }
  if (config.nome.trim() && config.nome.trim().toUpperCase() !== DEFAULT_OVERLAY_CONFIG.nome) {
    q.set('nome', config.nome.trim().toUpperCase());
  }
  if (config.sub.trim() && config.sub.trim().toUpperCase() !== DEFAULT_OVERLAY_CONFIG.sub) {
    q.set('sub', config.sub.trim().toUpperCase());
  }
  if (
    config.rodape.trim() &&
    config.rodape.trim().toUpperCase() !== DEFAULT_OVERLAY_CONFIG.rodape
  ) {
    q.set('rodape', config.rodape.trim().toUpperCase());
  }
  if (!config.fundo) q.set('fundo', '0');
  if (!config.particulas) q.set('particulas', '0');
  if (!config.arte) q.set('arte', '0');
  if (config.arteOpacidade !== DEFAULT_OVERLAY_CONFIG.arteOpacidade) {
    q.set('opacidade', String(clampOpacity(config.arteOpacidade)));
  }
  if (!config.corvos) q.set('corvos', '0');
  if (!config.velas) q.set('velas', '0');
  if (!config.runas) q.set('runas', '0');
  if (!config.interativo) q.set('interativo', '0');

  const serialized = q.toString();
  return serialized ? `?${serialized}` : '';
}

export function buildGithubPagesUrl(
  githubUser: string,
  repoName: string,
  config: OverlayConfig
): string {
  const cleanUser = sanitizeGithubUsername(githubUser) || 'seu-usuario';
  const cleanRepo = sanitizeRepoName(repoName);
  const query = buildOverlayQuery(config, { includeLiveFlag: false });
  return `https://${cleanUser}.github.io/${cleanRepo}/${query}`;
}

export interface RuneGlyphPlacement {
  x: number;
  y: number;
  angle: number;
  glyphPath: string;
}

const ELDER_RUNE_PATHS = [
  'M0,-12 L0,12 M0,-8 L7,-2 M0,1 L-6,7 M-5,-9 L5,-9',
  'M0,-12 L0,12 M-6,-6 L6,6 M-6,6 L0,0',
  'M-5,-11 L5,-11 M0,-11 L0,11 M0,-3 L7,4 M0,4 L-6,10',
  'M0,-12 L6,-3 L0,5 L-6,-3 Z M0,5 L0,12',
  'M-6,-10 L0,0 L6,-10 M0,0 L0,12 M-5,6 L5,6',
  'M0,-12 L0,12 M-7,-4 L7,-4 M-4,4 L6,10',
  'M-4,-11 L4,0 L-4,11 M2,-6 L7,-1',
  'M0,-12 L0,12 M0,-7 L-7,-1 M0,2 L7,8',
];

export function generateRuneRing(
  cx: number,
  cy: number,
  radius: number,
  count: number
): RuneGlyphPlacement[] {
  const items: RuneGlyphPlacement[] = [];
  for (let i = 0; i < count; i++) {
    const deg = (360 / count) * i;
    const rad = (deg * Math.PI) / 180;
    items.push({
      x: Number((cx + Math.cos(rad) * radius).toFixed(1)),
      y: Number((cy + Math.sin(rad) * radius).toFixed(1)),
      angle: Number((deg + 90).toFixed(1)),
      glyphPath: ELDER_RUNE_PATHS[i % ELDER_RUNE_PATHS.length],
    });
  }
  return items;
}

export interface EmberParticle {
  id: number;
  left: number;
  top: number;
  size: number;
  dx: number;
  dy: number;
  opacity: number;
  duration: number;
  delay: number;
  variant: 'crimson' | 'gold';
}

export interface FeatherParticle {
  id: number;
  left: number;
  top: number;
  size: number;
  dx: number;
  r0: number;
  r1: number;
  duration: number;
  delay: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDeterministicEmbers(count = 46): EmberParticle[] {
  const rand = mulberry32(26082026);
  const items: EmberParticle[] = [];
  for (let i = 0; i < count; i++) {
    const isGold = i % 3 === 0;
    items.push({
      id: i,
      left: Number((18 + rand() * 1044).toFixed(1)),
      top: Number((220 + rand() * 1720).toFixed(1)),
      size: Number((3.5 + rand() * 6.5).toFixed(1)),
      dx: Number((-55 + rand() * 110).toFixed(1)),
      dy: Number(-(220 + rand() * 480).toFixed(1)),
      opacity: Number((0.42 + rand() * 0.52).toFixed(2)),
      duration: Number((6.5 + rand() * 7.5).toFixed(2)),
      delay: Number((-rand() * 14).toFixed(2)),
      variant: isGold ? 'gold' : 'crimson',
    });
  }
  return items;
}

export function generateDeterministicFeathers(count = 7): FeatherParticle[] {
  const rand = mulberry32(991144);
  const items: FeatherParticle[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      left: Number((35 + rand() * 1010).toFixed(1)),
      top: Number((-120 + rand() * 940).toFixed(1)),
      size: Number((22 + rand() * 18).toFixed(1)),
      dx: Number((-110 + rand() * 220).toFixed(1)),
      r0: Number((-45 + rand() * 90).toFixed(1)),
      r1: Number((-150 + rand() * 300).toFixed(1)),
      duration: Number((10 + rand() * 6).toFixed(2)),
      delay: Number((-rand() * 16).toFixed(2)),
    });
  }
  return items;
}
