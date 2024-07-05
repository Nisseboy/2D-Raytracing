let ChapterPicker = {
  start() {
    
  },

  update() {
    Renderer.renderText("choose chapter to save level in", 1, 1);

    let y = 10;
    for (let i in editorChapters) {
      let chapter = editorChapters[i];

      buttons.push({text: chapter.name, x: 1, y: y, callback: e => {
        ChapterPicker.chooseChapter(chapter.name);
      }});
      
      y += 10;
    }
    buttons.push({text: "+", x: 1, y: y, callback: e => {
      let name = prompt("Name of new chapter");
      let chapter = {name: name, levels: []};
      editorChapters.push(chapter);
      chapters.push(chapter);
    }});

    buttons.push({
      text: "back",
      x: screenw - 1,
      y: 1,
      align: "tr",
      d: 0,

      callback: () => {setScene(MainMenu)},
    });
  },

  keyReleased() {
    if (keyCode == getKey("Pause")) setScene(MainMenu);
  },

  chooseChapter(chapterName) {
    Editor.chapterName = chapterName;
    setScene(Editor);
  },
};