let animals = {
  player: {name: "player", type: "player", speed: 2, slotAmount: 4, bobSpeed: 0.2, bobStrength: 0.02, jumpStrength: 2},
  rat: {name: "rat", type: "critter", texture: "rat", scale: 0.2, speed: 1, slotAmount: 1, bobSpeed: 0.2, bobStrength: 0.02, jumpStrength: 1}
};

class Entity {
  constructor(animalType, pos) {
    this.animalType = animalType;
    this.animal = animals[animalType];

    this.pos = pos;
    if (!pos.z) this.pos.z = 0;
    this.vel = {x: 0, y: 0, z: 0};

    this.dir = {x: 0, y: 0};
    
    this.slot = 0;
    this.slots = [];
    this.owner = undefined;
    
    this.bob = 0;

    this.floorHeight = 0;

    this.move({x: 0, y: 0});

  }
  
  update() {
    if (this.owner) return;
    
    if (this.pos.z < this.floorHeight + 0.01) {
      this.pos.z = this.floorHeight;
      this.vel.x *= 0.7;
      this.vel.y *= 0.7;
      if (this.vel.z < -1) { if (this.animal.type == "critter" || this.animal.type == "grenade") this.vel.z *= -0.4; }
      else this.vel.z = 0;
    } else {
      this.vel.z -= 0.1;
    }
    
    this.move(this.vel, true);
    
    if (this.pos.z > this.floorHeight + 0.01) return;
    
    switch(this.animal.type) {
      case "critter":
        this.dir.x += (Math.random() - 0.5) / 1;
        this.moveRelative({x: 1, y: 0});
        break;
      default:
        break;
    }
  }
  
  pickUp(entity) {
    if (this.slots[this.slot]) this.throwOut(this.slot);
    this.slots[this.slot] = entity;
    entity.owner = this;
    entity.pos = {x: -5, y: -5};
  }
  throwOut(slot, force = 0) {
    let entity = this.slots[slot];
    if (!entity) return;
    entity.owner = undefined;
    entity.pos = {x: this.pos.x, y: this.pos.y, z: this.pos.z + 0.4};
    entity.vel = {x: Math.cos(this.dir.x) * force, y: Math.sin(this.dir.x) * force, z: Math.cos(this.dir.y) * force};
    
    this.slots[slot] = undefined;
  }
  
  fire() {
    switch (this.animal.type) {
      case "critter":
      case "grenade":
        this.owner.throwOut(this.owner.slot, 3);
        break;
    }
  }
  
  jump() {
    if (this.pos.z > this.floorHeight + 0.01) return;

    this.vel.z = this.animal.jumpStrength;
    this.pos.z = this.floorHeight + 0.01;
  }
  moveRelative(v, cheatMove = false) {
    this.move(rotateVector(v, this.dir.x), cheatMove);
  }
  move(v_, cheatMove = false) {
    let v = {x: v_.x, y: v_.y, z: v_.z || 0};
    if (!cheatMove) {
      let sqMag = v.x * v.x + v.y * v.y + v.z * v.z;
      if (sqMag > 1) {
        let magnitude = Math.sqrt(sqMag);
        v.x /= magnitude;
        v.y /= magnitude;
      }
      v.x *= this.animal.speed / fps;
      v.y *= this.animal.speed / fps;
      v.z *= this.animal.speed / fps;
    } else {
      v.x /= fps;
      v.y /= fps;
      v.z /= fps;
    }
    
    
    if (v.x != 0 || v.y != 0) {
      this.bob = (this.bob + this.animal.bobSpeed) % (Math.PI * 2)
    }
    
    
    let gridPos = {x: Math.floor(this.pos.x), y: Math.floor(this.pos.y)};
  
    this.pos.x += v.x;
    this.pos.y += v.y;
    this.pos.z += v.z;

    let world = Game.world;
    let gridPosNew = {x: Math.floor(this.pos.x), y: Math.floor(this.pos.y)};

    if (this.pos.y < 0.01) {
      gridPosNew.y = 0.01;
      this.pos.y = 0.01;
    }

    if (gridPosNew.x < gridPos.x && (this.pos.x < 0 || world.get(gridPos)[2] != 0)) {
      this.pos.x -= v.x;
      gridPosNew.x = Math.floor(this.pos.x);
    }
    if (gridPosNew.x > gridPos.x && (this.pos.x >= world.w || world.get(gridPosNew)[2] != 0)) {
      this.pos.x -= v.x;
      gridPosNew.x = Math.floor(this.pos.x);
    }
    if (gridPosNew.y < gridPos.y && (this.pos.y < 0 || world.get(gridPos)[1] != 0)) {
      this.pos.y -= v.y;
      gridPosNew.y = Math.floor(this.pos.y);
    }
    if (gridPosNew.y > gridPos.y && (this.pos.y >= world.h || world.get(gridPosNew)[1] != 0)) {
      this.pos.y -= v.y;
      gridPosNew.y = Math.floor(this.pos.y);
    }

    this.floorHeight = Game.world.segments[Game.world.get(Math.floor(this.pos.x), Math.floor(this.pos.y))[0]].bottom;
  }
}