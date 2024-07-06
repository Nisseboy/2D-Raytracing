let lastGameFrame = [];

let PauseScreen = {
  init() {
    
  },

  start() {
    lastGameFrame = Renderer.buffer;
    for (let i = 0; i < lastGameFrame.length; i+=4) {
      lastGameFrame[i] *= 0.4;
      lastGameFrame[i+1] *= 0.4;
      lastGameFrame[i+2] *= 0.4;
    }
  },

  keyPressed() {
    if (keyCode == getKey("Pause")) PauseScreen.continueButton();
  },
  
  update() {
    Renderer.buffer = lastGameFrame.map(e=>e);
    menuButtons = [
      {text: "continue", callback: PauseScreen.continueButton},
      {text: "exit", callback: PauseScreen.exitButton},
    ];
  },
  continueButton(e) {
    setScene(Game);
  },
  exitButton(e) {
    if (Editor.inEditor) {
      setScene(Editor);
    } else {
      setScene(MainMenu);
    }
  },
  stop() {

  }
};

