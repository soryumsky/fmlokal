// js/league.js

function resetClubStats(clubs) {
  clubs.forEach(c => {
    c.played = 0; c.win = 0; c.draw = 0; c.lose = 0;
    c.gf = 0; c.ga = 0; c.pts = 0;
  });
}

function applyResultToStandings(clubs, homeId, awayId, hg, ag) {
  const home = clubs.find(c => c.id === homeId);
  const away = clubs.find(c => c.id === awayId);
  home.played++; away.played++;
  home.gf += hg; home.ga += ag;
  away.gf += ag; away.ga += hg;
  if (hg > ag) { home.win++; home.pts += 3; away.lose++; }
  else if (hg < ag) { away.win++; away.pts += 3; home.lose++; }
  else { home.draw++; away.draw++; home.pts += 1; away.pts += 1; }
}

function getStandings(clubs) {
  return [...clubs].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

// Rekap trophy (Liga & CUP) tiap klub berdasarkan riwayat musim (state.history).
// Dipakai untuk tab "Trophy Room". Diurutkan berdasarkan total trophy terbanyak.
function getClubTrophies(state) {
  const rows = state.clubs.map(c => ({
    id: c.id, name: c.name, color: c.color, league: 0, cup: 0
  }));
  const byName = {};
  rows.forEach(r => { byName[r.name] = r; });

  (state.history || []).forEach(h => {
    if (h.championName && byName[h.championName]) byName[h.championName].league++;
    if (h.cupChampionName && h.cupChampionName !== "-" && byName[h.cupChampionName]) {
      byName[h.cupChampionName].cup++;
    }
  });

  rows.forEach(r => { r.total = r.league + r.cup; });

  return rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.league !== a.league) return b.league - a.league;
    if (b.cup !== a.cup) return b.cup - a.cup;
    return a.name.localeCompare(b.name);
  });
}

// Form guide: hasil N pertandingan terakhir sebuah klub, urut dari terlama ke terbaru.
// Return array berisi 'W' | 'D' | 'L'.
function getClubForm(clubId, fixtures, n) {
  const played = fixtures
    .filter(f => f.played && (f.homeId === clubId || f.awayId === clubId))
    .sort((a, b) => a.matchday - b.matchday);
  const last = played.slice(-n);
  return last.map(f => {
    const isHome = f.homeId === clubId;
    const gf = isHome ? f.homeGoals : f.awayGoals;
    const ga = isHome ? f.awayGoals : f.homeGoals;
    if (gf > ga) return "W";
    if (gf < ga) return "L";
    return "D";
  });
}
