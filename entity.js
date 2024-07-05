class Entity {
  constructor(animalType, pos) {
    this.animalType = animalType;
    this.animal = animals[animalType];

    this.pos = pos;
    if (!pos.z) this.pos.z = 0;
    this.vel = {x: 0, y: 0, z: 0};

    this.hp = this.animal.maxHP;

    this.dir = {x: 0, y: 0};
    
    this.slot = 0;
    this.slots = [];
    this.owner = undefined;
    
    this.bob = 0;

    this.segment = {bottom: 0, top: 1};

    //this.move({x: 0, y: 0});

  }
  
  update() {
    if (this.owner) return;
    
    if (this.pos.z < this.segment.bottom + 0.01) {
      this.pos.z = this.segment.bottom;
      this.vel.x *= 0.7;
      this.vel.y *= 0.7;
      if (this.vel.z < -1) { if (this.animal.type == "critter" || this.animal.type == "grenade") this.vel.z *= -0.4; }
      else this.vel.z = 0;
    } else {
      this.vel.z -= 0.1;
    }
    
    this.move(this.vel, true);
    
    if (this.pos.z > this.segment.top - this.animal.height - 0.05)  {
      this.pos.z = this.segment.top - this.animal.height - 0.05;
      this.vel.z = 0;
    }
    
    switch(this.animal.type) {
      case "player":
        if (frameCount % 55 == 0 && this.pos.z < this.segment.bottom + 0.01 && Game.world.textures[this.segment.floorTexture].includes("nukage")) this.hurt(5);
        break;
      case "critter":
        this.dir.x += (Math.random() - 0.5) / 1;
        this.moveRelative({x: 1, y: 0});
        break;
      default:
        break;
    }
  }

  hurt(hp) {
    if (!Game.world.simulated) return;

    this.hp -= hp;

    if (this.hp <= 0) {
      this.kill();
    }
  }

  kill() {
    if (this.animalType == "player") setScene(DeathScreen);
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
    entity.vel = {x: Math.cos(this.dir.x) * force, y: Math.sin(this.dir.x) * force, z: Math.cos(this.dir.y + Math.PI / 2) * force  + 1};
    
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
    if (this.pos.z > this.segment.bottom + 0.01) return;

    this.vel.z = this.animal.jumpStrength;
    this.pos.z = this.segment.bottom + 0.01;
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

    let world = Game.world;

    const canCross = (wall) => {
      if (!crossed.divider) return false;
      let segment = world.segments[world.getWallSegment(wall, this.pos, true)];
      if (segment && segment.bottom - this.pos.z > 0.3) return false;
      if (segment && segment.top - this.pos.z < this.animal.height) return false;

      return true;
    }

    let newPos = {x: this.pos.x + v.x, y: this.pos.y, z: this.pos.z + v.z};
    let crossed = world.hasCrossedWalls(world.walls, this.pos, newPos);
    if (!crossed || canCross(crossed)) this.pos = newPos;
    else this.vel.x *= -1;

    newPos = {x: this.pos.x, y: this.pos.y + v.y, z: this.pos.z};
    crossed = world.hasCrossedWalls(world.walls, this.pos, newPos);
    if (!crossed || canCross(crossed)) this.pos = newPos;
    else this.vel.y *= -1;

    let seg = world.segments[world.getSegment(this.pos)];
    if (seg) this.segment = seg;
  }
}