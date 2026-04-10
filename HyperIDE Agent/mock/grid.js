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
