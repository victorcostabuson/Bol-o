import React, { useMemo, useState } from "react";
import "./ShuriksPickemBracket.css";

const TEAMS = {
  RSA: { id: "RSA", name: "África do Sul", flag: "🇿🇦" },
  CAN: { id: "CAN", name: "Canadá", flag: "🇨🇦" },
  BRA: { id: "BRA", name: "Brasil", flag: "🇧🇷" },
  JPN: { id: "JPN", name: "Japão", flag: "🇯🇵" },
  GER: { id: "GER", name: "Alemanha", flag: "🇩🇪" },
  PAR: { id: "PAR", name: "Paraguai", flag: "🇵🇾" },
  NED: { id: "NED", name: "Holanda", flag: "🇳🇱" },
  MAR: { id: "MAR", name: "Marrocos", flag: "🇲🇦" },
  CIV: { id: "CIV", name: "Costa do Marfim", flag: "🇨🇮" },
  NOR: { id: "NOR", name: "Noruega", flag: "🇳🇴" },
  FRA: { id: "FRA", name: "França", flag: "🇫🇷" },
  SWE: { id: "SWE", name: "Suécia", flag: "🇸🇪" },
  MEX: { id: "MEX", name: "México", flag: "🇲🇽" },
  ECU: { id: "ECU", name: "Equador", flag: "🇪🇨" },
  ENG: { id: "ENG", name: "Inglaterra", flag: "🏴" },
  COD: { id: "COD", name: "RD Congo", flag: "🇨🇩" },
  BEL: { id: "BEL", name: "Bélgica", flag: "🇧🇪" },
  SEN: { id: "SEN", name: "Senegal", flag: "🇸🇳" },
  USA: { id: "USA", name: "Estados Unidos", flag: "🇺🇸" },
  BIH: { id: "BIH", name: "Bósnia e Herzegovina", flag: "🇧🇦" },
  ESP: { id: "ESP", name: "Espanha", flag: "🇪🇸" },
  AUT: { id: "AUT", name: "Áustria", flag: "🇦🇹" },
  POR: { id: "POR", name: "Portugal", flag: "🇵🇹" },
  CRO: { id: "CRO", name: "Croácia", flag: "🇭🇷" },
  SUI: { id: "SUI", name: "Suíça", flag: "🇨🇭" },
  ALG: { id: "ALG", name: "Argélia", flag: "🇩🇿" },
  AUS: { id: "AUS", name: "Austrália", flag: "🇦🇺" },
  EGY: { id: "EGY", name: "Egito", flag: "🇪🇬" },
  ARG: { id: "ARG", name: "Argentina", flag: "🇦🇷" },
  CPV: { id: "CPV", name: "Cabo Verde", flag: "🇨🇻" },
  COL: { id: "COL", name: "Colômbia", flag: "🇨🇴" },
  GHA: { id: "GHA", name: "Gana", flag: "🇬🇭" },
};

// Ordem baseada nos slots oficiais 73-88. Se a sua API trouxer IDs oficiais, substitua este array mantendo o campo slot.
const INITIAL_R32 = [
  { slot: 73, a: "RSA", b: "CAN", actualWinner: "CAN", locked: true },
  { slot: 74, a: "GER", b: "PAR", actualWinner: "PAR", locked: true },
  { slot: 75, a: "NED", b: "MAR" },
  { slot: 76, a: "BRA", b: "JPN", actualWinner: "BRA", locked: true },
  { slot: 77, a: "FRA", b: "SWE" },
  { slot: 78, a: "CIV", b: "NOR" },
  { slot: 79, a: "MEX", b: "ECU" },
  { slot: 80, a: "ENG", b: "COD" },
  { slot: 81, a: "USA", b: "BIH" },
  { slot: 82, a: "BEL", b: "SEN" },
  { slot: 83, a: "POR", b: "CRO" },
  { slot: 84, a: "ESP", b: "AUT" },
  { slot: 85, a: "SUI", b: "ALG" },
  { slot: 86, a: "ARG", b: "CPV" },
  { slot: 87, a: "COL", b: "GHA" },
  { slot: 88, a: "AUS", b: "EGY" },
];

const ROUND_LABELS = {
  r32: "16 avos",
  r16: "Oitavas",
  qf: "Quartas",
  sf: "Semifinal",
};

function pairWinners(previousRound, startSlot) {
  const next = [];
  for (let i = 0; i < previousRound.length; i += 2) {
    next.push({
      slot: startSlot + i / 2,
      from: [previousRound[i].slot, previousRound[i + 1].slot],
      a: previousRound[i].pick || null,
      b: previousRound[i + 1].pick || null,
    });
  }
  return next;
}

function TeamButton({ teamId, selected, disabled, onClick }) {
  const team = teamId ? TEAMS[teamId] : null;
  return (
    <button
      type="button"
      className={`team ${selected ? "selected" : ""} ${disabled ? "disabled" : ""} ${!team ? "empty" : ""}`}
      disabled={disabled || !team}
      onClick={onClick}
    >
      <span className="flag">{team?.flag || "🐾"}</span>
      <span className="team-name">{team?.name || "Aguardando vencedor"}</span>
      <span className="chevron">›</span>
    </button>
  );
}

function MatchCard({ match, roundKey, pick, onPick, compact = false }) {
  const isLocked = Boolean(match.locked);

  return (
    <div className={`match-card ${compact ? "compact" : ""} ${isLocked ? "locked" : ""}`}>
      <div className="match-slot">Jogo {match.slot}</div>
      <TeamButton
        teamId={match.a}
        selected={pick === match.a}
        disabled={isLocked}
        onClick={() => onPick(roundKey, match.slot, match.a)}
      />
      <TeamButton
        teamId={match.b}
        selected={pick === match.b}
        disabled={isLocked}
        onClick={() => onPick(roundKey, match.slot, match.b)}
      />
      {isLocked && match.actualWinner && (
        <div className="result-chip">Classificado: {TEAMS[match.actualWinner].flag} {TEAMS[match.actualWinner].name}</div>
      )}
    </div>
  );
}

function RoundColumn({ title, matches, roundKey, picks, onPick }) {
  return (
    <section className="round-column">
      <h3>{title}</h3>
      <div className="round-stack">
        {matches.map((match) => (
          <MatchCard
            key={`${roundKey}-${match.slot}`}
            match={match}
            roundKey={roundKey}
            pick={picks[roundKey]?.[match.slot]}
            onPick={onPick}
            compact={roundKey !== "r32"}
          />
        ))}
      </div>
    </section>
  );
}

export default function ShuriksPickemBracket() {
  const [picks, setPicks] = useState({
    r32: Object.fromEntries(INITIAL_R32.filter((m) => m.actualWinner).map((m) => [m.slot, m.actualWinner])),
    r16: {},
    qf: {},
    sf: {},
    final: {},
    champion: null,
    thirdPlace: null,
  });

  const rounds = useMemo(() => {
    const r32 = INITIAL_R32.map((m) => ({ ...m, pick: picks.r32[m.slot] || m.actualWinner || null }));
    const r16 = pairWinners(r32, 89).map((m) => ({ ...m, pick: picks.r16[m.slot] || null }));
    const qf = pairWinners(r16, 97).map((m) => ({ ...m, pick: picks.qf[m.slot] || null }));
    const sf = pairWinners(qf, 101).map((m) => ({ ...m, pick: picks.sf[m.slot] || null }));
    const final = pairWinners(sf, 103)[0];
    final.pick = picks.final[final.slot] || null;
    const sfLosers = sf.map((m) => {
      if (!m.a || !m.b || !m.pick) return null;
      return m.pick === m.a ? m.b : m.a;
    });
    const third = { slot: 104, a: sfLosers[0], b: sfLosers[1], pick: picks.thirdPlace };
    return { r32, r16, qf, sf, final, third };
  }, [picks]);

  function clearDependent(roundKey) {
    const order = ["r32", "r16", "qf", "sf", "final"];
    const index = order.indexOf(roundKey);
    const next = {};
    for (let i = index + 1; i < order.length; i += 1) next[order[i]] = {};
    return next;
  }

  function handlePick(roundKey, slot, teamId) {
    setPicks((current) => ({
      ...current,
      ...clearDependent(roundKey),
      champion: roundKey === "final" ? current.champion : null,
      thirdPlace: ["sf", "final"].includes(roundKey) ? null : current.thirdPlace,
      [roundKey]: { ...current[roundKey], [slot]: teamId },
    }));
  }

  function savePicks() {
    const payload = {
      r32: picks.r32,
      r16: picks.r16,
      qf: picks.qf,
      sf: picks.sf,
      final: picks.final,
      champion: picks.champion,
      thirdPlace: picks.thirdPlace,
      submittedAt: new Date().toISOString(),
    };
    console.log("Enviar para API:", payload);
    alert("Palpites prontos para enviar. Veja o payload no console.");
  }

  const leftR32 = rounds.r32.slice(0, 8);
  const rightR32 = rounds.r32.slice(8, 16);
  const leftR16 = rounds.r16.slice(0, 4);
  const rightR16 = rounds.r16.slice(4, 8);
  const leftQF = rounds.qf.slice(0, 2);
  const rightQF = rounds.qf.slice(2, 4);
  const leftSF = rounds.sf.slice(0, 1);
  const rightSF = rounds.sf.slice(1, 2);

  return (
    <main className="pickem-page">
      <header className="topbar">
        <div className="brand-mark">🐾</div>
        <nav>
          <span>Início</span>
          <span className="active">Pick'em</span>
          <span>Ranking</span>
          <span>Recompensas</span>
        </nav>
        <button className="help-btn">Como funciona</button>
      </header>

      <section className="hero">
        <span className="brand-line">🐾 SHURIKS 🐾</span>
        <h1>PICK’EM DA COPA</h1>
        <p>Caminho do Campeão</p>
      </section>

      <section className="bracket-grid">
        <div className="side left-side">
          <RoundColumn title={ROUND_LABELS.r32} matches={leftR32} roundKey="r32" picks={picks} onPick={handlePick} />
          <RoundColumn title={ROUND_LABELS.r16} matches={leftR16} roundKey="r16" picks={picks} onPick={handlePick} />
          <RoundColumn title={ROUND_LABELS.qf} matches={leftQF} roundKey="qf" picks={picks} onPick={handlePick} />
          <RoundColumn title={ROUND_LABELS.sf} matches={leftSF} roundKey="sf" picks={picks} onPick={handlePick} />
        </div>

        <section className="center-stage">
          <h3>Final</h3>
          <MatchCard match={rounds.final} roundKey="final" pick={picks.final[rounds.final.slot]} onPick={handlePick} />

          <div className="champion-box">
            <div className="champion-title">Campeão</div>
            <TeamButton
              teamId={rounds.final.pick}
              selected={Boolean(picks.champion)}
              disabled={!rounds.final.pick}
              onClick={() => setPicks((current) => ({ ...current, champion: rounds.final.pick }))}
            />
          </div>

          <h3>3º lugar</h3>
          <MatchCard
            match={rounds.third}
            roundKey="thirdPlace"
            pick={picks.thirdPlace}
            onPick={(_, __, teamId) => setPicks((current) => ({ ...current, thirdPlace: teamId }))}
          />
        </section>

        <div className="side right-side">
          <RoundColumn title={ROUND_LABELS.sf} matches={rightSF} roundKey="sf" picks={picks} onPick={handlePick} />
          <RoundColumn title={ROUND_LABELS.qf} matches={rightQF} roundKey="qf" picks={picks} onPick={handlePick} />
          <RoundColumn title={ROUND_LABELS.r16} matches={rightR16} roundKey="r16" picks={picks} onPick={handlePick} />
          <RoundColumn title={ROUND_LABELS.r32} matches={rightR32} roundKey="r32" picks={picks} onPick={handlePick} />
        </div>
      </section>

      <footer className="bottom-panel">
        <div className="info-card">📅 Faça suas escolhas até o prazo configurado</div>
        <div className="legend">
          <span><i className="dot selected-dot" /> Selecionado</span>
          <span><i className="dot" /> Disponível</span>
          <span><i className="dot locked-dot" /> Bloqueado</span>
        </div>
        <button className="secondary" onClick={() => window.location.reload()}>Resetar</button>
        <button className="primary" onClick={savePicks}>Salvar palpites</button>
      </footer>
    </main>
  );
}
