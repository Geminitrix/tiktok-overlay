import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CUTOUTS,
  DEFAULT_OVERLAY_CONFIG,
  DEFAULT_REPO_NAME,
  buildGithubPagesUrl,
  buildOverlayQuery,
  clampOpacity,
  isOverlayLiveMode,
  parseOverlayParams,
  sanitizeRepoName,
} from './overlayConfig';
import { generateGithubReadme, generateStandaloneOverlayHtml } from './exportHtml';

const template = readFileSync(new URL('../../overlay/index.html', import.meta.url), 'utf8');

test('parseOverlayParams preserves defaults and respects original backwards-compatible params', () => {
  const defaults = parseOverlayParams('');
  assert.deepEqual(defaults, DEFAULT_OVERLAY_CONFIG);

  const custom = parseOverlayParams(
    '?fundo=0&nome=MorganaBR&sub=Suporte%20Mestre&particulas=0&arte=0&opacidade=30&runas=0&rodape=Oi%7CSiga'
  );
  assert.equal(custom.fundo, false);
  assert.equal(custom.nome, 'MORGANABR');
  assert.equal(custom.sub, 'SUPORTE MESTRE');
  assert.equal(custom.particulas, false);
  assert.equal(custom.arte, false);
  assert.equal(custom.arteOpacidade, 30);
  assert.equal(custom.runas, false);
  assert.equal(custom.rodape, 'OI|SIGA');
});

test('isOverlayLiveMode detects modo=overlay and live=1', () => {
  assert.equal(isOverlayLiveMode('?modo=overlay'), true);
  assert.equal(isOverlayLiveMode('?live=1&nome=LUMOX'), true);
  assert.equal(isOverlayLiveMode('?nome=LUMOX'), false);
});

test('buildOverlayQuery omits default values and serializes overrides cleanly', () => {
  assert.equal(buildOverlayQuery(DEFAULT_OVERLAY_CONFIG), '');
  assert.equal(
    buildOverlayQuery(DEFAULT_OVERLAY_CONFIG, { includeLiveFlag: true }),
    '?modo=overlay'
  );

  const query = buildOverlayQuery({
    ...DEFAULT_OVERLAY_CONFIG,
    nome: 'COVEN QUEEN',
    fundo: false,
    runas: false,
  });
  assert.match(query, /nome=COVEN\+QUEEN/);
  assert.match(query, /fundo=0/);
  assert.match(query, /runas=0/);
});

test('sanitizeRepoName and buildGithubPagesUrl generate valid GitHub Pages URLs', () => {
  assert.equal(sanitizeRepoName('Witch Gathering Overlay!'), 'witch-gathering-overlay');
  assert.equal(sanitizeRepoName('   '), DEFAULT_REPO_NAME);
  assert.equal(clampOpacity(140), 100);
  assert.equal(clampOpacity(-15), 0);

  const url = buildGithubPagesUrl('lumoxgg', 'tiktok-overlay', {
    ...DEFAULT_OVERLAY_CONFIG,
    nome: 'LUMOX',
  });
  assert.equal(url, 'https://lumoxgg.github.io/tiktok-overlay/');
});

test('overlay template keeps the exact 1080x1920 transparent cutouts', () => {
  const { webcam, gameplay } = CUTOUTS;
  const clip = `M${webcam.x} ${webcam.y}H${webcam.x + webcam.width}V${webcam.y + webcam.height}H${webcam.x}Z M${gameplay.x} ${gameplay.y}H${gameplay.x + gameplay.width}V${gameplay.y + gameplay.height}H${gameplay.x}Z`;
  assert.ok(template.includes(clip));
  assert.ok(!/raven|vela|candle/i.test(template));
  // versão estática: nada animado ou rodando em loop
  assert.ok(!/@keyframes|animation|requestAnimationFrame|setInterval/.test(template));
});

test('generateStandaloneOverlayHtml embeds config safely and inlines the art', () => {
  const html = generateStandaloneOverlayHtml(
    template,
    {
      ...DEFAULT_OVERLAY_CONFIG,
      nome: '</script><script>alert(1)</script>',
      sub: 'MAIN "MORGANA" & SUPORTE',
      particulas: false,
    },
    'data:image/png;base64,TESTDATA'
  );

  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('src="data:image/png;base64,TESTDATA"'));
  assert.ok(!html.includes('src="morgana.png"'));

  const block = html.match(/<script id="coven-config" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(block);
  const parsed = JSON.parse(block[1]);
  assert.equal(parsed.nome, '</SCRIPT><SCRIPT>ALERT(1)</SCRIPT>');
  assert.equal(parsed.sub, 'MAIN "MORGANA" & SUPORTE');
  assert.equal(parsed.particulas, false);
});

test('generateGithubReadme documents repository name, cutouts, and query parameters', () => {
  const readme = generateGithubReadme(DEFAULT_OVERLAY_CONFIG, 'tiktok-overlay', 'lumox');
  assert.ok(readme.includes('# tiktok-overlay'));
  assert.ok(readme.includes('https://lumox.github.io/tiktok-overlay/'));
  assert.ok(readme.includes('1080×1920'));
  assert.ok(readme.includes('?fundo=0'));
});
