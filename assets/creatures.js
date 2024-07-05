/*
all entities in the game have an animalType which corresponds to a tpye in this file and determines a few properties of the entity

name: the name used to reference it in levels and is displayed in game if you pick it up
type: is used to determine behaviour in "entity.js"
texture: this is the texture used when displaying the entity
height: the height of the texture (1 unit is one dot in the editor or 1 meter)
speed: how many meters per second it can move
maxHP: guess what
slotAmount: how many slots the entity has to hold items
bobSpeed: entities and the player bob slightly when moving and this controls how fast it bobs
bobStrength: how far up and down it bobs
jumpStrength: how hard it jumps

You can also easily create items by adding them to the items array and they will be created procedurally instead

*/

let animals = {
  player: {
    name: "player", 
    type: "player", 
    texture: "entities/player1",
    height: 0.65,
    speed: 2, 
    maxHP: 100,
    slotAmount: 4, 
    bobSpeed: 0.2, 
    bobStrength: 0.02, 
    jumpStrength: 1.7
  },
  rat: {
    name: "rat", 
    type: "critter", 
    texture: "entities/rat1", 
    height: 0.2,
    speed: 1, 
    maxHP: 5,
    slotAmount: 1, 
    bobSpeed: 0.2, 
    bobStrength: 0.02, 
    jumpStrength: 1
  },
};

let items = [
  {name: "medkit", texture: "itemsmedkit"}
];
for (let i of items) {
  animals[i.name] = {
    name: i.name,
    type: "item",
    texture: i.texture,
    height: 0.2,
    speed: 0,
    maxHP: 1,
    slotAmount: 1,
    bobSpeed: 0.2,
    bobStrength: 0.2,
    jumpStrength: 0
  };
}