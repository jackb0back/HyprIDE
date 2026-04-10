import { useState, useCallback, useEffect } from 'react';
import { GridInstance } from './classes/GridInstance';
import Grid from './components/Grid';
import TabSystem from './components/TabSystem';

function App() {
  const [grids, setGrids] = useState({
    'grid-1': new GridInstance('grid-1', 'Project Alpha', window.innerWidth, window.innerHeight),
  });
  const [activeGridId, setActiveGridId] = useState('grid-1');

  useEffect(() => {
    const handleResize = () => {
      setGrids((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          const grid = next[id];
          const newGrid = new GridInstance(grid.id, grid.title, window.innerWidth, window.innerHeight);
          Object.assign(newGrid, grid, {
            viewPortWidth: window.innerWidth,
            viewPortHeight: window.innerHeight,
          });
          next[id] = newGrid;
        });
        return next;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateGrid = useCallback((gridId, updates) => {
    setGrids((prev) => {
      const grid = prev[gridId];
      if (!grid) return prev;
      
      const newGrid = new GridInstance(grid.id, grid.title, grid.viewPortWidth, grid.viewPortHeight);
      Object.assign(newGrid, grid, updates);
      return { ...prev, [gridId]: newGrid };
    });
  }, []);

  const updateWindow = useCallback((gridId, windowId, updates) => {
    setGrids((prev) => {
      const grid = prev[gridId];
      if (!grid) return prev;

      const newGrid = new GridInstance(grid.id, grid.title, grid.viewPortWidth, grid.viewPortHeight);
      Object.assign(newGrid, grid);
      newGrid.windows = { ...grid.windows };
      if (newGrid.windows[windowId]) {
        newGrid.windows[windowId] = { ...newGrid.windows[windowId], ...updates };
      }
      return { ...prev, [gridId]: newGrid };
    });
  }, []);

  const closeWindow = useCallback((gridId, windowId) => {
    setGrids((prev) => {
      const grid = prev[gridId];
      if (!grid) return prev;

      const newGrid = new GridInstance(grid.id, grid.title, grid.viewPortWidth, grid.viewPortHeight);
      Object.assign(newGrid, grid);
      newGrid.windows = { ...grid.windows };
      delete newGrid.windows[windowId];
      return { ...prev, [gridId]: newGrid };
    });
  }, []);

  const handleNewTab = () => {
    const id = `grid-${Object.keys(grids).length + 1}`;
    const newGrid = new GridInstance(id, `Grid ${Object.keys(grids).length + 1}`, window.innerWidth, window.innerHeight);
    setGrids((prev) => ({ ...prev, [id]: newGrid }));
    setActiveGridId(id);
  };

  const handleTabClose = (id) => {
    setGrids((prev) => {
      const newGrids = { ...prev };
      delete newGrids[id];
      if (Object.keys(newGrids).length === 0) {
        const fallbackId = 'grid-1';
        newGrids[fallbackId] = new GridInstance(fallbackId, 'New Grid', window.innerWidth, window.innerHeight);
        setActiveGridId(fallbackId);
      } else if (activeGridId === id) {
        setActiveGridId(Object.keys(newGrids)[0]);
      }
      return newGrids;
    });
  };

  const addTestWindow = () => {
    const winId = `win-${Math.random().toString(36).substr(2, 9)}`;
    const newWindow = {
      id: winId,
      title: `Editor - ${winId}`,
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      content: "Hello HyprIDE! This is a test window on the infinite grid."
    };
    
    setGrids((prev) => {
      const grid = prev[activeGridId];
      const newGrid = new GridInstance(grid.id, grid.title, grid.viewPortWidth, grid.viewPortHeight);
      Object.assign(newGrid, grid);
      newGrid.windows = { ...grid.windows, [winId]: newWindow };
      return { ...prev, [activeGridId]: newGrid };
    });
  };

  const activeGrid = grids[activeGridId];

  return (
    <div className="flex flex-col w-screen h-screen bg-[#1e1e1e] text-white overflow-hidden">
      <TabSystem
        tabs={Object.values(grids).map(g => ({ id: g.id, title: g.title }))}
        activeTabId={activeGridId}
        onTabChange={setActiveGridId}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />
      <div className="flex-1 relative overflow-hidden">
        {activeGrid && (
          <Grid
            key={activeGridId}
            grid={activeGrid}
            onUpdateGrid={(updates) => updateGrid(activeGridId, updates)}
            onUpdateWindow={(winId, updates) => updateWindow(activeGridId, winId, updates)}
            onCloseWindow={(winId) => closeWindow(activeGridId, winId)}
          />
        )}
        
        <button
          onClick={addTestWindow}
          className="absolute bottom-6 right-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
          title="Add Test Window"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default App;
