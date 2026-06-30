// js/data.js
// Database 100 pemain (5 per klub: Finisher, Playmaker, Box-to-Box, Defender, Goalkeeper)
// Posisi tim: Finisher->ATT, Playmaker->MID, Box-to-Box->MID, Defender->DEF, Goalkeeper->GK

const RAW_PLAYERS = [
["Kylian Mbappé","S","Finisher",99,68,96,98,97],
["Lamine Yamal","S","Playmaker",93,88,99,97,98],
["Ousmane Dembélé","S","Box-to-Box",95,96,95,98,99],
["Mohamed Salah","S","Defender",88,99,93,98,97],
["Erling Haaland","S","Goalkeeper",20,99,88,98,97],
["Vinícius Júnior","S","Finisher",99,68,96,98,97],
["Jude Bellingham","S","Playmaker",93,88,99,97,98],
["Pedri","S","Box-to-Box",95,96,95,98,99],
["Rodri","S","Defender",88,99,93,98,97],
["Florian Wirtz","S","Goalkeeper",20,99,88,98,97],
["Jamal Musiala","S","Finisher",99,68,96,98,97],
["Harry Kane","S","Playmaker",93,88,99,97,98],
["Raphinha","S","Box-to-Box",95,96,95,98,99],
["Federico Valverde","S","Defender",88,99,93,98,97],
["Bukayo Saka","S","Goalkeeper",20,99,88,98,97],
["Robert Lewandowski","S","Finisher",99,68,96,98,97],
["Michael Olise","S","Playmaker",93,88,99,97,98],
["Virgil van Dijk","S","Box-to-Box",95,96,95,98,99],
["Alisson Becker","S","Defender",88,99,93,98,97],
["Thibaut Courtois","S","Goalkeeper",20,99,88,98,97],
["Phil Foden","A","Finisher",89,60,86,88,87],
["Declan Rice","A","Playmaker",84,80,89,87,88],
["Alexis Mac Allister","A","Box-to-Box",86,86,85,88,89],
["Bruno Fernandes","A","Defender",80,89,84,88,87],
["Lautaro Martínez","A","Goalkeeper",20,89,80,88,87],
["Khvicha Kvaratskhelia","A","Finisher",89,60,86,88,87],
["Nicolò Barella","A","Playmaker",84,80,89,87,88],
["Martin Ødegaard","A","Box-to-Box",86,86,85,88,89],
["Joško Gvardiol","A","Defender",80,89,84,88,87],
["William Saliba","A","Goalkeeper",20,89,80,88,87],
["Rúben Dias","A","Finisher",89,60,86,88,87],
["Ronald Araújo","A","Playmaker",84,80,89,87,88],
["Mike Maignan","A","Box-to-Box",86,86,85,88,89],
["Gianluigi Donnarumma","A","Defender",80,89,84,88,87],
["Victor Osimhen","A","Goalkeeper",20,89,80,88,87],
["Alexander Isak","A","Finisher",89,60,86,88,87],
["Ollie Watkins","A","Playmaker",84,80,89,87,88],
["Julián Álvarez","A","Box-to-Box",86,86,85,88,89],
["Federico Dimarco","A","Defender",80,89,84,88,87],
["Alphonso Davies","A","Goalkeeper",20,89,80,88,87],
["Kai Havertz","B","Finisher",81,52,78,80,79],
["Marcus Rashford","B","Playmaker",76,72,81,79,80],
["João Pedro","B","Box-to-Box",78,78,77,80,81],
["Darwin Núñez","B","Defender",72,81,76,80,79],
["Christopher Nkunku","B","Goalkeeper",20,81,72,80,79],
["Dominik Szoboszlai","B","Finisher",81,52,78,80,79],
["Youri Tielemans","B","Playmaker",76,72,81,79,80],
["Moisés Caicedo","B","Box-to-Box",78,78,77,80,81],
["Mikel Merino","B","Defender",72,81,76,80,79],
["Hakan Çalhanoğlu","B","Goalkeeper",20,81,72,80,79],
["Dani Olmo","B","Finisher",81,52,78,80,79],
["Ferran Torres","B","Playmaker",76,72,81,79,80],
["Cody Gakpo","B","Box-to-Box",78,78,77,80,81],
["Jonathan David","B","Defender",72,81,76,80,79],
["Benjamin Šeško","B","Goalkeeper",20,81,72,80,79],
["Kim Min-jae","B","Finisher",81,52,78,80,79],
["Mats Hummels","B","Playmaker",76,72,81,79,80],
["Raphaël Guerreiro","B","Box-to-Box",78,78,77,80,81],
["Diogo Costa","B","Defender",72,81,76,80,79],
["Gregor Kobel","B","Goalkeeper",20,81,72,80,79],
["Wout Weghorst","C","Finisher",73,42,70,72,71],
["Donyell Malen","C","Playmaker",67,62,73,71,72],
["Armando Broja","C","Box-to-Box",69,70,69,72,73],
["Raúl Jiménez","C","Defender",62,73,67,72,71],
["Patrik Schick","C","Goalkeeper",20,73,62,72,71],
["Callum Wilson","C","Finisher",73,42,70,72,71],
["Beto","C","Playmaker",67,62,73,71,72],
["Ross Barkley","C","Box-to-Box",69,70,69,72,73],
["Kalvin Phillips","C","Defender",62,73,67,72,71],
["James Ward-Prowse","C","Goalkeeper",20,73,62,72,71],
["Andreas Pereira","C","Finisher",73,42,70,72,71],
["Tom Cairney","C","Playmaker",67,62,73,71,72],
["Craig Dawson","C","Box-to-Box",69,70,69,72,73],
["Tyrone Mings","C","Defender",62,73,67,72,71],
["Ben Mee","C","Goalkeeper",20,73,62,72,71],
["Harry Maguire","C","Finisher",73,42,70,72,71],
["Luke Shaw","C","Playmaker",67,62,73,71,72],
["Kasper Schmeichel","C","Box-to-Box",69,70,69,72,73],
["Łukasz Fabiański","C","Defender",62,73,67,72,71],
["Danny Ings","C","Goalkeeper",20,73,62,72,71],
["Endrick","D","Finisher",68,35,65,67,66],
["Estevão Willian","D","Playmaker",61,55,68,66,67],
["Pau Cubarsí","D","Box-to-Box",63,65,64,67,68],
["Arda Güler","D","Defender",55,68,61,67,66],
["Warren Zaïre-Emery","D","Goalkeeper",20,68,55,67,66],
["Kobbie Mainoo","D","Finisher",68,35,65,67,66],
["João Neves","D","Playmaker",61,55,68,66,67],
["Dean Huijsen","D","Box-to-Box",63,65,64,67,68],
["Ethan Nwaneri","D","Defender",55,68,61,67,66],
["Claudio Echeverri","D","Goalkeeper",20,68,55,67,66],
["Jorrel Hato","D","Finisher",68,35,65,67,66],
["Marc Bernal","D","Playmaker",61,55,68,66,67],
["Geovany Quenda","D","Box-to-Box",63,65,64,67,68],
["Franco Mastantuono","D","Defender",55,68,61,67,66],
["Mathys Tel","D","Goalkeeper",20,68,55,67,66],
["Valentín Barco","D","Finisher",68,35,65,67,66],
["Vitor Roque","D","Playmaker",61,55,68,66,67],
["Senny Mayulu","D","Box-to-Box",63,65,64,67,68],
["Lucas Bergvall","D","Defender",55,68,61,67,66],
["Antonio Nusa","D","Goalkeeper",20,68,55,67,66]
];

const ROLE_TO_POS = {
  "Finisher": "ATT",
  "Playmaker": "MID",
  "Box-to-Box": "MID",
  "Defender": "DEF",
  "Goalkeeper": "GK"
};

const CLUB_NAMES = [
  "Juventus",       
  "Manchaster United",    
  "Paris Saint-Germain",        
  "Bayern Leverkusen",     
  "Real Madrid",    
  "Barcelona",   
  "Arsenal",      
  "Bayern Munchen",      
  "Aston Villa",     
  "Totenham Hotspur",      
  "Chelsea",    
  "Inter Milan",    
  "Atletico Madrid",    
  "Liverpool",       
  "Manchester City",     
  "Ajax",       
  "Ac Milan",   
  "Borussia Dortmund",      
  "Benfica",      
  "Galatasaray"         
];

// sesuai dengan jesrey club asli
const CLUB_COLORS = [
  "#000000", "#DA291C", "#004170", "#E2001A", "#FEBE10",
  "#A50044", "#EF0107", "#DC052D", "#95BFE5", "#132257",
  "#034694", "#0047AB", "#A50044", "#C8102E", "#6CABDD",
  "#AE1C28", "#F7E018", "#FDE100", "#FF0000", "#A32638"
];

function buildClubsAndPlayers() {
  // Kelompokkan pemain berdasarkan kelas (S/A/B/C/D) dan role,
  // supaya tiap club bisa diberi 1 pemain dari tiap kelas (campuran S,A,B,C,D)
  // dan tetap 1 pemain per role (Finisher/Playmaker/Box-to-Box/Defender/Goalkeeper).
  const CLASSES = ["S", "A", "B", "C", "D"];
  const ROLES = ["Finisher", "Playmaker", "Box-to-Box", "Defender", "Goalkeeper"];

  const pool = {};
  CLASSES.forEach(cl => {
    pool[cl] = {};
    ROLES.forEach(r => { pool[cl][r] = []; });
  });
  RAW_PLAYERS.forEach(p => {
    const [, cls, role] = p;
    pool[cls][role].push(p);
  });

  const clubs = [];
  const players = [];
  let pid = 1;
  for (let c = 0; c < 20; c++) {
    const clubId = "club_" + (c + 1);
    clubs.push({
      id: clubId,
      name: CLUB_NAMES[c],
      color: CLUB_COLORS[c],
      played: 0, win: 0, draw: 0, lose: 0,
      gf: 0, ga: 0, pts: 0
    });
    for (let r = 0; r < 5; r++) {
      const role = ROLES[r];
      // Geser kelas berdasarkan club + role supaya tiap club dapat
      // satu pemain dari masing-masing kelas S, A, B, C, D secara merata.
      const cls = CLASSES[(c + r) % 5];
      const raw = pool[cls][role].shift();
      const [name, , , atk, def, cre, men, sta] = raw;
      players.push({
        id: "p_" + (pid++),
        clubId: clubId,
        name, class: cls, role,
        pos: ROLE_TO_POS[role],
        attack: atk, defense: def, creativity: cre, mental: men, stamina: sta,
        goal: 0, assist: 0, match: 0, ratingSum: 0, yc: 0, rc: 0
      });
    }
  }
  return { clubs, players };
}
