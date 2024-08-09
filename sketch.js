p5.disableFriendlyErrors = true;

let editorEnabled = true;

let scene;

let pixelSize;

let screenw = 160;//432;
let screenh = screenw / 16 * 9;
let fps = 60;

let pressed = new Array(128).fill(false);

let debug = false;

let pmousePos = {x: 0, y: 0};
let mousePos = {x: 0, y: 0};

let editorChapters = [];

let buttons = [];
let menuButtons = [];
let confirmPopup = undefined;
let hoveredButton;

let buttonRenderers = {
  text: button => {
    let c = hoveredButton == button ? button.hoverColor : button.color;
    return Renderer.renderButton(button.text, button.x, button.y, button.align, button.d, c || [255, 255, 255]);
  },
  texture: button => {
    let c = hoveredButton == button ? button.hoverColor : button.color;
    let bounds = {x: button.x, y: button.y, w: button.w || textures[button.texture].width, h: button.h || 9};

    Renderer.renderTexture(button.texture, bounds.x, bounds.y, button.align, bounds.w, bounds.h, button.d, 1, c || [255, 255, 255]);
    return bounds;
  },
  none: button => {
    return {x: button.x, y: button.y, w: button.w, h: button.h};
  },
};

let controls = {
  "Walk Forward": 87,
  "Walk Back": 83,
  "Walk Left": 65,
  "Walk Right": 68,
  "Jump": 32,
  "Interact": 70,
  "Slot 1": 49,
  "Slot 2": 50,
  "Slot 3": 51,
  "Slot 4": 52,
  "Throw Out": 88,
  "Pause": 27,
  "Debug Mode": 76,
};


let save;


function preload() {
  Renderer.preload();
}

function setup() {
  let m = Math.min(windowWidth, windowHeight / 9 * 16)
  createCanvas(m, m / 16 * 9);
  pixelSize = m / screenw;
  Renderer.init(screenw, screenh);

  
  editorChapters = JSON.parse(localStorage.getItem("editorChapters") || "[]");
  for (let i of editorChapters) {
    chapters.push(i);
  }

  loadGame();

  setScene(MainMenu);

  //Game.chapter = chapters[0];
  //Game.level = Game.chapter.levels[0];
  //Game.world = new World(Game.level.data);
  //setScene(Game);

  //Editor.chapterName = "ass chapter";
  //Editor.loadLevel(chapters[0].levels[0]);
  //setScene(Editor);
  
  frameRate(fps);
}

function loadGame() {
  save = JSON.parse(localStorage.getItem("save")) || {
    chapters: {
      //"chapter 1": {player: [{level1 exit state}, {level2 exit state}]}
    }
  };
}
function saveGame() {
  localStorage.setItem("save", JSON.stringify(save));
}

function setScene(newScene) {
  if (scene?.stop) scene.stop();
  scene = newScene;
  if (!scene.hasStarted && scene.init) scene.init();
  if (scene.start) scene.start();
  scene.hasStarted = true;
}

function windowResized(e) {
  let m = Math.min(windowWidth, windowHeight / 9 * 16)
  resizeCanvas(m, m / 16 * 9);
  pixelSize = m / screenw;
  
  if (scene?.windowResized) scene.windowResized(e);
}

function keyPressed(e) {
  pressed[keyCode] = true;

  if (getKeyPressed("Debug Mode")) debug = !debug;

  if (scene?.keyPressed) scene.keyPressed(e);
  
  if (debug) print(keyCode);
}
function keyReleased(e) {
  pressed[keyCode] = false;

  if (scene?.keyReleased) scene.keyReleased(e);
}
function mousePressed(e) {
  if (!hoveredButton && scene?.mousePressed) scene.mousePressed(e);
}
function mouseReleased(e) {
  if (!hoveredButton && scene?.mouseReleased) scene.mouseReleased(e);

  if (hoveredButton) hoveredButton.callback(e);
}
function mouseWheel(e) {
  if (scene?.mouseWheel) scene.mouseWheel(e);
}
function getKey(controlName) {
  return controls[controlName];
}
function getKeyPressed(controlName) {
  return pressed[getKey(controlName)];
}
function getControlName(controlName) {
  return String.fromCharCode(controls[controlName]);
}
function mouseMoved(e) {
  pmousePos = {x: mousePos.x, y: mousePos.y};
  mousePos = {x: e.clientX / pixelSize, y: e.clientY / pixelSize};

  if (scene?.mouseMoved) scene.mouseMoved(e);
}
function mouseDragged(e) {
  pmousePos = {x: mousePos.x, y: mousePos.y};
  mousePos = {x: e.clientX / pixelSize, y: e.clientY / pixelSize};

  if (scene?.mouseDragged) scene.mouseDragged(e);
}

function draw() {
  Renderer.clearDisplay();

  buttons = [];
  menuButtons = [];
  hoveredButton = undefined;

  for (let i of animations) {
    textures[i.name] = textures[i.paths[Math.floor((frameCount / i.time / fps) % 1 * i.paths.length)]];
  }

  if (scene.update) scene.update();

  if (confirmPopup) {
    let p = confirmPopup;
    let textt = p.text;
    let w = textt.length * 4 - 1;

    Renderer.renderTexture("metal/ceiling1", screenw / 2, screenh / 2, "cc", w + 4, 5 + 13 + 4, -1, 1);
    Renderer.renderText(textt, screenw / 2, screenh / 2 - 1, "bc", -1);
    buttons.push({
      renderer: "text",
      text: "yes",
      x: screenw / 2 - 1,
      y: screenh / 2,
      align: "tr",
      d: -1,

      callback: e => {p.callback(e); confirmPopup = undefined},
    });
    buttons.push({
      renderer: "text",
      text: "no",
      x: screenw / 2 + 1,
      y: screenh / 2,
      align: "tl",
      d: -1,

      callback: e => {confirmPopup = undefined},
    });
  }

  for (let i = 0; i < menuButtons.length; i++) {
    let button = menuButtons[i];

    if (button.x == undefined) button.x = 1 + (button.dpos?.x || 0);
    if (button.y == undefined) button.y = (i + 1) * 10 + (button.dpos?.y || 0);
    buttons.push(button);
  }

  for (let i in buttons) {
    let button = buttons[i];
    if (!button.color) button.color = [255, 255, 255, 255];
    if (!button.hoverColor) button.hoverColor = [255, 0, 0, 255];
    if (button.align == undefined) button.align = "tl";
    if (button.d == undefined) button.d = 0;
    if (button.callback == undefined) button.callback = () => {};

    let renderer = buttonRenderers[button.renderer || "text"];
    let bounds = renderer(button);

    if (inBounds(mousePos, bounds)) {
      hoveredButton = button;
      renderer(button)
    }
  }
  
  if (debug) Renderer.renderText(Math.round(frameRate()), 0, 0);

  Renderer.displayRender();
}

function rotateVector(v, angle) {
  return {
    x: v.x * Math.cos(angle) - v.y * Math.sin(angle), 
    y: v.x * Math.sin(angle) + v.y * Math.cos(angle)
  }
}

function inBounds(p, bounds) {
  return (p.x > bounds.x && p.y > bounds.y && p.x < bounds.x + bounds.w && p.y < bounds.y + bounds.h);
}

function deleteChapter(chapter) {
  let index = chapters.indexOf(chapter);
  let index2 = editorChapters.indexOf(chapter);

  chapters.splice(index, 1);
  editorChapters.splice(index2, 1);

  if (Editor.chapter == chapter) Editor.chapterName = undefined;

  if (save[chapter.name]) { delete save[chapter.name]; saveGame(); }

  localStorage.setItem("editorChapters", JSON.stringify(editorChapters));
}

function deleteLevel(chapter, level) {
  chapter.levels.splice(chapter.levels.indexOf(level), 1);

  localStorage.setItem("editorChapters", JSON.stringify(editorChapters));
}

window.oncontextmenu = (e) => {
  e.preventDefault(); 
  e.stopPropagation(); 
  return false;
};