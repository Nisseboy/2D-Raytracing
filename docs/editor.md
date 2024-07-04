# Level Editor

Each level is composed of a list of objects:
* Vertices: These are the corners of walls and segments, create them by shift clicking, all vertices moved on top of other vertices will be merged
* Walls: Walls need two vertices, create a wall by shift dragging from a vertex
* Segments: These determine how a "room" looks, the height, lighting, floor, ceiling etc.
* Entities: These can be anywhere and are things like enemies, items, rats, or barrels


You select objects by clicking on them, you can also ctrl+click to select multiple objects, if you drag a selected object all other selected objects will move. Once you have selected at least one object a properties window will appear. Here you can edit them:
* Walls:
  * Divider: if this is checked the wall doesn't exist in the world, but is instead used to separate segments
  * 


There are a few buttons on the left side:
* Help brings this page up
* 3D Enters a 3d view of the map
* Segments opens a panel where you can create new segments and define segments by selecting walls in a clockwise order
* Snapping toggles snapping which means that you can only move vertices to certain places
  

Sometimes problems can arise, a few common ones:
* Walls are not visible in the 3d view, this is either because the walls are simply dividers for segments or the segment for the room is defined counter clockwise instead of clockwise
* I made a mistake and want to undo it, you can't, get better
