// js/match.js
// Simulasi pertandingan interval 5 menit (18 interval = 90 menit)

function clubRating(players, statKey) {
  const sum = players.reduce((s, p) => s + p[statKey], 0);
  return sum / players.length;
}

function pickWeighted(items, weightFn) {
  const weights = items.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function simulateMatch(homeClub, awayClub, homePlayers, awayPlayers) {
  const events = [];
  let homeGoals = 0, awayGoals = 0;
  let momentum = 0; // positif = home unggul momentum, negatif = away

  const HOME_ADV = 1.08;

  const homeAtk = clubRating(homePlayers, "attack") * HOME_ADV;
  const homeDef = clubRating(homePlayers, "defense");
  const homeCre = clubRating(homePlayers, "creativity");
  const homeMen = clubRating(homePlayers, "mental");
  const homeSta = clubRating(homePlayers, "stamina");

  const awayAtk = clubRating(awayPlayers, "attack");
  const awayDef = clubRating(awayPlayers, "defense");
  const awayCre = clubRating(awayPlayers, "creativity");
  const awayMen = clubRating(awayPlayers, "mental");
  const awaySta = clubRating(awayPlayers, "stamina");

  const ratingTally = {};
  homePlayers.concat(awayPlayers).forEach(p => ratingTally[p.id] = 6.0);

  const intervals = 18; // 90 menit / 5 menit

  for (let i = 0; i < intervals; i++) {
    const minute = (i + 1) * 5;
    const staminaFactor = 1 - (i / intervals) * 0.15; // stamina turun seiring waktu

    const homePower = (homeAtk * 0.4 + homeCre * 0.3 + homeMen * 0.15 + homeSta * 0.15) * staminaFactor + momentum * 0.5;
    const awayPower = (awayAtk * 0.4 + awayCre * 0.3 + awayMen * 0.15 + awaySta * 0.15) * staminaFactor - momentum * 0.5;

    const homeChance = homePower / (homePower + awayDef * 0.9);
    const awayChance = awayPower / (awayPower + homeDef * 0.9);

    // peluang terjadi
    if (Math.random() < homeChance * 0.32) {
      const scored = Math.random() < (0.32 + (homeAtk - awayDef) / 400);
      if (scored) {
        homeGoals++;
        momentum += 1.5;
        const scorer = pickWeighted(homePlayers.filter(p => p.pos !== "GK"), p => p.attack + p.creativity);
        const assistPool = homePlayers.filter(p => p.id !== scorer.id && p.pos !== "GK");
        const assister = Math.random() < 0.7 ? pickWeighted(assistPool, p => p.creativity) : null;
        events.push({ minute, type: "goal", team: "home", scorerId: scorer.id, assistId: assister ? assister.id : null });
        ratingTally[scorer.id] += 1.0;
        if (assister) ratingTally[assister.id] += 0.6;
      } else {
        events.push({ minute, type: "chance", team: "home" });
        momentum += 0.3;
      }
    } else if (Math.random() < awayChance * 0.32) {
      const scored = Math.random() < (0.32 + (awayAtk - homeDef) / 400);
      if (scored) {
        awayGoals++;
        momentum -= 1.5;
        const scorer = pickWeighted(awayPlayers.filter(p => p.pos !== "GK"), p => p.attack + p.creativity);
        const assistPool = awayPlayers.filter(p => p.id !== scorer.id && p.pos !== "GK");
        const assister = Math.random() < 0.7 ? pickWeighted(assistPool, p => p.creativity) : null;
        events.push({ minute, type: "goal", team: "away", scorerId: scorer.id, assistId: assister ? assister.id : null });
        ratingTally[scorer.id] += 1.0;
        if (assister) ratingTally[assister.id] += 0.6;
      } else {
        events.push({ minute, type: "chance", team: "away" });
        momentum -= 0.3;
      }
    }

    // kartu acak langka
    if (Math.random() < 0.015) {
      const allOnPitch = homePlayers.concat(awayPlayers).filter(p => p.pos !== "GK");
      const offender = allOnPitch[Math.floor(Math.random() * allOnPitch.length)];
      const isRed = Math.random() < 0.12;
      events.push({ minute, type: isRed ? "red" : "yellow", playerId: offender.id });
      ratingTally[offender.id] -= isRed ? 1.5 : 0.3;
    }

    momentum *= 0.85; // momentum meluruh
  }

  // finalisasi rating dengan sedikit noise & bonus clean sheet
  homePlayers.concat(awayPlayers).forEach(p => {
    let r = ratingTally[p.id] + (Math.random() * 0.6 - 0.3);
    if (p.pos === "GK") {
      const conceded = homePlayers.includes(p) ? awayGoals : homeGoals;
      r += conceded === 0 ? 1.2 : -conceded * 0.3;
    }
    ratingTally[p.id] = Math.max(4.0, Math.min(10.0, r));
  });

  return { homeGoals, awayGoals, events, ratings: ratingTally };
}
