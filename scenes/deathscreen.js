let DeathScreen = {
  start() {
    lastGameFrame = Renderer.buffer;
    for (let i = 0; i < lastGameFrame.length; i+=4) {
      lastGameFrame[i] *= 0.4;
      lastGameFrame[i+1] *= 0.4;
      lastGameFrame[i+2] *= 0.4;
    }
  },

  keyPressed() {
    if (keyCode == getKey("Pause")) DeathScreen.exitButton();
  },
  
  update() {
    Renderer.buffer = lastGameFrame.map(e=>e);

    Renderer.renderText("you suck at this", screenw / 2, screenh * 0.2, "cc", 0, [200, 50, 50, 255]);

    buttons = [
      {
        text: "main menu", 
        x: screenw / 2,
        y: screenh * 0.8,
        align: "tr",
        callback: DeathScreen.exitButton
      },
      {
        text: "restart", 
        x: screenw / 2 + 1,
        y: screenh * 0.8,
        callback: DeathScreen.restartButton
      },
    ];
  },
  restartButton(e) {
    Game.world = new World(Game.level.data);
    setScene(Game);
  },
  exitButton(e) {
    Game.world = undefined;
    setScene(MainMenu);
  },
};