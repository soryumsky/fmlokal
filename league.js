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
