function preload() {

}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let input = createFileInput(file => {
    renderModel(file);
  }, true);
  input.position(0, 0);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function renderModel(file) {
  print(file);
}

function draw() {
  background(255);
}