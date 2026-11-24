# Congregação Overlay — TikTok LIVE

Overlay vertical **1080×1920** para **TikTok LIVE Studio**, inspirado na linha de skins **Congregação das Bruxas** (League of Legends). Visual minimalista em obsidiana, prata e carmesim, com animação contínua.

- **Overlay pronto para a live:** [`overlay/index.html`](overlay/index.html) (HTML + CSS + JS puro, sem build)
- **Estúdio de personalização (React/Vite):** `src/`, gera e exporta o mesmo overlay

## O que se move

- Energia carmesim percorrendo as molduras da webcam e do gameplay
- Brasas carmesim e prateadas subindo, penas de corvo caindo e brumas luminosas (canvas, fora dos recortes)
- Névoa arcana se deslocando no fundo e a arte da Morgana "respirando" no rodapé
- Brilho correndo no nome, luz deslizando nas linhas da placa e ondas no emblema da lua crescente
- Mensagens do rodapé se alternando a cada 7 s
- Pulso arcano a cada 20 s (molduras acendem e soltam faíscas)

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

## Usar no TikTok LIVE Studio

1. **Adicionar fonte → Link** (ou *Browser source*).
2. Cole a URL acima e defina o tamanho **1080 × 1920**.
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
| `rodape` | `?rodape=BEM-VINDOS%7CSIGA%20O%20CANAL` | Mensagens do rodapé (separe com `%7C`, a barra vertical, para alternar) |
| `fundo` | `?fundo=0` | Remove o fundo escuro (mantém molduras e partículas) |
| `arte` | `?arte=0` | Esconde a arte da Morgana |
| `opacidade` | `?opacidade=60` | Opacidade da arte (0–100, padrão 45) |
| `particulas` | `?particulas=0` | Desliga as partículas |
| `runas` | `?runas=0` | Desliga o círculo rúnico |
| `interativo` | `?interativo=0` | Desliga as faíscas ao mover/clicar o mouse |
| `demo` | `?demo=1` | Mostra áreas de exemplo nos recortes (só para conferir no navegador) |
| `info` | `?info=1` | Mostra o tamanho real em que o TikTok desenha o overlay (o ideal é 1080×1920) |

## Estúdio local

```bash
npm install --legacy-peer-deps
npm run dev
```

Abra `http://localhost:3000` para editar o texto, ver a prévia ao vivo e baixar um `index.html` de arquivo único (arte embutida).
