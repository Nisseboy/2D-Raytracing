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
canPickUp: if it can be picked up, this function is run to determine if it can be picked up
onPickUp: run when something picks it up
bounce: from 0 to 1 how hard it boucnes of the ground
visible: guess what again

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
};

let events = [
  {name: "finish", texture: "eventsflag", onTouch: entity => {Game.finish()}}
];

let interactables = [
  {name: "buttondoor", texture: "interactable/buttondoor", visible: false, onPickUp: (entity, thisEntity) => {Game.world.walls[thisEntity.door].divider = !Game.world.walls[thisEntity.door].divider}}
];

let items = [
  
];

let critters = [
  {name: "rat", texture: "entities/rat1"}
];

let pickups = [
  {name: "medkit", texture: "itemsmedkit", onTouch: entity => {entity.hurt(-25)}}
];

for (let cat of [events, interactables, items, critters, pickups]) {

  for (let i of cat) {
    let animal = {
      name: i.name,
      type: "",
      texture: i.texture,
      height: 0,
      speed: 1,
      maxHP: 1,
      slotAmount: 1,
      bobSpeed: 0.2,
      bobStrength: 0.02,
      jumpStrength: 1,

      visible: i.visible,
  
      canPickUp: i.canPickUp || ((entity) => {return false}),
      onPickUp: i.onPickUp || ((entity) => {}),
      onTouch: i.onTouch,
    };

    switch(cat) {
      case events:
        animal.type = "event";
        animal.height = 0.5;
        break;

      case interactables:
        animal.type = "interactable";
        animal.height = 0.5;
        animal.canPickUp = (entity) => {return entity.animalType == "player"};
        break;

      case items:
        animal.type = "item";
        animal.height = 0.2;
        break;

      case critters:
        animal.type = "critter";
        animal.height = 0.1;
        animal.bounce = 0.4;
        animal.canPickUp = (entity) => {return entity.animalType == "player"};
        break;

      case pickups:
        animal.type = "pickup";
        animal.height = 0.2;
        break;

    }

    animals[i.name] = animal;
  }
}