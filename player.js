// js/player.js

// ============================================================
// Pengembangan Pemain (Naik/Turun Kelas)
// ============================================================
// Tiap pemain punya 3 "atribut kunci" sesuai role-nya (bukan cuma 1),
// yaitu atribut-atribut yang paling merepresentasikan kemampuan utama
// role tersebut. Ketiganya naik/turun bareng setiap pertandingan
// berdasarkan rating pemain di laga itu, dan dapat bonus +1 saat klubnya
// juara Liga/CUP. Kelas pemain (S/A/B/C/D) ditentukan dari rata-rata
// ketiga atribut kunci ini.
const KEY_ATTRS_BY_ROLE = {
  "Finisher": ["attack", "creativity", "mental"],
  "Playmaker": ["creativity", "mental", "stamina"],
  "Box-to-Box": ["attack", "mental", "stamina"],
  "Defender": ["defense", "mental", "stamina"],
  "Goalkeeper": ["defense", "mental", "creativity"]
};
const KEY_ATTR_LABEL = {
  attack: "ATK", defense: "DEF", creativity: "CRE", mental: "MEN", stamina: "STA"
};
const ATTR_MIN = 1;
const ATTR_MAX = 99;

// Batasi nilai atribut ke rentang [ATTR_MIN, ATTR_MAX] dan bulatkan ke 1
// desimal supaya tidak ada noise floating-point (mis. 82.20000000001).
function clampAttr(v) {
  const clamped = Math.max(ATTR_MIN, Math.min(ATTR_MAX, v));
  return Math.round(clamped * 10) / 10;
}

function keyAttrsOf(p) {
  return KEY_ATTRS_BY_ROLE[p.role] || ["mental"];
}

// Rata-rata ketiga atribut kunci pemain - dipakai untuk menentukan kelas.
function keyOverallOf(p) {
  const attrs = keyAttrsOf(p);
  return attrs.reduce((s, a) => s + p[a], 0) / attrs.length;
}

// Overall (OVR) pemain = rata-rata SEMUA (5) atribut. Cuma dipakai untuk
// ditampilkan di UI, tidak dipakai untuk menentukan kelas.
function overallOf(p) {
  return (p.attack + p.defense + p.creativity + p.mental + p.stamina) / 5;
}

// Batas kelas berdasarkan rata-rata 3 ATRIBUT KUNCI pemain (bukan rata-rata
// 5 atribut). Ini sengaja dipakai supaya pemain spesialis (mis. Finisher
// yang wajar punya defense rendah) tidak dirugikan saat penentuan kelasnya -
// kelas murni mencerminkan seberapa kuat kemampuan utama role-nya.
// Dipakai ulang tiap kali atribut kunci berubah (per match & bonus juara)
// supaya kelas (S/A/B/C/D) selalu merepresentasikan kekuatan pemain saat ini.
function classFromKeyOverall(v) {
  if (v >= 95) return "S";
  if (v >= 91) return "A";
  if (v >= 88) return "B";
  if (v >= 85) return "C";
  return "D";
}

// Cek ulang & update kelas pemain sesuai atribut kunci terbaru. Return
// kelas lama jika terjadi perubahan (naik/turun kelas), atau null jika
// tidak berubah.
function refreshPlayerClass(p) {
  const newClass = classFromKeyOverall(keyOverallOf(p));
  if (newClass !== p.class) {
    const oldClass = p.class;
    p.class = newClass;
    return oldClass;
  }
  return null;
}

// Besaran kenaikan/penurunan atribut kunci berdasarkan rating pemain di
// satu pertandingan.
//
// CATATAN KALIBRASI: mesin simulasi (match.js) menghasilkan rating dengan
// rata-rata sekitar 6.3 dan median sekitar 6.1 (rating 7+ cuma terjadi di
// ~17% laga, rating 8+ cuma ~1%). Ambang di bawah ini digeser ke skala
// rating asli mesin ini (hasil pengetesan ribuan simulasi laga) dan sengaja
// dibuat NETRAL CENDERUNG SEDIKIT KETAT (rata-rata perubahan per laga
// sekitar -0.01, dites lewat simulasi multi-musim supaya tidak longsor ke
// kelas D semua): pemain yang konsisten tampil di atas rata-rata akan
// pelan-pelan naik, tapi pemain yang tampilannya naik-turun/tidak stabil
// (sering kena rating di bawah rata-rata) akan cenderung turun karena zona
// "naik"-nya butuh performa di atas rata-rata, sedangkan zona "turun" mulai
// dari sedikit di bawah rata-rata saja.
function progressionDeltaFromRating(r) {
  if (r > 7.02) return 0.5;
  if (r > 6.77) return 0.3;
  if (r > 6.52) return 0.1;
  if (r < 5.62) return -0.5;
  if (r < 5.87) return -0.3;
  if (r < 6.12) return -0.1;
  return 0;
}

// Terapkan kenaikan/penurunan ke KETIGA atribut kunci pemain berdasarkan
// rating pertandingannya, lalu cek ulang kelasnya. Berlaku untuk pemain
// klub manapun (bukan cuma klub milik pemain).
function developPlayerFromRating(p, rating) {
  const delta = progressionDeltaFromRating(rating);
  if (delta === 0) return;
  keyAttrsOf(p).forEach(key => {
    p[key] = clampAttr(p[key] + delta);
  });
  refreshPlayerClass(p);
}

// Bonus juara: dipanggil sekali di akhir musim untuk semua pemain dari
// klub yang menjadi juara Liga dan/atau juara CUP. Kalau sebuah klub
// juara keduanya, bonus atribut kunci tetap hanya diberikan sekali (+1
// ke masing-masing dari 3 atribut kunci) karena clubIds sudah di-dedupe
// sebelum diproses.
function applyTitleBonus(players, championClubIds) {
  const ids = [...new Set((championClubIds || []).filter(Boolean))];
  ids.forEach(clubId => {
    players.filter(p => p.clubId === clubId).forEach(p => {
      keyAttrsOf(p).forEach(key => {
        p[key] = clampAttr(p[key] + 1);
      });
      refreshPlayerClass(p);
    });
  });
}

function applyMatchResultToPlayers(players, result, homeIds, awayIds) {
  const byId = {};
  players.forEach(p => byId[p.id] = p);

  homeIds.concat(awayIds).forEach(id => {
    const p = byId[id];
    if (!p) return;
    p.match += 1;
    const r = result.ratings[id];
    if (r !== undefined) {
      p.ratingSum += r;
      developPlayerFromRating(p, r);
    }
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

// Rating kekuatan keseluruhan klub (OVR), dihitung dari rata-rata 5 atribut
// seluruh pemain di skuadnya. Dipakai untuk membantu pemain memilih klub.
function clubOverall(players, clubId) {
  const squad = players.filter(p => p.clubId === clubId);
  if (!squad.length) return 0;
  const sum = squad.reduce((s, p) => s + p.attack + p.defense + p.creativity + p.mental + p.stamina, 0);
  return Math.round(sum / (squad.length * 5));
}

function getAwards(players, clubs, cup) {
  const byClub = {};
  clubs.forEach(c => byClub[c.id] = c);

  const goldenBoot = [...players].sort((a, b) => b.goal - a.goal)[0];
  const topAssist = [...players].sort((a, b) => b.assist - a.assist)[0];

  // Ballon d'Or menghitung performa liga DAN CUP: gol/assist CUP dihargai
  // sedikit lebih tinggi (nilai prestise laga knockout), ditambah bonus
  // untuk juara dan runner-up CUP musim ini.
  const ballonScore = p => {
    let score = p.goal * 2 + p.assist * 1.5 + avgRating(p) * (p.match || 1) * 0.3
      + (p.cupGoal || 0) * 2.5 + (p.cupAssist || 0) * 1.8;
    if (cup) {
      if (cup.championId === p.clubId) score += 5;
      else if (cup.runnerUpId === p.clubId) score += 2;
    }
    return score;
  };
  const ballonDor = [...players].sort((a, b) => ballonScore(b) - ballonScore(a))[0];

  const champion = [...clubs].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga))[0];

  const eligiblePlayers = players.filter(p => p.match >= 5);
  const bySlot = {
    GK: [...eligiblePlayers.filter(p => p.pos === "GK")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 1),
    DEF: [...eligiblePlayers.filter(p => p.pos === "DEF")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 1),
    MID: [...eligiblePlayers.filter(p => p.pos === "MID")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 2),
    ATT: [...eligiblePlayers.filter(p => p.pos === "ATT")].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 1),
  };
  const teamOfSeason = [...bySlot.ATT, ...bySlot.MID, ...bySlot.DEF, ...bySlot.GK];

  return {
    champion: champion ? champion.id : null,
    goldenBoot: goldenBoot ? goldenBoot.id : null,
    topAssist: topAssist ? topAssist.id : null,
    ballonDor: ballonDor ? ballonDor.id : null,
    teamOfSeason: teamOfSeason.map(p => p.id)
  };
}
