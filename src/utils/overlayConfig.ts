export interface OverlayConfig {
  nome: string;
  sub: string;
  rodape: string;
  fundo: boolean;
  particulas: boolean;
  arte: boolean;
  arteOpacidade: number; // 0 to 100
  runas: boolean;
  interativo: boolean;
}

export const STAGE_WIDTH = 1080;
export const STAGE_HEIGHT = 1920;

export const CUTOUTS = {
  webcam: { x: 60, y: 190, width: 960, height: 540 },
  gameplay: { x: 40, y: 892, width: 1000, height: 563 },
} as const;

/** Overlay estático publicado no GitHub Pages (fonte única do design). */
export const OVERLAY_PATH = '/overlay/';

export const DEFAULT_REPO_NAME = 'tiktok-overlay';

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  nome: 'LUMOX',
  sub: 'MAIN MORGANA · SUPORTE',
  // Várias mensagens separadas por | se alternam no rodapé do overlay
  rodape: 'BEM-VINDOS À CONGREGAÇÃO|SIGA E ENTRE PARA O COVEN|TOQUE NA TELA · DEIXE SEU LIKE',
  fundo: true,
  particulas: true,
  arte: true,
  arteOpacidade: 45,
  runas: true,
  interativo: true,
};

export function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_OVERLAY_CONFIG.arteOpacidade;
  return Math.max(0, Math.min(100, Math.round(value)));
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
      ? rodape.slice(0, 220).toUpperCase()
      : DEFAULT_OVERLAY_CONFIG.rodape,
    fundo: parseBool('fundo', DEFAULT_OVERLAY_CONFIG.fundo),
    particulas: parseBool('particulas', DEFAULT_OVERLAY_CONFIG.particulas),
    arte: parseBool('arte', DEFAULT_OVERLAY_CONFIG.arte),
    arteOpacidade: parsedOp,
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
