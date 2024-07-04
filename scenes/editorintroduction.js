let EditorIntroduction = {
  update() {
    Renderer.renderText("you should read the help text before", 2, 2);
    Renderer.renderText("making a level, press help in the top", 2, 8);
    Renderer.renderText("left corner of the editor", 2, 14);

    menuButtons.push({
      text: "back",
      x: screenw / 2 - 1,
      y: screenh / 2,
      align: "cr",
      callback: EditorIntroduction.backButton,
    });
    menuButtons.push({
      text: "continue",
      x: screenw / 2,
      y: screenh / 2,
      align: "cl",
      callback: () => {localStorage.setItem("hasEnteredEditor", true); setScene(Editor)},
    });
  },

  keyReleased() {
    if (keyCode == getKey("Pause")) EditorIntroduction.backButton();
  },

  backButton() {
    setScene(MainMenu);
  },
};