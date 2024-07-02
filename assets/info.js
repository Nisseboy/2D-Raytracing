let folders = [
  "brick/wall", "1,2,3,4,5,6,window",
  "metal/wall", "1,2,3",
  "metal/floor", "1",
  "metal/ceiling", "1",
];

let textures = {
  empty: {pixels: [0, 0, 0, 0], width: 1, height: 1},
  rat: "assets/images/entities/rat/rat.png",
  crosshair: "assets/images/crosshair.png",
}

for (let i = 0; i < folders.length; i += 2) {
  let path = folders[i];
  let names = folders[i + 1].split(",");
  for (let j of names) {
    textures[path + j] = `assets/images/${path}/${j}.png`;
  }
}

let font = {
  "a": "010101111101101",
  "b": "110101110101110",
  "c": "011100100100011",
  "d": "110101101101110",
  "e": "111100110100111",
  "f": "111100110100100",
  "g": "011100101101011",
  "h": "101101111101101",
  "i": "010010010010010",
  "j": "001001001101010",
  "k": "101101110101101",
  "l": "100100100100111",
  "m": "101111101101101",
  "n": "110101101101101",
  "o": "010101101101010",
  "p": "110101101110100",
  "q": "010101101101011",
  "r": "110101110101101",
  "s": "011100010001110",
  "t": "111010010010010",
  "u": "101101101101111",
  "v": "101101101010010",
  "w": "101101101111101",
  "x": "101101010101101",
  "y": "101101010010010",
  "z": "111001010100111",
  "0": "010101101101010",
  "1": "010110010010111",
  "2": "010101001010111",
  "3": "110001110001110",
  "4": "101101111001001",
  "5": "111100110001110",
  "6": "010100110101010",
  "7": "111001001010010",
  "8": "010101010101010",
  "9": "010101011001010",
  "[": "111100100100111",
  "]": "111001001001111",
  ".": "000000000000010",
  "-": "000000111000000",
  " ": "000000000000000",
  "rect": "111111111111111"
}

let levels = {
  "chapter 1": {
    "test level 1": `{"w":5,"h":5,"grid":[[1,0,0,0,0,0,0,0,0,0],[0,0,4,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],"walls":[{},{"texture":"metal/wall1"},{"texture":"metal/wall2"},{"texture":"metal/wall3"},{"texture":"brick/wallwindow"}],"segments":[{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"},{"bottom":0,"top":1,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}],"entities":[{"animalType":"player","animal":{"name":"player","type":"player","speed":2,"height":0.65,"slotAmount":4,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1.8},"pos":{"x":0.5,"y":0.5,"z":-0.2783333333333333},"vel":{"x":0,"y":0,"z":-1.7000000000000004},"dir":{"x":0.49236014736586853,"y":0.23931818181818176},"slot":0,"slots":[],"bob":2.516814692820417,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}},{"animalType":"rat","animal":{"name":"rat","type":"critter","texture":"rat","height":0.2,"speed":1,"slotAmount":1,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1},"pos":{"x":2.5594055325152776,"y":3.074527205135023,"z":-0.25},"vel":{"x":0,"y":0,"z":0},"dir":{"x":7.963259486753811,"y":0},"slot":0,"slots":[],"bob":0.6531085492287683,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}}]}`,
    "test level 2": `{"w":5,"h":5,"grid":[[1,0,0,0,0,0,0,0,0,0],[0,0,4,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],"walls":[{},{"texture":"metal/wall1"},{"texture":"metal/wall2"},{"texture":"metal/wall3"},{"texture":"brick/wallwindow"}],"segments":[{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"},{"bottom":0,"top":1,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}],"entities":[{"animalType":"player","animal":{"name":"player","type":"player","speed":2,"height":0.65,"slotAmount":4,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1.8},"pos":{"x":1.6322198726565955,"y":1.0326160733472838,"z":-0.2783333333333333},"vel":{"x":0,"y":0,"z":-1.7000000000000004},"dir":{"x":0.49236014736586853,"y":0.23931818181818176},"slot":0,"slots":[],"bob":2.516814692820417,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}},{"animalType":"rat","animal":{"name":"rat","type":"critter","texture":"rat","height":0.2,"speed":1,"slotAmount":1,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1},"pos":{"x":2.5594055325152776,"y":3.074527205135023,"z":-0.25},"vel":{"x":0,"y":0,"z":0},"dir":{"x":7.963259486753811,"y":0},"slot":0,"slots":[],"bob":0.6531085492287683,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}}]}`,
  },
  "chapter 2": {
    "test level 3": `{"w":5,"h":5,"grid":[[1,0,0,0,0,0,0,0,0,0],[0,0,4,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],"walls":[{},{"texture":"metal/wall1"},{"texture":"metal/wall2"},{"texture":"metal/wall3"},{"texture":"brick/wallwindow"}],"segments":[{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"},{"bottom":0,"top":1,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}],"entities":[{"animalType":"player","animal":{"name":"player","type":"player","speed":2,"height":0.65,"slotAmount":4,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1.8},"pos":{"x":1.6322198726565955,"y":1.0326160733472838,"z":-0.2783333333333333},"vel":{"x":0,"y":0,"z":-1.7000000000000004},"dir":{"x":0.49236014736586853,"y":0.23931818181818176},"slot":0,"slots":[],"bob":2.516814692820417,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}},{"animalType":"rat","animal":{"name":"rat","type":"critter","texture":"rat","height":0.2,"speed":1,"slotAmount":1,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1},"pos":{"x":2.5594055325152776,"y":3.074527205135023,"z":-0.25},"vel":{"x":0,"y":0,"z":0},"dir":{"x":7.963259486753811,"y":0},"slot":0,"slots":[],"bob":0.6531085492287683,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}}]}`,
    "test level 4": `{"w":5,"h":5,"grid":[[1,0,0,0,0,0,0,0,0,0],[0,0,4,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],"walls":[{},{"texture":"metal/wall1"},{"texture":"metal/wall2"},{"texture":"metal/wall3"},{"texture":"brick/wallwindow"}],"segments":[{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"},{"bottom":0,"top":1,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}],"entities":[{"animalType":"player","animal":{"name":"player","type":"player","speed":2,"height":0.65,"slotAmount":4,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1.8},"pos":{"x":1.6322198726565955,"y":1.0326160733472838,"z":-0.2783333333333333},"vel":{"x":0,"y":0,"z":-1.7000000000000004},"dir":{"x":0.49236014736586853,"y":0.23931818181818176},"slot":0,"slots":[],"bob":2.516814692820417,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}},{"animalType":"rat","animal":{"name":"rat","type":"critter","texture":"rat","height":0.2,"speed":1,"slotAmount":1,"bobSpeed":0.2,"bobStrength":0.02,"jumpStrength":1},"pos":{"x":2.5594055325152776,"y":3.074527205135023,"z":-0.25},"vel":{"x":0,"y":0,"z":0},"dir":{"x":7.963259486753811,"y":0},"slot":0,"slots":[],"bob":0.6531085492287683,"seg":{"bottom":-0.25,"top":0.75,"ceilingTexture":"metal/ceiling1","floorTexture":"metal/floor1","topWallTexture":"metal/ceiling1","bottomWallTexture":"metal/floor1"}}]}`,
  },
};