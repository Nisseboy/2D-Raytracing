let inEditor = false;

let mouseWorld;

let Editor = {
  tempWorld: undefined,
  world: new World(levels["chapter 1"]["level 1"]),

  pos: {x: 0, y: 0},
  gridSize: 10,

  hovered: undefined,
  selected: [],
  dragging: false,
  walling: false,
  tempVertex: undefined,

  hoveredColor: [0, 255, 255, 255],
  selectedColor: [200, 200, 0, 255],

  init() {
    
  },

  start() {
    if (inEditor) {
      Game.world = Editor.tempWorld;
    }
    inEditor = true;
  },
  
  update() {
    menuButtons.push({
      text: "3d",

      callback: e => {Editor.playButton(false)},
    });

    let movement = {y: getKeyPressed("Walk Back") - getKeyPressed("Walk Forward"), x: getKeyPressed("Walk Right") - getKeyPressed("Walk Left")};
    Editor.pos.x += movement.x;
    Editor.pos.y += movement.y;

    mouseWorld = toWorld(mousePos);

    let world = Editor.world;
    let gridSize = Editor.gridSize;
    Editor.hovered = undefined;

    for (let i = 0; i < world.vertices.length; i++) {
      let vertex = world.vertices[i];
      let pt = toScreen(vertex);

      if (!Editor.hovered && Math.abs(mousePos.x - pt.x) < 2 && Math.abs(mousePos.y - pt.y) < 2) {
        Editor.hovered = vertex;
      }

      Renderer.renderCross(pt.x, pt.y, 0, Editor.hovered == vertex ? Editor.hoveredColor : Editor.selected.includes(vertex) ? Editor.selectedColor : [255, 0, 0, 255]);
    }
    
    for (let i = 0; i < world.walls.length; i++) {
      let wall = world.walls[i];
      let a = toScreen(world.vertices[wall.a]);
      let b = toScreen(world.vertices[wall.b]);

      let pts = connectPoints(a.x, a.y, b.x, b.y);

      for (let i = 0; i < pts.length; i++) {
        let pt = pts[i];

        if (!Editor.hovered && Math.abs(mousePos.x - pt.x) < 1 && Math.abs(mousePos.y - pt.y) < 1) {
          Editor.hovered = wall;
        }
      }

      for (let i = 0; i < pts.length; i++) {
        let pt = pts[i];
  
        Renderer.renderPoint(pt.x, pt.y, 1, Editor.hovered == wall ? Editor.hoveredColor : Editor.selected.includes(wall) ? Editor.selectedColor : [255, 255, 255, 255]);
      }
    }

    for (let segmentIndex in world.segments) {
      let segment = world.segments[segmentIndex];
      for (let y = 0; y < screenh; y++) {
        let row = [];
        
        let l = toWorld(0, y);
        let r = toWorld(screenw, y);
        let luv = {u: l.x, v: l.y};
        let ruv = {u: r.x, v: r.y};

        let intersections = world.lineIntersect(world.getSegmentLines(segmentIndex), {a: mouseWorld, b: {x: 10000.1, y: 0.1}});
        if (!Editor.hovered && intersections.length % 2 == 1) {
          Editor.hovered = segment;
        }

        intersections = world.lineIntersect(world.getSegmentLines(segmentIndex), {a: {x: luv.u, y: luv.v}, b: {x: luv.u + (ruv.u - luv.u) * 200, y: luv.v + (ruv.v - luv.v) * 200 + 1}});
        let inside = intersections.length % 2 == 1;

        let lastDone = 0;

        for (let x = 0; x < screenw; x++) {
          let done = x / screenw;
          for (let i of intersections) {
            if (lastDone < i.d * 200 && done > i.d * 200) inside = !inside;
          }
          lastDone = done;

          let uv = {
            u: (luv.u + (ruv.u - luv.u) * done),
            v: (luv.v + (ruv.v - luv.v) * done)
          };
          
          if (!inside || isNaN(uv.u) || isNaN(uv.v)) {
            row.push([0, 0, 0, 0]);
            continue;
          }

          let tex = textures[world.textures[segment.floorTexture]];
          
          let c = [];
          let index = (Math.floor((uv.u + 1000) % 1 * tex.width) + Math.floor((uv.v + 1000) % 1 * tex.height) * tex.width) * 4;
          c[0] = tex.pixels[index  ];
          c[1] = tex.pixels[index+1];
          c[2] = tex.pixels[index+2];
          c[3] = tex.pixels[index+3];

          let c2;
          if (Editor.hovered == segment) {
            c2 = Editor.hoveredColor;
          }
          if (Editor.selected.includes(segment)) {
            c2 = Editor.selectedColor;
          }
          if (c2) {
            c[0] = (c2[0] + c[0]) / 2;
            c[1] = (c2[1] + c[1]) / 2;
            c[2] = (c2[2] + c[2]) / 2;
          }
  
          row.push(c);
        }
        Renderer.buffer.push({y: y, d: 5, col: row});
      }
    } 

    for (let x = 0; x <= screenw / pixelSize + 2; x++) {
      for (let y = 0; y <= screenh / pixelSize + 2; y++) {
        let pt = toScreen(x, y);
        Renderer.renderPoint((pt.x + screenw) % screenw, (pt.y + screenh) % screenh, 10, [100, 100, 100, 255]);
      }
    }
  },

  mousePressed() {
    let hovered = Editor.hovered;
    let selected = Editor.selected;
    let world = Editor.world;

    let shift = pressed[16];
    let ctrl = pressed[17];
    
    if (mouseButton == LEFT) {
      if (hovered) {
        Editor.dragging = true;

        if (shift && hovered.x != undefined) {
          Editor.walling = true;
          Editor.dragging = false;
          Editor.tempVertex = {x: mouseWorld.x, y: mouseWorld.y};
          world.vertices.push(Editor.tempVertex);

          world.walls.push({a: world.vertices.indexOf(hovered), b: world.vertices.indexOf(Editor.tempVertex), texture: 2});
        } else {
          if (!selected.includes(hovered)) {
            if (!ctrl) selected.length = 0;
            selected.push(hovered);
          }
        }
      } else if (!ctrl) {
        selected.length = 0;

        if (shift) {
          world.vertices.push({x: mouseWorld.x, y: mouseWorld.y});
        }
      }
    }
  },
  mouseDragged(e) {
    if (Editor.dragging) Editor.draggingFunc(e);
    if (Editor.walling) Editor.wallingFunc(e);
  },
  draggingFunc(e) {
    let selected = Editor.selected;
    let diff = {x: e.movementX / Editor.gridSize / pixelSize, y: e.movementY / Editor.gridSize / pixelSize};

    for (let i = 0; i < selected.length; i++) {
      let s = selected[i];
      if (!s.pos && s.x == undefined && s.y == undefined) continue;
      if (s.pos) {
        s.pos.x += diff.x;
        s.pos.y += diff.y;
      }
      if (s.x != undefined) {
        s.x += diff.x;
        s.y += diff.y;
      }
    }
  },
  wallingFunc(e) {
    let diff = {x: e.movementX / Editor.gridSize / pixelSize, y: e.movementY / Editor.gridSize / pixelSize};

    Editor.tempVertex.x += diff.x;
    Editor.tempVertex.y += diff.y;
  },
  mouseReleased() {
    Editor.dragging = false;
    Editor.walling = false;

    if (Editor.tempVertex) {
      Editor.world.vertices.push(Editor.tempVertex);
      Editor.tempVertex = undefined;
    }

    Editor.world.precalc();
  },

  keyPressed() {
    if (keyCode == getKey("Pause")) Editor.backButton();
  },

  backButton() {
    inEditor = false;
    setScene(MainMenu);
  },
  playButton(simulate) {
    Editor.tempWorld = Game.world;
    Game.world = new World(Editor.world.export());
    Game.world.simulated = simulate;
    setScene(Game);
  },

  stop() {

  }
};

function toScreen(x, y) {
  if (y == undefined) {
    y = x.y;
    x = x.x;
  }
  return {x: Math.floor(x * Editor.gridSize - Editor.pos.x + screenw / 2), y: Math.floor(y * Editor.gridSize - Editor.pos.y + screenh / 2)};
}
function toWorld(x, y) {
  if (y == undefined) {
    y = x.y;
    x = x.x;
  }
  return {x: (x - screenw / 2 + Editor.pos.x) / Editor.gridSize , y: (y - screenh / 2 + Editor.pos.y) / Editor.gridSize};
}

function connectPoints(x1, y1, x2, y2) {
  x1 = Math.floor(x1);
  x2 = Math.floor(x2);
  y1 = Math.floor(y1);
  y2 = Math.floor(y2);
  
  let pts = [];
  let diff = {x: x2 - x1, y: y2 - y1};
  
  let vertical = Math.abs(diff.y) > Math.abs(diff.x);
  
  let slope;
  if (vertical) slope = diff.x / diff.y;
  else          slope = diff.y / diff.x;
  
  for (let i = 0; i < Math.abs(vertical?diff.y:diff.x); i++) {
    let j = i * Math.sign(vertical?diff.y:diff.x);
    if (vertical) pts.push({x: x1 + Math.round(j * slope), y: y1 + j});
    else          pts.push({x: x1 + j, y: y1 + Math.round(j * slope)});
  }
  
  if (pts.length == 0 || pts[pts.length - 1].x != x2 || pts[pts.length - 1].y != y2) pts.push({x: x2, y: y2});

  return pts;
}