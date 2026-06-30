// js/app.js

let state = null;
let currentTab = "home";
let squadTab = "club";

function newGameState() {
  const { clubs, players } = buildClubsAndPlayers();
  const fixtures = generateFixtures(clubs.map(c => c.id));
  return {
    userClubId: null,
    clubs, players, fixtures,
    season: 1,
    matchday: 1,
    history: [],
    lastSimResult: null
  };
}

function init() {
  const saved = Storage.load();
  if (saved) {
    state = saved;
  } else {
    state = newGameState();
  }
  render();
}

function render() {
  const app = document.getElementById("app");
  if (!state.userClubId) {
    app.innerHTML = UI.renderTopbar(state) + `<main>${UI.renderOnboarding(state)}</main>`;
    bindOnboarding();
    return;
  }

  let body = "";
  if (currentTab === "home") body = UI.renderHome(state);
  else if (currentTab === "league") body = UI.renderLeague(state);
  else if (currentTab === "match") body = UI.renderMatch(state);
  else if (currentTab === "squad") body = UI.renderSquad(state, squadTab);
  else if (currentTab === "history") body = UI.renderHistory(state);

  app.innerHTML = UI.renderTopbar(state) + `<main>${body}</main>` + UI.renderBottomNav(currentTab);
  bindMainEvents();
}

function bindOnboarding() {
  document.querySelectorAll(".club-pick").forEach(elm => {
    elm.addEventListener("click", () => {
      state.userClubId = elm.dataset.club;
      Storage.save(state);
      render();
      UI.toast("Selamat datang di " + UI.clubById(state, state.userClubId).name + "!");
    });
  });
}

function bindMainEvents() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTab = btn.dataset.nav;
      render();
    });
  });

  const simBtn = document.getElementById("btn-sim-matchday");
  if (simBtn) simBtn.addEventListener("click", simulateMatchday);

  const finishBtn = document.getElementById("btn-finish-season");
  if (finishBtn) finishBtn.addEventListener("click", finishSeason);

  document.querySelectorAll("[data-squadtab]").forEach(elm => {
    elm.addEventListener("click", () => {
      squadTab = elm.dataset.squadtab;
      render();
    });
  });
}

function simulateMatchday() {
  const fixturesToday = state.fixtures.filter(f => f.matchday === state.matchday && !f.played);
  if (!fixturesToday.length) {
    state.matchday++;
    Storage.save(state);
    render();
    return;
  }

  let userResult = null;

  fixturesToday.forEach(f => {
    const homePlayers = UI.playersByClub(state, f.homeId);
    const awayPlayers = UI.playersByClub(state, f.awayId);
    const homeClub = UI.clubById(state, f.homeId);
    const awayClub = UI.clubById(state, f.awayId);

    const result = simulateMatch(homeClub, awayClub, homePlayers, awayPlayers);

    f.played = true;
    f.homeGoals = result.homeGoals;
    f.awayGoals = result.awayGoals;
    f.events = result.events;

    applyResultToStandings(state.clubs, f.homeId, f.awayId, result.homeGoals, result.awayGoals);
    applyMatchResultToPlayers(state.players, result, homePlayers.map(p => p.id), awayPlayers.map(p => p.id));

    if (f.homeId === state.userClubId || f.awayId === state.userClubId) {
      userResult = { homeId: f.homeId, awayId: f.awayId, homeGoals: result.homeGoals, awayGoals: result.awayGoals, events: result.events };
    }
  });

  if (userResult) {
    state.lastSimResult = userResult;
    currentTab = "match";
  }

  state.matchday++;
  Storage.save(state);
  render();

  if (userResult) {
    const homeName = UI.clubById(state, userResult.homeId).name;
    const awayName = UI.clubById(state, userResult.awayId).name;
    UI.toast(`${homeName} ${userResult.homeGoals} - ${userResult.awayGoals} ${awayName}`);
  } else {
    UI.toast("Matchday selesai.");
  }
}

function finishSeason() {
  const awards = getAwards(state.players, state.clubs);
  const p = id => state.players.find(pl => pl.id === id);
  const c = id => state.clubs.find(cl => cl.id === id);
  const champion = c(awards.champion);
  const goldenBoot = p(awards.goldenBoot);
  const topAssist = p(awards.topAssist);
  const ballonDor = p(awards.ballonDor);

  state.history.push({
    season: state.season,
    championName: champion.name,
    goldenBootName: goldenBoot.name,
    goldenBootGoals: goldenBoot.goal,
    topAssistName: topAssist.name,
    topAssistAssists: topAssist.assist,
    ballonDorName: ballonDor.name
  });

  // mulai musim baru: reset stat klub & pemain, fixture baru
  resetClubStats(state.clubs);
  state.players.forEach(p => {
    p.goal = 0; p.assist = 0; p.match = 0; p.ratingSum = 0; p.yc = 0; p.rc = 0;
  });
  state.fixtures = generateFixtures(state.clubs.map(c => c.id));
  state.season++;
  state.matchday = 1;
  state.lastSimResult = null;

  Storage.save(state);
  currentTab = "history";
  render();
  UI.toast(`Musim ${state.season - 1} selesai! Juara: ${champion.name}`);
}

document.addEventListener("DOMContentLoaded", init);
