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
    LevelPicker.callback = (level, chapter) => {
      let callback = e => {
        Game.level = level; 
        Game.chapter = chapter; 
        Game.world = new World(level.data); 
        Game.frame = 0; 
        setScene(Game); 

        let saveChapter = save.chapters[chapter.name];
        if (saveChapter) {
          let levelIndex = chapter.levels.indexOf(level);
          let saveLevel = saveChapter.levels[levelIndex - 1];
          if (saveLevel && levelIndex > 0) {
            parsePlayer(saveLevel.player);
          }
        }

      };

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

