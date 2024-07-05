/*

All levels need to be in a chapter, if you want a level to be permanently in the game you need to define it here, if you just store it in the browser it will disappear on cache clearing

*/

let chapters = [
  {name: "chapter 1", levels: [
    {name: "best level", data: '{"textures":["metal/floor1","metal/ceiling1","metal/wall1","rat","nukage/floor"],"vertices":[{"x":0,"y":0},{"x":1,"y":0},{"x":1,"y":1},{"x":0,"y":1},{"x":2,"y":0},{"x":2,"y":1},null],"walls":[{"a":0,"b":1,"texture":2,"segments":[0,null],"length":1,"divider":false,"tileH":false,"tileV":false},{"a":1,"b":2,"texture":2,"segments":[0,1],"length":1,"divider":true,"tileH":false,"tileV":false},{"a":2,"b":3,"texture":2,"segments":[0,null],"length":1,"divider":false,"tileH":false,"tileV":false},{"a":3,"b":0,"texture":2,"segments":[0,null],"length":1,"divider":false,"tileH":false,"tileV":false},{"a":1,"b":4,"texture":2,"segments":[1,null],"length":1,"divider":false,"tileH":false,"tileV":false},{"a":4,"b":5,"texture":2,"segments":[1,null],"length":1,"divider":false,"tileH":false,"tileV":false},{"a":5,"b":2,"texture":2,"segments":[1,null],"length":1,"divider":false,"tileH":false,"tileV":false}],"segments":[{"walls":[0,1,2,3],"bottom":0,"top":1,"floorTexture":0,"ceilingTexture":1,"topWallTexture":1,"bottomWallTexture":0,"topWallTextureTileH":true,"topWallTextureTileV":true,"bottomWallTextureTileH":true,"bottomWallTextureTileV":true},{"walls":[4,5,6,1],"bottom":0.25,"top":1.25,"floorTexture":4,"ceilingTexture":1,"topWallTexture":1,"bottomWallTexture":4,"topWallTextureTileH":true,"topWallTextureTileV":true,"bottomWallTextureTileH":true,"bottomWallTextureTileV":true}],"entities":[{"animalType":"player","pos":{"x":0.5,"y":0.5,"z":0},"dir":{"x":0,"y":0},"vel":{"x":0,"y":0,"z":0},"slots":[]},{"animalType":"rat","pos":{"x":1.6147465437788013,"y":0.5875576036866363,"z":0},"dir":{"x":0,"y":0},"vel":{"x":0,"y":0,"z":0},"slots":[]}]}'},
    ]},
];