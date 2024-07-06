let LevelPicker = {
  callback: () => {},
  scene: undefined,
  openChapter: undefined,
  forEditor: undefined,

  start() {
    LevelPicker.openChapter = undefined;
  },

  update() {
    let y = 10;
    for (let i in chapters) {
      let chapter = chapters[i];

      buttons.push({text: chapter.name, x: 1, y: y, callback: e => {LevelPicker.openChapter = i}});
      y += 10;
      if (i == LevelPicker.openChapter) {
        for (let j in chapter.levels) {
          let level = chapter.levels[j];

          buttons.push({text: level.name, x: 5, y: y, callback: e => {
            LevelPicker.callback(level);
          }});

          if (LevelPicker.forEditor && editorChapters.includes(chapter))
            buttons.push({text: "x", x: 12 + level.name.length * 4, y: y, callback: e => {
              confirmPopup = {
                text: "delete level?",
                callback: () => {deleteLevel(chapter, level)}
              };
            }});

          y += 10;
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