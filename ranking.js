// js/ranking.js
// Fitur "Ranking Klub": setiap akhir musim, tiap klub mendapat poin dari
// pencapaian akhir musim di Liga (peringkat klasemen 1-20) dan di CUP
// (Juara 1/2/3/4, Peringkat 5-8, Peringkat 9-16, Tidak Lolos). Poin
// diakumulasikan lintas musim untuk menghasilkan ranking klub sepanjang karir.

// Poin Liga berdasarkan peringkat akhir klasemen (1 = juara, 20 = paling bawah).
const LEAGUE_RANK_POINTS = {
  1: 100, 2: 75, 3: 50, 4: 40, 5: 35, 6: 32, 7: 30, 8: 28, 9: 26, 10: 25,
  11: 20, 12: 19, 13: 18, 14: 17, 15: 15, 16: 10, 17: 8, 18: 6, 19: 4, 20: 2
};
function leaguePointsForRank(rank) {
  return LEAGUE_RANK_POINTS[rank] || 0;
}

// Poin CUP berdasarkan babak tersingkir (tier), bukan per-peringkat individual
// karena format gugur tidak menghasilkan urutan 1-20 yang rapi.
const CUP_TIER_POINTS = {
  champion: 80,
  runnerUp: 60,
  third: 50,
  fourth: 30,
  qf: 15,   // Posisi 5-8 (kalah di 8 Besar)
  r16: 5,   // Posisi 9-16 (kalah di 16 Besar)
  none: 0   // Posisi 17-20 (tidak lolos CUP / gagal playoff kualifikasi)
};

const CUP_TIER_LABEL = {
  champion: "Juara 1 CUP",
  runnerUp: "Juara 2 CUP",
  third: "Juara 3 CUP",
  fourth: "Juara 4 CUP",
  qf: "Peringkat 5-8 CUP",
  r16: "Peringkat 9-16 CUP",
  none: "Tidak Lolos CUP"
};

// Menentukan tier CUP tiap klub untuk musim yang baru saja selesai,
// berdasarkan state.cup (masih terisi hasil musim ini, sebelum di-reset
// oleh initCupForSeason untuk musim berikutnya).
function computeCupPlacements(state) {
  const placements = {};
  const cup = state.cup;
  if (!cup) {
    state.clubs.forEach(c => { placements[c.id] = { tier: "none", label: CUP_TIER_LABEL.none, points: CUP_TIER_POINTS.none }; });
    return placements;
  }

  const setP = (clubId, tier) => {
    if (clubId && !placements[clubId]) {
      placements[clubId] = { tier, label: CUP_TIER_LABEL[tier], points: CUP_TIER_POINTS[tier] };
    }
  };

  setP(cup.championId, "champion");
  setP(cup.runnerUpId, "runnerUp");
  setP(cup.thirdId, "third");

  if (cup.third && cup.third.winnerId) {
    const fourthId = cup.third.winnerId === cup.third.homeId ? cup.third.awayId : cup.third.homeId;
    setP(fourthId, "fourth");
  }

  (cup.qf || []).forEach(m => {
    if (!m.winnerId) return;
    const loserId = m.winnerId === m.homeId ? m.awayId : m.homeId;
    setP(loserId, "qf");
  });

  (cup.r16 || []).forEach(m => {
    if (!m.winnerId) return;
    const loserId = m.winnerId === m.homeId ? m.awayId : m.homeId;
    setP(loserId, "r16");
  });

  state.clubs.forEach(c => setP(c.id, "none"));

  return placements;
}

// Hitung poin ranking musim ini untuk semua klub lalu akumulasikan ke
// masing-masing objek klub (persisten lintas musim). standingsOrder adalah
// array clubId terurut dari klasemen akhir musim (peringkat 1..20).
function applySeasonRankingPoints(state, standingsOrder) {
  const cupPlacements = computeCupPlacements(state);
  const logEntries = [];

  standingsOrder.forEach((clubId, idx) => {
    const club = state.clubs.find(c => c.id === clubId);
    if (!club) return;
    const leagueRank = idx + 1;
    const leaguePoints = leaguePointsForRank(leagueRank);
    const cupInfo = cupPlacements[clubId] || { label: CUP_TIER_LABEL.none, points: CUP_TIER_POINTS.none };
    const total = leaguePoints + cupInfo.points;

    club.rankLeaguePoints = (club.rankLeaguePoints || 0) + leaguePoints;
    club.rankCupPoints = (club.rankCupPoints || 0) + cupInfo.points;
    club.rankPoints = (club.rankPoints || 0) + total;
    club.rankSeasons = (club.rankSeasons || 0) + 1;

    logEntries.push({
      season: state.season,
      clubId,
      clubName: club.name,
      leagueRank,
      leaguePoints,
      cupLabel: cupInfo.label,
      cupPoints: cupInfo.points,
      total
    });
  });

  state.rankingLog = state.rankingLog || [];
  state.rankingLog.push(...logEntries);
}

// Tabel ranking klub sepanjang karir, terurut dari total poin tertinggi.
function getClubRankingTable(state) {
  return [...state.clubs]
    .map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      leaguePoints: c.rankLeaguePoints || 0,
      cupPoints: c.rankCupPoints || 0,
      total: c.rankPoints || 0,
      seasons: c.rankSeasons || 0,
      keyOvr: clubKeyOverall(state.players, c.id)
    }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.leaguePoints !== a.leaguePoints) return b.leaguePoints - a.leaguePoints;
      return a.name.localeCompare(b.name);
    });
}
