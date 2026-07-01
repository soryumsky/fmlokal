// js/cup.js
// Turnamen CUP: diikuti 16 klub, format single leg (satu laga, tanpa leg kedua).
//
// Kualifikasi (ditentukan dari klasemen akhir musim sebelumnya, atau OVR klub
// untuk musim pertama karena belum ada riwayat):
//   - Peringkat 1-15  -> otomatis lolos ke CUP (15 slot)
//   - Peringkat 16-19 -> playoff kualifikasi (single leg) memperebutkan 1 slot sisa
//   - Peringkat 20    -> otomatis gugur, tidak dapat kesempatan playoff
//
// Playoff kualifikasi disimulasikan otomatis di awal musim (sebelum matchday 1)
// karena hasilnya harus sudah pasti sebelum Babak 16 Besar (yang disisipkan
// setelah Match 8 di jadwal liga).
//
// Jadwal penyisipan babak CUP ke jadwal liga (38 matchday):
//   Setelah Match 8   -> Babak 16 Besar (8 laga)
//   Setelah Match 16  -> Babak 8 Besar  (4 laga)
//   Setelah Match 24  -> Babak 4 Besar  (2 laga)
//   Setelah Match 32  -> Perebutan Juara 3 (1 laga)
//   Sebelum Match 38  -> Final (1 laga)
//
// Karena format single leg, laga yang berakhir imbang diputuskan lewat adu
// penalti (disederhanakan: peluang menang berdasar rata-rata atribut mental).

const CUP_TRIGGER_MATCHDAY = { 9: "r16", 17: "qf", 25: "sf", 33: "third", 38: "final" };
const CUP_STAGE_LABEL = {
  r16: "16 Besar",
  qf: "8 Besar",
  sf: "4 Besar",
  third: "Perebutan Juara 3",
  final: "Final"
};

function emptyCupMatch(id, homeId, awayId) {
  return { id, homeId, awayId, played: false, homeGoals: null, awayGoals: null, winnerId: null, events: [], penalty: false };
}

// Urutan pairing "seed 1 vs seed 16, seed 2 vs seed 15, dst" untuk babak pertama.
function seededOrder(teamIds) {
  const n = teamIds.length;
  const out = [];
  for (let i = 0; i < n / 2; i++) {
    out.push(teamIds[i]);
    out.push(teamIds[n - 1 - i]);
  }
  return out;
}

function buildBracketRound(teamIds, prefix, seeded) {
  const ids = seeded ? seededOrder(teamIds) : teamIds;
  const matches = [];
  for (let i = 0; i < ids.length; i += 2) {
    matches.push(emptyCupMatch(prefix + "_" + (i / 2 + 1), ids[i], ids[i + 1]));
  }
  return matches;
}

function decidePenaltyWinner(state, homeId, awayId) {
  const homePlayers = state.players.filter(p => p.clubId === homeId);
  const awayPlayers = state.players.filter(p => p.clubId === awayId);
  const homeMen = homePlayers.reduce((s, p) => s + p.mental, 0) / homePlayers.length;
  const awayMen = awayPlayers.reduce((s, p) => s + p.mental, 0) / awayPlayers.length;
  const homeChance = homeMen / (homeMen + awayMen);
  return Math.random() < homeChance ? homeId : awayId;
}

// Dipakai untuk playoff kualifikasi (instan, tidak mempengaruhi statistik CUP pemain).
function simulateKnockoutMatch(state, homeId, awayId, idLabel) {
  const homeClub = state.clubs.find(c => c.id === homeId);
  const awayClub = state.clubs.find(c => c.id === awayId);
  const homePlayers = state.players.filter(p => p.clubId === homeId);
  const awayPlayers = state.players.filter(p => p.clubId === awayId);
  const result = simulateMatch(homeClub, awayClub, homePlayers, awayPlayers);

  const m = emptyCupMatch(idLabel, homeId, awayId);
  m.played = true;
  m.homeGoals = result.homeGoals;
  m.awayGoals = result.awayGoals;
  m.events = result.events;
  if (result.homeGoals > result.awayGoals) m.winnerId = homeId;
  else if (result.awayGoals > result.homeGoals) m.winnerId = awayId;
  else { m.penalty = true; m.winnerId = decidePenaltyWinner(state, homeId, awayId); }
  return m;
}

// Ambil urutan klasemen akhir musim sebelumnya (rank 1..20). Untuk musim
// pertama (belum ada riwayat), pakai peringkat OVR skuad sebagai gantinya.
function getPreviousStandingIds(state) {
  if (state.lastSeasonStandingIds && state.lastSeasonStandingIds.length === 20) {
    return state.lastSeasonStandingIds;
  }
  return [...state.clubs]
    .sort((a, b) => clubOverall(state.players, b.id) - clubOverall(state.players, a.id))
    .map(c => c.id);
}

// Menyusun CUP baru untuk musim berjalan: jalankan playoff kualifikasi lalu
// siapkan bracket Babak 16 Besar.
function initCupForSeason(state) {
  const standingIds = getPreviousStandingIds(state);
  const top15 = standingIds.slice(0, 15);
  const playoffIds = standingIds.slice(15, 19); // peringkat 16-19
  const goneId = standingIds[19]; // peringkat 20, otomatis gugur

  const semiA = simulateKnockoutMatch(state, playoffIds[0], playoffIds[3], "playoff_sa");
  const semiB = simulateKnockoutMatch(state, playoffIds[1], playoffIds[2], "playoff_sb");
  const final = simulateKnockoutMatch(state, semiA.winnerId, semiB.winnerId, "playoff_final");

  const entrants = [...top15, final.winnerId];

  state.cup = {
    season: state.season,
    stage: "r16",
    playoff: {
      semis: [semiA, semiB],
      final,
      winnerId: final.winnerId,
      eliminatedRank20: goneId,
      participants: playoffIds
    },
    entrants,
    r16: buildBracketRound(entrants, "r16", true),
    qf: [],
    sf: [],
    third: null,
    final: null,
    championId: null,
    runnerUpId: null,
    thirdId: null
  };
}

function applyCupMatchResultToPlayers(players, result, homeIds, awayIds) {
  const byId = {};
  players.forEach(p => byId[p.id] = p);

  homeIds.concat(awayIds).forEach(id => {
    const p = byId[id];
    if (!p) return;
    p.cupMatch = (p.cupMatch || 0) + 1;
    const r = result.ratings[id];
    if (r !== undefined) {
      p.cupRatingSum = (p.cupRatingSum || 0) + r;
      developPlayerFromRating(p, r);
    }
  });

  result.events.forEach(ev => {
    if (ev.type === "goal") {
      if (byId[ev.scorerId]) byId[ev.scorerId].cupGoal = (byId[ev.scorerId].cupGoal || 0) + 1;
      if (ev.assistId && byId[ev.assistId]) byId[ev.assistId].cupAssist = (byId[ev.assistId].cupAssist || 0) + 1;
    }
  });
}

// Mengecek apakah pada state.matchday saat ini seharusnya ada babak CUP yang
// disimulasikan lebih dulu (sebelum matchday liga tsb dimainkan).
function getCupStageDue(state) {
  if (!state.cup || !state.cup.stage) return null;
  const expected = CUP_TRIGGER_MATCHDAY[state.matchday];
  if (!expected) return null;
  if (state.cup.stage !== expected) return null;
  return expected;
}

function advanceCupStage(state, stage, matchList) {
  const winners = matchList.map(m => m.winnerId);
  if (stage === "r16") {
    state.cup.qf = buildBracketRound(winners, "qf", false);
    state.cup.stage = "qf";
  } else if (stage === "qf") {
    state.cup.sf = buildBracketRound(winners, "sf", false);
    state.cup.stage = "sf";
  } else if (stage === "sf") {
    const losers = matchList.map(m => (m.homeId === m.winnerId ? m.awayId : m.homeId));
    state.cup.final = emptyCupMatch("final", winners[0], winners[1]);
    state.cup.third = emptyCupMatch("third", losers[0], losers[1]);
    state.cup.stage = "third";
  } else if (stage === "third") {
    state.cup.thirdId = matchList[0].winnerId;
    state.cup.stage = "final";
  } else if (stage === "final") {
    state.cup.championId = matchList[0].winnerId;
    const m = matchList[0];
    state.cup.runnerUpId = (m.homeId === m.winnerId) ? m.awayId : m.homeId;
    state.cup.stage = null; // CUP musim ini selesai
  }
}

// Simulasikan seluruh laga pada babak CUP yang sedang tertunda. Mengembalikan
// hasil laga milik klub pemain (format serupa userResult liga) atau null.
function simulateCupStage(state) {
  const stage = state.cup.stage;
  const raw = state.cup[stage];
  const matchList = Array.isArray(raw) ? raw : [raw];

  let userResult = null;

  matchList.forEach(m => {
    const homeClub = state.clubs.find(c => c.id === m.homeId);
    const awayClub = state.clubs.find(c => c.id === m.awayId);
    const homePlayers = state.players.filter(p => p.clubId === m.homeId);
    const awayPlayers = state.players.filter(p => p.clubId === m.awayId);

    const result = simulateMatch(homeClub, awayClub, homePlayers, awayPlayers);

    m.played = true;
    m.homeGoals = result.homeGoals;
    m.awayGoals = result.awayGoals;
    m.events = result.events;

    if (result.homeGoals > result.awayGoals) { m.winnerId = m.homeId; m.penalty = false; }
    else if (result.awayGoals > result.homeGoals) { m.winnerId = m.awayId; m.penalty = false; }
    else { m.penalty = true; m.winnerId = decidePenaltyWinner(state, m.homeId, m.awayId); }

    applyCupMatchResultToPlayers(state.players, result, homePlayers.map(p => p.id), awayPlayers.map(p => p.id));

    if (m.homeId === state.userClubId || m.awayId === state.userClubId) {
      userResult = {
        homeId: m.homeId, awayId: m.awayId,
        homeGoals: m.homeGoals, awayGoals: m.awayGoals,
        events: m.events, ratings: result.ratings,
        isCup: true, stage, penalty: m.penalty, winnerId: m.winnerId
      };
    }
  });

  advanceCupStage(state, stage, matchList);

  return userResult;
}

function avgCupRating(p) {
  return p.cupMatch > 0 ? (p.cupRatingSum / p.cupMatch) : 0;
}

function getCupAwards(state) {
  const players = state.players;
  const sortedScorer = [...players].sort((a, b) => (b.cupGoal || 0) - (a.cupGoal || 0))[0];
  const sortedAssist = [...players].sort((a, b) => (b.cupAssist || 0) - (a.cupAssist || 0))[0];
  return {
    cupTopScorer: sortedScorer && sortedScorer.cupGoal > 0 ? sortedScorer.id : null,
    cupTopAssist: sortedAssist && sortedAssist.cupAssist > 0 ? sortedAssist.id : null
  };
}
