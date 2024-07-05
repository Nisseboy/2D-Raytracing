/*

If you want to add a texture you can either add it to the textures array which would look like this: 
  "name": "path/to/file.png"
name is what is referenced in the code and the path is the path from assets/images, so for the rat it would be "entities/rat/1.png"

You should however not do that, and instead add it to the folders array, all lines need to have 2 strings otherwise it will get messed up
  "brick/wall", "1,2,3,4,5,6,window"
would generate the exact same code as this in the textures array:
  "brick/wall1": "assets/images/brick/wall/1.png"
  "brick/wall2": "assets/images/brick/wall/2.png"
  "brick/wall3": "assets/images/brick/wall/3.png"
  "brick/wall4": "assets/images/brick/wall/4.png"
  "brick/wall5": "assets/images/brick/wall/5.png"
  "brick/wall6": "assets/images/brick/wall/6.png"
  "brick/wallwindow": "assets/images/brick/wall/window.png"

*/

let folders = [
  "ui", "crosshair,snapping,segments,plus",
  "ui/propertytabs", "walls,segments,entities",
  "brick/wall", "1,2,3,4,5,6,window",
  "metal/wall", "1,2,3",
  "metal/floor", "1",
  "metal/ceiling", "1",
  "entities/rat", "1",
];


let textures = {
  empty: {pixels: [0, 0, 0, 0], width: 1, height: 1}, //Ignore this it's not supposed to look like this
}

for (let i = 0; i < folders.length; i += 2) {
  let path = folders[i];
  let names = folders[i + 1].split(",");
  for (let j of names) {
    textures[path + j] = `assets/images/${path}/${j}.png`;
  }
}