class World {
  constructor(data) {
    if (data) {
      let world = JSON.parse(data);
      this.textures = world.textures;
      this.vertices = world.vertices;
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
      this.segments = [{walls: [0, 1, 2, 3], bottom: 0, top: 1, floorTexture: 0, ceilingTexture: 1, topWallTexture: 1, bottomWallTexture: 0}];
      this.entities = [new Entity("player", {x: 0.5, y: 0.5})];
    }

    this.simulated = true;
    this.precalc();
  }

  precalc() {
    for (let i of this.walls) {
      let line = {a: this.vertices[i.a], b: this.vertices[i.b]};

      let diff = {x: line.b.x - line.a.x, y: line.b.y - line.a.y};
      let perpendicular = {x: diff.y / 128, y: diff.x / 128};

      let middle = {x: line.a.x + diff.x * 0.5, y: line.a.y + diff.y * 0.5};
      i.segments = [
        this.getSegment({x: middle.x - perpendicular.x, y: middle.y + perpendicular.y}), 
        this.getSegment({x: middle.x + perpendicular.x, y: middle.y - perpendicular.y})
      ];
      i.length = Math.sqrt(diff.x ** 2 + diff.y ** 2);

      if (i.divider == undefined) i.divider = false;
      if (i.tileH == undefined) i.tileH = false;
      if (i.tileV == undefined) i.tileV = false;
    }
  }
  
  lineIntersect(lines, l2) {
    let hits = [];
    for (let i = 0; i < lines.length; i++) {
      let l1 = lines[i];
      var det, gamma, lambda;
      det = (l1.b.x - l1.a.x) * (l2.b.y - l2.a.y) - (l2.b.x - l2.a.x) * (l1.b.y - l1.a.y);
      if (det === 0) {
        
      } else {
        lambda = ((l2.b.y - l2.a.y) * (l2.b.x - l1.a.x) + (l2.a.x - l2.b.x) * (l2.b.y - l1.a.y)) / det;
        gamma = ((l1.a.y - l1.b.y) * (l2.b.x - l1.a.x) + (l1.b.x - l1.a.x) * (l2.b.y - l1.a.y)) / det;
  
        let hit = (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        if (hit) {
          let diff = {x: l2.b.x - l2.a.x, y: l2.b.y - l2.a.y};
          let point = {x: l2.a.x + diff.x * (1 - gamma), y: l2.a.y + diff.y * (1 - gamma)}
          hits.push({
            point: point,
            uv: lambda,
            d: (1 - gamma),
            i: i,
          });
        }
      }
    }
    return hits;
  }

  getSegmentLines(segment) {
    let walls = this.segments[segment].walls;
    let lines = [];

    for (let i = 0; i < walls.length; i++) {
      lines.push({a: this.vertices[this.walls[walls[i]].a], b: this.vertices[this.walls[walls[i]].b]});
    }
    return lines;
  }

  getSegment(pos) {
    for (let i = 0; i < this.segments.length; i++) {
      let intersections = this.lineIntersect(this.getSegmentLines(i), {a: pos, b: {x: 100000.1, y: 0.1}});
      if (intersections.length % 2 == 1) return i;
    }
  }

  getWallSegment(wall, pos, invert = false) {
    let line = {a: this.vertices[wall.a], b: this.vertices[wall.b]};

    let diff1 = {x: line.b.x - line.a.x, y: line.b.y - line.a.y};
    let diff2 = {x: pos.x - line.a.x, y: pos.y - line.a.y};
    
    let a1 = Math.atan2(diff1.y, diff1.x);
    let a2 = Math.atan2(diff2.y, diff2.x);

    let diffAngle = -getDeltaAngle(a1, a2);

    let segment;
    if (Math.abs(diffAngle) > Math.PI) segment = wall.segments[invert ? 0 : 1];
    else segment = wall.segments[invert ? 1 : 0];

    return segment;
  }

  export() {
    let data = {};
    data.textures = this.textures;
    data.vertices = this.vertices;
    data.walls = this.walls;
    data.segments = this.segments;

    data.entities = [];
    for (let i = 0; i < this.entities.length; i++) {
      data.entities[i] = {};
      let e = data.entities[i];
      let en = this.entities[i];

      e.animalType = en.animalType;
      e.pos = en.pos;
      e.dir = en.dir;
      e.vel = en.vel;
      e.slots = en.slots;
    }

    data.vertices = [];
    for (let i = 0; i < this.vertices.length; i++) {
      data.vertices[i] = this.vertices[i] ? {x: this.vertices[i].x, y: this.vertices[i].y} : undefined;
    }

    return JSON.stringify(data);
  }
}