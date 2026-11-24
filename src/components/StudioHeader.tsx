import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

export type StudioTab = 'personalizar' | 'animacoes' | 'github';

interface StudioHeaderProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onDownloadHtml: () => void;
  isExporting: boolean;
  liveOverlayHref: string;
}

const TABS: { id: StudioTab; label: string }[] = [
  { id: 'personalizar', label: 'Personalizar' },
  { id: 'animacoes', label: 'Decoração' },
  { id: 'github', label: 'GitHub & TikTok' },
];

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  activeTab,
  onTabChange,
  onDownloadHtml,
  isExporting,
  liveOverlayHref,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#251f30] bg-[#0a090f]/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M16 3 L23 14 L16 29 L9 14 Z"
              fill="#15101d"
              stroke="#c59e54"
              strokeWidth="1.6"
            />
            <path
              d="M16 10 L19.5 16 L16 22 L12.5 16 Z"
              fill="#e3264a"
            />
          </svg>
          <div className="flex items-baseline gap-2.5 whitespace-nowrap">
            <span className="font-coven text-[15px] font-bold tracking-[0.14em] text-[#f3e6cc]">
              CONGREGAÇÃO
            </span>
            <span className="hidden text-xs text-[#8f879e] sm:inline">
              Coven Morgana · 1080×1920
            </span>
          </div>
        </div>

        {/* Zone 2: Clean Single-Line Tab Navigation */}
        <nav aria-label="Seções do estúdio" className="flex items-center gap-1 sm:gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54] ${
                  isActive
                    ? 'bg-[#1a1524] text-[#f6ead2] border border-[#3a2f46]'
                    : 'text-[#a39bb2] hover:text-[#ece5f5] hover:bg-[#14111c]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={liveOverlayHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-[#2d2638] bg-[#13101a] px-3 py-2 text-xs font-medium text-[#d8cfe4] transition-colors hover:border-[#c59e54]/50 hover:text-[#f8edd4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59e54] md:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Modo tela cheia
          </a>
          <button
            type="button"
            onClick={onDownloadHtml}
            disabled={isExporting}
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md bg-[#b81d3d] px-4 py-2 text-xs font-semibold text-[#fff7f0] transition-colors hover:bg-[#d12447] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3e3ba]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {isExporting ? 'Gerando...' : 'Baixar HTML'}
          </button>
        </div>
      </div>
    </header>
  );
};
