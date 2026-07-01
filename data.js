// js/data.js
// Database 100 pemain (5 per klub: Finisher, Playmaker, Box-to-Box, Defender, Goalkeeper)
// Posisi tim: Finisher->ATT, Playmaker->MID, Box-to-Box->MID, Defender->DEF, Goalkeeper->GK

const RAW_PLAYERS = [
["Gianluigi Donnarumma","S","Goalkeeper",22,99,90,98,96],
["Alisson Becker","S","Goalkeeper",20,98,88,97,95],
["Thibaut Courtois","S","Goalkeeper",18,98,86,96,94],
["Diogo Costa","S","Goalkeeper",18,96,89,95,94],
["William Saliba","S","Defender",58,99,86,94,95],
["Virgil van Dijk","S","Defender",60,99,88,92,93],
["Achraf Hakimi","S","Defender",78,96,92,99,98],
["Gabriel Magalhaes","S","Defender",55,98,89,91,95],
["Pedri","S","Box-to-Box",90,87,99,94,98],
["Federico Valverde","S","Box-to-Box",91,92,94,97,99],
["Vitinha","S","Box-to-Box",88,86,98,95,97],
["Declan Rice","S","Box-to-Box",82,96,92,90,98],
["Lamine Yamal","S","Playmaker",95,72,99,99,95],
["Florian Wirtz","S","Playmaker",91,75,99,95,94],
["Jamal Musiala","S","Playmaker",92,73,98,98,94],
["Michael Olise","S","Playmaker",88,76,99,91,95],
["Erling Haaland","S","Finisher",99,45,84,94,94],
["Kylian Mbappé","S","Finisher",98,48,90,99,96],
["Vinícius Júnior","S","Finisher",95,46,89,99,95],
["Harry Kane","S","Finisher",96,55,90,96,96],

["Mike Maignan","A","Goalkeeper",20,95,86,94,93],
["Gregor Kobel","A","Goalkeeper",20,94,84,93,92],
["David Raya","A","Goalkeeper",20,93,88,92,92],
["Joan García","A","Goalkeeper",20,92,86,91,91],
["Rúben Dias","A","Defender",78,95,84,88,92],
["Joško Gvardiol","A","Defender",80,94,86,90,92],
["Nuno Mendes","A","Defender",76,92,88,96,94],
["Willian Pacho","A","Defender",74,94,85,89,91],
["Jude Bellingham","A","Box-to-Box",90,90,96,93,96],
["João Neves","A","Box-to-Box",84,90,95,92,95],
["Alexis Mac Allister","A","Box-to-Box",83,88,92,88,94],
["Aurélien Tchouaméni","A","Box-to-Box",81,91,90,87,94],
["Martin Ødegaard","A","Playmaker",90,70,96,96,91],
["Bukayo Saka","A","Playmaker",88,72,94,95,92],
["Désiré Doué","A","Playmaker",86,71,94,95,90],
["Phil Foden","A","Playmaker",87,68,95,93,90],
["Julián Álvarez","A","Finisher",92,48,84,91,92],
["Alexander Isak","A","Finisher",91,46,82,92,91],
["Victor Osimhen","A","Finisher",93,45,80,93,90],
["Khvicha Kvaratskhelia","A","Finisher",89,50,90,94,91],

["Emiliano Martínez","B","Goalkeeper",20,90,82,90,89],
["Mile Svilar","B","Goalkeeper",20,89,84,90,88],
["Lucas Chevalier","B","Goalkeeper",20,89,83,89,88],
["Giorgi Mamardashvili","B","Goalkeeper",20,91,82,88,89],
["Alessandro Bastoni","B","Defender",74,91,82,86,90],
["Ronald Araújo","B","Defender",76,90,84,87,89],
["Alessandro Buongiorno","B","Defender",71,90,82,84,89],
["Jeremie Frimpong","B","Defender",78,86,87,96,91],
["Moisés Caicedo","B","Box-to-Box",80,89,88,89,92],
["Sandro Tonali","B","Box-to-Box",79,88,90,87,91],
["Eduardo Camavinga","B","Box-to-Box",81,88,89,90,91],
["Bruno Guimarães","B","Box-to-Box",82,87,91,86,90],
["Cole Palmer","B","Playmaker",86,68,93,88,89],
["Xavi Simons","B","Playmaker",84,69,92,91,89],
["Paulo Dybala","B","Playmaker",82,65,93,82,87],
["Fermín López","B","Playmaker",80,74,89,86,89],
["Mohamed Salah","B","Finisher",92,45,86,80,88],
["Robert Lewandowski","B","Finisher",90,42,82,77,86],
["Jonathan David","B","Finisher",87,44,80,90,88],
["Ollie Watkins","B","Finisher",86,46,81,91,89],

["Yann Sommer","C","Goalkeeper",20,88,80,88,86],
["Unai Simón","C","Goalkeeper",20,87,82,87,86],
["André Onana","C","Goalkeeper",20,86,85,89,85],
["Gregor Lunin","C","Goalkeeper",20,85,82,86,84],
["Micky van de Ven","C","Defender",72,88,82,94,89],
["Destiny Udogie","C","Defender",70,86,84,92,89],
["Cristian Romero","C","Defender",74,89,80,85,88],
["Nathan Aké","C","Defender",71,87,80,84,88],
["Youssouf Fofana","C","Box-to-Box",78,85,84,86,90],
["Dominik Szoboszlai","C","Box-to-Box",82,82,89,88,89],
["Khephren Thuram","C","Box-to-Box",79,84,84,87,90],
["Ryan Gravenberch","C","Box-to-Box",80,84,87,86,89],
["João Félix","C","Playmaker",82,64,90,87,85],
["Dani Olmo","C","Playmaker",81,68,91,84,86],
["Arda Güler","C","Playmaker",80,65,91,87,85],
["Morgan Rogers","C","Playmaker",79,72,86,88,87],
["Benjamin Šeško","C","Finisher",86,42,76,87,87],
["Rasmus Højlund","C","Finisher",84,43,74,86,86],
["João Pedro","C","Finisher",82,46,82,84,86],
["Hugo Ekitiké","C","Finisher",83,41,76,86,85],

["Bart Verbruggen","D","Goalkeeper",20,84,82,84,83],
["James Trafford","D","Goalkeeper",20,83,80,83,82],
["Guillaume Restes","D","Goalkeeper",20,82,79,82,82],
["Lucas Perri","D","Goalkeeper",20,82,80,82,81],
["Jorrel Hato","D","Defender",66,84,82,85,86],
["Dean Huijsen","D","Defender",67,83,80,82,85],
["Castello Lukeba","D","Defender",68,84,81,84,85],
["Murillo","D","Defender",67,83,80,83,84],
["Kobbie Mainoo","D","Box-to-Box",72,82,85,83,85],
["Aleksandar Pavlović","D","Box-to-Box",70,82,84,82,84],
["Archie Gray","D","Box-to-Box",69,81,83,83,84],
["Arthur Vermeeren","D","Box-to-Box",68,81,84,81,83],
["Franco Mastantuono","D","Playmaker",75,60,88,84,82],
["Estevão Willian","D","Playmaker",74,61,87,87,82],
["Claudio Echeverri","D","Playmaker",72,60,86,85,81],
["Geovany Quenda","D","Playmaker",71,62,85,86,82],
["Endrick","D","Finisher",82,40,74,84,82],
["Mathys Tel","D","Finisher",80,42,76,86,83],
["Vitor Roque","D","Finisher",79,40,73,83,82],
["Eli Junior Kroupi","D","Finisher",78,39,72,82,81]
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
  "Manchester United",    
  "Paris Saint-Germain",        
  "Bayer Leverkusen",     
  "Real Madrid",    
  "Barcelona",   
  "Arsenal",      
  "Bayern Munchen",      
  "Aston Villa",     
  "Tottenham Hotspur",      
  "Chelsea",    
  "Inter Milan",    
  "Atletico Madrid",    
  "Liverpool",       
  "Manchester City",     
  "Ajax",       
  "AC Milan",   
  "Borussia Dortmund",      
  "Benfica",      
  "Galatasaray"         
];

const CLUB_COLORS = [
  "#000000", "#DA291C", "#004170", "#E2001A", "#FEBE10",
  "#A50044", "#EF0107", "#DC052D", "#95BFE5", "#132257",
  "#034694", "#0047AB", "#CB3524", "#C8102E", "#6CABDD",
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
        goal: 0, assist: 0, match: 0, ratingSum: 0, yc: 0, rc: 0,
        cupGoal: 0, cupAssist: 0, cupMatch: 0, cupRatingSum: 0
      });
    }
  }
  return { clubs, players };
}
