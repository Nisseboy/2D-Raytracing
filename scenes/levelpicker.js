let LevelPicker = {
  callback: () => {},
  scene: undefined,
  openChapter: undefined,

  start() {
    LevelPicker.openChapter = undefined;
  },

  update() {
    for (let i in levels) {
      let chapter = levels[i];

      menuButtons.push({text: i, callback: e => {LevelPicker.openChapter = i}});
      if (i == LevelPicker.openChapter) {
        for (let j in chapter) {
          let levelString = chapter[j];
          if (typeof(levelString) != "string") levelString = JSON.stringify(levelString);

          menuButtons.push({text: j, dpos: {x: 4, y: 0}, callback: e => {
            LevelPicker.callback({world: levelString, chapter: i, name: j});
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