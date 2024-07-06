let EditorLevelCreator = {
  scene: undefined,

  start() {
    
  },

  update() {
    Renderer.renderText("choose starting template", 1, 1);

    menuButtons.push({
      text: "empty level",

      callback: () => {
        EditorLevelCreator.done({name: prompt("Level Name"), data: ""})
      },
    });

    menuButtons.push({
      text: "from clipboard",

      callback: () => {
        navigator.clipboard.readText().then(e => {
          EditorLevelCreator.done(JSON.parse(e))
        });
      },
    });

    menuButtons.push({
      text: "from chapter",

      callback: () => {
        LevelPicker.callback = (level) => {
          EditorLevelCreator.done(level);
        }
  
        LevelPicker.scene = EditorLevelCreator;
        LevelPicker.forEditor = true;
        setScene(LevelPicker);
      },
    });

    buttons.push({
      text: "back",
      x: screenw - 1,
      y: 1,
      align: "tr",
      d: 0,

      callback: () => {setScene(EditorLevelCreator.scene)},
    });
  },

  keyReleased() {
    if (keyCode == getKey("Pause")) setScene(EditorLevelCreator.scene);
  },

  done(level) {
    Editor.loadLevel(level);
    setScene(Editor);
  },
};