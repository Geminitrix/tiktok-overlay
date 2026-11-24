import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  Flame,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_OVERLAY_CONFIG,
  OverlayConfig,
  buildGithubPagesUrl,
  sanitizeGithubUsername,
  sanitizeRepoName,
} from '../utils/overlayConfig';
import { StudioTab } from './StudioHeader';

interface ControlPanelProps {
  activeTab: StudioTab;
  config: OverlayConfig;
  onChange: (next: OverlayConfig) => void;
  previewBackdrop: 'simulated' | 'checkerboard';
  onPreviewBackdropChange: (mode: 'simulated' | 'checkerboard') => void;
  onTriggerSurge: () => void;
  onDownloadHtml: (embedArt: boolean) => void;
  onDownloadReadme: () => void;
  onCopyHtml: () => Promise<void>;
  onCopyReadme: () => Promise<void>;
  isExporting: boolean;
  repoName: string;
  onRepoNameChange: (val: string) => void;
  githubUser: string;
  onGithubUserChange: (val: string) => void;
  liveOverlayFullUrl: string;
  readmePreview: string;
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  id,
  label,
  description,
  checked,
  onToggle,
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-[#1f1a28] py-3.5 last:border-b-0">
    <div className="min-w-0">
      <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-[#eee8f5]">
        {label}
      </label>
      <p className="mt-0.5 text-xs leading-relaxed text-[#948ca4]">{description}</p>
    </div>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onToggle(!checked)}
      className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54] ${
        checked
          ? 'border-[#e3264a] bg-[#b81d3d]'
          : 'border-[#332c40] bg-[#16121f]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-[#f8f1e1] transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeTab,
  config,
  onChange,
  previewBackdrop,
  onPreviewBackdropChange,
  onTriggerSurge,
  onDownloadHtml,
  onDownloadReadme,
  onCopyHtml,
  onCopyReadme,
  isExporting,
  repoName,
  onRepoNameChange,
  githubUser,
  onGithubUserChange,
  liveOverlayFullUrl,
  readmePreview,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const flashCopied = (key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(key);
    } catch {
      // Fallback for restricted clipboard contexts
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      flashCopied(key);
    }
  };

  const cleanRepo = sanitizeRepoName(repoName);
  const cleanUser = sanitizeGithubUsername(githubUser) || 'seu-usuario';
  const pagesUrl = buildGithubPagesUrl(cleanUser, cleanRepo, config);
  const createRepoHref = `https://github.com/new?name=${encodeURIComponent(
    cleanRepo
  )}&description=${encodeURIComponent(
    'Vertical 1080x1920 TikTok Live HTML overlay inspired by League of Legends Coven Morgana (Congregação das Bruxas).'
  )}&visibility=public`;

  const gitCommands = [
    `git init`,
    `git add index.html README.md`,
    `git commit -m "feat: add Coven Morgana vertical TikTok Live overlay"`,
    `git branch -M main`,
    `git remote add origin https://github.com/${cleanUser}/${cleanRepo}.git`,
    `git push -u origin main`,
  ].join('\n');

  return (
    <section
      aria-label="Painel de configuração do overlay"
      className="flex flex-col border border-[#231d2d] bg-[#0e0c14] rounded-xl overflow-hidden"
    >
      {/* Tab 1: Personalizar */}
      {activeTab === 'personalizar' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#1f1a28] pb-3.5">
            <div>
              <h1 className="font-coven text-lg font-bold tracking-[0.06em] text-[#f4e7cd]">
                Identidade da Live
              </h1>
              <p className="mt-0.5 text-xs text-[#948ca4]">
                Os recortes 16:9 de câmera e gameplay mantêm exatamente o encaixe original.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange(DEFAULT_OVERLAY_CONFIG)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-[#2a2335] px-2.5 py-1.5 text-xs text-[#b5adc4] transition-colors hover:border-[#c59e54]/50 hover:text-[#f5e7cb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restaurar
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="input-nome"
                className="mb-1 block text-xs font-medium tracking-wide text-[#cfc6db]"
              >
                Nome na placa central
              </label>
              <input
                id="input-nome"
                type="text"
                maxLength={26}
                value={config.nome}
                onChange={(e) => onChange({ ...config, nome: e.target.value })}
                placeholder="LUMOX"
                className="w-full rounded-lg border border-[#2c2538] bg-[#14111c] px-3 py-2 text-sm text-[#f7f2fa] placeholder-[#6f677f] transition-colors focus:border-[#c59e54] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="input-sub"
                className="mb-1 block text-xs font-medium tracking-wide text-[#cfc6db]"
              >
                Subtítulo da placa
              </label>
              <input
                id="input-sub"
                type="text"
                maxLength={48}
                value={config.sub}
                onChange={(e) => onChange({ ...config, sub: e.target.value })}
                placeholder="MAIN MORGANA · SUPORTE"
                className="w-full rounded-lg border border-[#2c2538] bg-[#14111c] px-3 py-2 text-sm text-[#f7f2fa] placeholder-[#6f677f] transition-colors focus:border-[#c59e54] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="input-rodape"
                className="mb-1 block text-xs font-medium tracking-wide text-[#cfc6db]"
              >
                Mensagens do rodapé (separe com | para alternar)
              </label>
              <input
                id="input-rodape"
                type="text"
                maxLength={220}
                value={config.rodape}
                onChange={(e) => onChange({ ...config, rodape: e.target.value })}
                placeholder="BEM-VINDOS|SIGA O CANAL|DEIXE SEU LIKE"
                className="w-full rounded-lg border border-[#2c2538] bg-[#14111c] px-3 py-2 text-sm text-[#f7f2fa] placeholder-[#6f677f] transition-colors focus:border-[#c59e54] focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[#1f1a28] pt-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c59e54]">
              Composição & Arte da Morgana
            </h2>

            <div className="mt-1">
              <ToggleRow
                id="toggle-fundo"
                label="Fundo escuro da floresta"
                description="Obsidiana com névoa carmesim e petróleo em movimento, fora dos recortes."
                checked={config.fundo}
                onToggle={(fundo) => onChange({ ...config, fundo })}
              />

              <ToggleRow
                id="toggle-arte"
                label="Arte da Morgana no rodapé"
                description="Splash art com fusão suave na base, sem disputar atenção com o chat."
                checked={config.arte}
                onToggle={(arte) => onChange({ ...config, arte })}
              />
            </div>

            {config.arte && config.fundo && (
              <div className="mt-2 rounded-lg border border-[#221c2d] bg-[#13101a] px-3.5 py-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="slider-opacidade" className="font-medium text-[#d8cfe4]">
                    Opacidade da arte
                  </label>
                  <span className="font-code tabular-nums text-[#e8cf97]">
                    {config.arteOpacidade}%
                  </span>
                </div>
                <input
                  id="slider-opacidade"
                  type="range"
                  min={15}
                  max={100}
                  step={1}
                  value={config.arteOpacidade}
                  onChange={(e) =>
                    onChange({ ...config, arteOpacidade: Number(e.target.value) })
                  }
                  className="mt-2 h-1.5 w-full cursor-pointer accent-[#c59e54]"
                />
              </div>
            )}
          </div>

          {/* Preview Backdrop Switcher */}
          <div className="border-t border-[#1f1a28] pt-4">
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#c59e54]">
              Fundo da prévia no estúdio
            </span>
            <p className="mt-1 text-xs text-[#948ca4]">
              Apenas visual para teste — no HTML exportado os recortes ficam 100% transparentes.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onPreviewBackdropChange('simulated')}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54] ${
                  previewBackdrop === 'simulated'
                    ? 'border-[#c59e54] bg-[#1c1726] text-[#f8ecd2]'
                    : 'border-[#262032] bg-[#120f19] text-[#a39bb2] hover:text-[#ece5f5]'
                }`}
              >
                Simular câmera e jogo
              </button>
              <button
                type="button"
                onClick={() => onPreviewBackdropChange('checkerboard')}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54] ${
                  previewBackdrop === 'checkerboard'
                    ? 'border-[#c59e54] bg-[#1c1726] text-[#f8ecd2]'
                    : 'border-[#262032] bg-[#120f19] text-[#a39bb2] hover:text-[#ece5f5]'
                }`}
              >
                Grade transparente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Animações & Interatividade */}
      {activeTab === 'animacoes' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="border-b border-[#1f1a28] pb-4">
            <h1 className="font-coven text-lg font-bold tracking-[0.06em] text-[#f4e7cd]">
              Animações e Interações
            </h1>
            <p className="mt-1 text-xs text-[#948ca4]">
              Efeitos leves em GPU que mantêm a live fluida e nunca cobrem a câmera ou gameplay.
            </p>
          </div>

          <div>
            <ToggleRow
              id="toggle-particulas"
              label="Brasas arcanas e penas de corvo"
              description="Brasas carmesim e prateadas subindo, penas caindo e brumas luminosas, desenhadas fora dos recortes."
              checked={config.particulas}
              onToggle={(particulas) => onChange({ ...config, particulas })}
            />
            <ToggleRow
              id="toggle-runas"
              label="Círculo rúnico"
              description="Runas antigas girando lentamente atrás da arte da Morgana, no rodapé."
              checked={config.runas}
              onToggle={(runas) => onChange({ ...config, runas })}
            />
            <ToggleRow
              id="toggle-interativo"
              label="Faíscas interativas"
              description="Mover o mouse ou clicar fora dos recortes solta faíscas carmesim."
              checked={config.interativo}
              onToggle={(interativo) => onChange({ ...config, interativo })}
            />
          </div>

          <div className="border-t border-[#1f1a28] pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c59e54]">
              Testar efeitos na prévia
            </h2>
            <p className="mt-1 text-xs text-[#948ca4]">
              O pulso também dispara sozinho a cada 20 segundos durante a live.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={onTriggerSurge}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#4a1c2a] bg-[#220e16] px-3.5 py-2.5 text-xs font-medium text-[#ffd6de] transition-colors hover:border-[#e3264a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e3264a]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#ff4d6d]" aria-hidden="true" />
                Pulso arcano
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#221c2c] bg-[#120f18] p-3.5 text-xs leading-relaxed text-[#a69eb6]">
            <div className="flex items-center gap-2 font-medium text-[#e8d5ad]">
              <Flame className="h-3.5 w-3.5 text-[#e8983e]" aria-hidden="true" />
              Desempenho para live
            </div>
            <p className="mt-1">
              Todas as animações usam transformações aceleradas em GPU e respeitam os recortes
              transparentes (<span className="font-code text-[#d8cfe4]">clip-path: evenodd</span>),
              mantendo baixo uso de CPU no TikTok LIVE Studio.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: GitHub & TikTok LIVE Studio */}
      {activeTab === 'github' && (
        <div className="p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#1f1a28] pb-4">
            <h1 className="font-coven text-lg font-bold tracking-[0.06em] text-[#f4e7cd]">
              Publicar no GitHub & TikTok
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-[#948ca4]">
              Como este estúdio não acessa sua conta pessoal do GitHub, geramos o pacote pronto do
              repositório <span className="font-code text-[#e8d5ad]">{cleanRepo}</span> para você
              publicar no GitHub Pages em 1 minuto.
            </p>
          </div>

          {/* Repo Name & Username Inputs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="input-repo-name"
                className="mb-1 block text-xs font-medium text-[#cfc6db]"
              >
                Nome do repositório
              </label>
              <input
                id="input-repo-name"
                type="text"
                value={repoName}
                onChange={(e) => onRepoNameChange(e.target.value)}
                placeholder="tiktok-overlay"
                className="w-full rounded-lg border border-[#2c2538] bg-[#14111c] px-3 py-2 font-code text-xs text-[#f5effa] focus:border-[#c59e54] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="input-gh-user"
                className="mb-1 block text-xs font-medium text-[#cfc6db]"
              >
                Seu usuário do GitHub
              </label>
              <input
                id="input-gh-user"
                type="text"
                value={githubUser}
                onChange={(e) => onGithubUserChange(e.target.value)}
                placeholder="seu-usuario"
                className="w-full rounded-lg border border-[#2c2538] bg-[#14111c] px-3 py-2 font-code text-xs text-[#f5effa] focus:border-[#c59e54] focus:outline-none"
              />
            </div>
          </div>

          {/* Download / Copy Repository Files */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#c59e54]">
              Arquivos do repositório
            </span>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onDownloadHtml(true)}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#b81d3d] px-3.5 py-2.5 text-xs font-semibold text-[#fff7f0] transition-colors hover:bg-[#d12447] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3e3ba]"
              >
                <FileCode2 className="h-4 w-4" aria-hidden="true" />
                {isExporting ? 'Gerando...' : 'Baixar index.html'}
              </button>

              <button
                type="button"
                onClick={onDownloadReadme}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#322940] bg-[#161220] px-3.5 py-2.5 text-xs font-medium text-[#f2e8f8] transition-colors hover:border-[#c59e54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54]"
              >
                <FileText className="h-4 w-4 text-[#c59e54]" aria-hidden="true" />
                Baixar README.md
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await onCopyHtml();
                  flashCopied('html');
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#272033] bg-[#120f19] px-3 py-2 text-xs text-[#cdc4dc] transition-colors hover:border-[#c59e54]/60 hover:text-[#f8edd4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54]"
              >
                {copiedKey === 'html' ? (
                  <Check className="h-3.5 w-3.5 text-[#4ade80]" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copiedKey === 'html' ? 'HTML copiado' : 'Copiar código HTML'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  await onCopyReadme();
                  flashCopied('readme');
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#272033] bg-[#120f19] px-3 py-2 text-xs text-[#cdc4dc] transition-colors hover:border-[#c59e54]/60 hover:text-[#f8edd4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54]"
              >
                {copiedKey === 'readme' ? (
                  <Check className="h-3.5 w-3.5 text-[#4ade80]" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copiedKey === 'readme' ? 'README copiado' : 'Copiar README.md'}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-[#8d849d]">
              O <span className="font-code text-[#d8cfe4]">index.html</span> já embute a imagem da
              Morgana em base64 para funcionar em arquivo único no GitHub Pages e no TikTok LIVE
              Studio sem caminhos quebrados.
            </p>
          </div>

          {/* 4-Step GitHub Pages + TikTok Guide */}
          <div className="border-t border-[#1f1a28] pt-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c59e54]">
                Passo a passo (GitHub Pages → TikTok)
              </span>
              <a
                href={createRepoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-[#f0c97a] hover:underline"
              >
                Criar repo no GitHub
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>

            <ol className="space-y-2 text-xs leading-relaxed text-[#cfc6db] list-decimal pl-4">
              <li>
                Clique em <strong className="text-[#f5e7cb]">Criar repo no GitHub</strong> (já vem
                preenchido como público <span className="font-code">{cleanRepo}</span>).
              </li>
              <li>
                Envie o <span className="font-code">index.html</span> e o{' '}
                <span className="font-code">README.md</span> baixados acima (via{' '}
                <em>Upload files</em> ou pelos comandos git abaixo).
              </li>
              <li>
                No repositório, abra <strong>Settings → Pages</strong>, selecione{' '}
                <strong>Branch: main</strong> e <strong>/ (root)</strong> e salve.
              </li>
              <li>
                No <strong>TikTok LIVE Studio</strong>, adicione uma fonte{' '}
                <strong>Link / Browser Source</strong> em <strong>1080 × 1920</strong> com a URL
                abaixo:
              </li>
            </ol>

            {/* Generated GitHub Pages URL */}
            <div className="rounded-lg border border-[#282135] bg-[#120f19] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#a39bb2]">
                  URL do GitHub Pages (pronta para o TikTok)
                </span>
                <button
                  type="button"
                  onClick={() => copyText('pages-url', pagesUrl)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#f0c97a] hover:underline focus-visible:outline-none"
                >
                  {copiedKey === 'pages-url' ? 'Copiado' : 'Copiar URL'}
                </button>
              </div>
              <p
                data-testid="github-pages-url"
                className="mt-1.5 break-all font-code text-[11px] text-[#f3e6cc]"
              >
                {pagesUrl}
              </p>
            </div>

            {/* Direct Live Preview URL from this App */}
            <div className="rounded-lg border border-[#241e30] bg-[#110e17] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#a39bb2]">
                  Link direto de prévia em tela cheia
                </span>
                <button
                  type="button"
                  onClick={() => copyText('live-url', liveOverlayFullUrl)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#d8cfe4] hover:text-[#f8edd4] hover:underline focus-visible:outline-none"
                >
                  {copiedKey === 'live-url' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p
                data-testid="live-overlay-url"
                className="mt-1.5 break-all font-code text-[11px] text-[#b8afc7]"
              >
                {liveOverlayFullUrl}
              </p>
            </div>

            {/* Collapsible Git CLI + README Preview */}
            <details className="rounded-lg border border-[#221c2d] bg-[#110e17]">
              <summary className="cursor-pointer select-none px-3 py-2.5 text-xs font-medium text-[#d8cfe4] hover:text-[#f5e7cb]">
                Comandos Git (opcional) e prévia do README.md
              </summary>
              <div className="border-t border-[#1f1a28] p-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#948ca4]">Terminal / Git</span>
                    <button
                      type="button"
                      onClick={() => copyText('git', gitCommands)}
                      className="text-[11px] font-medium text-[#f0c97a] hover:underline"
                    >
                      {copiedKey === 'git' ? 'Copiado' : 'Copiar comandos'}
                    </button>
                  </div>
                  <pre className="mt-1.5 overflow-x-auto rounded bg-[#09080d] p-2.5 font-code text-[11px] leading-relaxed text-[#d9d0e5]">
                    {gitCommands}
                  </pre>
                </div>
                <div>
                  <span className="text-[11px] text-[#948ca4]">Prévia do README.md</span>
                  <pre className="mt-1.5 max-h-40 overflow-auto rounded bg-[#09080d] p-2.5 font-code text-[11px] leading-relaxed text-[#b8afc7] whitespace-pre-wrap">
                    {readmePreview}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </section>
  );
};
