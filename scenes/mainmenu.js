let MainMenu = {
  selectedLevelIndex: -1,
  openedLevelChapterIndex: 0,

  init() {
    
  },

  start() {
    MainMenu.selectedLevelIndex = -1;
  },
  
  update() {    
    if (MainMenu.selectedLevelIndex != -1) {
      for (let i in levels) {
        let chapter = levels[i];

        menuButtons.push({text: i, callback: e => {MainMenu.openedLevelChapterIndex = i}});
        if (i == MainMenu.openedLevelChapterIndex) {
          for (let j in chapter) {
            menuButtons.push({text: j, dpos: {x: 4, y: 0}, callback: e => {
              let callback = e => {Game.world = new World(chapter[j]); setScene(Game)};

              if (Game.world)
                MainMenu.warning = {
                  text: "current level progress will be lost",
                  callback: callback,
                }
              else callback();
            }});
          }
        }
      }

      buttons.push({
        renderer: "text",
        text: "back",
        x: screenw - 1,
        y: 1,
        align: "tr",
        d: 0,

        callback: MainMenu.newGameButton,
      });
    } else {
      if (Game.world) menuButtons.push({text: "continue", callback: MainMenu.continueButton});
      menuButtons.push(
        {text: "play", callback: MainMenu.newGameButton},
        {text: "editor", callback: MainMenu.editorButton},
      );
    }

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
    if (MainMenu.selectedLevelIndex != -1) MainMenu.selectedLevelIndex = -1;
    else MainMenu.selectedLevelIndex = 0;
  },
  editorButton() {
    setScene(Editor);
  },
  stop() {

  }
};

