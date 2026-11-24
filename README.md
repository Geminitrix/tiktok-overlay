# Congregação Overlay — TikTok LIVE

Overlay vertical **1080×1920** para **TikTok LIVE Studio**, inspirado na linha de skins **Congregação das Bruxas** (League of Legends). Visual minimalista em obsidiana, prata e carmesim, **totalmente estático**: sem animações e sem nada rodando em loop, para pesar o mínimo possível na live.

- **Imagem pronta (recomendado):** [`overlay/overlay.png`](overlay/overlay.png) — PNG 1080×1920 com os recortes transparentes
- **Versão em link (HTML):** [`overlay/index.html`](overlay/index.html) — personalizável pela URL
- **Estúdio de personalização (React/Vite):** `src/` — gera e exporta o mesmo overlay

No rodapé ficam fixas as três frases: **Bem-vindos à Congregação**, **Siga e entre para o Coven** e **Toque na tela · Deixe seu like**.

## Usar como imagem no TikTok LIVE Studio (mais leve e mais nítido)

1. Baixe a imagem: abra `https://geminitrix.github.io/tiktok-overlay/overlay/overlay.png`, clique com o botão direito e escolha **Salvar imagem como…**
2. No TikTok LIVE Studio: **Adicionar fonte → Imagem** e escolha o arquivo `overlay.png`.
3. Clique com o botão direito na fonte → **Tela cheia → Esticar para a tela** (ou **Ajustar à tela**).
4. Deixe a imagem **acima** da webcam e do jogo na lista de fontes e encaixe-os nos recortes.

Uma imagem não precisa de navegador por trás, então pesa bem menos que uma fonte Link e aparece sempre em 1080×1920.

## Recortes transparentes

| Área | Posição | Tamanho |
| :--- | :--- | :--- |
| Webcam | x 60, y 190 | 960 × 540 |
| Gameplay | x 40, y 892 | 1000 × 563 |

## Publicar no GitHub Pages

1. No GitHub, abra **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**, branch **main** e pasta **/ (root)**, e clique em **Save**.
3. Depois de ~1 minuto, o overlay fica em:

   ```text
   https://geminitrix.github.io/tiktok-overlay/overlay/
   ```

## Usar como link no TikTok LIVE Studio

1. **Adicionar fonte → Link** (ou *Browser source*).
2. Cole a URL acima e ligue **Resolução personalizada** com **1080 × 1920**.
3. Coloque a fonte do overlay **acima** da webcam e do jogo na lista de camadas.
4. Encaixe a webcam e o jogo nas posições da tabela de recortes.

## Overlay borrado?

O overlay é desenhado no tamanho da área do link. Se o TikTok LIVE Studio cria essa área menor que 1080×1920 e você estica a fonte depois, a imagem é ampliada e perde qualidade. Abra o link com `?info=1` para ver o tamanho real: a etiqueta verde indica qualidade máxima e a vermelha indica que vai borrar.

- Se a fonte Link tiver campos de largura e altura, use **1080 × 1920** em vez de esticar.
- Se não tiver, use o OBS: crie uma cena 1080×1920 com uma fonte de navegador 1080×1920 apontando para o link, ligue a **Câmera Virtual** e adicione essa câmera no TikTok LIVE Studio.

## Personalização pela URL

Exemplo: `https://geminitrix.github.io/tiktok-overlay/overlay/?nome=LUMOX&sub=MAIN%20MORGANA`

| Parâmetro | Exemplo | Efeito |
| :--- | :--- | :--- |
| `nome` | `?nome=LUMOX` | Nick principal |
| `sub` | `?sub=MAIN%20MORGANA` | Subtítulo |
| `rodape` | `?rodape=BEM-VINDOS%7CSIGA%20O%20CANAL%7CDEIXE%20SEU%20LIKE` | As 3 frases do rodapé, separadas por `%7C` (barra vertical) |
| `fundo` | `?fundo=0` | Remove o fundo escuro (mantém molduras) |
| `arte` | `?arte=0` | Esconde a arte da Morgana |
| `opacidade` | `?opacidade=60` | Opacidade da arte (0–100, padrão 45) |
| `particulas` | `?particulas=0` | Tira as brasas e penas decorativas |
| `runas` | `?runas=0` | Tira o círculo rúnico |
| `demo` | `?demo=1` | Mostra áreas de exemplo nos recortes (só para conferir no navegador) |
| `info` | `?info=1` | Mostra o tamanho real em que o TikTok desenha o overlay (o ideal é 1080×1920) |

## Estúdio local

```bash
npm install --legacy-peer-deps
npm run dev
```

Abra `http://localhost:3000` para editar o texto, ver a prévia e baixar um `index.html` de arquivo único (arte embutida).

Para gerar de novo o `overlay/overlay.png` depois de mudar o HTML, tire um print de `overlay/index.html` em 1080×1920 com fundo transparente (por exemplo, com o Playwright: `page.screenshot({ omitBackground: true })`).
