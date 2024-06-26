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
    let menuButtons = [
      {text: "continue", callback: PauseScreen.continueButton},
      {text: "exit", callback: PauseScreen.exitButton},
    ];
    for (let i in menuButtons) {
      let menuButton = menuButtons[i];

      buttons.push({
        text: menuButton.text,
        x: 0,
        y: 10 + i * 10,
        align: "tl",
        d: 0,
  
        color: [255, 255, 255],
        hoverColor: [255, 0, 0],
  
        callback: menuButton.callback,
      });
    }
    
  },
  continueButton(e) {
    setScene(Game);
  },
  exitButton(e) {
    setScene(MainMenu);
  },
  stop() {

  }
};

