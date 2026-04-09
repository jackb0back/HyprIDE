import * as monaco from 'monaco-editor';

// ---------------------------
// GRID_instance Class
// ---------------------------
class GRID_instance {
  constructor(ID, title, viewPortWidth, viewPortHeight, dom) {
    this.ID = ID;
    this.title = title;
    this.viewPortWidth = viewPortWidth; // The width of the viewport (visible area)
    this.viewPortHeight = viewPortHeight; // The height of the viewport (visible area)
    this.X = 0; // The scroll X (panX)
    this.Y = 0; // The scroll Y (panY)
    this.Windows = {}; // Object of window instances in the grid
    this.dom = {
      container: dom.container,
      gridWorld: dom.gridWorld,
    };
    
    // Create a dedicated element for this grid's windows
    this.gridElement = document.createElement('div');
    this.gridElement.className = 'grid-instance-content';
    this.gridElement.id = `grid-${ID}`;
    this.dom.gridWorld.appendChild(this.gridElement);
    
    this.active = false;
  }

  activate() {
    this.active = true;
    this.gridElement.style.display = 'block';
    this.updateTransform();
  }

  deactivate() {
    this.active = false;
    this.gridElement.style.display = 'none';
  }

  updateTransform() {
    if (!this.active) return;
    this.gridElement.style.transform = `translate(${this.X}px, ${this.Y}px)`;
    // Update background pattern position to create infinite illusion
    this.dom.container.style.backgroundPosition = `${this.X}px ${this.Y}px`;
  }

  pan(dx, dy) {
    this.X += dx;
    this.Y += dy;
    this.updateTransform();
  }

  setPan(x, y) {
    this.X = x;
    this.Y = y;
    this.updateTransform();
  }

  addWindow(win) {
    const winID = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    win.id = winID;
    this.Windows[winID] = win;
    this.gridElement.appendChild(win.el);
  }

  removeWindow(win) {
    if (this.Windows[win.id]) {
      delete this.Windows[win.id];
      win.el.remove();
    }
  }
}

// ---------------------------
// Window Manager System
// ---------------------------
class EditorWindow {
  constructor(x, y, width, height, title) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.title = title;
    
    this.el = document.createElement('div');
    this.el.className = 'editor-window';
    this.el.style.left = `${this.x}px`;
    this.el.style.top = `${this.y}px`;
    this.el.style.width = `${this.width}px`;
    this.el.style.height = `${this.height}px`;

    // Header
    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = `
      <div class="window-title">${title}</div>
      <div class="window-controls">
        <div class="window-btn minimize"></div>
        <div class="window-btn maximize"></div>
        <div class="window-btn close"></div>
      </div>
    `;

    // Body container for Monaco
    const body = document.createElement('div');
    body.className = 'window-body';
    
    this.el.appendChild(header);
    this.el.appendChild(body);

    this.setupWindowDragging(header);

    // Set up Monaco Editor
    setTimeout(() => {
      this.editor = monaco.editor.create(body, {
        value: `// Window: ${title}\nfunction helloWorld() {\n\tconsole.log('Hello from HyprIDE!');\n}`,
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: true }
      });
    }, 0);

    const resizeObserver = new ResizeObserver(() => {
      if (this.editor) {
        this.editor.layout();
      }
    });
    resizeObserver.observe(this.el);

    // Make window active on click
    this.el.addEventListener('mousedown', () => {
      document.querySelectorAll('.editor-window').forEach(w => w.classList.remove('active'));
      this.el.classList.add('active');
    });

    // Close button
    header.querySelector('.window-btn.close').addEventListener('click', (e) => {
      e.stopPropagation();
      tabManager.getActiveGrid()?.removeWindow(this);
    });
  }

  setupWindowDragging(header) {
    let isDraggingWindow = false;
    let initialMouseX, initialMouseY;
    let initialWinX, initialWinY;

    header.addEventListener('mousedown', (e) => {
      isDraggingWindow = true;
      initialMouseX = e.clientX;
      initialMouseY = e.clientY;
      initialWinX = this.x;
      initialWinY = this.y;
      e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingWindow) {
        const deltaX = e.clientX - initialMouseX;
        const deltaY = e.clientY - initialMouseY;
        // Snap to 40px grid
        this.x = Math.round((initialWinX + deltaX) / 40) * 40;
        this.y = Math.round((initialWinY + deltaY) / 40) * 40;
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingWindow = false;
    });
  }
}

// ---------------------------
// Tab Manager System
// ---------------------------
class TabManager {
  constructor(dom) {
    this.dom = dom;
    this.grids = [];
    this.activeGridIndex = -1;
    this.tabsContainer = document.getElementById('tabs-container');
    this.addTabBtn = document.getElementById('add-tab');
    
    this.addTabBtn.addEventListener('click', () => {
      this.createNewGrid();
    });
  }

  createNewGrid(title = 'New Grid') {
    const id = Date.now().toString();
    const width = this.dom.container.clientWidth;
    const height = this.dom.container.clientHeight;
    const grid = new GRID_instance(id, title, width, height, this.dom);
    this.grids.push(grid);
    
    const tabEl = document.createElement('div');
    tabEl.className = 'grid-tab';
    tabEl.id = `tab-${id}`;
    tabEl.innerHTML = `
      <div class="tab-title">${title}</div>
      <div class="tab-close">×</div>
    `;
    
    tabEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-close')) {
        this.closeGrid(grid);
      } else {
        this.setActiveGrid(grid);
      }
    });
    
    this.tabsContainer.insertBefore(tabEl, this.addTabBtn);
    this.setActiveGrid(grid);

    // Add a demo window to new grid
    const win = new EditorWindow(100, 100, 600, 400, `Editor in ${title}`);
    grid.addWindow(win);

    return grid;
  }

  setActiveGrid(grid) {
    const index = this.grids.indexOf(grid);
    if (index === -1) return;

    if (this.activeGridIndex !== -1) {
      this.grids[this.activeGridIndex].deactivate();
      document.querySelector('.grid-tab.active')?.classList.remove('active');
    }

    this.activeGridIndex = index;
    grid.activate();
    document.getElementById(`tab-${grid.ID}`).classList.add('active');
  }

  getActiveGrid() {
    return this.grids[this.activeGridIndex];
  }

  closeGrid(grid) {
    const index = this.grids.indexOf(grid);
    if (index === -1) return;

    this.grids.splice(index, 1);
    const tabEl = document.getElementById(`tab-${grid.ID}`);
    if (tabEl) tabEl.remove();
    grid.gridElement.remove();

    if (this.activeGridIndex === index) {
      this.activeGridIndex = -1;
      if (this.grids.length > 0) {
        this.setActiveGrid(this.grids[Math.max(0, index - 1)]);
      }
    } else if (this.activeGridIndex > index) {
      this.activeGridIndex--;
    }
  }
}

const dom = {
  container: document.getElementById('canvas-container'),
  gridWorld: document.getElementById('grid-world')
};

const tabManager = new TabManager(dom);

// ---------------------------
// Global Panning Logic
// ---------------------------
const state = {
  isDragging: false,
  startX: 0,
  startY: 0
};

dom.container.addEventListener('mousedown', (e) => {
  const activeGrid = tabManager.getActiveGrid();
  if (!activeGrid) return;

  // Only pan if clicking directly on the canvas (not on a window)
  if (e.target === dom.container || e.target === dom.gridWorld || e.target.classList.contains('grid-instance-content')) {
    state.isDragging = true;
    state.startX = e.clientX - activeGrid.X;
    state.startY = e.clientY - activeGrid.Y;
  }
});

window.addEventListener('mousemove', (e) => {
  const activeGrid = tabManager.getActiveGrid();
  if (state.isDragging && activeGrid) {
    const newX = e.clientX - state.startX;
    const newY = e.clientY - state.startY;
    activeGrid.setPan(newX, newY);
  }
});

window.addEventListener('mouseup', () => {
  state.isDragging = false;
});

dom.container.addEventListener('wheel', (e) => {
  const activeGrid = tabManager.getActiveGrid();
  if (!e.ctrlKey && activeGrid) {
    activeGrid.pan(-e.deltaX, -e.deltaY);
  }
});

// ---------------------------
// Search Overlay Logic
// ---------------------------
const searchOverlay = document.getElementById('overlay-search');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let matchedWindows = [];
let selectedSearchIndex = 0;

function jumpToWindow(win, grid) {
  // Switch to the correct grid if necessary
  tabManager.setActiveGrid(grid);

  // Hide overlay
  searchOverlay.classList.add('hidden');
  searchInput.value = '';
  
  // Calculate center pan
  const containerRect = dom.container.getBoundingClientRect();
  const targetX = win.x + win.width / 2;
  const targetY = win.y + win.height / 2;
  
  grid.setPan((containerRect.width / 2) - targetX, (containerRect.height / 2) - targetY);
  
  // Make active and focus
  document.querySelectorAll('.editor-window').forEach(w => w.classList.remove('active'));
  win.el.classList.add('active');
  if (win.editor) {
    win.editor.focus();
  }
}

function renderSearchResults() {
  searchResults.innerHTML = '';
  matchedWindows.forEach((match, index) => {
    const item = document.createElement('div');
    item.className = 'search-item' + (index === selectedSearchIndex ? ' selected' : '');
    item.textContent = `${match.win.title} (${match.grid.title})`;
    item.addEventListener('click', () => jumpToWindow(match.win, match.grid));
    item.addEventListener('mouseover', () => {
      selectedSearchIndex = index;
      renderSearchResults();
    });
    searchResults.appendChild(item);
  });
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  matchedWindows = [];
  tabManager.grids.forEach(grid => {
    Object.values(grid.Windows).forEach(win => {
      if (win.title.toLowerCase().includes(query)) {
        matchedWindows.push({ win, grid });
      }
    });
  });
  selectedSearchIndex = 0;
  renderSearchResults();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    selectedSearchIndex = Math.min(selectedSearchIndex + 1, matchedWindows.length - 1);
    renderSearchResults();
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0);
    renderSearchResults();
    e.preventDefault();
  } else if (e.key === 'Enter') {
    if (matchedWindows[selectedSearchIndex]) {
      const match = matchedWindows[selectedSearchIndex];
      jumpToWindow(match.win, match.grid);
    }
  }
});

// Map Ctrl+P to show search overlay
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    searchOverlay.classList.toggle('hidden');
    if (!searchOverlay.classList.contains('hidden')) {
      searchInput.value = '';
      matchedWindows = [];
      tabManager.grids.forEach(grid => {
        Object.values(grid.Windows).forEach(win => {
          matchedWindows.push({ win, grid });
        });
      });
      selectedSearchIndex = 0;
      renderSearchResults();
      searchInput.focus();
    }
  }
  // Escape to close
  if (e.key === 'Escape') {
    searchOverlay.classList.add('hidden');
  }
});

// Initialize with a default grid
tabManager.createNewGrid('Main Workspace');
tabManager.createNewGrid('Secondary Workspace');
