import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { StudioHeader, StudioTab } from './components/StudioHeader';
import {
  DEFAULT_REPO_NAME,
  OVERLAY_PATH,
  OverlayConfig,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  buildOverlayQuery,
  isOverlayLiveMode,
  parseOverlayParams,
  sanitizeRepoName,
} from './utils/overlayConfig';
import { generateGithubReadme, generateStandaloneOverlayHtml } from './utils/exportHtml';
import overlayTemplate from '../overlay/index.html?raw';
import morganaArtUrl from '../overlay/morgana.png';

function withParam(query: string, key: string, value: string): string {
  const q = new URLSearchParams(query);
  q.set(key, value);
  return `?${q.toString()}`;
}

async function loadAssetAsDataUrl(assetPath: string): Promise<string> {
  const response = await fetch(assetPath);
  if (!response.ok) {
    throw new Error('Asset fetch failed');
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not convert image to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

function triggerFileDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const isLiveOverlay = useMemo(
    () => (typeof window !== 'undefined' ? isOverlayLiveMode(window.location.search) : false),
    []
  );

  const [config, setConfig] = useState<OverlayConfig>(() =>
    typeof window !== 'undefined' ? parseOverlayParams(window.location.search) : parseOverlayParams('')
  );

  const [activeTab, setActiveTab] = useState<StudioTab>('personalizar');
  const [previewBackdrop, setPreviewBackdrop] = useState<'simulated' | 'checkerboard'>('simulated');
  const [repoName, setRepoName] = useState(DEFAULT_REPO_NAME);
  const [githubUser, setGithubUser] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const embeddedArtCache = useRef<string | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(0.36);

  // Modo live (?modo=overlay): abre direto o overlay publicado
  useEffect(() => {
    if (!isLiveOverlay) return;
    window.location.replace(`${OVERLAY_PATH}${buildOverlayQuery(config)}`);
  }, [isLiveOverlay, config]);

  // Responsive 9:16 preview sizing inside Studio
  useEffect(() => {
    if (isLiveOverlay) return;
    const updateScale = () => {
      const container = previewWrapRef.current;
      if (!container) return;
      const availWidth = Math.max(240, container.clientWidth - 24);
      const availHeight = Math.max(460, Math.min(window.innerHeight - 150, 760));
      const nextScale = Math.min(availWidth / STAGE_WIDTH, availHeight / STAGE_HEIGHT);
      setPreviewScale(Number(nextScale.toFixed(4)));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (previewWrapRef.current) observer.observe(previewWrapRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [isLiveOverlay]);

  const getEmbeddedArt = useCallback(async (): Promise<string> => {
    if (embeddedArtCache.current) return embeddedArtCache.current;
    try {
      const dataUrl = await loadAssetAsDataUrl(morganaArtUrl);
      embeddedArtCache.current = dataUrl;
      return dataUrl;
    } catch {
      return 'morgana.png';
    }
  }, []);

  const showNotice = useCallback((msg: string) => {
    setExportNotice(msg);
    window.setTimeout(() => {
      setExportNotice((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const handleDownloadHtml = useCallback(
    async (embedArt = true) => {
      setIsExporting(true);
      try {
        const artSrc = embedArt ? await getEmbeddedArt() : 'morgana.png';
        const html = generateStandaloneOverlayHtml(overlayTemplate, config, artSrc);
        triggerFileDownload('index.html', html, 'text/html;charset=utf-8');
        showNotice('index.html pronto para GitHub Pages e TikTok LIVE Studio.');
      } finally {
        setIsExporting(false);
      }
    },
    [config, getEmbeddedArt, showNotice]
  );

  const readmePreview = useMemo(
    () => generateGithubReadme(config, repoName, githubUser),
    [config, repoName, githubUser]
  );

  const handleDownloadReadme = useCallback(() => {
    triggerFileDownload('README.md', readmePreview, 'text/markdown;charset=utf-8');
    showNotice(`README.md gerado para ${sanitizeRepoName(repoName)}.`);
  }, [readmePreview, repoName, showNotice]);

  const handleCopyHtml = useCallback(async () => {
    setIsExporting(true);
    try {
      const artSrc = await getEmbeddedArt();
      const html = generateStandaloneOverlayHtml(overlayTemplate, config, artSrc);
      await navigator.clipboard.writeText(html);
      showNotice('Código HTML completo copiado para a área de transferência.');
    } catch {
      showNotice('Não foi possível copiar automaticamente — use o botão Baixar HTML.');
    } finally {
      setIsExporting(false);
    }
  }, [config, getEmbeddedArt, showNotice]);

  const handleCopyReadme = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(readmePreview);
      showNotice('README.md copiado para a área de transferência.');
    } catch {
      showNotice('Use o botão Baixar README.md para salvar o arquivo.');
    }
  }, [readmePreview, showNotice]);

  // Prévia: o próprio overlay em um iframe (recarrega com um pequeno atraso ao editar)
  const previewQuery = useMemo(() => {
    const base = buildOverlayQuery(config);
    return previewBackdrop === 'simulated' ? withParam(base, 'demo', '1') : base;
  }, [config, previewBackdrop]);
  const [previewSrc, setPreviewSrc] = useState(() => `${OVERLAY_PATH}${previewQuery}`);
  useEffect(() => {
    const id = window.setTimeout(() => setPreviewSrc(`${OVERLAY_PATH}${previewQuery}`), 400);
    return () => window.clearTimeout(id);
  }, [previewQuery]);

  const liveOverlayQuery = useMemo(
    () => buildOverlayQuery(config, { includeLiveFlag: true }),
    [config]
  );

  const liveOverlayFullUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/${liveOverlayQuery}`;
    return `${window.location.origin}/${liveOverlayQuery}`;
  }, [liveOverlayQuery]);

  // PURE LIVE OVERLAY MODE (?modo=overlay or ?live=1) — redireciona para o overlay
  if (isLiveOverlay) {
    return null;
  }

  // STUDIO MODE
  const scaledWidth = Math.round(STAGE_WIDTH * previewScale);
  const scaledHeight = Math.round(STAGE_HEIGHT * previewScale);

  return (
    <div className="min-h-screen bg-[#08070b] text-[#ede8f2]">
      <StudioHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadHtml={() => handleDownloadHtml(true)}
        isExporting={isExporting}
        liveOverlayHref={`/${liveOverlayQuery}`}
      />

      <main className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8 lg:py-7">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_470px]">
          {/* Left / Center Stage Preview Canvas */}
          <div
            ref={previewWrapRef}
            className="flex flex-col items-center rounded-xl border border-[#211b2b] bg-[#0c0a12] px-4 py-5"
          >
            <div className="mb-3.5 flex w-full max-w-[540px] items-center justify-between gap-3 text-xs text-[#9d94ad]">
              <span>
                Prévia vertical 9:16 ·{' '}
                <strong className="font-medium text-[#e7dcc4]">1080 × 1920</strong>
              </span>
              <span className="hidden sm:inline">
                Overlay estático · recortes transparentes
              </span>
            </div>

            <div
              style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}
              className={`relative overflow-hidden rounded-lg border border-[#322940] shadow-[0_24px_60px_rgba(0,0,0,0.75)] ${
                previewBackdrop === 'checkerboard' ? 'studio-checkerboard' : 'bg-[#2b2b30]'
              }`}
            >
              <iframe
                title="Prévia do overlay"
                src={previewSrc}
                width={scaledWidth}
                height={scaledHeight}
                className="block border-0"
                style={{ colorScheme: 'normal', background: 'transparent' }}
              />
            </div>

            {exportNotice && (
              <p
                role="status"
                className="mt-4 text-center text-xs font-medium text-[#ebd49b]"
              >
                {exportNotice}
              </p>
            )}
          </div>

          {/* Right Control & GitHub Publishing Panel */}
          <ControlPanel
            activeTab={activeTab}
            config={config}
            onChange={setConfig}
            previewBackdrop={previewBackdrop}
            onPreviewBackdropChange={setPreviewBackdrop}
            onDownloadHtml={handleDownloadHtml}
            onDownloadReadme={handleDownloadReadme}
            onCopyHtml={handleCopyHtml}
            onCopyReadme={handleCopyReadme}
            isExporting={isExporting}
            repoName={repoName}
            onRepoNameChange={setRepoName}
            githubUser={githubUser}
            onGithubUserChange={setGithubUser}
            liveOverlayFullUrl={liveOverlayFullUrl}
            readmePreview={readmePreview}
          />
        </div>
      </main>
    </div>
  );
}
