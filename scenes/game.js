let maxLookVertical = Math.PI / 8;
let sensitivity = 50;

let highlighted;
let reach = 0.5;
let reachAngle = Math.PI / 8;

let slotSize = 12;

let fov = Math.PI / 2;
let player;

let Game = {
  init() {

  },
  start() {
    requestPointerLock();

    if (!Game.world.hasInit) {
      Game.world.init();
    }
  
    player = Game.world.entities[0];
  },
  keyPressed(e) {
    if (getKeyPressed("Slot 1")) player.slot = 0;
    if (getKeyPressed("Slot 2")) player.slot = 1;
    if (getKeyPressed("Slot 3")) player.slot = 2;
    if (getKeyPressed("Slot 4")) player.slot = 3;
    if (getKeyPressed("Throw Out")) player.throwOut(player.slot);
    if (getKeyPressed("Jump")) player.jump();
    
    if (getKeyPressed("Interact") && highlighted) player.pickUp(highlighted);

    if (keyCode == getKey("Pause")) setScene(PauseScreen);
  },
  mouseMoved(e) {
    player.dir.x += e.movementX / 2200000 * screenw * sensitivity;
    player.dir.y += e.movementY / 2200000 * screenh * sensitivity;
    player.dir.y = Math.max(Math.min(player.dir.y, maxLookVertical), -maxLookVertical);
    
    player.dir.x = (player.dir.x + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  },
  mousePressed() {
    requestPointerLock();
  
    if (!Game.world.simulated) return;
    let held = player.slots[player.slot];
    if (held) held.fire();
  },
  mouseWheel(e) {
    player.slot = (player.slot + Math.sign(e.delta) + player.animal.slotAmount) % player.animal.slotAmount;
  },
  update() {
    player.moveRelative({x: getKeyPressed("Walk Forward") - getKeyPressed("Walk Back"), y: getKeyPressed("Walk Right") - getKeyPressed("Walk Left")});
    
    let closestAngle = Math.PI;
    highlighted = undefined;
    if (Game.world.simulated) {
      for (let i in Game.world.entities) {
        let entity = Game.world.entities[i];
        entity.update();
        
        let diff = {x: entity.pos.x - player.pos.x, y: entity.pos.y - player.pos.y}
        let sqd = diff.x * diff.x + diff.y * diff.y;
        let angle = Math.atan2(diff.y, diff.x) - player.dir.x;
        if ((entity.animal.type == "critter" || entity.animal.type == "grenade") && angle < reachAngle && sqd < reach * reach && angle < closestAngle) {
          closestAngle = angle;
          highlighted = entity;
        }
      }
    }
    player.update();

    Renderer.renderWorld();
    Renderer.renderEntities();
  
    for (let i = 0; i < player.animal.slotAmount; i++) {
      let entity = player.slots[i];
      Renderer.renderTexture((entity?entity.animal.texture:"empty"), screenw - (slotSize + 1) * (player.animal.slotAmount - i), screenh - 1, "bl", slotSize, slotSize, 0, 1, (player.slot == i ? [255, 100, 100, 255] : [255, 255, 255, 255]));
    }

    let held = player.slots[player.slot];
    if (held) {
      Renderer.renderTexture(held.animal.texture, (screenw - 20) / 2, screenh - 40, "tl", 20, 40, 0.1);
    }

    Renderer.renderTexture("crosshair", screenw / 2, screenh / 2, "cc", textures.crosshair.width,  textures.crosshair.height, 0);
    
    if (highlighted) {
      Renderer.renderText(`press [${getControlName("Interact")}] to pick up ${highlighted.animal.name}`, screenw / 2, screenh / 2, "bc");
    }
    
    if (held) {
      Renderer.renderText(held.animal.name, screenw - 1, screenh - (slotSize + 2), "br");
    }
  },
  stop() {
    exitPointerLock();
  }
};

