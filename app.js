// js/app.js

let state = null;
let currentTab = "home";
let squadTab = "club";
let openClubId = null;
let showTots = false;

function newGameState() {
  const { clubs, players } = buildClubsAndPlayers();
  const fixtures = generateFixtures(clubs.map(c => c.id));
  const state = {
    userClubId: null,
    clubs, players, fixtures,
    season: 1,
    matchday: 1,
    history: [],
    lastSimResult: null,
    lastSeasonStandingIds: null,
    cup: null
  };
  initCupForSeason(state);
  return state;
}

function init() {
  const saved = Storage.load();
  if (saved) {
    state = saved;
    // Kompatibilitas save lama (sebelum fitur CUP ditambahkan): siapkan CUP
    // untuk musim yang sedang berjalan bila belum ada.
    if (!state.cup) {
      state.players.forEach(p => {
        if (p.cupGoal === undefined) { p.cupGoal = 0; p.cupAssist = 0; p.cupMatch = 0; p.cupRatingSum = 0; }
      });
      if (state.lastSeasonStandingIds === undefined) state.lastSeasonStandingIds = null;
      initCupForSeason(state);
      Storage.save(state);
    }
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
  else if (currentTab === "cup") body = UI.renderCup(state);
  else if (currentTab === "match") body = UI.renderMatch(state);
  else if (currentTab === "squad") body = UI.renderSquad(state, squadTab);
  else if (currentTab === "history") body = UI.renderHistory(state);

  app.innerHTML = UI.renderTopbar(state) + `<main>${body}</main>` + UI.renderBottomNav(currentTab)
    + (openClubId ? UI.renderClubModal(state, openClubId) : "")
    + (showTots ? UI.renderTotsModal(state) : "");
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

  const simToNextBtn = document.getElementById("btn-sim-to-next");
  if (simToNextBtn) simToNextBtn.addEventListener("click", simulateToNextUserMatch);

  const finishBtn = document.getElementById("btn-finish-season");
  if (finishBtn) finishBtn.addEventListener("click", finishSeason);

  document.querySelectorAll("[data-squadtab]").forEach(elm => {
    elm.addEventListener("click", () => {
      squadTab = elm.dataset.squadtab;
      render();
    });
  });

  document.querySelectorAll("[data-club-detail]").forEach(elm => {
    elm.addEventListener("click", () => {
      openClubId = elm.dataset.clubDetail;
      render();
    });
  });

  document.querySelectorAll("[data-open-tots]").forEach(elm => {
    elm.addEventListener("click", () => {
      showTots = true;
      render();
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(elm => {
    elm.addEventListener("click", () => {
      openClubId = null;
      showTots = false;
      render();
    });
  });

  const modalBox = document.querySelector(".modal-box");
  if (modalBox) {
    modalBox.addEventListener("click", (e) => e.stopPropagation());
  }
}

// Simulasi satu matchday tanpa render/toast, dipakai baik untuk simulasi
// satu-satu maupun simulasi cepat berantai. Mengembalikan userResult jika
// klub milik pemain bertanding pada matchday ini, atau null jika tidak.
function simulateMatchdayCore() {
  // Jika sudah waktunya, mainkan dulu babak CUP yang disisipkan sebelum
  // matchday liga ini (mis. Babak 16 Besar disisipkan setelah Match 8).
  const cupStage = getCupStageDue(state);
  if (cupStage) {
    const cupUserResult = simulateCupStage(state);
    state.lastCupStageLabel = CUP_STAGE_LABEL[cupStage];
    if (cupUserResult) return cupUserResult;
    // Tidak ada laga CUP milik klub pemain di babak ini; lanjut proses
    // matchday liga di panggilan berikutnya (matchday tidak berubah).
    return null;
  }
  state.lastCupStageLabel = null;

  const fixturesToday = state.fixtures.filter(f => f.matchday === state.matchday && !f.played);
  if (!fixturesToday.length) {
    state.matchday++;
    return null;
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
      userResult = {
        homeId: f.homeId, awayId: f.awayId,
        homeGoals: result.homeGoals, awayGoals: result.awayGoals,
        events: result.events, ratings: result.ratings
      };
    }
  });

  state.matchday++;
  return userResult;
}

function simulateMatchday() {
  state.lastCupStageLabel = null;
  const userResult = simulateMatchdayCore();

  if (userResult) {
    state.lastSimResult = userResult;
    currentTab = "match";
  }

  Storage.save(state);
  render();

  if (userResult) {
    const homeName = UI.clubById(state, userResult.homeId).name;
    const awayName = UI.clubById(state, userResult.awayId).name;
    const prefix = userResult.isCup ? `[CUP - ${CUP_STAGE_LABEL[userResult.stage]}] ` : "";
    const penaltyNote = userResult.isCup && userResult.penalty ? " (Adu Penalti)" : "";
    UI.toast(`${prefix}${homeName} ${userResult.homeGoals} - ${userResult.awayGoals} ${awayName}${penaltyNote}`);
  } else if (state.lastCupStageLabel) {
    UI.toast(`Babak CUP ${state.lastCupStageLabel} telah dimainkan. Tekan lagi untuk lanjut matchday liga.`);
  } else {
    UI.toast("Matchday selesai.");
  }
}

// Fitur QoL: simulasikan matchday berturut-turut secara diam-diam sampai
// klub pemain kembali bertanding, atau musim berakhir (matchday > 38).
function simulateToNextUserMatch() {
  let userResult = null;
  let safety = 0;
  while (state.matchday <= 38 && !userResult && safety < 50) {
    userResult = simulateMatchdayCore();
    safety++;
  }

  if (userResult) {
    state.lastSimResult = userResult;
    currentTab = "match";
  }

  Storage.save(state);
  render();

  if (userResult) {
    const homeName = UI.clubById(state, userResult.homeId).name;
    const awayName = UI.clubById(state, userResult.awayId).name;
    const prefix = userResult.isCup ? `[CUP - ${CUP_STAGE_LABEL[userResult.stage]}] ` : "";
    const penaltyNote = userResult.isCup && userResult.penalty ? " (Adu Penalti)" : "";
    UI.toast(`${prefix}${homeName} ${userResult.homeGoals} - ${userResult.awayGoals} ${awayName}${penaltyNote}`);
  } else {
    UI.toast("Musim selesai! Lihat hasil akhir.");
  }
}

function finishSeason() {
  // Simpan urutan klasemen akhir musim ini sebagai dasar seeding CUP musim depan.
  const standingsOrder = getStandings(state.clubs).map(c => c.id);

  const awards = getAwards(state.players, state.clubs, state.cup);
  const cupAwards = getCupAwards(state);
  const p = id => state.players.find(pl => pl.id === id);
  const c = id => state.clubs.find(cl => cl.id === id);
  const champion = c(awards.champion);
  const goldenBoot = p(awards.goldenBoot);
  const topAssist = p(awards.topAssist);
  const ballonDor = p(awards.ballonDor);

  const cupChampion = state.cup && state.cup.championId ? c(state.cup.championId) : null;
  const cupTopScorer = cupAwards.cupTopScorer ? p(cupAwards.cupTopScorer) : null;
  const cupTopAssist = cupAwards.cupTopAssist ? p(cupAwards.cupTopAssist) : null;

  state.history.push({
    season: state.season,
    championName: champion.name,
    goldenBootName: goldenBoot.name,
    goldenBootGoals: goldenBoot.goal,
    topAssistName: topAssist.name,
    topAssistAssists: topAssist.assist,
    ballonDorName: ballonDor.name,
    cupChampionName: cupChampion ? cupChampion.name : "-",
    cupTopScorerName: cupTopScorer ? cupTopScorer.name : "-",
    cupTopScorerGoals: cupTopScorer ? cupTopScorer.cupGoal : 0,
    cupTopAssistName: cupTopAssist ? cupTopAssist.name : "-",
    cupTopAssistAssists: cupTopAssist ? cupTopAssist.cupAssist : 0
  });

  state.lastSeasonStandingIds = standingsOrder;

  // mulai musim baru: reset stat klub & pemain, fixture baru
  resetClubStats(state.clubs);
  state.players.forEach(p => {
    p.goal = 0; p.assist = 0; p.match = 0; p.ratingSum = 0; p.yc = 0; p.rc = 0;
    p.cupGoal = 0; p.cupAssist = 0; p.cupMatch = 0; p.cupRatingSum = 0;
  });
  state.fixtures = generateFixtures(state.clubs.map(c => c.id));
  state.season++;
  state.matchday = 1;
  state.lastSimResult = null;
  state.lastCupStageLabel = null;
  initCupForSeason(state);

  Storage.save(state);
  currentTab = "history";
  render();
  UI.toast(`Musim ${state.season - 1} selesai! Juara Liga: ${champion.name}${cupChampion ? " · Juara CUP: " + cupChampion.name : ""}`);
}

document.addEventListener("DOMContentLoaded", init);
