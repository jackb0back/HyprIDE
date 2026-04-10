export class GridInstance {
  constructor(id, title, viewPortWidth, viewPortHeight) {
    this.id = id;
    this.title = title;
    this.viewPortWidth = viewPortWidth;
    this.viewPortHeight = viewPortHeight;
    this.scrollX = 0;
    this.scrollY = 0;
    this.zoom = 1; // 1 = 100%
    this.windows = {};
  }

  addWindow(window) {
    this.windows[window.id] = window;
  }

  removeWindow(id) {
    delete this.windows[id];
  }

  updateWindow(id, updates) {
    if (this.windows[id]) {
      this.windows[id] = { ...this.windows[id], ...updates };
    }
  }

  setScroll(x, y) {
    this.scrollX = x;
    this.scrollY = y;
  }
}
