class World {
  constructor(w, h) {
    if (h == undefined) {
      let world = JSON.parse(w);
      this.w = world.w;
      this.h = world.h;
      this.grid = world.grid;
      this.walls = world.walls;
      this.segments = world.segments;
      this.entities = world.entities;

      for (let i = 0; i < this.entities.length; i++) {
        let e = this.entities[i];
        this.entities[i] = new Entity(e.animalType, e.pos);
        if (e.dir) this.entities[i].dir = e.dir;
        if (e.vel) this.entities[i].vel = e.vel;
        if (e.slots) this.entities[i].slots = e.slots;
      }
    } else {
      this.w = w;
      this.h = h;
      
      /*
      X - X -
      | * | *
      X - X -
      | * | *
  
      X: segment index
      |, -: wall index
      *: thing
      */
      this.grid = new Array(w * 2).fill(undefined).map((e, x) => { return new Array(h * 2).fill(0) });
  
      this.walls = [];
      this.segments = [{bottom: 0, top: 1, floorTexture: "metal/floor1", ceilingTexture: "metal/ceiling1", topWallTexture: "metal/ceiling1", bottomWallTexture: "metal/floor1"}];
      this.entities = [{animalType: "player", pos: {x: 0.5, y: 0.5}}];

      this.textures = ["metal/floor1", "metal/ceiling1", "metal/wall1", "rat"];
      this.vertices = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}];
      this.walls = [{
        a: 0,
        b: 1,
        texture: 2,
      },{
        a: 1,
        b: 2,
        texture: 2,
      },{
        a: 2,
        b: 3,
        texture: 2,
      },{
        a: 3,
        b: 0,
        texture: 2,
      },];
      this.segments = [{bottom: 0, top: 1, floorTexture: 0, ceilingTexture: 1, topWallTexture: 1, bottomWallTexture: 0}];
      this.entities = [new Entity("player", {x: 0.5, y: 0.5})];
    }

    this.simulated = true;
  }

  init() {
    
    this.hasInit = true;
  }
  
  get(x, y) {
    if (y == undefined) {
      y = x.y;
      x = x.x;
    }
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return undefined;
    return [this.grid[x * 2][y * 2], this.grid[x * 2 + 1][y * 2], this.grid[x * 2][y * 2 + 1], this.grid[x * 2 + 1][y * 2 + 1]];
  }
  set(x, y, index, value) {
    if (y == undefined) {
      value = index;
      index = y;
      y = x.y;
      x = x.x;
    }
    this.grid[x * 2 + (index == 1 || index == 3)][y * 2 + (index == 2 || index == 3)] = value;
  }
  
  marchRay(startPos, angle) {
    let dir = {x: Math.cos(angle), y: Math.sin(angle)};
    if (dir.x == 0) dir.x = 0.001;
    if (dir.y == 0) dir.y = 0.001;

    let small = 0.0000000001;

    let pos  = {x: startPos.x, y: startPos.y};

    let sign = {x: Math.sign(dir.x), y: Math.sign(dir.y)};
    let fx = (sign.x == 1) ? Math.ceil : Math.floor;
    let fy = (sign.y == 1) ? Math.ceil : Math.floor;

    let blocked = false;
    let hits = [];
    
    while (!blocked && pos.x >= 0 && pos.y >= 0 && pos.x < this.grid.length / 2 && pos.y < this.grid.length / 2) {
      let uv;
      let isHorizontal;

      let ny = lineFuncY(startPos, dir, fx(pos.x + small * sign.x));
      let nx = lineFuncX(startPos, dir, fy(pos.y + small * sign.y));

      if (nx * sign.x > fx(pos.x + small * sign.x) * sign.x) { 
        pos.x = fx(pos.x + small * sign.x);
        pos.y = ny;
        uv = ny % 1;
        isHorizontal = true;
      } 
      else {
        pos.y = fy(pos.y + small * sign.y);
        pos.x = nx;
        uv = nx % 1;
        isHorizontal = false;
      }
      
      if (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h) return hits;

      let d = Math.sqrt((pos.x-startPos.x)*(pos.x-startPos.x)+(pos.y-startPos.y)*(pos.y-startPos.y));
      let fPos = {x: Math.floor(pos.x), y: Math.floor(pos.y)};
      let oldPos = {x: Math.floor(pos.x - small * sign.x), y: Math.floor(pos.y - small * sign.y)};
      let newPos = {x: Math.floor(pos.x + small * sign.x), y: Math.floor(pos.y + small * sign.y)};

      let wall = this.get(fPos)[isHorizontal?2:1];

      let segmentIndex =  this.get(oldPos)[0];
      let oldSegment = this.segments[segmentIndex];
      let newSegmentIndex = this.get(newPos);
      if (newSegmentIndex) newSegmentIndex = newSegmentIndex[0];

      if (wall != 0) {
        hits.push({
          wall: wall,
          segment: segmentIndex,
          d: d,
          uv: uv,
          isHorizontal: isHorizontal,
        });

        if (!textures[this.walls[wall].texture].transparent) blocked = true;
      } else if (newSegmentIndex != undefined) {
        let newSegment = this.segments[newSegmentIndex];
        let top = newSegment.top < oldSegment.top;
        let bottom = newSegment.bottom > oldSegment.bottom;
        if (top || bottom) {
          hits.push({
            top: top,
            bottom: bottom,
            oldSegment: segmentIndex,
            newSegment: newSegmentIndex,
            d: d,
            uv: uv,
            isHorizontal: isHorizontal,
          });
        }
      }
    }
    return hits;
  }
}

function lineFuncY(startPos, dir, x) {
  return (dir.y / dir.x) * (x - startPos.x) + startPos.y;
}
function lineFuncX(startPos, dir, y) {
  return (dir.x / dir.y) * (y - startPos.y) + startPos.x;
}