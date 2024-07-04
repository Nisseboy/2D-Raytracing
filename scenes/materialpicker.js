let MaterialPicker = {
  toChange: {},
  scroll: 0,

  update() {
    let w = 16;

    let cats = {
      wall: [],
      floor: [],
      ceiling: [],
      entities: [],
      ui: [],
      other: [],
    };
    let catsOrder = ["ui", "wall", "floor", "ceiling", "entities"];

    outer: for (let i in textures) {
      for (let j of catsOrder) {
        if (i.includes(j)) {
          cats[j].push(i);
          continue outer;
        }
      }
      cats.other.push(i);
    }

    let y = MaterialPicker.scroll;
    for (let catIndex in cats) {
      let cat = cats[catIndex];
      let x = 1;

      Renderer.renderText(catIndex, x, y);
      y += 6;

      for (let i = 0; i < cat.length; i++) {
        if (x > screenw - w) { x = 1; y += w + 1; }
        buttons.push({
          renderer: "texture",
          texture: cat[i],
          x: x,
          y: y,
          w: w,
          h: w,

          callback: () => {
            let index = Editor.world.textures.indexOf(cat[i]);
            if (index == -1) {
              Editor.world.textures.push(cat[i]);
              index = Editor.world.textures.length - 1;
            }

            for (let j of MaterialPicker.toChange.objects) 
              j[MaterialPicker.toChange.property] = index; 
            setScene(Editor)}
        });
        x += w + 1;
      }
      y += w + 1;
    } 
  },

  mouseWheel(e) {
    MaterialPicker.scroll += -Math.floor(e.delta / pixelSize);
    MaterialPicker.scroll = Math.min(MaterialPicker.scroll, 0);
  },

  keyReleased() {
    if (keyCode == getKey("Pause")) MaterialPicker.backButton();
  },

  backButton() {
    setScene(Editor);
  },
};