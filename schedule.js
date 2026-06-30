// js/schedule.js
// Round robin home & away: 20 klub -> 38 laga per klub, 380 pertandingan per musim.

function generateFixtures(clubIds) {
  const ids = [...clubIds];
  if (ids.length % 2 !== 0) ids.push(null); // bye, not used here (20 is even)
  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;
  const firstLeg = []; // array of rounds, each round = array of [home, away]

  let arr = ids.slice();
  for (let r = 0; r < rounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== null && away !== null) {
        // alternate home/away based on round parity to balance
        if (r % 2 === 0) roundMatches.push([home, away]);
        else roundMatches.push([away, home]);
      }
    }
    firstLeg.push(roundMatches);
    // rotate (keep first fixed)
    const fixedFirst = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop());
    arr = [fixedFirst, ...rest];
  }

  // second leg: reverse home/away
  const secondLeg = firstLeg.map(round => round.map(([h, a]) => [a, h]));

  const allRounds = [...firstLeg, ...secondLeg];
  const fixtures = [];
  let matchday = 1;
  for (const round of allRounds) {
    for (const [home, away] of round) {
      fixtures.push({
        id: "f_" + fixtures.length,
        matchday,
        homeId: home,
        awayId: away,
        played: false,
        homeGoals: null,
        awayGoals: null,
        events: []
      });
    }
    matchday++;
  }
  return fixtures;
}
