# Level Editor

Each level is composed of a list of objects:
* Vertices: These are the corners of walls and segments, create them by shift clicking, all vertices moved on top of other vertices will be merged
* Walls: Walls need two vertices, create a wall by shift dragging from a vertex
* Segments: These determine how a "room" looks, the height, lighting, floor, ceiling etc.
* Entities: These can be anywhere and are things like enemies, items, rats, or barrels, create them by shift clicking on a segment, blue is the player, green is an item or pickup, yellow is an event, like level finish or sound trigger, red is everything else

Entity type "types", all entities has a type like rat or player or medkit but every entity type also has a type which determines behaviour:
* Player: Every level need exactly one player or it will not work
* Item: An item on the floor which can be picked up by pressing F or something, you can also pick up most critters
* Critter: Critters can be picked up and thrown and will run around erratically when on the ground
* Pickup: Like an item but it's automatically picked upa nd used, if you walk over a medkit you will heal automatically
* Event: These trigger something when stepped on, like a sound or completing the level
* Interactable: They trigger something when pressed, like a door opening


You select objects by clicking on them, you can also ctrl+click to select multiple objects, if you drag a selected object all other selected objects will move. Once you have selected at least one object a properties window will appear, A star on any value means that the objects you have selected have different values but they will become the same once you change it:
* Walls:
  * Divider: If this is checked the wall doesn't exist in the world, but is instead used to separate segments
  * Tex: The wall texture
  * TileH: Whether or not to tile the texture horizontally so it doesn't stretch
  * TileV: The same but vertically
* Segments:
  * Flor: Z position of floor
  * Ceil: Z position of ceiling
  * FlorTex: Texture of the floor
  * CeilTex: Texture of the floor
  * TopTex: Texture above the ceiling when there's a height difference between segments
  * TopTexTileH: Same as with the walls
  * TopTexTileV: Same as with the walls
  * BotTex: Same as TopTex but below the floor instead
  * BotTexTileH: Same as with the walls
  * BotTexTileV: Same as with the walls
* Entities:
  * Type: Determines which "animal" it is, for example player, rat, medkit, etc.
  * Door: If it's an interactable for a door you need to select a wall to open or close when you interact with it

If you want a door with a button you need to create an entity and set the type to a door interactable, then you select a wall for it to open and close in the properties, then put the button somewhere it's clear that the button exists, for example a wall with a button texture

There are a few buttons on the left side:
* Help brings this page up
* File opens the saving and loading menu
* 3D Enters a 3d view of the map
* Segments opens a panel where you can create new segments and define segments by selecting walls in a clockwise order
* Snapping toggles snapping which means that you can only move vertices to certain places
  

Sometimes problems can arise, a few common ones:
* Walls are not visible in the 3d view, this is either because the walls are simply dividers for segments or the segment for the room is defined counter clockwise instead of clockwise
* I made a mistake and want to undo it, you can't, get better


## Advanced
If you want to make a more advanced level pack or even an entire game, you need to fork the github repository of this engine, then you can edit the source code and all the assets. To hard code levels or add textures you would do that in the assets folder, it's pretty self explanatory
