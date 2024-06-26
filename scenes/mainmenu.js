let MainMenu = {
  init() {
    
  },

  start() {
    
  },
  
  update() {
    let menuButtons = [
      {text: "continue", callback: PauseScreen.continueButton},
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
  stop() {

  }
};

