let AnimalPicker = {
  toChange: {},
  scroll: 0,

  update() {
    let w = 16;

    let cats = {
      player: [],
      event: [],
      interactable: [],
      pickup: [],
      item: [],
      critter: [],
      other: [],
    };

    outer: for (let i in animals) {
      for (let j in cats) {
        if (animals[i].type == j) {
          cats[j].push(i);
          continue outer;
        }
      }
      cats.other.push(i);
    }

    let y = AnimalPicker.scroll;
    for (let catIndex in cats) {
      let cat = cats[catIndex];
      let x = 1;

      Renderer.renderText(catIndex, x, y);
      y += 6;

      for (let i = 0; i < cat.length; i++) {
        if (x > screenw - w) { x = 1; y += w + 1; }

        buttons.push({
          renderer: "texture",
          texture: animals[cat[i]].texture,
          x: x,
          y: y,
          w: w,
          h: w,

          callback: () => {
            for (let j of AnimalPicker.toChange.objects) 
              j[AnimalPicker.toChange.property] = cat[i]; 
            setScene(Editor)}
        });
        x += w + 1;
      }
      y += w + 1;
    } 
  },

  mouseWheel(e) {
    AnimalPicker.scroll += -Math.floor(e.delta / pixelSize);
    AnimalPicker.scroll = Math.min(AnimalPicker.scroll, 0);
  },

  keyReleased() {
    if (keyCode == getKey("Pause")) AnimalPicker.backButton();
  },

  backButton() {
    setScene(Editor);
  },
};