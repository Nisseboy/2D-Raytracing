let Renderer = {
  textures: {
    empty: {pixels: [0, 0, 0, 0], width: 1, height: 1},
    brick_wall1: "assets/images/brick_wall/1.png",
    brick_wall2: "assets/images/brick_wall/2.png",
    brick_wall3: "assets/images/brick_wall/3.png",
    brick_wall4: "assets/images/brick_wall/4.png",
    brick_wall5: "assets/images/brick_wall/5.png",
    brick_wall6: "assets/images/brick_wall/6.png",
    brick_wall_window: "assets/images/brick_wall/window.png",
    rat: "assets/images/entities/rat/rat.png",
    crosshair: "assets/images/crosshair.png",
  },

  font: {
    "a": "010101111101101",
    "b": "110101110101110",
    "c": "011100100100011",
    "d": "110101101101110",
    "e": "111100110100111",
    "f": "111100110100100",
    "g": "011100101101011",
    "h": "101101111101101",
    "i": "010010010010010",
    "j": "001001001101010",
    "k": "101101110101101",
    "l": "100100100100111",
    "m": "101111101101101",
    "n": "110101101101101",
    "o": "010101101101010",
    "p": "110101101110100",
    "q": "010101101101011",
    "r": "110101110101101",
    "s": "011100010001110",
    "t": "111010010010010",
    "u": "101101101101111",
    "v": "101101101010010",
    "w": "101101101111101",
    "x": "101101010101101",
    "y": "101101010010010",
    "z": "111001010100111",
    "0": "010101101101010",
    "1": "010110010010111",
    "2": "010101001010111",
    "3": "110001110001110",
    "4": "101101111001001",
    "5": "111100110001110",
    "6": "010100110101010",
    "7": "111001001010010",
    "8": "010101010101010",
    "9": "010101011001010",
    "[": "111100100100111",
    "]": "111001001001111",
    " ": "000000000000000",
    "rect": "111111111111111"
  },

  buffer: [],

  preload() {
    for (let i in Renderer.textures) {
      if (typeof(Renderer.textures[i]) != "string") continue;
      Renderer.textures[i] = loadImage(Renderer.textures[i]);
    }
  },

  init(w, h) {
    Renderer.img = createImage(w, h);
    Renderer.img.loadPixels();
  
    for (let i in Renderer.textures) {
      let tex = Renderer.textures[i];
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
        let char = Renderer.font[string[Math.floor((x - X) / 4)]];
        
        if (char == undefined) char = Renderer.font.rect;

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

    for (let x = 0; x < screenw; x++) {
      let relativeAngle = Math.atan((x - screenw / 2) / focusPlane);
      
      let infos = Game.world.marchRay(player.pos, player.dir.x + relativeAngle);
      for (let i = 0; i < infos.length; i++) {
        let info = infos[i];
        let d = info.d * Math.cos(relativeAngle);
        let oldD = info.oldD * Math.cos(relativeAngle);
        let yShearReal = yShear + (Math.sin(player.bob) * player.animal.bobStrength - player.pos.z - playerHeight + 0.5) * focusPlane / d;
      
        let size = focusPlane / d * 0.01;
        let sizeOld = focusPlane / info.oldD * 0.01;
        let wallFog = Math.max(Math.pow(d, 1), 1) + info.isHorizontal * 0.3;
        
        let segment = Game.world.segments[info.segment];
        let oldSegment = Game.world.segments[info.oldSegment];
        let newSegment = Game.world.segments[info.newSegment];
  
        let tex;
        let top;
        let bottom;
        if (segment) {
          tex = Renderer.textures[info.wall == undefined ? segment.ceilingTexture : Game.world.walls[info.wall].texture];
          top = segment.top;
          bottom = segment.bottom;
        } else {
          tex = Renderer.textures[info.top ? newSegment.topWallTexture : newSegment.bottomWallTexture];
          top = info.top?oldSegment.top:newSegment.bottom;
          bottom = info.top?newSegment.top:oldSegment.bottom;
        }

        let col = [];
        if (info.ceiling) {
          for (let Y = 0; Y < screenh; Y++) {
            let y = Y + Math.floor(yShearReal);
            let c = [0, 0, 0, 0];

            let deltaCenter = y / screenh - 0.5;
            let vTop = (0.5 - top) * sizeOld;
            let vBottom = (0.5 - top) * size;
            let vDist = d + (oldD - d) * (deltaCenter - vBottom) / (vTop - vBottom);
            vDist = Math.sqrt(((Y + Math.floor(yShear)) / screenh - 0.5) * -2);

            let uv = {u: (Math.cos(player.dir.x + relativeAngle) * vDist + 1000) % 1, v: (Math.sin(player.dir.x + relativeAngle) * vDist + 1000) % 1};
            
            if (deltaCenter < vBottom) {
              let index = (Math.floor(uv.u * tex.width) + Math.floor(uv.v * tex.height) * tex.width) * 4;
              c[0] = tex.pixels[index  ];
              c[1] = tex.pixels[index+1];
              c[2] = tex.pixels[index+2];
              c[3] = tex.pixels[index+3];
              c = [uv.u * 255, uv.v * 255, 0, 255]
              //c = [vDist * 255, 0, 0, 255];
            } else {
              c = [255, 0, 0, 0];
            }
            
            col.push([c[0], c[1], c[2], c[3]]);
          }
        } else {
  
          let uv = {u: info.uv, v: 0};
          
          for (let Y = 0; Y < screenh; Y++) {
            let y = Y + Math.floor(yShearReal);
            let deltaCenter = y / screenh - 0.5;
            uv.v = (deltaCenter / size + 0.5 + top - 1) / (top - bottom);
            let c = [];
            
            if (deltaCenter < (0.5 - bottom) * size && deltaCenter > (0.5 - top) * size) {
              let index = (Math.floor(uv.u * tex.width) + Math.floor(uv.v * tex.height) * tex.width) * 4;
              c[0] = tex.pixels[index  ] / wallFog;
              c[1] = tex.pixels[index+1] / wallFog;
              c[2] = tex.pixels[index+2] / wallFog;
              c[3] = tex.pixels[index+3];
            } else {
              let ceilingFog = 1 / Math.abs(deltaCenter);
              c = [51 / ceilingFog, 51 / ceilingFog, 51 / ceilingFog, 255];
              c = [0, 0, 0, 0];
            }
            
            col.push([c[0], c[1], c[2], c[3]]);
          }
        }

        Renderer.buffer.push({x: x, d: d, col: col});
      }
    }

    for (let y = 0; y < screenh; y++) {
      let row = [];

      let langle = Math.atan(-screenw / 2 / focusPlane) + player.dir.x;
      let rangle = Math.atan( screenw / 2 / focusPlane) + player.dir.x;

      let deltaCenter = (y + yShear) / screenh - 0.5;
      if (deltaCenter == 0) deltaCenter = 0.00001;
      let bottom = 0;
      let top = 1;

      let sizet = -(deltaCenter * 2) / (top * 2 - 1);
      let dt = 1 / (sizet / 0.01 / focusPlane);
      let sizeb = -(deltaCenter * 2) / (bottom * 2 - 1);
      let db = 1 / (sizeb / 0.01 / focusPlane);
      
      let d = Math.max(dt, db);
      let fog = Math.max(Math.pow(d, 1), 1);

      let yShearReal = yShear + (Math.sin(player.bob) * player.animal.bobStrength - player.pos.z - playerHeight + 0.5) * focusPlane / d;

      let luv = {u: Math.cos(langle) * d, v: Math.sin(langle) * d};
      let ruv = {u: Math.cos(rangle) * d, v: Math.sin(rangle) * d};

      for (let x = 0; x < screenw; x++) {
        let uv = {
          u: (luv.u + (ruv.u - luv.u) * x / screenw + player.pos.x),
          v: (luv.v + (ruv.v - luv.v) * x / screenw + player.pos.y)
        };
        
        if (uv.u < 0 || uv.u >= Game.world.w || uv.v < 0 || uv.v >= Game.world.h) {
          //debugger;
          row.push([0, 0, 0, 0]);
          continue;
        }
        let segment = Game.world.segments[Game.world.get(Math.floor(uv.u), Math.floor(uv.v))[0]];
        let tex = Renderer.textures[(d == dt) ? segment.ceilingTexture : segment.floorTexture];

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
  },

  renderEntities() {
    let focusPlane = screenw / 2 / Math.tan(fov / 2);
    let yShear = Math.tan(player.dir.y) * focusPlane;

    for (let i = 1; i < Game.world.entities.length; i++) {
      let entity = Game.world.entities[i];
      if (entity.owner) continue;
      let tex = Renderer.textures[entity.animal.texture];
      let relativePos = rotateVector({x: entity.pos.x - player.pos.x, y: entity.pos.y - player.pos.y}, -player.dir.x + Math.PI / 2);
      
      let d = relativePos.y;
      let yShearReal = yShear + (Math.sin(player.bob) * player.animal.bobStrength - player.pos.z - playerHeight + 0.5) * focusPlane / d;
      
      let size = focusPlane / d * 0.01 * entity.animal.scale;
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
    tex = Renderer.textures[tex];

    if (align[0] == "c") Y = Math.floor(Y - h / 2);
    if (align[0] == "b") Y = Math.floor(Y - h);
    if (align[1] == "c") X = Math.floor(X - w / 2);
    if (align[1] == "r") X = Math.floor(X - w);

    let fog = Math.max(Math.pow(d, 1), 1);
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
    tex = Renderer.textures[tex];

    let w = tr.x - tl.x;
    let h = bl.y - tl.y;

    let br = {x: bl.x + w, y: tr.y + h};

    let atl = {x: Math.min(tl.x, bl.x), y: Math.min(tl.y, tr.y)};
    let atr = {x: Math.max(tr.x, bl.x + w), y: Math.max(tl.y, tr.y)};

    let slopeX = (bl.x - tl.x);
    let slopeY = (tr.y - tl.y);

    for (let x = atl.x; x < atr.x; x++) {
      let xU = (x - atl.x) / (atr.x - atl.x);
      let fog = Math.max(Math.pow(ld + (rd - ld) * xU, 1), 1);

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

  renderPoint(x, y, d = 0, c = [255, 255, 255, 255]) {
    let col = [];
    for (let Y = 0; Y < screenh; Y++) col.push(Y == y ? c : [0, 0, 0, 0]);
    Renderer.buffer.push({x: x, d: d, col: col});
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