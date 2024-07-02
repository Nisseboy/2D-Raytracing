let inEditor = false;

let Editor = {
  tempWorld: undefined,
  world: new World(levels["chapter 1"]["test level 1"]),

  pos: {x: 0, y: 0},
  gridSize: 10,

  init() {
    
  },

  start() {
    if (inEditor) {
      Game.world = Editor.tempWorld;
    }
    inEditor = true;
  },
  
  update() {
    buttons.push({
      text: "back",
      x: screenw - 1,
      y: 1,
      align: "tr",
      d: 0,

      callback: Editor.backButton,
    });
    buttons.push({
      text: "3d",
      x: screenw - 1,
      y: 11,
      align: "tr",
      d: 0,

      callback: e => {Editor.playButton(false)},
    });

    let movement = {y: getKeyPressed("Walk Back") - getKeyPressed("Walk Forward"), x: getKeyPressed("Walk Right") - getKeyPressed("Walk Left")};
    Editor.pos.x += movement.x;
    Editor.pos.y += movement.y;

    let world = Editor.world;
    let gridSize = Editor.gridSize;
    for (let x = 0; x < Editor.world.w; x++) {
      for (let y = 0; y < Editor.world.h; y++) {
        let pt = toScreen(x * gridSize, y * gridSize);

        let square = world.get(x, y);
        if (square[1] != 0) {
          Renderer.renderRectangle(pt.x, pt.y, pt.x + gridSize - 1, pt.y, 1);
        }
        if (square[2] != 0) {
          Renderer.renderRectangle(pt.x, pt.y, pt.x, pt.y + gridSize - 1, 1);
        }
        Renderer.renderRectangle(pt.x, pt.y + gridSize - 1, pt.x + gridSize - 1, pt.y + gridSize - 1, 1, [255, 255, 255, 20]);
        Renderer.renderRectangle(pt.x + gridSize - 1, pt.y, pt.x + gridSize - 1, pt.y + gridSize - 1, 1, [255, 255, 255, 20]);
        
        Renderer.renderTexture(world.segments[square[0]].floorTexture, pt.x, pt.y, "tl", gridSize, gridSize, 2);
      }
    }

    let mouseWorld = toWorld(mousePos);
    let mouseGrid = {x: Math.floor(mouseWorld.x / gridSize), y: Math.floor(mouseWorld.y / gridSize)};
    let mouseSquare;
    if (mouseWorld.x >= 0 && mouseWorld.y >= 0 && mouseWorld.x < world.x && mouseWorld.y < world.y) {
      mouseSquare = world.segments[world.get(mouseGrid.x, mouseGrid.y)];
    }
    
    let pt = toScreen(mouseGrid.x * gridSize, mouseGrid.y * gridSize);
    debugger;
    Renderer.renderTexture("empty", pt.x, pt.y, "tl", gridSize, gridSize, 0.5, 1, [255, 255, 0, 100]);
  },
  backButton() {
    inEditor = false;
    setScene(MainMenu);
  },
  playButton(simulate) {
    Editor.tempWorld = Game.world;
    Game.world = new World(JSON.stringify(Editor.world));
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
  return {x: x - Editor.pos.x + screenw / 2, y: y - Editor.pos.y + screenh / 2};
}
function toWorld(x, y) {
  if (y == undefined) {
    y = x.y;
    x = x.x;
  }
  return {x: x - screenw / 2 + Editor.pos.x , y: y - screenh / 2 + Editor.pos.y};
}
