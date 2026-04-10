
# The GRID
Implement a class for individual GRID instances. Use this mockup for reference.
```js
//This class is used for creating individual grid instances (the space where windows are displayed)
class GRID_instance {
  constructor(ID, title, viewPortWidth, viewPortHeight, dom) {
    this.ID = ID;
    this.title = title;
    this.viewPortWidth = viewPortWidth; //The width of the viewport (visible area)
    this.viewPortHeight = viewPortHeight; //The height of the viewport (visible area)
    this.X = 0; //The scroll X
    this.Y = 0; //The scroll Y
    this.Windows = {}; //Object of window instances in the grid
    this.dom = {
      container: dom.container,
      gridWorld: dom.gridWorld,
    };
  }
}
```
The grid should be a gray color scheme with light grey/white dots in a grid shaped pattern. The grid should be able to be moved around in by middle clicking and dragging. 
### Tab system
In the future, there will be multiple grid instances, so, it should be easy to switch between them using a tab system. Keep that in mind.
# Windows
Create a basic window system that is aligned with the GRID. Windows should be rectangular, with minimal styling along the borders. Windows should also feature a title and an "x" button. 