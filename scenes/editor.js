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

  snapping: true,
  snapDist: 0.3,
  
  segmentPanelOpen: false,
  segmentPanelScroll: 0,
  selectedSegment: undefined,

  propertyPanelOpen: false,

  panelWidth: 60,

  hoveredColor: [0, 255, 255, 255],
  selectedColor: [200, 200, 0, 255],

  init() {

  },

  start() {
    if (inEditor) {
      Game.world = Editor.tempWorld;
    }
    inEditor = true;

    mouseWorld = toWorld(mousePos);
  },
  
  update() {
    let world = Editor.world;
    Editor.hovered = undefined;

    if (Editor.selectedSegment == undefined) {
      menuButtons.push({
        text: "help",

        callback: e => {window.open("https://github.com/Nisseboy/2D-Raytracing/blob/master/docs/editor.md")},
      });
      menuButtons.push({
        text: "3d",

        callback: e => {Editor.playButton(false)},
      });
      menuButtons.push({
        renderer: "texture",

        texture: "uisegments",

        callback: () => {Editor.segmentPanelOpen = true},
      });
      menuButtons.push({
        renderer: "texture",

        texture: "uisnapping",
        color: [255, 255, Editor.snapping ? 0 : 255, 255],

        callback: () => {Editor.snapping = !Editor.snapping},
      });

      if (Editor.segmentPanelOpen)
        Editor.renderSegmentPanel();
    } else {
      menuButtons.push({
        text: "done",
        x: screenw / 2,
        y: screenh - 1,
        align: "bc",

        callback: () => {
          let selected = Editor.selected;
          let selectedSegment = Editor.selectedSegment;

          selectedSegment.walls = [];

          for (let i = 0; i < selected.length; i++) {
            selectedSegment.walls.push(world.walls.indexOf(selected[i]));
          }
          world.precalc();

          Editor.segmentPanelOpen = true;
          Editor.selectedSegment = undefined;
          selected.length = 0;
        }
      });
    }


    let movement = {y: getKeyPressed("Walk Back") - getKeyPressed("Walk Forward"), x: getKeyPressed("Walk Right") - getKeyPressed("Walk Left")};
    Editor.pos.x += movement.x;
    Editor.pos.y += movement.y;

    if (Editor.selectedSegment == undefined)
    for (let i = 0; i < world.vertices.length; i++) {
      let vertex = world.vertices[i];
      if (vertex == undefined) continue;

      let pt = toScreen(vertex);

      if (!Editor.hovered && Math.abs(mousePos.x - pt.x) < 2 && Math.abs(mousePos.y - pt.y) < 2) {
        Editor.hovered = vertex;
      }

      Renderer.renderCross(pt.x, pt.y, 6, Editor.getHighlightColor(vertex, [255, 0, 0, 255]));
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
  
        Renderer.renderPoint(pt.x, pt.y, 8, Editor.getHighlightColor(wall));
      }
    }

    for (let segmentIndex in world.segments) {
      let segment = world.segments[segmentIndex];
      if (segment.walls.length == 0) continue;

      for (let y = 0; y < screenh; y++) {
        let row = [];
        
        let l = toWorld(0, y);
        let r = toWorld(screenw, y);
        let luv = {u: l.x, v: l.y};
        let ruv = {u: r.x, v: r.y};

        let intersections = world.lineIntersect(world.getSegmentLines(segmentIndex), {a: {x: luv.u, y: luv.v}, b: {x: luv.u + (ruv.u - luv.u) * 200, y: luv.v + (ruv.v - luv.v) * 200 + 1}});
        let inside = intersections.length % 2 == 1;

        if (intersections.length == 0) continue;

        let intersections2 = world.lineIntersect(world.getSegmentLines(segmentIndex), {a: mouseWorld, b: {x: 10000.1, y: 0.1}});
        if (!Editor.hovered && intersections2.length % 2 == 1) {
          Editor.hovered = segment;
        }

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

          let c2 = Editor.getHighlightColor(segment, 0);
          
          if (c2) {
            c[0] = (c2[0] + c[0]) / 2;
            c[1] = (c2[1] + c[1]) / 2;
            c[2] = (c2[2] + c[2]) / 2;
          }
  
          row.push(c);
        }
        Renderer.buffer.push({y: y, d: 9, col: row});
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

    if (Editor.selectedSegment) {
      if (hovered && hovered.a != undefined) {
        selected.push(hovered);
      }
      return;
    }

    let shift = pressed[16];
    let ctrl = pressed[17];
    
    if (mouseButton == LEFT) {
      if (hovered) {
        if (shift && hovered.x != undefined) {

          //Shift dragging on a vertex creates a new wall
          Editor.walling = true;
          Editor.tempVertex = {x: mouseWorld.x, y: mouseWorld.y, offset: {x: 0, y: 0}};

          world.vertices.push(Editor.tempVertex);
          world.walls.push({a: world.vertices.indexOf(hovered), b: world.vertices.indexOf(Editor.tempVertex), texture: 2});

        } else {

          //Dragging on a vertex or entity moves them
          Editor.dragging = true;
          if (!selected.includes(hovered)) {
            if (!ctrl) selected.length = 0;
            selected.push(hovered);
          }

          for (let s of selected) {
            if (s.pos) s.offset = {x: s.pos.x - mouseWorld.x, y: s.pos.y - mouseWorld.y};
            if (s.x != undefined) s.offset = {x: s.x - mouseWorld.x, y: s.y - mouseWorld.y};
          }

        }
      } else if (!ctrl) {
        selected.length = 0;

        if (shift) {
          //Shift click creates a new vertex
          world.vertices.push({x: mouseWorld.x, y: mouseWorld.y});
        }
      }
    }
  },
  mouseDragged(e) {
    mouseWorld = toWorld(mousePos);
    
    if (Editor.dragging) Editor.draggingFunc(e);
    if (Editor.walling) Editor.wallingFunc(e);
  },
  mouseMoved(e) {
    mouseWorld = toWorld(mousePos);
  },
  draggingFunc(e) {
    let selected = Editor.selected;

    for (let i = 0; i < selected.length; i++) {
      let s = selected[i];
      if (!s.pos && s.x == undefined) continue;

      let npos = {x: mouseWorld.x + s.offset.x, y: mouseWorld.y + s.offset.y};

      Editor.setObjectPos(s, npos);

      Editor.snap(s);
    }
  },
  wallingFunc(e) {
    let s = Editor.tempVertex;
    let npos = {x: mouseWorld.x + s.offset.x, y: mouseWorld.y + s.offset.y};

    Editor.setObjectPos(s, npos);

    Editor.snap(Editor.tempVertex);
  },
  setObjectPos(object, pos) {
    if (object.pos) {
      object.pos.x = pos.x;
      object.pos.y = pos.y;
    }
    if (object.x != undefined) {
      object.x = pos.x;
      object.y = pos.y;
    }
  },
  snap(object, connect = false) {
    let pos = object.pos || {x: object.x, y: object.y};
    if (pos.x == undefined) return {};

    let world = Editor.world;
    for (let i = 0; i < world.vertices.length; i++) {
      let v = world.vertices[i];

      if (v == object || v == undefined) continue;
      else {
        let sqd = (pos.x - v.x) ** 2 + (pos.y - v.y) ** 2;
        if (sqd < Editor.snapDist ** 2) {
          Editor.setObjectPos(object, v);

          if (connect && object.x != undefined) {
            let index = world.vertices.indexOf(object);
            world.vertices[index] = undefined;

            for (let wall of world.walls) {
              if (wall.a == index) wall.a = i;
              if (wall.b == index) wall.b = i;
            }
          }

          return {to: "vertex", v: v};
        }
      }
    }

    if (!Editor.snapping) return {};

    Editor.setObjectPos(object, {
      x: Math.round(pos.x * 2) / 2,
      y: Math.round(pos.y * 2) / 2,
    });
    return {to: "grid"};
  },
  mouseReleased() {
    let world = Editor.world;

    if (Editor.dragging) {
      for (let i = 0; i < Editor.selected.length; i++) {
        Editor.snap(Editor.selected[i], true);
      }
    }

    if (Editor.walling) {
      Editor.snap(Editor.tempVertex, true);

      Editor.tempVertex = undefined;
    }

    Editor.dragging = false;
    Editor.walling = false;

    world.precalc();
  },

  keyPressed() {
    if (keyCode == getKey("Pause")) Editor.backButton();
  },

  mouseWheel(e) {
    if (Editor.segmentPanelOpen) Editor.segmentPanelScroll += -Math.floor(e.delta / pixelSize);
    Editor.segmentPanelScroll = Math.min(Editor.segmentPanelScroll, 0);
    Editor.segmentPanelScroll = Math.max(Editor.segmentPanelScroll, -Math.max((Math.ceil((Editor.world.segments.length + 1) / 4)) * 13, screenh) + screenh);
  },

  backButton() {
    if (Editor.segmentPanelOpen) {
      Editor.segmentPanelOpen = false;
      return;
    }
    if (Editor.propertyPanelOpen) {
      Editor.propertyPanelOpen = false;
      return;
    }
    if (Editor.selectedSegment != undefined) {
      Editor.selectedSegment = undefined;
      Editor.segmentPanelOpen = true;
      return;
    }

    inEditor = false;
    setScene(MainMenu);
  },
  playButton(simulate) {
    Editor.tempWorld = Game.world;
    Game.world = new World(Editor.world.export());
    Game.world.simulated = simulate;
    setScene(Game);
  },

  getHighlightColor(object, base = [255, 255, 255, 255]) {
    return Editor.hovered == object ? Editor.hoveredColor : Editor.selected.includes(object) ? Editor.selectedColor : base
  },

  renderSegmentPanel() {
    let world = Editor.world;
    let segments = world.segments;

    let x = screenw - Editor.panelWidth - 1;

    Renderer.renderRectangle(x, 0, screenw, screenh, 2, [20, 20, 20, 255]);
    x++;

    let y = Editor.segmentPanelScroll + 1;
    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      let button = {
        renderer: "texture", 
        texture: world.textures[segment.floorTexture], 

        d: 1.9, 

        x: x, 
        y: y, 
        w: 12, 
        h: 12, 
        align: "tl",

        callback: () => {
          Editor.selectedSegment = segment;
          Editor.selected.length = 0;
          Editor.segmentPanelOpen = false;
        }
      };
      buttons.push(button);

      if (inBounds(mousePos, button)) Editor.hovered = segment;

      x += 13;
      if (x > screenw - 13) {
        x = screenw - Editor.panelWidth;
        y += 13;
      }
    }
    let button = {
      renderer: "texture", 
      texture: "uiplus", 

      d: 1.9, 

      x: x, 
      y: y, 
      w: 12, 
      h: 12, 
      align: "tl",

      callback: () => {
        segments.push({walls: [], bottom: 0, top: 1, floorTexture: 0, ceilingTexture: 1, topWallTexture: 1, bottomWallTexture: 0});
      }
    };
    buttons.push(button);

    x = screenw - Editor.panelWidth - 1 + 14;
    y = 1;

    Renderer.renderPoint(x, y);
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