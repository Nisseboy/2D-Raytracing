let MainMenu = {
  init() {
    
  },

  start() {
    
  },
  
  update() {    
    if (Game.world) menuButtons.push({text: "continue", callback: MainMenu.continueButton});
    menuButtons.push(
      {text: "play", callback: MainMenu.newGameButton},
      {text: "editor", callback: MainMenu.editorButton},
    );

    if (MainMenu.warning) {
      let text = MainMenu.warning.text;
      let w = text.length * 4 - 1;

      Renderer.renderTexture("metal/ceiling1", screenw / 2, screenh / 2, "cc", w + 4, 5 + 13 + 4, -1, 1);
      Renderer.renderText(text, screenw / 2, screenh / 2 - 1, "bc", -1);
      buttons.push({
        renderer: "text",
        text: "yes",
        x: screenw / 2 - 1,
        y: screenh / 2,
        align: "tr",
        d: -1,

        callback: e => {MainMenu.warning.callback(e); MainMenu.warning = undefined},
      });
      buttons.push({
        renderer: "text",
        text: "no",
        x: screenw / 2 + 1,
        y: screenh / 2,
        align: "tl",
        d: -1,

        callback: e => {MainMenu.warning = undefined},
      });
    }
    
  },
  continueButton(e) {
    setScene(Game);
  },
  newGameButton(e) {
    LevelPicker.callback = (level) => {
      let callback = e => {Game.world = new World(level.data); setScene(Game)};

      if (Game.world) {
        MainMenu.warning = {
          text: "current level progress will be lost",
          callback: callback,
        }
        setScene(MainMenu);
      }
      else callback();
    }
    LevelPicker.scene = MainMenu;
    setScene(LevelPicker);
  },
  editorButton() {
    setScene(Editor);
  },
  stop() {

  }
};

