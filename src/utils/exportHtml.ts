import {
  DEFAULT_REPO_NAME,
  OverlayConfig,
  buildGithubPagesUrl,
  clampOpacity,
  sanitizeGithubUsername,
  sanitizeRepoName,
} from './overlayConfig';

const CONFIG_BLOCK_RE =
  /(<script id="coven-config" type="application\/json">)[\s\S]*?(<\/script>)/;
const ART_SRC_RE = /src="morgana\.png"/;

/** Torna um JSON seguro para ficar dentro de uma tag <script>. */
function jsonForScriptTag(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Gera o overlay final a partir do template em `overlay/index.html`:
 * grava a configuração escolhida no bloco `coven-config` e troca a arte
 * por `artSrc` (normalmente um data URL, para funcionar como arquivo único).
 */
export function generateStandaloneOverlayHtml(
  template: string,
  config: OverlayConfig,
  artSrc = 'morgana.png'
): string {
  if (!CONFIG_BLOCK_RE.test(template)) {
    throw new Error('Template do overlay sem o bloco coven-config.');
  }
  const embedded = {
    nome: config.nome.trim().toUpperCase() || 'LUMOX',
    sub: config.sub.trim().toUpperCase(),
    rodape: config.rodape.trim().toUpperCase(),
    fundo: config.fundo,
    arte: config.arte,
    opacidade: clampOpacity(config.arteOpacidade),
    particulas: config.particulas,
    runas: config.runas,
    interativo: config.interativo,
  };
  const safeArt = artSrc.replace(/"/g, '%22');
  return template
    .replace(CONFIG_BLOCK_RE, (_m, open: string, close: string) => `${open}${jsonForScriptTag(embedded)}${close}`)
    .replace(ART_SRC_RE, () => `src="${safeArt}"`);
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

Overlay vertical **1080×1920** para **TikTok LIVE Studio / OBS**, inspirado na linha de skins **Congregação das Bruxas (League of Legends)**.

## Destaques

- **Recortes transparentes exatos (16:9)**:
  - Webcam: \`x=60, y=190, 960×540\`
  - Gameplay: \`x=40, y=892, 1000×563\`
- **Visual minimalista**: obsidiana, prata e carmesim, lua crescente da Congregação e molduras finas com cantos em lâmina.
- **Animações fluidas**: energia carmesim percorrendo as molduras, brasas e penas em canvas, névoa arcana, brilho no nome, mensagens alternadas no rodapé e um pulso arcano periódico.

## Como usar no GitHub Pages + TikTok LIVE Studio

1. Crie um repositório público no GitHub com o nome \`${cleanRepo}\`.
2. Envie o arquivo \`index.html\` (com a arte já embutida) e este \`README.md\` para a branch \`main\`.
3. Acesse **Settings → Pages**, em **Build and deployment** selecione **Branch: main** e **/ (root)** e clique em **Save**.
4. Aguarde ~1 minuto e copie o endereço publicado:
   \`\`\`text
   ${pagesUrl}
   \`\`\`
5. No **TikTok LIVE Studio**, adicione uma fonte **Link / Browser Source** com resolução **1080 × 1920** e cole a URL acima.

## Personalização via URL

| Parâmetro | Exemplo | Efeito |
| :--- | :--- | :--- |
| \`nome\` | \`?nome=${encodeURIComponent(config.nome || 'LUMOX')}\` | Nick principal na placa |
| \`sub\` | \`?sub=${encodeURIComponent(config.sub || 'MAIN MORGANA · SUPORTE')}\` | Subtítulo |
| \`rodape\` | \`?rodape=BEM-VINDOS%7CSIGA%20O%20CANAL\` | Mensagens do rodapé (separe com barra vertical, \`%7C\`, para alternar) |
| \`fundo\` | \`?fundo=0\` | Remove o fundo escuro (mantém molduras e partículas) |
| \`arte\` | \`?arte=0\` | Oculta a arte da Morgana no rodapé |
| \`opacidade\` | \`?opacidade=${clampOpacity(config.arteOpacidade)}\` | Opacidade da arte (0–100) |
| \`particulas\` | \`?particulas=0\` | Desliga brasas e penas |
| \`runas\` | \`?runas=0\` | Desliga o círculo rúnico |
| \`interativo\` | \`?interativo=0\` | Desliga as faíscas ao mover/clicar o mouse |
| \`demo\` | \`?demo=1\` | Mostra áreas de exemplo nos recortes (só para conferir) |
`;
}
