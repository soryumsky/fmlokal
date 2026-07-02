// js/ui.js

const UI = {
  el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  },

  toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.getElementById("app").appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 2200);
  },

  clubById(state, id) { return state.clubs.find(c => c.id === id); },
  playersByClub(state, id) { return state.players.filter(p => p.clubId === id); },

  // Span nama klub yang bisa diklik untuk membuka detail klub (skuad & trophy).
  clubLink(club) {
    if (!club) return "";
    return `<span class="name-link" data-club-detail="${club.id}">${club.name}</span>`;
  },
  // Span nama pemain yang bisa diklik untuk membuka detail atribut lengkap pemain.
  playerLink(p) {
    if (!p) return "";
    return `<span class="name-link" data-player-detail="${p.id}">${p.name}</span>`;
  },

  // Tampilkan ringkas 3 atribut kunci pemain, mis. "ATK 84.3 · CRE 90.1 · MEN 88.0"
  keyAttrsText(p) {
    return keyAttrsOf(p).map(k => `${KEY_ATTR_LABEL[k]} ${p[k].toFixed(1)}`).join(" · ");
  },


  renderFormBadges(clubId, fixtures, n) {
    const form = getClubForm(clubId, fixtures, n || 5);
    if (!form.length) return `<span class="form-empty">-</span>`;
    return `<span class="form-badges">${form.map(r => `<span class="form-dot form-${r}">${r}</span>`).join("")}</span>`;
  },

  renderTopbar(state) {
    return `<div class="topbar">
      <div class="brand">FMLOKAL</div>
      <div class="season-tag">Musim ${state.season} &middot; Matchday ${Math.min(state.matchday, 38)}/38</div>
    </div>`;
  },

  renderOnboarding(state) {
    const grid = state.clubs.map(c => {
      const ovr = clubOverall(state.players, c.id);
      return `
      <div class="club-pick" data-club="${c.id}">
        <div class="swatch" style="background:${c.color}"></div>
        <div class="club-pick-name">${c.name}</div>
        <div class="club-pick-ovr">OVR ${ovr}</div>
      </div>
    `;
    }).join("");
    return `
      <div style="padding-top:30px;text-align:center;">
        <div class="brand" style="font-size:26px;color:var(--accent);font-weight:800;">FMLOKAL</div>
        <p style="color:var(--text-dim);font-size:13px;margin-top:6px;">Pilih klub yang ingin kamu kelola musim ini.</p>
      </div>
      <div class="club-pick-grid" style="margin-top:16px;">${grid}</div>
    `;
  },

  renderHome(state) {
    const club = this.clubById(state, state.userClubId);
    const standings = getStandings(state.clubs);
    const userRank = standings.findIndex(c => c.id === club.id) + 1;
    const leader = standings[0];
    const nextFixture = state.fixtures.find(f => !f.played && (f.homeId === club.id || f.awayId === club.id));
    const allCurrentPlayed = state.fixtures.filter(f => f.matchday === state.matchday).every(f => f.played);
    const seasonDone = state.matchday > 38;
    const progressPct = Math.min(100, Math.round((Math.min(state.matchday, 38) - 1) / 38 * 100));

    let fixtureHtml = "";
    if (nextFixture) {
      const home = this.clubById(state, nextFixture.homeId);
      const away = this.clubById(state, nextFixture.awayId);
      fixtureHtml = `
        <div class="card">
          <h2 class="section-title" style="margin-top:0">Pertandingan Berikutnya &middot; MD${nextFixture.matchday}</h2>
          <div class="fixture-row">
            <div class="club"><span class="dot" style="background:${home.color}"></span>${this.clubLink(home)}</div>
            <div class="score">vs</div>
            <div class="club away">${this.clubLink(away)}<span class="dot" style="background:${away.color}"></span></div>
          </div>
        </div>`;
    }

    const gapToLeader = leader && leader.id !== club.id ? leader.pts - club.pts : 0;

    return `
      <div class="card" style="display:flex;align-items:center;gap:12px;">
        <div class="swatch" style="width:40px;height:40px;border-radius:50%;background:${club.color};flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="font-weight:800;font-size:16px;">${this.clubLink(club)}</div>
          <div style="color:var(--text-dim);font-size:12px;">
            Peringkat #${userRank} &middot; ${club.pts} poin
            ${leader && leader.id !== club.id ? ` &middot; -${gapToLeader} dari puncak` : ` &middot; Memimpin klasemen!`}
          </div>
          <div style="margin-top:6px;">${this.renderFormBadges(club.id, state.fixtures, 5)}</div>
        </div>
      </div>

      <div class="card" style="padding:12px 14px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);margin-bottom:6px;">
          <span>Progres Musim</span><span>${Math.min(state.matchday, 38)}/38</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
      </div>

      ${fixtureHtml}

      <div class="card">
        <h2 class="section-title" style="margin-top:0">Aksi Musim</h2>
        ${seasonDone
          ? `<button class="btn" id="btn-finish-season">Lihat Hasil Akhir Musim</button>`
          : `<button class="btn" id="btn-sim-matchday">
              ${allCurrentPlayed ? "Lanjut ke Matchday Berikutnya" : "Simulasikan Matchday Ini"}
            </button>
            <button class="btn secondary" id="btn-sim-to-next" style="margin-top:8px;">
              &raquo; Simulasikan Sampai Laga Saya Berikutnya
            </button>`
        }
      </div>

      <h2 class="section-title">Statistik Klub</h2>
      <div class="card">
        <table>
          <tr><th>Main</th><th>M</th><th>S</th><th>K</th><th>SG</th><th>Poin</th></tr>
          <tr>
            <td>${club.played}</td><td>${club.win}</td><td>${club.draw}</td><td>${club.lose}</td>
            <td>${club.gf - club.ga >= 0 ? "+" : ""}${club.gf - club.ga}</td><td><b>${club.pts}</b></td>
          </tr>
        </table>
      </div>
    `;
  },

  renderLeague(state) {
    const standings = getStandings(state.clubs);
    const rows = standings.map((c, i) => {
      const rank = i + 1;
      const zoneClass = rank <= 15 ? "zone-ucl" : rank <= 19 ? "zone-releg" : "";
      return `
      <tr class="club-row ${zoneClass} ${c.id === state.userClubId ? "user-club" : ""}" data-club-detail="${c.id}">
        <td class="rank">${rank}</td>
        <td class="team-name">${c.name}</td>
        <td>${c.played}</td>
        <td>${c.win}</td>
        <td>${c.draw}</td>
        <td>${c.lose}</td>
        <td>${c.gf}</td>
        <td>${c.ga}</td>
        <td>${c.gf - c.ga >= 0 ? "+" : ""}${c.gf - c.ga}</td>
        <td><b>${c.pts}</b></td>
        <td>${this.renderFormBadges(c.id, state.fixtures, 5)}</td>
      </tr>
    `;
    }).join("");
    return `
      <h2 class="section-title" style="margin-top:14px;">Klasemen Liga</h2>
      <div class="card" style="overflow-x:auto;">
        <table>
          <tr><th></th><th style="text-align:left;">Klub</th><th>M</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>SG</th><th>Pts</th><th>Form</th></tr>
          ${rows}
        </table>
        <div class="legend-row">
          <span><span class="legend-dot zone-ucl"></span>Zona CUP</span>
          <span><span class="legend-dot zone-releg"></span>Zona Playoff</span>
        </div>
      </div>
      ${this.renderAwardsSection(state)}
    `;
  },

  renderAwardsSection(state) {
    const playedCount = state.fixtures.filter(f => f.played).length;
    if (playedCount < 10) return "";
    const awards = getAwards(state.players, state.clubs, state.cup);
    const p = id => state.players.find(pl => pl.id === id);
    const c = id => state.clubs.find(cl => cl.id === id);
    const goldenBoot = p(awards.goldenBoot);
    const topAssist = p(awards.topAssist);
    const ballonDor = p(awards.ballonDor);
    const champion = c(awards.champion);
    const totsReady = awards.teamOfSeason.length === 5;
    return `
      <h2 class="section-title">Penghargaan Sementara</h2>
      <div class="card">
        <div class="award-row"><span class="award-label">Top Skor</span><span>${this.playerLink(goldenBoot)} (${goldenBoot.goal})</span></div>
        <div class="award-row"><span class="award-label">Top Assist</span><span>${this.playerLink(topAssist)} (${topAssist.assist})</span></div>
        <div class="award-row"><span class="award-label">Ballon d'Or</span><span>${this.playerLink(ballonDor)}</span></div>
        <div class="award-row"><span class="award-label">Memimpin Klasemen</span><span>${this.clubLink(champion)}</span></div>
        ${totsReady ? `
          <div class="award-row award-row-clickable" data-open-tots="1">
            <span class="award-label">Team Of The Season</span>
            <span>Lihat Tim &rsaquo;</span>
          </div>
        ` : `
          <div class="award-row"><span class="award-label">Team Of The Season</span><span style="color:var(--text-dim);">Belum tersedia</span></div>
        `}
      </div>
    `;
  },

  renderTotsModal(state) {
    const awards = getAwards(state.players, state.clubs);
    const p = id => state.players.find(pl => pl.id === id);
    const tots = awards.teamOfSeason.map(p).filter(Boolean);
    if (!tots.length) return "";
    const order = { ATT: 0, MID: 1, DEF: 2, GK: 3 };
    const sorted = [...tots].sort((a, b) => order[a.pos] - order[b.pos]);
    const rows = sorted.map(pl => `
      <div class="player-row">
        <div>
          <div class="player-name">${this.playerLink(pl)} <span class="badge ${pl.class}">${pl.class}</span></div>
          <div class="player-role">${pl.role} &middot; ${pl.pos} &middot; ${this.clubLink(this.clubById(state, pl.clubId))}</div>
        </div>
        <div class="player-stats">⭐${avgRating(pl).toFixed(1)}</div>
      </div>
    `).join("");
    return `
      <div class="modal-overlay" data-close-modal="1">
        <div class="modal-box">
          <div class="modal-header">
            <b style="font-size:16px;">Team Of The Season</b>
            <button class="modal-close" data-close-modal="1">&times;</button>
          </div>
          <div class="modal-body">
            <div class="card">${rows}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderClubModal(state, clubId) {
    const club = this.clubById(state, clubId);
    if (!club) return "";
    const players = this.playersByClub(state, clubId);
    const order = { GK: 0, DEF: 1, MID: 2, ATT: 3 };
    const sorted = [...players].sort((a, b) => order[a.pos] - order[b.pos]);
    const rows = sorted.map(p => `
      <div class="player-row">
        <div>
          <div class="player-name">${this.playerLink(p)} <span class="badge ${p.class}">${p.class}</span></div>
          <div class="player-role">${p.role} &middot; ${p.pos}</div>
          <div class="player-role" style="font-size:11px;">KEY OVR ${keyOverallOf(p).toFixed(1)} &middot; ${this.keyAttrsText(p)}</div>
        </div>
        <div class="player-stats">⚽${p.goal} 🅰️${p.assist} ⭐${avgRating(p).toFixed(1)}</div>
      </div>
    `).join("");

    const trophyRow = (getClubTrophies(state) || []).find(r => r.id === clubId) || { league: 0, cup: 0, total: 0 };
    const trophyHtml = `
      <div class="card" style="margin-bottom:8px;">
        <div style="font-weight:700;font-size:12.5px;margin-bottom:6px;">🏆 Trophy</div>
        <div class="award-row"><span class="award-label">Juara Liga</span><span>${trophyRow.league}</span></div>
        <div class="award-row"><span class="award-label">Juara CUP</span><span>${trophyRow.cup}</span></div>
        <div class="award-row"><span class="award-label">Total Trophy</span><span><b>${trophyRow.total}</b></span></div>
      </div>
    `;

    return `
      <div class="modal-overlay" data-close-modal="1">
        <div class="modal-box" data-stop-propagation="1">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="dot" style="background:${club.color};width:14px;height:14px;"></span>
              <b style="font-size:16px;">${club.name}</b>
            </div>
            <button class="modal-close" data-close-modal="1">&times;</button>
          </div>
          <div class="modal-body">
            ${trophyHtml}
            <div class="card">${rows}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderPlayerModal(state, playerId) {
    const p = state.players.find(pl => pl.id === playerId);
    if (!p) return "";
    const club = this.clubById(state, p.clubId);
    const keys = keyAttrsOf(p);
    const attrRow = (label, key) => `
      <div class="award-row">
        <span class="award-label">${label}${keys.includes(key) ? " ⭐" : ""}</span>
        <span>${p[key].toFixed(1)}</span>
      </div>`;
    return `
      <div class="modal-overlay" data-close-player-modal="1">
        <div class="modal-box" data-stop-propagation="1">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="badge ${p.class}">${p.class}</span>
              <b style="font-size:16px;">${p.name}</b>
            </div>
            <button class="modal-close" data-close-player-modal="1">&times;</button>
          </div>
          <div class="modal-body">
            <div class="card" style="margin-bottom:8px;">
              <div class="award-row"><span class="award-label">Klub</span><span>${this.clubLink(club)}</span></div>
              <div class="award-row"><span class="award-label">Role</span><span>${p.role}</span></div>
              <div class="award-row"><span class="award-label">Posisi</span><span>${p.pos}</span></div>
              <div class="award-row"><span class="award-label">Kelas</span><span>${p.class}</span></div>
              <div class="award-row"><span class="award-label">OVR (5 atribut)</span><span>${overallOf(p).toFixed(1)}</span></div>
              <div class="award-row"><span class="award-label">Key OVR (3 atribut kunci ⭐)</span><span>${keyOverallOf(p).toFixed(1)}</span></div>
            </div>
            <div class="card" style="margin-bottom:8px;">
              <div style="font-weight:700;font-size:12.5px;margin-bottom:6px;">Atribut Lengkap</div>
              ${attrRow("Attack (ATK)", "attack")}
              ${attrRow("Defense (DEF)", "defense")}
              ${attrRow("Creativity (CRE)", "creativity")}
              ${attrRow("Mental (MEN)", "mental")}
              ${attrRow("Stamina (STA)", "stamina")}
            </div>
            <div class="card">
              <div style="font-weight:700;font-size:12.5px;margin-bottom:6px;">Statistik Musim Ini</div>
              <div class="award-row"><span class="award-label">Main</span><span>${p.match}</span></div>
              <div class="award-row"><span class="award-label">Gol</span><span>${p.goal}</span></div>
              <div class="award-row"><span class="award-label">Assist</span><span>${p.assist}</span></div>
              <div class="award-row"><span class="award-label">Rating Rata-rata</span><span>${avgRating(p).toFixed(1)}</span></div>
              <div class="award-row"><span class="award-label">Kartu Kuning</span><span>${p.yc}</span></div>
              <div class="award-row"><span class="award-label">Kartu Merah</span><span>${p.rc}</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderMatch(state) {
    const lastResult = state.lastSimResult;
    if (!lastResult) {
      return `<div class="empty-state">Belum ada pertandingan yang disimulasikan.<br>Buka tab Home dan tekan tombol simulasi.</div>`;
    }
    const home = this.clubById(state, lastResult.homeId);
    const away = this.clubById(state, lastResult.awayId);
    const p = id => state.players.find(pl => pl.id === id);
    const isUserHome = lastResult.homeId === state.userClubId;
    let userWon, userLost;
    if (lastResult.isCup && lastResult.penalty) {
      userWon = lastResult.winnerId === state.userClubId;
      userLost = !userWon;
    } else {
      userWon = isUserHome ? lastResult.homeGoals > lastResult.awayGoals : lastResult.awayGoals > lastResult.homeGoals;
      userLost = isUserHome ? lastResult.homeGoals < lastResult.awayGoals : lastResult.awayGoals < lastResult.homeGoals;
    }
    const resultClass = userWon ? "result-win" : userLost ? "result-lose" : "result-draw";

    let potmHtml = "";
    if (lastResult.ratings) {
      const allIds = Object.keys(lastResult.ratings);
      let bestId = null, bestVal = -1;
      allIds.forEach(id => { if (lastResult.ratings[id] > bestVal) { bestVal = lastResult.ratings[id]; bestId = id; } });
      const potm = bestId ? p(bestId) : null;
      if (potm) {
        const potmClub = this.clubById(state, potm.clubId);
        potmHtml = `
          <div class="card potm-card">
            <div class="potm-label">⭐ Pemain Terbaik Pertandingan</div>
            <div class="potm-name">${this.playerLink(potm)}</div>
            <div class="potm-sub">${this.clubLink(potmClub)} &middot; Rating ${bestVal.toFixed(1)}</div>
          </div>`;
      }
    }

    const eventLines = lastResult.events.filter(e => e.type !== "chance").map(ev => {
      if (ev.type === "goal") {
        const scorer = p(ev.scorerId);
        const assist = ev.assistId ? p(ev.assistId) : null;
        const scorerClubId = ev.team === "home" ? lastResult.homeId : lastResult.awayId;
        const isUserGoal = scorerClubId === state.userClubId;
        return `<div class="event-line">
          <span class="event-minute">${ev.minute}'</span>
          <span class="event-goal ${isUserGoal ? "event-goal-user" : ""}">⚽ Gol! ${this.playerLink(scorer)}${assist ? ` (assist: ${this.playerLink(assist)})` : ""} - ${this.clubLink(ev.team === "home" ? home : away)}</span>
        </div>`;
      }
      if (ev.type === "yellow") {
        return `<div class="event-line"><span class="event-minute">${ev.minute}'</span><span class="event-yellow">🟨 ${this.playerLink(p(ev.playerId))}</span></div>`;
      }
      if (ev.type === "red") {
        return `<div class="event-line"><span class="event-minute">${ev.minute}'</span><span class="event-red">🟥 ${this.playerLink(p(ev.playerId))}</span></div>`;
      }
      return "";
    }).join("");

    const cupBadge = lastResult.isCup
      ? `<div style="text-align:center;font-size:11px;color:var(--accent);font-weight:700;margin-bottom:6px;">
          🏆 CUP &middot; ${CUP_STAGE_LABEL[lastResult.stage]}${lastResult.penalty ? " &middot; Menang Adu Penalti" : ""}
        </div>`
      : "";

    return `
      <h2 class="section-title" style="margin-top:14px;">Hasil Pertandingan</h2>
      ${cupBadge}
      <div class="card ${resultClass}">
        <div class="fixture-row">
          <div class="club"><span class="dot" style="background:${home.color}"></span>${this.clubLink(home)}</div>
          <div class="score">${lastResult.homeGoals} - ${lastResult.awayGoals}</div>
          <div class="club away">${this.clubLink(away)}<span class="dot" style="background:${away.color}"></span></div>
        </div>
      </div>
      ${potmHtml}
      <h2 class="section-title">Jalannya Pertandingan</h2>
      <div class="card events-log">
        ${eventLines || '<div class="empty-state">Tidak ada peluang besar.</div>'}
      </div>
    `;
  },

  renderSquad(state, squadTab) {
    const tab = squadTab || "club";
    const tabs = `
      <div class="tabs-mini">
        <div class="tab-mini ${tab === "club" ? "active" : ""}" data-squadtab="club">Skuad Klub</div>
        <div class="tab-mini ${tab === "top" ? "active" : ""}" data-squadtab="top">Top Pemain</div>
      </div>
    `;
    if (tab === "top") {
      const sorted = [...state.players].sort((a, b) => (b.goal + b.assist) - (a.goal + a.assist)).slice(0, 20);
      const rows = sorted.map(p => `
        <div class="player-row">
          <div>
            <div class="player-name">${this.playerLink(p)} <span class="badge ${p.class}">${p.class}</span></div>
            <div class="player-role">${p.role} &middot; ${this.clubLink(this.clubById(state, p.clubId))}</div>
          </div>
          <div class="player-stats">⚽${p.goal} 🅰️${p.assist}</div>
        </div>
      `).join("");
      return `<h2 class="section-title" style="margin-top:14px;">Skuad</h2>${tabs}<div class="card">${rows}</div>`;
    }
    const club = this.clubById(state, state.userClubId);
    const players = this.playersByClub(state, club.id);
    const rows = players.map(p => `
      <div class="player-row">
        <div>
          <div class="player-name">${this.playerLink(p)} <span class="badge ${p.class}">${p.class}</span></div>
          <div class="player-role">${p.role} &middot; ${p.pos}</div>
          <div class="player-role" style="font-size:11px;">KEY OVR ${keyOverallOf(p).toFixed(1)} &middot; ${this.keyAttrsText(p)}</div>
        </div>
        <div class="player-stats">⚽${p.goal} 🅰️${p.assist} ⭐${avgRating(p).toFixed(1)}</div>
      </div>
    `).join("");
    return `<h2 class="section-title" style="margin-top:14px;">Skuad</h2>${tabs}
      <div class="card" style="margin-bottom:8px;"><b>${this.clubLink(club)}</b></div>
      <div class="card">${rows}</div>`;
  },

  renderPlayers(state, posFilter) {
    const filter = posFilter || "all";
    const POS_LABEL = { all: "Semua", GK: "GK", DEF: "DEF", MID: "MID", ATT: "ATT" };
    const filters = ["all", "GK", "DEF", "MID", "ATT"].map(f => `
      <div class="tab-mini ${filter === f ? "active" : ""}" data-posfilter="${f}">${POS_LABEL[f]}</div>
    `).join("");

    const list = filter === "all" ? state.players : state.players.filter(p => p.pos === filter);
    const sorted = [...list].sort((a, b) => keyOverallOf(b) - keyOverallOf(a));

    const rows = sorted.map((p, i) => `
      <div class="player-row ${p.clubId === state.userClubId ? "user-club" : ""}">
        <div>
          <div class="player-name">${i + 1}. ${this.playerLink(p)} <span class="badge ${p.class}">${p.class}</span></div>
          <div class="player-role">${this.clubLink(this.clubById(state, p.clubId))} &middot; ${p.pos}</div>
        </div>
        <div class="player-stats">🏆${p.ballonDorCount || 0} &middot; <b>KEY OVR ${keyOverallOf(p).toFixed(1)}</b></div>
      </div>
    `).join("");

    return `
      <h2 class="section-title" style="margin-top:14px;">Players</h2>
      <div class="tabs-mini">${filters}</div>
      <div class="card">${rows || '<div class="empty-state">Tidak ada pemain.</div>'}</div>
    `;
  },

  renderHistory(state) {
    if (!state.history.length) {
      return `<div class="empty-state">Belum ada riwayat musim.<br>Selesaikan musim pertamamu untuk melihat hasilnya di sini.</div>`;
    }
    // Riwayat musim cuma menyimpan nama (bukan id), tapi klub & pemain tidak
    // pernah dihapus sepanjang karir, jadi id-nya bisa dicari lagi lewat nama
    // supaya nama di History tetap bisa diklik untuk membuka detail.
    const clubByName = n => state.clubs.find(c => c.name === n);
    const playerByName = n => state.players.find(p => p.name === n);
    const nameOrLink = (linkFn, findFn, name) => {
      if (!name || name === "-") return name || "-";
      const found = findFn(name);
      return found ? linkFn(found) : name;
    };
    const rows = state.history.slice().reverse().map(h => {
      const rankTxt = h.userLeagueRank ? `#${h.userLeagueRank}${h.totalClubs ? ` / ${h.totalClubs}` : ""}` : "-";
      const isChampion = h.userLeagueRank === 1;
      return `
      <div class="card">
        <h2 class="section-title" style="margin-top:0;">Musim ${h.season}</h2>
        <div class="award-row"><span class="award-label">Posisi Anda${h.userClubName ? ` (${nameOrLink(this.clubLink.bind(this), clubByName, h.userClubName)})` : ""}</span><span>${isChampion ? "🏆 " : ""}${rankTxt}</span></div>
        <div class="award-row"><span class="award-label">Juara Liga</span><span>${nameOrLink(this.clubLink.bind(this), clubByName, h.championName)}</span></div>
        <div class="award-row"><span class="award-label">Top Skor</span><span>${nameOrLink(this.playerLink.bind(this), playerByName, h.goldenBootName)} (${h.goldenBootGoals})</span></div>
        <div class="award-row"><span class="award-label">Top Assist</span><span>${nameOrLink(this.playerLink.bind(this), playerByName, h.topAssistName)} (${h.topAssistAssists})</span></div>
        <div class="award-row"><span class="award-label">Ballon d'Or</span><span>${nameOrLink(this.playerLink.bind(this), playerByName, h.ballonDorName)}</span></div>
        ${h.cupChampionName ? `
          <div style="height:1px;background:var(--border);margin:8px 0;"></div>
          <div class="award-row"><span class="award-label">🏆 Juara CUP</span><span>${nameOrLink(this.clubLink.bind(this), clubByName, h.cupChampionName)}</span></div>
          <div class="award-row"><span class="award-label">Top Skor CUP</span><span>${nameOrLink(this.playerLink.bind(this), playerByName, h.cupTopScorerName)}${h.cupTopScorerGoals ? ` (${h.cupTopScorerGoals})` : ""}</span></div>
          <div class="award-row"><span class="award-label">Top Assist CUP</span><span>${nameOrLink(this.playerLink.bind(this), playerByName, h.cupTopAssistName)}${h.cupTopAssistAssists ? ` (${h.cupTopAssistAssists})` : ""}</span></div>
        ` : ""}
      </div>
    `;
    }).join("");
    return `<h2 class="section-title" style="margin-top:14px;">Riwayat Musim</h2>${rows}`;
  },

  renderTrophies(state) {
    const rows = getClubTrophies(state);
    if (!state.history.length) {
      return `<h2 class="section-title" style="margin-top:14px;">Trophy Room</h2>
        <div class="empty-state">Belum ada trophy yang dimenangkan.<br>Selesaikan musim pertamamu untuk mulai mengumpulkan trophy.</div>`;
    }
    const body = rows.map((r, i) => `
      <tr class="club-row ${r.id === state.userClubId ? "user-club" : ""}" data-club-detail="${r.id}">
        <td class="rank">${i + 1}</td>
        <td class="team-name"><span class="dot" style="background:${r.color}"></span>${r.name}</td>
        <td>${r.league}</td>
        <td>${r.cup}</td>
        <td><b>${r.total}</b></td>
      </tr>
    `).join("");
    return `
      <h2 class="section-title" style="margin-top:14px;">Trophy Room</h2>
      <div class="card" style="overflow-x:auto;">
        <table>
          <tr><th></th><th style="text-align:left;">Klub</th><th>Liga</th><th>CUP</th><th>Total</th></tr>
          ${body}
        </table>
      </div>
    `;
  },

  renderRanking(state) {
    const rows = getClubRankingTable(state);
    const hasData = rows.some(r => r.seasons > 0);
    const body = rows.map((r, i) => `
      <tr class="club-row ${r.id === state.userClubId ? "user-club" : ""}" data-club-detail="${r.id}">
        <td class="rank">${i + 1}</td>
        <td class="team-name"><span class="dot" style="background:${r.color}"></span>${r.name}</td>
        <td>${r.seasons}</td>
        <td>${r.leaguePoints}</td>
        <td>${r.cupPoints}</td>
        <td><b>${r.total}</b></td>
      </tr>
    `).join("");

    const emptyNote = hasData ? "" : `
      <div class="empty-state">Belum ada poin ranking.<br>Selesaikan musim pertamamu untuk mulai mengumpulkan poin.</div>`;

    return `
      <h2 class="section-title" style="margin-top:14px;">Ranking Klub</h2>
      <div class="card" style="overflow-x:auto;">
        <table>
          <tr><th></th><th style="text-align:left;">Klub</th><th>Musim</th><th>Poin Liga</th><th>Poin CUP</th><th>Total</th></tr>
          ${body}
        </table>
      </div>
      ${emptyNote}

      <h2 class="section-title">Cara Poin Dihitung</h2>
      <div class="card">
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">
          Poin didapat tiap akhir musim, dari pencapaian di Liga (berdasarkan peringkat klasemen) dan CUP (berdasarkan babak tersingkir).
        </div>
        <div style="font-weight:700;font-size:12.5px;margin-bottom:4px;">Liga</div>
        ${Object.keys(LEAGUE_RANK_POINTS).map(rank => `
          <div class="award-row"><span class="award-label">${rank === "1" ? "Juara 1" : rank === "2" ? "Juara 2" : rank === "3" ? "Juara 3" : "Posisi " + rank}</span><span>${LEAGUE_RANK_POINTS[rank]} poin</span></div>
        `).join("")}
        <div style="height:1px;background:var(--border);margin:10px 0;"></div>
        <div style="font-weight:700;font-size:12.5px;margin-bottom:4px;">CUP</div>
        <div class="award-row"><span class="award-label">Juara 1</span><span>${CUP_TIER_POINTS.champion} poin</span></div>
        <div class="award-row"><span class="award-label">Juara 2</span><span>${CUP_TIER_POINTS.runnerUp} poin</span></div>
        <div class="award-row"><span class="award-label">Juara 3</span><span>${CUP_TIER_POINTS.third} poin</span></div>
        <div class="award-row"><span class="award-label">Juara 4</span><span>${CUP_TIER_POINTS.fourth} poin</span></div>
        <div class="award-row"><span class="award-label">Posisi 5-8</span><span>${CUP_TIER_POINTS.qf} poin</span></div>
        <div class="award-row"><span class="award-label">Posisi 9-16</span><span>${CUP_TIER_POINTS.r16} poin</span></div>
        <div class="award-row"><span class="award-label">Posisi 17-20</span><span>Tidak dapat poin</span></div>
      </div>
    `;
  },

  renderCupMatchRow(state, m) {
    if (!m) return "";
    const home = this.clubById(state, m.homeId);
    const away = this.clubById(state, m.awayId);
    if (!home || !away) return "";
    const isUser = m.homeId === state.userClubId || m.awayId === state.userClubId;
    const scoreTxt = m.played ? `${m.homeGoals} - ${m.awayGoals}${m.penalty ? " (pen)" : ""}` : "vs";
    return `
      <div class="fixture-row ${isUser ? "user-club" : ""}" style="padding:7px 0;">
        <div class="club ${m.played && m.winnerId === m.homeId ? "" : m.played ? "muted-team" : ""}">
          <span class="dot" style="background:${home.color}"></span>${this.clubLink(home)}
        </div>
        <div class="score">${scoreTxt}</div>
        <div class="club away ${m.played && m.winnerId === m.awayId ? "" : m.played ? "muted-team" : ""}">
          ${this.clubLink(away)}<span class="dot" style="background:${away.color}"></span>
        </div>
      </div>`;
  },

  renderCup(state) {
    const cup = state.cup;
    if (!cup) return `<div class="empty-state">CUP belum tersedia.</div>`;

    const champion = cup.championId ? this.clubById(state, cup.championId) : null;
    const runnerUp = cup.runnerUpId ? this.clubById(state, cup.runnerUpId) : null;
    const third = cup.thirdId ? this.clubById(state, cup.thirdId) : null;

    let championHtml = "";
    if (champion) {
      championHtml = `
        <div class="card" style="text-align:center;">
          <div style="font-size:11px;color:var(--text-dim);">JUARA CUP MUSIM ${cup.season}</div>
          <div style="font-size:20px;font-weight:800;margin-top:4px;">🏆 ${this.clubLink(champion)}</div>
          ${runnerUp ? `<div style="font-size:12px;color:var(--text-dim);margin-top:4px;">Runner-up: ${this.clubLink(runnerUp)}</div>` : ""}
          ${third ? `<div style="font-size:12px;color:var(--text-dim);">Juara 3: ${this.clubLink(third)}</div>` : ""}
        </div>`;
    }

    const eliminatedClub = cup.playoff ? this.clubById(state, cup.playoff.eliminatedRank20) : null;
    const playoffHtml = cup.playoff ? `
      <h2 class="section-title">Kualifikasi Playoff (Peringkat 16-19)</h2>
      <div class="card">
        ${this.renderCupMatchRow(state, cup.playoff.semis[0])}
        ${this.renderCupMatchRow(state, cup.playoff.semis[1])}
        <div style="height:6px;border-top:1px dashed var(--border);margin:6px 0;"></div>
        ${this.renderCupMatchRow(state, cup.playoff.final)}
        <div style="font-size:11px;color:var(--text-dim);margin-top:8px;">
          Peringkat 20 otomatis gugur: <b>${eliminatedClub ? eliminatedClub.name : "-"}</b>
        </div>
      </div>
    ` : "";

    const stageBlock = (title, arr) => {
      if (!arr || !arr.length) return "";
      return `<h2 class="section-title">${title}</h2><div class="card">${arr.map(m => this.renderCupMatchRow(state, m)).join("")}</div>`;
    };

    const cupAwards = getCupAwards(state);
    const p = id => state.players.find(pl => pl.id === id);
    const cs = cupAwards.cupTopScorer ? p(cupAwards.cupTopScorer) : null;
    const ca = cupAwards.cupTopAssist ? p(cupAwards.cupTopAssist) : null;

    const stageStatusHtml = cup.stage
      ? `<div class="card" style="padding:10px 14px;font-size:12px;color:var(--text-dim);">
          Babak berikutnya: <b style="color:var(--text);">${CUP_STAGE_LABEL[cup.stage]}</b>
        </div>`
      : "";

    return `
      <h2 class="section-title" style="margin-top:14px;">CUP</h2>
      ${championHtml}
      ${stageStatusHtml}
      ${playoffHtml}
      ${stageBlock("Babak 16 Besar", cup.r16)}
      ${stageBlock("Babak 8 Besar", cup.qf)}
      ${stageBlock("Babak 4 Besar", cup.sf)}
      ${stageBlock("Perebutan Juara 3", cup.third ? [cup.third] : [])}
      ${stageBlock("Final", cup.final ? [cup.final] : [])}
      ${(cs || ca) ? `
        <h2 class="section-title">Penghargaan CUP</h2>
        <div class="card">
          <div class="award-row"><span class="award-label">Top Skor CUP</span><span>${cs ? this.playerLink(cs) + " (" + cs.cupGoal + ")" : "-"}</span></div>
          <div class="award-row"><span class="award-label">Top Assist CUP</span><span>${ca ? this.playerLink(ca) + " (" + ca.cupAssist + ")" : "-"}</span></div>
        </div>
      ` : ""}
    `;
  },

  renderBottomNav(active) {
    const items = [
      ["home", "🏠", "Home"],
      ["league", "📊", "League"],
      ["cup", "🥇", "CUP"],
      ["match", "⚽", "Match"],
      ["squad", "👥", "Squad"],
      ["players", "🌟", "Players"],
      ["trophies", "🏅", "Trophy"],
      ["ranking", "📈", "Ranking"],
      ["history", "🏆", "History"],
    ];
    return `<div class="bottom-nav">
      ${items.map(([key, icon, label]) => `
        <button class="nav-btn ${active === key ? "active" : ""}" data-nav="${key}">
          <span class="icon">${icon}</span><span>${label}</span>
        </button>
      `).join("")}
    </div>`;
  }
};
