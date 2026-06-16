// ════════════════════════════════════════════════════════════════════
//  MEDALHAS / CONQUISTAS DO BOLÃO  (compartilhado por stats.html e perfil.html)
//  Para criar/editar medalhas, mexa SÓ neste arquivo.
// ════════════════════════════════════════════════════════════════════
(function (global) {
  function dir(a, b) { return a > b ? 1 : b > a ? 2 : 0; }

  // monta o "contexto" uma vez, com tudo que as medalhas precisam
  function buildMedalCtx(participantes, palpites, jogos, cutoff) {
    cutoff = cutoff || 1;
    const posicaoDe = {};
    participantes.forEach((p, i) => posicaoDe[p.nome] = i + 1);

    const palpitesPorPessoa = {};
    palpites.forEach(pl => { (palpitesPorPessoa[pl.nome] = palpitesPorPessoa[pl.nome] || []).push(pl); });

    // campeão de cada rodada
    const campeoes = {};
    for (let r = 1; r <= 3; r++) {
      let best = null;
      participantes.forEach(p => { const v = (p.rodada && p.rodada[r]) || 0; if (v > 0 && (!best || v > best.v)) best = { nome: p.nome, v: v }; });
      if (best) campeoes[best.nome] = true;
    }

    // info por jogo encerrado e que conta ponto
    const jogoInfo = {};
    const fechadosValidos = [];
    jogos.forEach(j => {
      const fim = j.placar1 !== null && j.placar2 !== null && j.placar1 !== undefined && j.placar2 !== undefined;
      if (!fim || Number(j.num) < cutoff) return;
      fechadosValidos.push(String(j.num));
      const realDir = dir(j.placar1, j.placar2);
      const cont = { 0: 0, 1: 0, 2: 0 };
      palpites.forEach(pl => { if (String(pl.jogo) === String(j.num)) cont[dir(pl.gol1, pl.gol2)]++; });
      let majDir = 0; if (cont[1] >= cont[0] && cont[1] >= cont[2]) majDir = 1; else if (cont[2] >= cont[0] && cont[2] >= cont[1]) majDir = 2;
      jogoInfo[String(j.num)] = { realDir: realDir, diff: Math.abs(j.placar1 - j.placar2), majDir: majDir, majCerta: majDir === realDir };
    });

    return { posicaoDe, palpitesPorPessoa, campeoes, jogoInfo, fechadosValidos, cutoff };
  }

  function calcularMedalhas(p, ctx) {
    const meus = ctx.palpitesPorPessoa[p.nome] || [];
    const pos = ctx.posicaoDe[p.nome] || 99;
    const pontos = p.pontos || 0, crav = p.cravadas || 0, aprov = p.aproveitamento || 0, pontuados = p.pontuados || 0;

    // sequência: jogos encerrados e válidos, em ordem, máximo de acertos seguidos
    const validos = meus.filter(pl => ctx.jogoInfo[String(pl.jogo)]).sort((a, b) => Number(a.jogo) - Number(b.jogo));
    let streak = 0, maxStreak = 0;
    validos.forEach(pl => { if (pl.pontos > 0) { streak++; maxStreak = Math.max(maxStreak, streak); } else streak = 0; });

    // em dia: palpitou em todos os jogos encerrados e válidos
    const meusNums = {}; meus.forEach(pl => meusNums[String(pl.jogo)] = true);
    const emDia = ctx.fechadosValidos.length > 0 && ctx.fechadosValidos.every(n => meusNums[n]);

    // do contra: acertou um resultado que a maioria errou
    let doContra = false;
    validos.forEach(pl => { const info = ctx.jogoInfo[String(pl.jogo)]; if (info && dir(pl.gol1, pl.gol2) === info.realDir && !info.majCerta) doContra = true; });

    // goleador: cravou um placar de goleada (diferença 3+)
    let goleador = false;
    meus.forEach(pl => { const info = ctx.jogoInfo[String(pl.jogo)]; if (info && pl.pontos === 7 && info.diff >= 3) goleador = true; });

    return [
      { ok: meus.length >= 1,        ico: '🐣', t: 'Estreante',       d: 'Fez o primeiro palpite' },
      { ok: pontos >= 1,             ico: '✅', t: 'Na conta',         d: 'Pontuou pela primeira vez' },
      { ok: pontos >= 25,            ico: '⚽', t: 'Meia-bola',        d: '25+ pontos' },
      { ok: pontos >= 50,            ico: '🌟', t: 'Craque',           d: '50+ pontos' },
      { ok: pontos >= 100,           ico: '🐐', t: 'Lenda',            d: '100+ pontos' },
      { ok: crav >= 1,               ico: '🔮', t: 'Nostradamus',      d: 'Cravou 1 placar exato' },
      { ok: crav >= 3,               ico: '🎯', t: 'Vidente',          d: 'Cravou 3 placares' },
      { ok: crav >= 5,               ico: '📜', t: 'Profeta',          d: 'Cravou 5 placares' },
      { ok: crav >= 10,              ico: '🧿', t: 'Oráculo',          d: 'Cravou 10 placares' },
      { ok: pos === 1 && pontos > 0, ico: '👑', t: 'Líder',            d: 'Está em 1º lugar' },
      { ok: pos === 2 && pontos > 0, ico: '🥈', t: 'Vice',             d: 'Está em 2º lugar' },
      { ok: pos <= 3 && pontos > 0,  ico: '🏆', t: 'Pódio',            d: 'Está no top 3' },
      { ok: aprov >= 50 && pontuados >= 3, ico: '🔥', t: 'Pé-quente',  d: '50%+ de aproveitamento' },
      { ok: aprov >= 70 && pontuados >= 5, ico: '🎓', t: 'Mestre',     d: '70%+ de aproveitamento' },
      { ok: pontuados >= 8,          ico: '🏃', t: 'Maratonista',      d: 'Palpitou em 8+ jogos válidos' },
      { ok: emDia,                   ico: '📅', t: 'Em dia',           d: 'Palpitou em todos os jogos já encerrados' },
      { ok: doContra,                ico: '🃏', t: 'Do contra',        d: 'Acertou um resultado que a maioria errou' },
      { ok: goleador,                ico: '💣', t: 'Goleador',         d: 'Cravou uma goleada (3+ de diferença)' },
      { ok: maxStreak >= 3,          ico: '♨️', t: 'Sequência quente', d: 'Pontuou em 3 jogos seguidos' },
      { ok: ctx.campeoes[p.nome],    ico: '🏅', t: 'Dono da rodada',   d: 'Foi o campeão de uma rodada' },
      { ok: pontuados >= 5 && pontos === 0, ico: '🥶', t: 'Pé-frio',   d: '5+ jogos válidos e 0 ponto' },
    ];
  }

  global.buildMedalCtx = buildMedalCtx;
  global.calcularMedalhas = calcularMedalhas;

  // ── DESTAQUES DA ZOEIRA (superlativos do grupo, 1 ganhador cada) ──
  function calcularDestaques(participantes, palpites, jogos, ctx) {
    const jn = {}; jogos.forEach(j => jn[String(j.num)] = j);
    const norm = s => String(s || '').trim().toLowerCase();

    const empates = {}, zebras = {}, clubista = {};
    participantes.forEach(p => { empates[p.nome] = 0; zebras[p.nome] = 0; clubista[p.nome] = 0; });
    const timeDe = {}; participantes.forEach(p => timeDe[p.nome] = norm(p.time));

    palpites.forEach(pl => {
      if (empates[pl.nome] === undefined) { empates[pl.nome] = 0; zebras[pl.nome] = 0; clubista[pl.nome] = 0; }
      if (Number(pl.gol1) === Number(pl.gol2)) empates[pl.nome]++;
      const info = ctx.jogoInfo[String(pl.jogo)];
      if (info) { const d = pl.gol1 > pl.gol2 ? 1 : pl.gol2 > pl.gol1 ? 2 : 0; if (d === info.realDir && !info.majCerta) zebras[pl.nome]++; }
      const j = jn[String(pl.jogo)], t = timeDe[pl.nome];
      if (j && t) {
        if (norm(j.time1) === t && pl.gol1 > pl.gol2) clubista[pl.nome]++;
        else if (norm(j.time2) === t && pl.gol2 > pl.gol1) clubista[pl.nome]++;
      }
    });

    function topPor(valorFn) {
      let win = null;
      participantes.forEach(p => { const v = valorFn(p); if (v > 0 && (!win || v > win.v)) win = { p: p, v: v }; });
      return win;
    }

    const out = [];
    const add = (ico, t, win, sufixo) => { if (win) out.push({ ico: ico, titulo: t, nome: win.p.nome, foto: win.p.foto, valor: win.v + ' ' + sufixo }); };

    add('🔮', 'Maior vidente', topPor(p => p.cravadas || 0), 'cravada(s)');
    add('🥶', 'Mais azarado',  topPor(p => (p.pontuados || 0) - (p.acertos || 0)), 'jogo(s) zerado(s)');
    add('🤝', 'Rei do empate', topPor(p => empates[p.nome] || 0), 'palpite(s) de empate');
    add('🦓', 'Corajoso',      topPor(p => zebras[p.nome] || 0), 'zebra(s) acertada(s)');
    add('💚', 'Clubista',      topPor(p => clubista[p.nome] || 0), 'aposta(s) no seu time');
    return out;
  }
  global.calcularDestaques = calcularDestaques;
})(window);
