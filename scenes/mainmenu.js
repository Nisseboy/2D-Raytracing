let MainMenu = {
  init() {
    
  },

  start() {
    
  },
  
  update() {    
    if (Game.world) menuButtons.push({text: "continue", callback: MainMenu.continueButton});
    menuButtons.push(
      {text: "play", callback: MainMenu.newGameButton},
    );
    if (editorEnabled) menuButtons.push({text: "editor", callback: MainMenu.editorButton});

    
    
  },
  continueButton(e) {
    setScene(Game);
  },
  newGameButton(e) {
    LevelPicker.callback = (level) => {
      let callback = e => {Game.level = level; Game.world = new World(level.data); setScene(Game)};

      if (Game.world) {
        confirmPopup = {
          text: "current level progress will be lost",
          callback: callback,
        }
      }
      else callback();
    }
    LevelPicker.scene = MainMenu;
    LevelPicker.forEditor = false;
    setScene(LevelPicker);
  },
  editorButton() {
    setScene(Editor);
  },
  stop() {

  }
};

