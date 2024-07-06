let fogA = 0.5;
let fogB = 1;

let Renderer = {
  buffer: [],
  depthBuffer: [],

  preload() {
    for (let i in textures) {
      if (typeof(textures[i]) != "string") continue;
      textures[i] = loadImage(textures[i]);
    }
  },

  init(w, h) {
    Renderer.img = createImage(w, h);
    Renderer.img.loadPixels();
  
    for (let i in textures) {
      let tex = textures[i];
      if (tex.loadPixels) tex.loadPixels();
      tex.transparent = false;

      for (let i = 3; i < tex.pixels.length; i += 4) {
        if (tex.pixels[i] != 255) {
          tex.transparent = true;
          break;
        }
      }
    }
  },

  renderText(string, X, Y, align = "tl", d = 0, c = [255, 255, 255]) {
    string = string.toString().toLowerCase();
    let w = string.length * 4;
    let h = 5;

    if (align[0] == "c") Y = Math.floor(Y - h / 2);
    if (align[0] == "b") Y = Math.floor(Y - h);
    if (align[1] == "c") X = Math.floor(X - w / 2);
    if (align[1] == "r") X = Math.floor(X - w);

    for (let x = 0; x < screenw; x++) {
      if (x < X || x >= X + w || (x - X + 1) % 4 == 0) {
        continue;
      }

      let col = [];
      for (let y = 0; y < screenh; y++) {
        if (y < Y || y >= Y + h) {
          continue;
        }

        let index = (Math.floor((x - X) % 4) + Math.floor((y - Y) % 5) * 3);
        let char = font[string[Math.floor((x - X) / 4)]];
        
        if (char == undefined) char = font["§"];

        let clr = [
          c[0],
          c[1],
          c[2],
          char[index] * 255,
        ];

        col.push(clr);
      }
      //Renderer.buffer.push({x: x, d: d, col: col});
      Renderer.bufferPush(x, d, col, Y);
    }
  },

  renderButton(string, X, Y, align = "tl", d = 0, c = [255, 255, 255]) {
    let w = string.length * 4 + 3;
    let h = 5 + 4;

    if (align[0] == "c") Y = Math.floor(Y - h / 2);
    if (align[0] == "b") Y = Math.floor(Y - h);
    if (align[1] == "c") X = Math.floor(X - w / 2);
    if (align[1] == "r") X = Math.floor(X - w);

    Renderer.renderTexture("empty", X, Y, "tl", w, h, d, 1);
    Renderer.renderText(string, X + 2, Y + 2, "tl", d, c);

    return {x: X, y: Y, w: w, h: h};
  },

  renderWorld() {
    let focusPlane = screenw / 2 / Math.tan(fov / 2);
    let yShear = Math.tan(player.dir.y) * focusPlane;
    let dFactor = (Math.sin(player.bob) * player.animal.bobStrength - player.pos.z - player.animal.height + 0.5); //Z offset i don't know why it's called dFactor
    let world = Game.world;

    renderWalls();
    renderFloorAndCeiling();

    function renderWalls() {
      for (let i = 0; i < world.walls.length; i++) {
        let wall = world.walls[i];
        if (wall == undefined) continue;

        let tex = wall.texture;
        let tileH = wall.tileH ? wall.length : 1;
        let tileV = wall.tileV ? segment.top - segment.bottom : 1;

        let segment = world.segments[world.getWallSegment(wall, player.pos)];
        if (!segment) continue;

        let top = segment.top;
        let bottom = segment.bottom;

        if (wall.divider) {
          let segment2 = world.segments[world.getWallSegment(wall, player.pos, true)];

          let diffBottom = segment2.bottom - segment.bottom;
          let diffTop = segment.bottom - segment2.bottom;

          if (diffBottom > 0) {
            top = segment2.bottom;
            bottom = segment.bottom;

            tex = segment2.bottomWallTexture;
            tileH = segment2.bottomWallTextureTileH ? wall.length : 1;
            tileV = segment2.bottomWallTextureTileV ? diffBottom : 1;
          }
          else if (diffTop > 0) {
            top = segment.top;
            bottom = segment2.top;

            tex = segment2.topWallTexture;
            tileH = segment2.topWallTextureTileH ? wall.length : 1;
            tileV = segment2.topWallTextureTileV ? diffTop : 1;
          } else {
            continue;
          }

        }

        tex = textures[world.textures[tex]];

        let l = {};
        let r = {};

        for (let j = 0; j < 2; j++) {
          let pos = world.vertices[j == 0 ? wall.a : wall.b];
          let u = j;

          let diff = {x: pos.x - player.pos.x, y: pos.y - player.pos.y};
          let relativeAngle = -getDeltaAngle(Math.atan2(diff.y, diff.x), player.dir.x);

          let na = Math.min(Math.max(relativeAngle, -fov / 2), fov / 2);
          if (relativeAngle != na) {
            relativeAngle = na;
            
            let cast = world.lineIntersect(
              [{a: world.vertices[wall.a], b: world.vertices[wall.b]}],
              {a: player.pos, b: {x: player.pos.x + Math.cos(player.dir.x + relativeAngle) * 1000, y: player.pos.y + Math.sin(player.dir.x + relativeAngle) * 1000}}
            );

            u = cast[0]?.uv;
            if (cast.length != 0) {
              pos = cast[0].point;
              diff = {x: pos.x - player.pos.x, y: pos.y - player.pos.y};
            }
          }

          let d = Math.sqrt(diff.x ** 2 + diff.y ** 2) * Math.cos(relativeAngle);
          let yShearReal = yShear + dFactor * focusPlane / d;

          let size = focusPlane / d * 0.01;
          let fog = Math.max(Math.pow(d, fogA), fogB);// + info.isHorizontal * 0.3;
          if (isNaN(fog)) fog = 1;

          let data = j == 0 ? l : r;
          data.d = d;
          data.yShearReal = yShearReal;
          data.size = size;
          data.fog = fog;
          data.diff = diff;
          data.u = u;
          data.x = Math.floor(Math.tan(relativeAngle) * focusPlane + screenw / 2);
          if (relativeAngle < -fov || relativeAngle > fov) data.x = undefined;
        }

        if (l.x > r.x) [l, r] = [r, l];
        for (let x = l.x; x < r.x; x++) {
          let done = (x - l.x) / (r.x - l.x);
          let d = l.d + (r.d - l.d) * done;
          let yShearReal = l.yShearReal + (r.yShearReal - l.yShearReal) * done;
          let size = l.size + (r.size - l.size) * done;
          let fog = l.fog + (r.fog - l.fog) * done;
          let uv = {u: l.u + (r.u - l.u) * done, v: 0};


          let relativeAngle = Math.atan((x - screenw / 2) / focusPlane);
          
          let cast = world.lineIntersect(
            [{a: world.vertices[wall.a], b: world.vertices[wall.b]}],
            {a: player.pos, b: {x: player.pos.x + Math.cos(player.dir.x + relativeAngle) * 1000, y: player.pos.y + Math.sin(player.dir.x + relativeAngle) * 1000}}
          );
          if (cast[0]) {
            d = Math.sqrt((cast[0].point.x - player.pos.x) ** 2 + (cast[0].point.y - player.pos.y) ** 2) * Math.cos(relativeAngle)
            uv.u = cast[0].uv;
          }
          size = focusPlane / d * 0.01;
          fog = Math.max(Math.pow(d, fogA), fogB);
          yShearReal = yShear + dFactor * focusPlane / d;

          let col = [];
          let yStart = undefined;
          for (let Y = 0; Y < screenh; Y++) {
            let y = Y + Math.floor(yShearReal);
            let deltaCenter = y / screenh - 0.5;
            uv.v = (deltaCenter / size + 0.5 + top - 1) / (top - bottom);
            
            if (deltaCenter < (0.5 - bottom) * size && deltaCenter > (0.5 - top) * size && d > 0 && !isNaN(uv.u)) {
              let c = [0, 0, 0, 0];
              if (yStart == undefined) yStart = Y;

              let index = (Math.floor(uv.u * tileH * tex.width) + Math.floor(uv.v * tileV * tex.height) * tex.width) * 4;
              c[0] = tex.pixels[index  ] / fog;
              c[1] = tex.pixels[index+1] / fog;
              c[2] = tex.pixels[index+2] / fog;
              c[3] = tex.pixels[index+3];

              //c = [uv.u * 255, uv.v * 255, 0, 255];
              //c = [world.getWallSegment(wall, player.pos) * 100, 0, 0, 255];
              //c = [uv.u * tileH * 255, uv.v * tileV * 255, 0, 255];

              col.push([c[0], c[1], c[2], c[3]]);
            }
          }

          //Renderer.buffer.push({x: x, d: d, col: col});
          Renderer.bufferPush(x, d, col, yStart);
        }
      }
    }

    function renderFloorAndCeiling() {
      for (let segmentIndex = 0; segmentIndex < world.segments.length; segmentIndex++) {
        let segment = world.segments[segmentIndex];
        if (segment == undefined || segment.walls.length == 0) continue;
  
        for (let y = 0; y < screenh; y++) {
    
          let langle = Math.atan(-screenw / 2 / focusPlane) + player.dir.x;
          let rangle = Math.atan( screenw / 2 / focusPlane) + player.dir.x;
    
          let bottom = segment.bottom;
          let top = segment.top;
  
          /*
          x deltaCenter
          y size
          z top
          w bottom
          a y
          b yShear
          c screenh
          d dFactor
          e focusPlane
          f 1 / (y / 0.01 / e)
  
          0 = (((((a + b + ((d * e) / (1 / ((y / 0.01) / e)))) / c) - 0.5) / y) + 0.5 + z - 1) / (z - w);
          y = (0.005c - 0.01a - 0.01b) / (-0.005c + d + 0.01cz)
  
          1 = (((((a + b + ((d * e) / (1 / ((y / 0.01) / e)))) / c) - 0.5) / y) + 0.5 + z - 1) / (z - w);
          y = (-c + 2a + 2b) / (c - 200d - 2cw)
          */
  
          let drawingCeiling = (y + yShear) < screenh / 2;
          let d;
          if (drawingCeiling) {
            let size = (screenh * 0.005 - y * 0.01 - yShear * 0.01) / (screenh * -0.005 + dFactor + screenh * top * 0.01);
            d = 1 / (size / 0.01 / focusPlane);
          } else {
            let size = ((y + yShear) * 2 - screenh) / (screenh - dFactor * 200 - screenh * bottom * 2);
            d = 1 / (size / 0.01 / focusPlane);
          }
  
          let fog = Math.max(Math.pow(d, fogA), fogB);
    
          let scaling = 1 / 0.71;
          let luv = {u: Math.cos(langle) * d * scaling + player.pos.x, v: Math.sin(langle) * d * scaling + player.pos.y};
          let ruv = {u: Math.cos(rangle) * d * scaling + player.pos.x, v: Math.sin(rangle) * d * scaling + player.pos.y};
  
          let intersections = world.lineIntersect(world.getSegmentLines(segmentIndex), {a: {x: luv.u, y: luv.v}, b: {x: luv.u + (ruv.u - luv.u) * 200, y: luv.v + (ruv.v - luv.v) * 200}});
          let inside = intersections.length % 2 == 1;
  
          let lastDone = 0;
          let yStart = 0;
          let row = [];

          for (let x = 0; x < screenw; x++) {
            let done = x / screenw;
            let lastInside = inside;

            for (let i = 0; i < intersections.length; i++) {
              let int = intersections[i];
              if (lastDone < int.d * 200 && done > int.d * 200) inside = !inside;
            }
            lastDone = done;

            if (lastInside && !inside) {
              Renderer.bufferPush(y, d, row, yStart, true);
              //Renderer.renderPoint(x, y, 0, [0, 0, 255, 255]);
            }
            if (!lastInside && inside) {
              yStart = x;
              row = [];
              //Renderer.renderPoint(x, y, 0, [255, 0, 0, 255]);
            }
  
            let uv = {
              u: (luv.u + (ruv.u - luv.u) * done),
              v: (luv.v + (ruv.v - luv.v) * done)
            };

            //row.push([uv.u * 255, uv.v * 255, 0, 255]);
            //continue;
  
            //row.push([Game.world.get(Math.floor(uv.u), Math.floor(uv.v))[0] * 255, 0, 0, 255]);
            //continue
  
            let tex = textures[world.textures[drawingCeiling ? segment.ceilingTexture : segment.floorTexture]];
    
            let c = [];
            let index = (Math.floor((uv.u + 1000) % 1 * tex.width) + Math.floor((uv.v + 1000) % 1 * tex.height) * tex.width) * 4;
            c[0] = tex.pixels[index  ] / fog;
            c[1] = tex.pixels[index+1] / fog;
            c[2] = tex.pixels[index+2] / fog;
            c[3] = tex.pixels[index+3];
    
            //c = [uv.u * 255, uv.v * 255, 0, 255];
            row.push(c);
          }
          //Renderer.buffer.push({y: y, d: d, col: row});
          if (inside) Renderer.bufferPush(y, d, row, yStart, true);
          //if (inside) Renderer.renderPoint(screenw - 1, y, 0, [0, 0, 255, 255]);
        }
      } 
    }
  },

  renderEntities() {
    let focusPlane = screenw / 2 / Math.tan(fov / 2);
    let yShear = Math.tan(player.dir.y) * focusPlane;
    let dFactor = (Math.sin(player.bob) * player.animal.bobStrength - player.pos.z - player.animal.height + 0.5);
    let world = Game.world;

    for (let i = 1; i < Game.world.entities.length; i++) {
      let entity = Game.world.entities[i];
      if (!entity || entity.owner || entity.hp < 0 || entity.animal.visible == false) continue;

      let tex = textures[entity.animal.texture];
      let relativePos = rotateVector({x: entity.pos.x - player.pos.x, y: entity.pos.y - player.pos.y}, -player.dir.x + Math.PI / 2);
      
      let d = relativePos.y;
      let yShearReal = yShear + dFactor * focusPlane / d;
      
      let size = focusPlane / d * 0.01 * entity.animal.height;
      if (size < 0) continue;
      let wallSize = focusPlane / d * 0.01;
      
      let X = Math.floor(-relativePos.x * focusPlane / d + screenw / 2 - screenh * size / 2);
      let Y = Math.floor((-yShearReal - (entity.pos.z + Math.sin(entity.bob) * entity.animal.bobStrength) * focusPlane / d + (wallSize / 2) * screenh) + screenh / 2 - screenh * size);
      let w = Math.floor(screenh * size);
      let h = Math.floor(screenh * size);
      
      Renderer.renderTexture(entity.animal.texture, X, Y, "tl", w, h, d, (entity == highlighted) * 2)
    }
  },

  renderTexture(tex, X, Y, align, w, h, d, highlight = false, highlightColor = [255, 255, 255, 255]) {
    tex = textures[tex];

    if (align[0] == "c") Y = Math.floor(Y - h / 2);
    if (align[0] == "b") Y = Math.floor(Y - h);
    if (align[1] == "c") X = Math.floor(X - w / 2);
    if (align[1] == "r") X = Math.floor(X - w);

    let fog = Math.max(Math.pow(d, fogA), fogB);
    if (isNaN(fog)) fog = 1;
    for (let x = 0; x < screenw; x++) {
      if (x < X || x >= X + w) {
        continue;
      }

      let col = [];
      for (let y = 0; y < screenh; y++) {
        if (y < Y || y >= Y + h) {
          continue;
        }
        let index = (Math.floor((x - X) / w * tex.width) + Math.floor((y - Y) / h * tex.height) * tex.width) * 4;
        let c = [
          tex.pixels[index  ] / fog,
          tex.pixels[index+1] / fog,
          tex.pixels[index+2] / fog,
          tex.pixels[index+3],
        ];

        if (highlight && (
            (highlight == 1 && (x == X || y == Y || x == X + w - 1 || y == Y + h - 1) ||
            (highlight == 2 && (X + w / 2 - 0.5 - x) ** 2 + (Y + h / 2 - 0.5 - y) ** 2 > (Math.max(w, h) / 1.7 )** 2)
          ))) {
          c = highlightColor;
        }
        col.push(c);
      }
      //Renderer.buffer.push({x: x, d: d, col: col});
      Renderer.bufferPush(x, d, col, Y);
    }
  },

  renderSlantedTexture(tex, tl, tr, bl, ld, rd) {
    tex = textures[tex];

    let w = tr.x - tl.x;
    let h = bl.y - tl.y;

    let br = {x: bl.x + w, y: tr.y + h};

    let atl = {x: Math.min(tl.x, bl.x), y: Math.min(tl.y, tr.y)};
    let atr = {x: Math.max(tr.x, bl.x + w), y: Math.max(tl.y, tr.y)};

    let slopeX = (bl.x - tl.x);
    let slopeY = (tr.y - tl.y);

    for (let x = atl.x; x < atr.x; x++) {
      let xU = (x - atl.x) / (atr.x - atl.x);
      let fog = Math.max(Math.pow(ld + (rd - ld) * xU, fogA), fogB);

      let col = [];
      for (let y = 0; y < screenh; y++) {
        let u = (x - tl.x) / w;
        let v = (y - tl.y) / h;

        let oldU = u;

        u -= slopeX * v / w;
        v -= slopeY * oldU / h;

        if (u < 0 || v < 0 || u >= 1 || v >= 1) {
          col.push([0, 0, 0, 0]);
          continue;
        }

        let index = (Math.floor(u * tex.width) + Math.floor(v * tex.height) * tex.width) * 4;
        let c = [
          tex.pixels[index  ] / fog,
          tex.pixels[index+1] / fog,
          tex.pixels[index+2] / fog,
          tex.pixels[index+3],
        ];

        col.push(c);
      }
      //Renderer.buffer.push({x: x, d: ld + (rd - ld) * xU, col: col});
      Renderer.bufferPush(x, ld + (rd - ld) * xU, col);
    }

    /*Renderer.renderPoint(tl.x, tl.y, -1, [0, 0, 255, 255]);
    Renderer.renderPoint(tr.x, tr.y, -1, [0, 0, 255, 255]);
    Renderer.renderPoint(bl.x, bl.y, -1, [0, 0, 255, 255]);
    Renderer.renderPoint(br.x, br.y, -1, [0, 0, 255, 255]);*/
  },

  renderRectangle(x1, y1, x2, y2, d = 0, c = [255, 255, 255, 255]) {
    for (let x = x1; x <= x2; x++) {
      let col = [];
      for (let y = 0; y < screenh; y++) {
        if (y >= y1 && y <= y2) col.push(c);
      }
      //Renderer.buffer.push({x: x, d: d, col: col});
      Renderer.bufferPush(x, d, col, y1);
    }
  },

  renderPoint(x, y, d = 0, c = [255, 255, 255, 255]) {
    Renderer.bufferPush(x, d, [c], y);
  },

  renderCross(X, Y, d = 0, c = [255, 255, 255, 255]) {
    Renderer.renderPoint(X-1, Y-1, d, c);
    Renderer.renderPoint(X-1, Y+1, d, c);
    Renderer.renderPoint(X, Y, d, c);
    Renderer.renderPoint(X+1, Y-1, d, c);
    Renderer.renderPoint(X+1, Y+1, d, c);
  },

  renderPlus(X, Y, d = 0, c = [255, 255, 255, 255]) {
    Renderer.renderPoint(X-1, Y, d, c);
    Renderer.renderPoint(X+1, Y, d, c);
    Renderer.renderPoint(X, Y, d, c);
    Renderer.renderPoint(X, Y-1, d, c);
    Renderer.renderPoint(X, Y+1, d, c);
  },

  bufferPush(X, d, col, yStart = 0, row = false, ) {
    for (let Y = 0; Y < col.length; Y++) {
      let x = X;
      let y = yStart + Y;

      if (row) {
        x = yStart + Y;
        y = X;
      }
      
      if (col[Y][3] < 50 || x < 0 || x >= screenw || y < 0 || y >= screenh) continue;

      let k = x + y * screenw;
      if (Renderer.depthBuffer[k] < d) continue;
      Renderer.depthBuffer[k] = d;

      k *= 4;
      Renderer.buffer[k++] = col[Y][0];
      Renderer.buffer[k++] = col[Y][1];
      Renderer.buffer[k++] = col[Y][2];
      Renderer.buffer[k++] = 255;
    }
  },

  displayRender() {
    for (let i = 0; i < Renderer.buffer.length; i++) {
      Renderer.img.pixels[i] = ((i + 1) % 4 == 0) ? 255 : (Renderer.buffer[i] || 0);
    }

    Renderer.img.updatePixels();
    noSmooth();
    image(Renderer.img, 0, 0, width, height);
  },

  mix(c1, c2, i) {
    return [c1[0] + (c2[0] - c1[0]) * i, c1[1] + (c2[1] - c1[1]) * i, c1[2] + (c2[2] - c1[2]) * i, c1[3] + (c2[3] - c1[3]) * i];
  },
};

//https://gist.github.com/yomotsu/165ba9ee0dc991cb6db5
var getDeltaAngle = function () {
  var TAU = 2 * Math.PI;
  var mod = function (a, n) { return ( a % n + n ) % n; } // modulo
  var equivalent = function (a) { return mod(a + Math.PI, TAU) - Math.PI } // [-π, +π]
  return function (current, target) {
    return equivalent(target - current);
  }
}();