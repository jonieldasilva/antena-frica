// ────────────────────────────────────────────────────────────────────────────
//  Antena África — Slides Generator
//  Figma Plugin · creates all 12 presentation slides as 1920×1080 frames
// ────────────────────────────────────────────────────────────────────────────

const W   = 1920;
const H   = 1080;
const GAP = 160;

// Font scale — the HTML deck fills a ~1440px viewport; Figma frames are 1920px.
// To match the same visual proportion: 1920 / 1440 = 4/3 ≈ 1.333
const FS = 4 / 3;
const sf = n => Math.round(n * FS);

const C = {
  ink:   { r: 0.075, g: 0.059, b: 0.039 },
  sand:  { r: 0.867, g: 0.835, b: 0.769 },
  earth: { r: 0.290, g: 0.235, b: 0.188 },
  mid:   { r: 0.137, g: 0.102, b: 0.071 },
  sand2: { r: 0.784, g: 0.745, b: 0.659 },
};

// ── Font loading (Inter always available as fallback) ─────────────────────────
const FONT_MAP = {
  'Light':   { family: 'Jost', style: 'Light' },
  'Regular': { family: 'Jost', style: 'Regular' },
  'Medium':  { family: 'Jost', style: 'Medium' },
  'Bold':    { family: 'Jost', style: 'Bold' },
  'Black':   { family: 'Jost', style: 'Black' },
};
const FALLBACK = {
  'Light':   { family: 'Inter', style: 'Regular' },
  'Regular': { family: 'Inter', style: 'Regular' },
  'Medium':  { family: 'Inter', style: 'Medium' },
  'Bold':    { family: 'Inter', style: 'Bold' },
  'Black':   { family: 'Inter', style: 'Bold' },
};
const resolvedFonts = {};

async function loadFonts() {
  for (const [key, font] of Object.entries(FONT_MAP)) {
    try {
      await figma.loadFontAsync(font);
      resolvedFonts[key] = font;
    } catch (e) {
      console.warn(`Jost ${key} not available, falling back to Inter`);
      await figma.loadFontAsync(FALLBACK[key]);
      resolvedFonts[key] = FALLBACK[key];
    }
  }
}

// ── Primitives ───────────────────────────────────────────────────────────────
function mkFrame(name, x, bg) {
  const f = figma.createFrame();
  f.name = name;
  f.x = x; f.y = 0;
  f.resize(W, H);
  f.fills = [{ type: 'SOLID', color: bg }];
  f.clipsContent = true;
  return f;
}

function mkRect(parent, x, y, w, h, color, opacity, radius) {
  if (w <= 0) w = 0.5;
  if (h <= 0) h = 0.5;
  const r = figma.createRectangle();
  r.x = x; r.y = y;
  r.resize(w, h);
  r.fills = [{ type: 'SOLID', color, opacity: opacity !== undefined ? opacity : 1 }];
  if (radius) r.cornerRadius = radius;
  parent.appendChild(r);
  return r;
}

function mkEllipse(parent, cx, cy, size, strokeColor, strokeOpacity, strokeW) {
  const e = figma.createEllipse();
  e.resize(size, size);
  e.x = cx - size / 2;
  e.y = cy - size / 2;
  e.fills = [];
  e.strokes = [{ type: 'SOLID', color: strokeColor, opacity: strokeOpacity }];
  e.strokeWeight = strokeW || 1;
  parent.appendChild(e);
  return e;
}

function mkText(parent, chars, x, y, fontSize, styleKey, color, opts) {
  opts = opts || {};
  const t = figma.createText();
  t.fontName = resolvedFonts[styleKey];
  t.fontSize = fontSize;
  t.characters = chars;
  t.fills = [{ type: 'SOLID', color }];
  t.x = x; t.y = y;
  if (opts.width) { t.textAutoResize = 'HEIGHT'; t.resize(opts.width, Math.max(t.height, 1)); }
  if (opts.lineHeight  !== undefined) t.lineHeight    = { value: opts.lineHeight,    unit: 'PERCENT' };
  if (opts.letterSpacing !== undefined) t.letterSpacing = { value: opts.letterSpacing, unit: 'PERCENT' };
  if (opts.textCase)                  t.textCase       = opts.textCase;
  parent.appendChild(t);
  return t;
}

function mkRule(parent, x, y, color, opacity, w) {
  mkRect(parent, x, y, w || 48, 1, color, opacity !== undefined ? opacity : 0.30);
}

function mkWaves(parent, x, y, color, opacity) {
  [8, 14, 20, 26, 20, 12, 7].forEach((h, i) => {
    mkRect(parent, x + i * 5, y + (26 - h) / 2, 3, h, color, opacity || 0.6);
  });
}

// ── Two-column layout constants ───────────────────────────────────────────────
const LX = 80;
const RX = 700;
const RW = W - RX - 80;  // 1140

// ════════════════════════════════════════════════════════════════════════════
//  SLIDES
// ════════════════════════════════════════════════════════════════════════════

function buildCover(x) {
  const f = mkFrame('01 — Cover', x, C.ink);
  mkRect(f, W * 0.55, 0, W * 0.45, H, C.mid, 0.40);

  // Compass circles
  const cx = W - 260, cy = H / 2, sz = 520;
  mkEllipse(f, cx, cy, sz,       C.sand, 0.08, 1.2);
  mkEllipse(f, cx, cy, sz * 0.8, C.sand, 0.05, 0.7);
  mkRect(f, cx,           cy - sz / 2, 0.5, sz, C.sand, 0.05);
  mkRect(f, cx - sz / 2,  cy,          sz, 0.5, C.sand, 0.05);

  mkText(f, 'ANTENA ÁFRICA', 80, 80, sf(9), 'Light', C.earth,
    { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'ANTENA\nÁFRICA', 80, 300, sf(152), 'Black', C.sand,
    { lineHeight: 88, letterSpacing: -2 });
  // rule pushed down to clear the scaled title (≈203px × 2 lines ends ~682)
  mkRule(f, 80, 740, C.sand, 0.35, 48);
  mkText(f, 'Música Africana  ·  Curadoria  ·  Contexto', 80, 766, sf(13), 'Light', C.sand2,
    { letterSpacing: 18 });
  mkText(f, 'Lúcio Oliveira  ·  Proposta de Canal Digital', 80, 800, sf(9), 'Light', C.earth,
    { letterSpacing: 18, textCase: 'UPPER' });
  return f;
}

function buildIntro(x) {
  const f = mkFrame('02 — Introdução', x, C.sand);
  mkEllipse(f, W - 340, H / 2, 660, C.sand2, 0.45, 0);

  mkText(f, 'O PROJETO', 80, 80, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'MÚSICA AFRICANA\nPARA ALÉM DO RÁDIO.', 80, 180, sf(80), 'Black', C.ink,
    { lineHeight: 93, letterSpacing: -1.5, width: 960 });
  mkRule(f, 80, 430, C.ink, 0.28, 48);
  mkText(f,
    'Uma curadoria semanal de música africana — do afrobeat ao kuduro,\ndo highlife ao amapiano. Cada episódio conecta som, história\ne identidade cultural do continente.',
    80, 460, sf(17), 'Light', C.mid, { lineHeight: 168, width: 800 });
  mkText(f,
    'Lúcio Oliveira  ·  DJ Sankoffa  ·  Expansão digital do Rádio África — Educadora FM 107,5',
    80, H - 60, sf(9), 'Light', C.earth, { letterSpacing: 14, textCase: 'UPPER', width: W - 160 });
  return f;
}

// ── Slide 03 — Justificativa ───────────────────────────────────────────────────
function buildJustificativa(x) {
  const f = mkFrame('03 — Justificativa', x, C.sand);

  // Left column
  mkText(f, '01 — JUSTIFICATIVA', LX, 80, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'JUSTIFI\nCATIVA', LX, 140, sf(88), 'Black', C.ink, { lineHeight: 88, letterSpacing: -2 });
  mkRule(f, LX, 400, C.ink, 0.28, 48);

  // Right column — 3 body paragraphs
  mkText(f,
    'Embora a música africana tenha ampliado sua presença no Brasil por meio das plataformas digitais, sua circulação ainda se concentra em tendências de maior visibilidade internacional.',
    RX, 80, sf(14), 'Light', C.mid, { lineHeight: 168, width: RW });
  mkText(f,
    'A vasta produção musical africana das décadas de 1960, 1970 e 1980 — fundamental para compreender as sonoridades atuais — permanece pouco explorada de forma contextualizada no rádio brasileiro.',
    RX, 200, sf(14), 'Light', C.mid, { lineHeight: 168, width: RW });
  mkText(f,
    'Gêneros como Highlife, Soukous, Afrobeat, Marrabenta, Makossa, entre outros, tiveram papel central em processos históricos, culturais e sociais no continente africano.',
    RX, 330, sf(14), 'Light', C.mid, { lineHeight: 168, width: RW });

  // Proposta divider + bullets
  mkRect(f, RX, 440, RW, 0.5, C.ink, 0.15);
  mkText(f, 'O PROGRAMA PROPÕE-SE A:', RX, 456, sf(9), 'Bold', C.earth, { letterSpacing: 22, textCase: 'UPPER' });

  const bullets = [
    'Ampliar repertórios',
    'Formar escuta qualificada',
    'Estabelecer conexões entre África, Brasil e Bahia',
    'Destacar a diversidade de gêneros musicais existentes no continente africano',
  ];
  let by = 492;
  for (const b of bullets) {
    mkRect(f, RX, by + 8, 4, 4, C.earth, 0.55, 1);
    mkText(f, b, RX + 18, by, sf(13), 'Light', C.mid, { width: RW - 18 });
    by += 52;
  }

  return f;
}

// ── Slide 04 — Objetivos ───────────────────────────────────────────────────────
function buildObjetivos(x) {
  const f = mkFrame('04 — Objetivos', x, C.ink);

  // Faint compass rings right side
  mkEllipse(f, W - 200, H / 2, 440, C.sand, 0.06, 1.0);
  mkEllipse(f, W - 200, H / 2, 320, C.sand, 0.04, 0.6);

  // Left column
  mkText(f, '02 — OBJETIVOS', LX, 80, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'OBJE\nTIVOS', LX, 140, sf(88), 'Black', C.sand, { lineHeight: 88, letterSpacing: -2 });
  mkRule(f, LX, 380, C.sand, 0.32, 48);

  // Right column — Objetivo Geral
  mkText(f, 'OBJETIVO GERAL', RX, 80, sf(9), 'Bold', C.earth, { letterSpacing: 22, textCase: 'UPPER' });
  mkText(f,
    'Difundir a música africana de forma crítica e contextualizada, ampliando o acesso a expressões sonoras do continente.',
    RX, 112, sf(15), 'Light', C.sand2, { lineHeight: 168, width: RW });

  // Divider
  mkRect(f, RX, 220, RW, 0.5, C.earth, 0.25);

  // Objetivos Específicos
  mkText(f, 'OBJETIVOS ESPECÍFICOS', RX, 238, sf(9), 'Bold', C.earth, { letterSpacing: 22, textCase: 'UPPER' });

  const especificos = [
    'Apresentar artistas clássicos e contemporâneos de diferentes regiões da África',
    'Contextualizar produções musicais em seus marcos históricos e culturais',
    'Estabelecer conexões entre gêneros africanos e música afro-brasileira',
    'Atrair público jovem por meio de estratégias curatoriais intergeracionais',
    'Valorizar artistas locais influenciados por matrizes africanas',
  ];
  let ey = 276;
  for (const e of especificos) {
    mkRect(f, RX, ey + 8, 4, 4, C.earth, 0.55, 1);
    mkText(f, e, RX + 18, ey, sf(14), 'Light', C.sand2, { lineHeight: 155, width: RW - 18 });
    ey += 56;
  }

  return f;
}

// ── Slide 05 — Público-Alvo ────────────────────────────────────────────────────
function buildPublicoAlvo(x) {
  const f = mkFrame('05 — Público-Alvo', x, C.sand);

  // Left column
  mkText(f, '03 — PÚBLICO-ALVO', LX, 80, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'PÚBLICO\nALVO', LX, 140, sf(88), 'Black', C.ink, { lineHeight: 88, letterSpacing: -2 });
  mkRule(f, LX, 400, C.ink, 0.28, 48);

  // Right column — 4 audience items
  const audiences = [
    'Público interessado em música afro-brasileira',
    'Ouvintes interessados em diversidade musical',
    'Jovens interessados em sonoridades africanas contemporâneas',
    'Estudantes e pesquisadores da área cultural',
  ];
  let ay = 80;
  for (let i = 0; i < audiences.length; i++) {
    if (i > 0) mkRect(f, RX, ay, RW, 0.5, C.ink, 0.15);
    ay += (i > 0 ? 18 : 0);
    mkText(f, String(i + 1).padStart(2, '0'), RX, ay, sf(11), 'Light', C.earth, { letterSpacing: 8 });
    mkText(f, audiences[i], RX + 60, ay, sf(22), 'Medium', C.ink, { lineHeight: 130, width: RW - 60 });
    ay += 116;
  }

  return f;
}

function buildNome(x) {
  const f = mkFrame('06 — Nome do Canal', x, C.sand);

  mkText(f, '04 — IDENTIDADE', 80, 60, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'O NOME\nDO CANAL', 80, 110, sf(88), 'Black', C.ink, { lineHeight: 92, letterSpacing: -2 });

  const names = [
    { key: 'Antena África',     val: 'Direto. O continente primeiro, o meio depois.',               chosen: false },
    { key: 'Antena África ✓',   val: 'Nome escolhido — sintonia, alcance, presença permanente no ar.', chosen: true  },
    { key: 'Afro-Rádio',        val: 'Compacto. Reconhecível. Forte nas redes.',                   chosen: false },
    { key: 'Frequência África',  val: 'Canal e cultura — a mesma frequência.',                      chosen: false },
    { key: 'Sinal África',      val: 'Técnico e poético. Um sinal que chega e significa.',         chosen: false },
  ];
  let rowY = 400;
  for (const n of names) {
    mkRect(f, 80, rowY, W - 160, 0.5, C.ink, n.chosen ? 0.25 : 0.12);
    rowY += 14;
    if (n.chosen) mkRect(f, 80, rowY - 4, W - 160, 72, C.ink, 0.06);
    mkText(f, n.key, 80, rowY, sf(14), n.chosen ? 'Bold' : 'Regular',
      n.chosen ? C.ink : C.earth, { letterSpacing: 3 });
    mkText(f, n.val, 520, rowY, sf(14), n.chosen ? 'Regular' : 'Light',
      n.chosen ? C.mid : C.earth, { width: W - 600 });
    rowY += 80;
  }
  return f;
}

function buildOrigem(x) {
  const f = mkFrame('07 — A Origem', x, C.ink);
  // Tribal border dots
  for (let i = 0; i < 8; i++) {
    const sq = figma.createRectangle();
    sq.resize(36, 36); sq.x = W - 76; sq.y = 100 + i * 68;
    sq.fills = []; sq.strokes = [{ type: 'SOLID', color: C.sand, opacity: 0.08 }];
    sq.strokeWeight = 0.8;
    f.appendChild(sq);
  }

  mkText(f, '05 — A ORIGEM', 80, 60, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'RÁDIO ÁFRICA\nNA EDUCADORA.', 80, 110, sf(80), 'Black', C.sand, { lineHeight: 93, letterSpacing: -1.5 });

  mkRect(f, W / 2 - 40, 370, 0.5, 360, C.earth, 0.25);

  mkText(f, 'A ORIGEM', 80, 380, sf(9), 'Light', C.earth, { letterSpacing: 22, textCase: 'UPPER' });
  mkText(f,
    'O Rádio África é o único programa no Brasil dedicado exclusivamente à música africana — ao ar há anos na Educadora FM 107,5, Salvador, com retransmissão pela Rádio Nacional.',
    80, 412, sf(14), 'Light', C.sand2, { lineHeight: 168, width: W / 2 - 160 });

  // Pills
  for (const [px, label] of [[80, 'Sábados\n107,5 FM'], [298, '3 Estados\nna Grade']]) {
    mkRect(f, px, 670, 196, 64, C.earth, 0.28, 4);
    mkText(f, label, px + 20, 680, sf(12), 'Regular', C.sand, { letterSpacing: 8, lineHeight: 140 });
  }

  const rx = W / 2 + 40;
  mkText(f, 'A EXPANSÃO DIGITAL', rx, 380, sf(9), 'Light', C.earth, { letterSpacing: 22, textCase: 'UPPER' });
  mkText(f,
    'A Antena África é a continuação desse trabalho no ambiente digital. O mesmo rigor curatorial, a mesma voz — agora no YouTube e no Instagram, alcançando quem nunca sintonizou o rádio.',
    rx, 412, sf(14), 'Light', C.sand2, { lineHeight: 168, width: W / 2 - 160 });
  return f;
}

// ── Slide 08 — Formato do Episódio (60 min) ────────────────────────────────────
function buildFormatoEpisodio(x) {
  const f = mkFrame('08 — Formato do Episódio', x, C.sand);

  // Left column
  mkText(f, '06 — FORMATO', LX, 80, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'FOR\nMATO', LX, 140, sf(88), 'Black', C.ink, { lineHeight: 88, letterSpacing: -2 });
  // '60 minutos' pushed below scaled title (≈117px × 2 lines ends ~360)
  mkText(f, '60 minutos', LX, 390, sf(14), 'Light', C.earth, { letterSpacing: 6 });
  mkRule(f, LX, 428, C.ink, 0.28, 48);

  // Right column — timeline blocks
  const blocks = [
    { time: '5 min',  name: 'Abertura',                            desc: 'Apresentação do tema do episódio.' },
    { time: '15 min', name: 'Bloco 1 — Sonoridades Contemporâneas', desc: 'Produções atuais como ponto de entrada.' },
    { time: '15 min', name: 'Bloco 2 — Raízes e Matrizes',          desc: 'Destaque para artistas clássicos e movimentos históricos.' },
    { time: '10 min', name: 'Bloco 3 — Conexões',                   desc: 'Relações entre África, Brasil e Bahia.' },
    { time: '10 min', name: 'Bloco 4 — Escuta Atenta',              desc: 'Análise de uma faixa específica.' },
    { time: '5 min',  name: 'Encerramento',                         desc: 'Síntese e anúncio do próximo programa.' },
  ];

  let ty = 80;
  const timeColW = 80;
  const nameX = RX + timeColW + 24;
  const nameW = RW - timeColW - 24;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (i > 0) mkRect(f, RX, ty, RW, 0.5, C.ink, 0.15);
    ty += (i > 0 ? 16 : 0);
    mkText(f, b.time, RX, ty, sf(11), 'Bold', C.earth, { letterSpacing: 4 });
    mkText(f, b.name.toUpperCase(), nameX, ty, sf(13), 'Bold', C.ink, { letterSpacing: 3, width: nameW });
    mkText(f, b.desc, nameX, ty + 26, sf(12), 'Light', C.mid, { lineHeight: 155, width: nameW });
    ty += 96;
  }

  return f;
}

function buildFormato(x) {
  const f = mkFrame('09 — Formato Digital', x, C.ink);
  mkEllipse(f, W / 2, H / 2 + 60, 500, C.sand, 0.05, 1.2);
  mkEllipse(f, W / 2, H / 2 + 60, 400, C.sand, 0.03, 0.7);

  mkText(f, '07 — FORMATO DIGITAL', 80, 60, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'DO RÁDIO\nÀS REDES.', 80, 110, sf(96), 'Black', C.sand, { lineHeight: 92, letterSpacing: -2 });
  // rule pushed to clear the scaled title (≈128px × 2 lines ends ~356)
  mkRule(f, 80, 380, C.sand, 0.22, 48);
  mkRect(f, W / 2, 392, 0.5, 420, C.earth, 0.30);

  mkWaves(f, 80, 416, C.sand, 0.50);
  mkText(f, 'YouTube', 80, 460, sf(28), 'Medium', C.sand, { letterSpacing: 3 });
  mkText(f, 'Episódio semanal · 60 min\nVoz + música + visualizer\nNúcleo de toda a produção\nCâmera não precisa aparecer',
    80, 522, sf(15), 'Light', C.sand2, { lineHeight: 195, width: W / 2 - 160 });

  mkWaves(f, W / 2 + 80, 416, C.sand, 0.50);
  mkText(f, 'Instagram', W / 2 + 80, 460, sf(28), 'Medium', C.sand, { letterSpacing: 3 });
  mkText(f, 'Carrossel · Reels · Stories\nTudo deriva do episódio\nUma produção\nMúltiplas entregas na semana',
    W / 2 + 80, 522, sf(15), 'Light', C.sand2, { lineHeight: 195, width: W / 2 - 160 });
  return f;
}

function buildLinha(x) {
  const f = mkFrame('10 — Linha Editorial', x, C.sand);
  mkRect(f, 0, 0, W, 6, C.mid, 1);

  mkText(f, '08 — LINHA EDITORIAL', 80, 60, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'TRÊS\nEIXOS.', 80, 110, sf(96), 'Black', C.ink, { lineHeight: 92, letterSpacing: -2 });

  const eixos = [
    { num: '01', title: 'Histórico-formativo', body: 'Cada episódio localiza a música no seu tempo — independências, diásporas, resistências culturais.' },
    { num: '02', title: 'Cultural',             body: 'Identidade, memória e diáspora como horizonte permanente, não como tema fixo ou decorativo.' },
    { num: '03', title: 'Estético-musical',     body: 'Instrumentação, ritmo, influências — análise acessível que amplia a escuta sem virar aula.' },
  ];
  const colW = Math.floor((W - 160) / 3) - 40;
  eixos.forEach((e, i) => {
    const cx = 80 + i * (colW + 80);
    mkRect(f, cx, 400, colW, 0.5, C.ink, 0.15);
    mkText(f, e.num, cx, 420, sf(40), 'Light', C.earth);
    mkText(f, e.title.toUpperCase(), cx, 490, sf(15), 'Bold', C.ink, { letterSpacing: 4, width: colW });
    mkText(f, e.body, cx, 534, sf(14), 'Light', C.mid, { lineHeight: 172, width: colW });
  });

  mkRule(f, 80, H - 130, C.earth, 0.22, 48);
  mkText(f,
    '"A música é documento histórico, expressão de identidades, instrumento de resistência."',
    80, H - 96, sf(15), 'Light', C.earth, { letterSpacing: 2, width: W - 160 });
  return f;
}

function buildPassos(x) {
  const f = mkFrame('11 — Próximos Passos', x, C.mid);
  mkText(f, '09 — PRÓXIMOS PASSOS', 80, 60, sf(9), 'Light', C.earth, { letterSpacing: 28, textCase: 'UPPER' });
  mkText(f, 'O QUE\nFALTA\nDEFINIR.', 80, 130, sf(76), 'Black', C.sand, { lineHeight: 92, letterSpacing: -1.5 });
  mkRect(f, Math.round(W * 0.42), 100, 0.5, H - 200, C.earth, 0.18);

  const steps = [
    { num: '01', label: 'Nome do Canal Digital' },
    { num: '02', label: 'Episódios Piloto — 3 primeiros temas' },
    { num: '03', label: 'Identidade Visual' },
    { num: '04', label: 'Equipe e Parceiros' },
    { num: '05', label: 'Calendário de Lançamento' },
  ];
  const rx = Math.round(W * 0.42) + 60;
  let rowY = 200;
  for (const s of steps) {
    mkRect(f, rx, rowY, W - rx - 80, 0.5, C.earth, 0.18);
    rowY += 14;
    mkText(f, s.num, rx, rowY, sf(11), 'Light', C.earth, { letterSpacing: 8 });
    mkText(f, s.label.toUpperCase(), rx + 80, rowY, sf(20), 'Medium', C.sand, { letterSpacing: 4 });
    rowY += 108;
  }

  mkWaves(f, 80, H - 56, C.earth, 0.45);
  mkText(f, 'ANTENA ÁFRICA  ·  LÚCIO OLIVEIRA', 136, H - 48, sf(8), 'Bold', C.earth,
    { letterSpacing: 25, textCase: 'UPPER' });
  return f;
}

function buildBackCover(x) {
  const f = mkFrame('12 — Back Cover', x, C.ink);
  mkRect(f, 0, 0, W * 0.50, H, C.mid, 0.90);

  mkEllipse(f, Math.round(W * 0.25), H / 2, 360, C.sand, 0.10, 1.2);
  mkEllipse(f, Math.round(W * 0.25), H / 2, 288, C.sand, 0.06, 0.7);
  mkRect(f, Math.round(W * 0.25), H / 2 - 180, 0.5, 360, C.sand, 0.06);
  mkRect(f, Math.round(W * 0.25) - 180, H / 2, 360, 0.5, C.sand, 0.06);

  // title start pushed up so scaled text (≈160px × 2 lines ≈ 300px) clears the rule
  mkText(f, 'ANTENA\nÁFRICA', 80, H / 2 - 260, sf(120), 'Black', C.sand, { lineHeight: 88, letterSpacing: -2 });
  mkRule(f, 80, H / 2 + 80, C.sand, 0.32, 48);

  // Statement
  mkText(f,
    'O Programa ANTENA ÁFRICA propõe-se a oferecer conteúdo musical qualificado, ampliando repertórios e fortalecendo conexões históricas e culturais entre África, Brasil e Bahia.',
    80, H / 2 + 112, sf(13), 'Light', C.sand2, { lineHeight: 180, width: 560 });

  mkText(f, 'Expansão digital do Rádio África\nCuradoria  ·  Contexto  ·  Conexão',
    80, H / 2 + 268, sf(15), 'Light', C.sand2, { lineHeight: 168 });
  mkText(f, 'Lúcio Oliveira', 80, H - 80, sf(12), 'Light', C.earth, { letterSpacing: 20, textCase: 'UPPER' });

  mkRect(f, W * 0.50, 0, W * 0.50, H, C.earth, 0.07);
  return f;
}


// ════════════════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('[Antena África] Loading fonts…');
  await loadFonts();
  console.log('[Antena África] Fonts loaded:', JSON.stringify(resolvedFonts));

  // Remove any previously generated frames (matching "NN — " naming pattern)
  const existing = figma.currentPage.children.filter(n =>
    n.type === 'FRAME' && /^\d{2} — /.test(n.name)
  );
  for (const node of existing) node.remove();
  if (existing.length) console.log(`[Antena África] Removed ${existing.length} existing slide(s)`);

  const slides = [];
  let xOff = 0;

  console.log('[Antena África] Building slides…');
  slides.push(buildCover(xOff));              xOff += W + GAP;  // 01
  slides.push(buildIntro(xOff));              xOff += W + GAP;  // 02
  slides.push(buildJustificativa(xOff));      xOff += W + GAP;  // 03
  slides.push(buildObjetivos(xOff));          xOff += W + GAP;  // 04
  slides.push(buildPublicoAlvo(xOff));        xOff += W + GAP;  // 05
  slides.push(buildNome(xOff));               xOff += W + GAP;  // 06
  slides.push(buildOrigem(xOff));             xOff += W + GAP;  // 07
  slides.push(buildFormatoEpisodio(xOff));    xOff += W + GAP;  // 08
  slides.push(buildFormato(xOff));            xOff += W + GAP;  // 09
  slides.push(buildLinha(xOff));              xOff += W + GAP;  // 10
  slides.push(buildPassos(xOff));             xOff += W + GAP;  // 11
  slides.push(buildBackCover(xOff));                             // 12

  console.log('[Antena África] Done — ' + slides.length + ' slides created');

  figma.currentPage.selection = slides;
  figma.viewport.scrollAndZoomIntoView(slides);
  figma.closePlugin('✓ Antena África — 12 slides criados');
}

main().catch(err => {
  console.error('[Antena África] FATAL:', err);
  figma.closePlugin('Erro: ' + err.message);
});
