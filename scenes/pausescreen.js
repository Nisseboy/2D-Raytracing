let PauseScreen = {
  init() {
    
  },

  start() {

  },

  keyPressed() {
    if (keyCode == getKey("Pause")) PauseScreen.continueButton();
  },
  
  update() {
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

