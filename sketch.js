let scene;

let pixelSize;

let screenw = 160;//432;
let screenh = screenw / 16 * 9;
let fps = 60;

let pressed = new Array(128).fill(false);

let debug = true;

let mousePos = {x: 0, y: 0};

let buttons = []
let hoveredButton;

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




function preload() {
  Renderer.preload();
}

function setup() {
  let m = Math.min(windowWidth, windowHeight / 9 * 16)
  createCanvas(m, m / 16 * 9);
  pixelSize = m / screenw;
  Renderer.init(screenw, screenh);

  setScene(MainMenu);
  
  frameRate(fps);
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
  if (hoveredButton) hoveredButton.callback(e);

  if (scene?.mousePressed) scene.mousePressed(e);
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
  mousePos = {x: e.clientX / pixelSize, y: e.clientY / pixelSize};

  if (scene?.mouseMoved) scene.mouseMoved(e);
}

function draw() {
  Renderer.buffer = [];
  buttons = [];
  hoveredButton = undefined;

  if (scene.update) scene.update();

  for (let i in buttons) {
    let button = buttons[i];
    let bounds = Renderer.renderButton(button.text, button.x, button.y, button.align, button.d, button.color);

    if (mousePos.x > bounds.x && mousePos.y > bounds.y && mousePos.x < bounds.x + bounds.w && mousePos.y < bounds.y + bounds.h) {
      Renderer.renderButton(button.text, button.x, button.y, button.align, button.d, button.hoverColor);
      hoveredButton = button;
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