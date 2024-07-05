let LevelPicker = {
  callback: () => {},
  scene: undefined,
  openChapter: undefined,

  start() {
    LevelPicker.openChapter = undefined;
  },

  update() {
    for (let i in chapters) {
      let chapter = chapters[i];

      menuButtons.push({text: chapter.name, callback: e => {LevelPicker.openChapter = i}});
      if (i == LevelPicker.openChapter) {
        for (let j in chapter.levels) {
          let level = chapter.levels[j];

          menuButtons.push({text: level.name, dpos: {x: 4, y: 0}, callback: e => {
            LevelPicker.callback(level);
          }});
        }
      }
    }

    buttons.push({
      text: "back",
      x: screenw - 1,
      y: 1,
      align: "tr",
      d: 0,

      callback: () => {setScene(LevelPicker.scene)},
    });
  },

  keyReleased() {
    if (keyCode == getKey("Pause")) setScene(LevelPicker.scene);
  }
};