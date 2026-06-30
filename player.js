// js/player.js

function applyMatchResultToPlayers(players, result, homeIds, awayIds) {
  const byId = {};
  players.forEach(p => byId[p.id] = p);

  homeIds.concat(awayIds).forEach(id => {
    const p = byId[id];
    if (!p) return;
    p.match += 1;
    const r = result.ratings[id];
    if (r !== undefined) p.ratingSum += r;
  });

  result.events.forEach(ev => {
    if (ev.type === "goal") {
      if (byId[ev.scorerId]) byId[ev.scorerId].goal += 1;
      if (ev.assistId && byId[ev.assistId]) byId[ev.assistId].assist += 1;
    } else if (ev.type === "yellow") {
      if (byId[ev.playerId]) byId[ev.playerId].yc += 1;
    } else if (ev.type === "red") {
      if (byId[ev.playerId]) byId[ev.playerId].rc += 1;
    }
  });
}

function avgRating(p) {
  return p.match > 0 ? (p.ratingSum / p.match) : 0;
}

function getAwards(players, clubs) {
  const byClub = {};
  clubs.forEach(c => byClub[c.id] = c);

  const goldenBoot = [...players].sort((a, b) => b.goal - a.goal)[0];
  const topAssist = [...players].sort((a, b) => b.assist - a.assist)[0];

  const ballonScore = p => p.goal * 2 + p.assist * 1.5 + avgRating(p) * (p.match || 1) * 0.3;
  const ballonDor = [...players].sort((a, b) => ballonScore(b) - ballonScore(a))[0];

  const champion = [...clubs].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga))[0];

  const eligiblePlayers = players.filter(p => p.match >= 5);
  const bySlot = {
    GK: [...eligiblePlayers.filter(p => p.pos === "GK")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 1),
    DEF: [...eligiblePlayers.filter(p => p.pos === "DEF")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 4),
    MID: [...eligiblePlayers.filter(p => p.pos === "MID")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 4),
    ATT: [...eligiblePlayers.filter(p => p.pos === "ATT")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 2),
  };
  const teamOfSeason = [...bySlot.GK, ...bySlot.DEF, ...bySlot.MID, ...bySlot.ATT];

  return {
    champion: champion ? champion.id : null,
    goldenBoot: goldenBoot ? goldenBoot.id : null,
    topAssist: topAssist ? topAssist.id : null,
    ballonDor: ballonDor ? ballonDor.id : null,
    teamOfSeason: teamOfSeason.map(p => p.id)
  };
}
