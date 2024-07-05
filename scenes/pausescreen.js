let lastGameFrame = [];

let PauseScreen = {
  init() {
    
  },

  start() {
    lastGameFrame = Renderer.buffer;
    lastGameFrame.forEach(e => {
      e.col = e.col.map(ee => [ee[0] * 0.4, ee[1] * 0.4, ee[2] * 0.4, ee[3]]);
    });
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

