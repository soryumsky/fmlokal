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

  renderTopbar(state) {
    return `<div class="topbar">
      <div class="brand">FMLOKAL</div>
      <div class="season-tag">Musim ${state.season} &middot; Matchday ${Math.min(state.matchday, 38)}/38</div>
    </div>`;
  },

  renderOnboarding(state) {
    const grid = state.clubs.map(c => `
      <div class="club-pick" data-club="${c.id}">
        <div class="swatch" style="background:${c.color}"></div>
        ${c.name}
      </div>
    `).join("");
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
    const nextFixture = state.fixtures.find(f => !f.played && (f.homeId === club.id || f.awayId === club.id));
    const allCurrentPlayed = state.fixtures.filter(f => f.matchday === state.matchday).every(f => f.played);
    const seasonDone = state.matchday > 38;

    let fixtureHtml = "";
    if (nextFixture) {
      const home = this.clubById(state, nextFixture.homeId);
      const away = this.clubById(state, nextFixture.awayId);
      fixtureHtml = `
        <div class="card">
          <h2 class="section-title" style="margin-top:0">Pertandingan Berikutnya &middot; MD${nextFixture.matchday}</h2>
          <div class="fixture-row">
            <div class="club"><span class="dot" style="background:${home.color}"></span>${home.name}</div>
            <div class="score">vs</div>
            <div class="club away">${away.name}<span class="dot" style="background:${away.color}"></span></div>
          </div>
        </div>`;
    }

    return `
      <div class="card" style="display:flex;align-items:center;gap:12px;">
        <div class="swatch" style="width:40px;height:40px;border-radius:50%;background:${club.color};flex-shrink:0;"></div>
        <div>
          <div style="font-weight:800;font-size:16px;">${club.name}</div>
          <div style="color:var(--text-dim);font-size:12px;">Peringkat #${userRank} &middot; ${club.pts} poin</div>
        </div>
      </div>

      ${fixtureHtml}

      <div class="card">
        <h2 class="section-title" style="margin-top:0">Aksi Musim</h2>
        ${seasonDone
          ? `<button class="btn" id="btn-finish-season">Lihat Hasil Akhir Musim</button>`
          : `<button class="btn" id="btn-sim-matchday" ${allCurrentPlayed ? "" : ""}>
              ${allCurrentPlayed ? "Lanjut ke Matchday Berikutnya" : "Simulasikan Matchday Ini"}
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
    const rows = standings.map((c, i) => `
      <tr class="${c.id === state.userClubId ? "user-club" : ""}">
        <td class="rank">${i + 1}</td>
        <td class="team-name">${c.name}</td>
        <td>${c.played}</td>
        <td>${c.win}</td>
        <td>${c.draw}</td>
        <td>${c.lose}</td>
        <td>${c.gf}</td>
        <td>${c.ga}</td>
        <td>${c.gf - c.ga >= 0 ? "+" : ""}${c.gf - c.ga}</td>
        <td><b>${c.pts}</b></td>
      </tr>
    `).join("");
    return `
      <h2 class="section-title" style="margin-top:14px;">Klasemen Liga</h2>
      <div class="card" style="overflow-x:auto;">
        <table>
          <tr><th></th><th style="text-align:left;">Klub</th><th>M</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>SG</th><th>Pts</th></tr>
          ${rows}
        </table>
      </div>
      ${this.renderAwardsSection(state)}
    `;
  },

  renderAwardsSection(state) {
    const playedCount = state.fixtures.filter(f => f.played).length;
    if (playedCount < 10) return "";
    const awards = getAwards(state.players, state.clubs);
    const p = id => state.players.find(pl => pl.id === id);
    const c = id => state.clubs.find(cl => cl.id === id);
    const goldenBoot = p(awards.goldenBoot);
    const topAssist = p(awards.topAssist);
    const ballonDor = p(awards.ballonDor);
    const champion = c(awards.champion);
    return `
      <h2 class="section-title">Penghargaan Sementara</h2>
      <div class="card">
        <div class="award-row"><span class="award-label">Top Skor</span><span>${goldenBoot.name} (${goldenBoot.goal})</span></div>
        <div class="award-row"><span class="award-label">Top Assist</span><span>${topAssist.name} (${topAssist.assist})</span></div>
        <div class="award-row"><span class="award-label">Ballon d'Or</span><span>${ballonDor.name}</span></div>
        <div class="award-row"><span class="award-label">Memimpin Klasemen</span><span>${champion.name}</span></div>
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

    const eventLines = lastResult.events.filter(e => e.type !== "chance").map(ev => {
      if (ev.type === "goal") {
        const scorer = p(ev.scorerId);
        const assist = ev.assistId ? p(ev.assistId) : null;
        return `<div class="event-line">
          <span class="event-minute">${ev.minute}'</span>
          <span class="event-goal">⚽ Gol! ${scorer.name}${assist ? ` (assist: ${assist.name})` : ""} - ${ev.team === "home" ? home.name : away.name}</span>
        </div>`;
      }
      if (ev.type === "yellow") {
        return `<div class="event-line"><span class="event-minute">${ev.minute}'</span><span class="event-yellow">🟨 ${p(ev.playerId).name}</span></div>`;
      }
      if (ev.type === "red") {
        return `<div class="event-line"><span class="event-minute">${ev.minute}'</span><span class="event-red">🟥 ${p(ev.playerId).name}</span></div>`;
      }
      return "";
    }).join("");

    return `
      <h2 class="section-title" style="margin-top:14px;">Hasil Pertandingan</h2>
      <div class="card">
        <div class="fixture-row">
          <div class="club"><span class="dot" style="background:${home.color}"></span>${home.name}</div>
          <div class="score">${lastResult.homeGoals} - ${lastResult.awayGoals}</div>
          <div class="club away">${away.name}<span class="dot" style="background:${away.color}"></span></div>
        </div>
      </div>
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
            <div class="player-name">${p.name} <span class="badge ${p.class}">${p.class}</span></div>
            <div class="player-role">${p.role} &middot; ${this.clubById(state, p.clubId).name}</div>
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
          <div class="player-name">${p.name} <span class="badge ${p.class}">${p.class}</span></div>
          <div class="player-role">${p.role} &middot; ${p.pos}</div>
        </div>
        <div class="player-stats">⚽${p.goal} 🅰️${p.assist} ⭐${avgRating(p).toFixed(1)}</div>
      </div>
    `).join("");
    return `<h2 class="section-title" style="margin-top:14px;">Skuad</h2>${tabs}
      <div class="card" style="margin-bottom:8px;"><b>${club.name}</b></div>
      <div class="card">${rows}</div>`;
  },

  renderHistory(state) {
    if (!state.history.length) {
      return `<div class="empty-state">Belum ada riwayat musim.<br>Selesaikan musim pertamamu untuk melihat hasilnya di sini.</div>`;
    }
    const rows = state.history.slice().reverse().map(h => `
      <div class="card">
        <h2 class="section-title" style="margin-top:0;">Musim ${h.season}</h2>
        <div class="award-row"><span class="award-label">Juara Liga</span><span>${h.championName}</span></div>
        <div class="award-row"><span class="award-label">Top Skor</span><span>${h.goldenBootName} (${h.goldenBootGoals})</span></div>
        <div class="award-row"><span class="award-label">Top Assist</span><span>${h.topAssistName} (${h.topAssistAssists})</span></div>
        <div class="award-row"><span class="award-label">Ballon d'Or</span><span>${h.ballonDorName}</span></div>
      </div>
    `).join("");
    return `<h2 class="section-title" style="margin-top:14px;">Riwayat Musim</h2>${rows}`;
  },

  renderBottomNav(active) {
    const items = [
      ["home", "🏠", "Home"],
      ["league", "📊", "League"],
      ["match", "⚽", "Match"],
      ["squad", "👥", "Squad"],
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
