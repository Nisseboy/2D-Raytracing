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
      let saveChapter = save.chapters[chapter.name];

      buttons.push({text: chapter.name, x: 1, y: y, callback: e => {LevelPicker.openChapter = i}});
      y += 10;
      if (i == LevelPicker.openChapter) {
        for (let j in chapter.levels) {
          let level = chapter.levels[j];
          let saveLevel;
          if (saveChapter) saveLevel = saveChapter.levels[j];
          let saveLevelPrev;
          if (saveChapter) saveLevelPrev = saveChapter.levels[j - 1];

          if (LevelPicker.forEditor) {
            buttons.push({text: level.name, x: 5, y: y, callback: e => {
              LevelPicker.callback(level, chapter);
            }});

            if (editorChapters.includes(chapter))
              buttons.push({text: "x", x: 12 + level.name.length * 4, y: y, callback: e => {
                confirmPopup = {
                  text: "delete level?",
                  callback: () => {deleteLevel(chapter, level)}
                };
              }});
          } else {

            let hasUnlocked = j == 0 || saveLevelPrev;

            buttons.push({text: level.name, x: 5, y: y, color: hasUnlocked ? [255, 255, 255, 255] : [120, 120, 120, 255], callback: e => {
              if (hasUnlocked) LevelPicker.callback(level, chapter);
            }});

            if (saveLevel) {
              let bounds = {x: 8 + level.name.length * 4, y: y - 1, w: 9, h: 9};
              Renderer.renderTexture("ui/medal1", bounds.x, bounds.y, "tl", bounds.w, bounds.h, 0);
            }
          }
            

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