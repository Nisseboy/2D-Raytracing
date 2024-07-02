let fogA = 0.8;
let fogB = 1;

let Renderer = {
  buffer: [],

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
          col.push([0, 0, 0, 0]);
          continue;
        }

        let index = (Math.floor((x - X) % 4) + Math.floor((y - Y) % 5) * 3);
        let char = font[string[Math.floor((x - X) / 4)]];
        
        if (char == undefined) char = font.rect;

        let clr = [
          c[0],
          c[1],
          c[2],
          char[index] * 255,
        ];

        col.push(clr);
      }
      Renderer.buffer.push({x: x, d: d, col: col});
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
    let dFactor = (Math.sin(player.bob) * player.animal.bobStrength - player.pos.z - player.animal.height + 0.5);
    let world = Game.world;


    for (let i = 0; i < world.walls.length; i++) {
      let wall = world.walls[i];
      let tex = textures[world.textures[wall.texture]];
      let segment = world.segments[world.getWallSegment(wall, player.pos)];
      if (!segment) continue;

      let top = segment.top;
      let bottom = segment.bottom;

      let l = {};
      let r = {};

      for (let j = 0; j < 2; j++) {
        let pos = world.vertices[j == 0 ? wall.a : wall.b];
        let u = j;

        let diff = {x: pos.x - player.pos.x, y: pos.y - player.pos.y};
        let relativeAngle = Math.atan2(diff.y, diff.x) - player.dir.x;
        if (relativeAngle < -fov / 2 || relativeAngle > fov / 2) {
          relativeAngle = fov / 2 * (j == 0 ? -1 : 1);
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


      for (let x = 0; x < screenw; x++) {
        if (x < l.x || x > r.x) continue;

        let done = (x - l.x) / (r.x - l.x);
        let d = l.d + (r.d - l.d) * done;
        let yShearReal = l.yShearReal + (r.yShearReal - l.yShearReal) * done;
        let size = l.size + (r.size - l.size) * done;
        let fog = l.fog + (r.fog - l.fog) * done;
        let uv = {u: l.u + (r.u - l.u) * done, v: 0};

        /*let diff = {
          x: l.diff.x + (r.diff.x - l.diff.x) * done,
          y: l.diff.y + (r.diff.y - l.diff.y) * done,
        };

        let relativeAngle = Math.atan((x - screenw / 2) / focusPlane);
        d = Math.sqrt(diff.x ** 2 + diff.y ** 2) * Math.cos(relativeAngle);
        size = focusPlane / d * 0.01;
        fog = Math.max(Math.pow(d, fogA), fogB);
        yShearReal = yShear + dFactor * focusPlane / d;*/

        let col = [];
        for (let Y = 0; Y < screenh; Y++) {
          let y = Y + Math.floor(yShearReal);
          let deltaCenter = y / screenh - 0.5;
          uv.v = (deltaCenter / size + 0.5 + top - 1) / (top - bottom);
          let c = [0, 0, 0, 0];
          
          if (deltaCenter < (0.5 - bottom) * size && deltaCenter > (0.5 - top) * size && d > 0 && !isNaN(uv.u)) {
            let index = (Math.floor(uv.u * tex.width) + Math.floor(uv.v * tex.height) * tex.width) * 4;
            c[0] = tex.pixels[index  ] / fog;
            c[1] = tex.pixels[index+1] / fog;
            c[2] = tex.pixels[index+2] / fog;
            c[3] = tex.pixels[index+3];

            //c = [uv.u * 255, uv.v * 255, 0, 255];
            //c[0] = 255 - d * 255
          }
          //c = [255, 0, 0, 255];

          col.push([c[0], c[1], c[2], c[3]]);
        }

        Renderer.buffer.push({x: x, d: d, col: col});
      }
    }


   
    for (let segmentIndex in world.segments) {
      let segment = world.segments[segmentIndex];
      for (let y = 0; y < screenh; y++) {
        let row = [];
  
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
        //inside = true;

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
          
          if (!inside || isNaN(uv.u) || isNaN(uv.v) || d < 0) {
            row.push([0, 0, 0, 0]);
            continue;
          }
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
        Renderer.buffer.push({y: y, d: d, col: row});
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
      if (entity.owner) continue;
      let tex = textures[world.textures[entity.animal.texture]];
      let relativePos = rotateVector({x: entity.pos.x - player.pos.x, y: entity.pos.y - player.pos.y}, -player.dir.x + Math.PI / 2);
      
      let d = relativePos.y;
      let yShearReal = yShear + dFactor * focusPlane / d;
      
      let size = focusPlane / d * 0.01 * entity.animal.height;
      if (size < 0) continue;
      let wallSize = focusPlane / d * 0.01;
      
      let X = Math.floor(-relativePos.x * focusPlane / d + screenw / 2 + tex.width * size / 2);
      let Y = Math.floor((-yShearReal - (entity.pos.z + Math.sin(entity.bob) * entity.animal.bobStrength) * focusPlane / d + (wallSize / 2) * screenh) + screenh / 2 - tex.height * size);
      let w = Math.floor(tex.width * size);
      let h = Math.floor(tex.height * size);
      
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
          col.push([0, 0, 0, 0]);
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
      Renderer.buffer.push({x: x, d: d, col: col});
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
      Renderer.buffer.push({x: x, d: ld + (rd - ld) * xU, col: col});
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
        else col.push([0, 0, 0, 0]);
      }
      Renderer.buffer.push({x: x, d: d, col: col});
    }
  },

  renderPoint(x, y, d = 0, c = [255, 255, 255, 255]) {
    let col = [];
    for (let Y = 0; Y < screenh; Y++) col.push(Y == y ? c : [0, 0, 0, 0]);
    Renderer.buffer.push({x: x, d: d, col: col});
  },

  renderCross(X, Y, d = 0, c = [255, 255, 255, 255]) {
    for (let x = X - 1; x <= X + 1; x++) {
      let col = [];
      for (let y = 0; y < screenh; y++) {
        if (y >= Y - 1 && y <= Y + 1 && Math.abs(x - X) == Math.abs(y - Y)) col.push(c);
        else col.push([0, 0, 0, 0]);
      }
      Renderer.buffer.push({x: x, d: d, col: col});
    }
  },

  displayRender() {
    for (let i = 0; i < Renderer.img.pixels.length; i++) {
      Renderer.img.pixels[i] = ((i + 1) % 4 == 0) ? 255 : 0;
    }

    Renderer.buffer.sort((a, b) => {
      return b.d - a.d;
    });
    
    for (let item of Renderer.buffer) {
      for (let y in item.col) {
        let opacity = item.col[y][3] / 255;

        if (opacity == 0 || item.x < 0 || item.x >= screenw || item.y < 0 || item.y >= screenh) continue;
        
        let k = (item.x != undefined?(item.x + y * screenw):(y * 1 + item.y * screenw)) * 4;
        Renderer.img.pixels[k] = item.col[y][0] * opacity + Renderer.img.pixels[k++] * (1 - opacity);
        Renderer.img.pixels[k] = item.col[y][1] * opacity + Renderer.img.pixels[k++] * (1 - opacity);
        Renderer.img.pixels[k] = item.col[y][2] * opacity + Renderer.img.pixels[k++] * (1 - opacity);
        Renderer.img.pixels[k++] = 255;
      }
    }
    Renderer.img.updatePixels();
    noSmooth();
    image(Renderer.img, 0, 0, width, height);
  }
};