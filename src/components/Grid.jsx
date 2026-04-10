import React, { useRef, useState, useEffect } from "react";
import hotkeys from "hotkeys-js";
import EditorWindow from "./EditorWindow";

const Grid = ({
  grid,
  onUpdateGrid,
  onUpdateWindow,
  onCloseWindow,
  onFocusWindow,
}) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const gridRef = useRef(grid);
  const snapTimeoutRef = useRef(null);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const ensureWindowInView = (windowId) => {
    const currentGrid = gridRef.current;
    const win = currentGrid.windows[windowId];
    if (!win) return;

    const viewportW = currentGrid.viewPortWidth;
    const viewportH = currentGrid.viewPortHeight;
    const zoom = currentGrid.zoom;

    // Window coordinates in "world" space
    const winLeft = win.x;
    const winRight = win.x + win.width;
    const winTop = win.y;
    const winBottom = win.y + win.height;

    // Viewport bounds in "world" space
    const viewLeft = -currentGrid.scrollX / zoom;
    const viewRight = (-currentGrid.scrollX + viewportW) / zoom;
    const viewTop = -currentGrid.scrollY / zoom;
    const viewBottom = (-currentGrid.scrollY + viewportH) / zoom;

    let deltaX = 0;
    let deltaY = 0;

    if (winLeft < viewLeft) deltaX = (viewLeft - winLeft) * zoom;
    else if (winRight > viewRight) deltaX = (viewRight - winRight) * zoom;

    if (winTop < viewTop) deltaY = (viewTop - winTop) * zoom;
    else if (winBottom > viewBottom) deltaY = (viewBottom - winBottom) * zoom;

    if (deltaX !== 0 || deltaY !== 0) {
      onUpdateGrid({
        scrollX: currentGrid.scrollX + deltaX,
        scrollY: currentGrid.scrollY + deltaY,
      });
    }
  };

  const jumpToClosestWindow = (direction) => {
    const currentGrid = gridRef.current;
    const focusedId = currentGrid.focusedWindowId;
    const windows = Object.values(currentGrid.windows);
    if (windows.length === 0) return;

    if (!focusedId) {
      onFocusWindow(windows[0].id);
      ensureWindowInView(windows[0].id);
      return;
    }

    const focusedWin = currentGrid.windows[focusedId];
    if (!focusedWin) return;

    let bestWin = null;
    let minDistance = Infinity;

    windows.forEach((win) => {
      if (win.id === focusedId) return;

      let isCandidate = false;
      let distance = 0;

      const focusedCenterX = focusedWin.x + focusedWin.width / 2;
      const focusedCenterY = focusedWin.y + focusedWin.height / 2;
      const winCenterX = win.x + win.width / 2;
      const winCenterY = win.y + win.height / 2;

      const dx = winCenterX - focusedCenterX;
      const dy = winCenterY - focusedCenterY;

      switch (direction) {
        case "left":
          if (winCenterX < focusedCenterX) {
            isCandidate = true;
            distance = Math.abs(dx) + Math.abs(dy) * 0.5;
          }
          break;
        case "right":
          if (winCenterX > focusedCenterX) {
            isCandidate = true;
            distance = Math.abs(dx) + Math.abs(dy) * 0.5;
          }
          break;
        case "up":
          if (winCenterY < focusedCenterY) {
            isCandidate = true;
            distance = Math.abs(dy) + Math.abs(dx) * 0.5;
          }
          break;
        case "down":
          if (winCenterY > focusedCenterY) {
            isCandidate = true;
            distance = Math.abs(dy) + Math.abs(dx) * 0.5;
          }
          break;
      }

      if (isCandidate && distance < minDistance) {
        minDistance = distance;
        bestWin = win;
      }
    });

    if (bestWin) {
      onFocusWindow(bestWin.id);
      ensureWindowInView(bestWin.id);
    }
  };

  const moveWindow = (direction, amount = 20) => {
    const currentGrid = gridRef.current;
    const focusedId = currentGrid.focusedWindowId;
    if (!focusedId) return;
    const win = currentGrid.windows[focusedId];
    if (!win) return;

    const updates = {};
    if (direction === "left") updates.x = win.x - amount;
    if (direction === "right") updates.x = win.x + amount;
    if (direction === "up") updates.y = win.y - amount;
    if (direction === "down") updates.y = win.y + amount;

    onUpdateWindow(focusedId, updates);
    ensureWindowInView(focusedId);
  };

  const tileWindow = (side) => {
    const currentGrid = gridRef.current;
    const focusedId = currentGrid.focusedWindowId;
    if (!focusedId) return;
    const win = currentGrid.windows[focusedId];
    if (!win) return;

    const viewportW = currentGrid.viewPortWidth;
    const viewportH = currentGrid.viewPortHeight;
    const zoom = currentGrid.zoom;

    const viewLeft = -currentGrid.scrollX / zoom;
    const viewTop = -currentGrid.scrollY / zoom;
    const viewW = viewportW / zoom;
    const viewH = viewportH / zoom;

    const updates = {};
    if (side === "left") {
      updates.x = viewLeft;
      updates.y = viewTop;
      updates.width = viewW / 2;
      updates.height = viewH;
    } else if (side === "right") {
      updates.x = viewLeft + viewW / 2;
      updates.y = viewTop;
      updates.width = viewW / 2;
      updates.height = viewH;
    } else if (side === "up") {
      updates.x = viewLeft;
      updates.y = viewTop;
      updates.width = viewW;
      updates.height = viewH / 2;
    } else if (side === "down") {
      updates.x = viewLeft;
      updates.y = viewTop + viewH / 2;
      updates.width = viewW;
      updates.height = viewH / 2;
    }

    onUpdateWindow(focusedId, updates);
  };

  const switchWindow = (direction) => {
    const currentGrid = gridRef.current;
    const focusedId = currentGrid.focusedWindowId;
    if (!focusedId) return;
    const focusedWin = currentGrid.windows[focusedId];
    if (!focusedWin) return;

    let bestWin = null;
    let minDistance = Infinity;

    Object.values(currentGrid.windows).forEach((win) => {
      if (win.id === focusedId) return;

      const dx = win.x - focusedWin.x;
      const dy = win.y - focusedWin.y;
      let isCandidate = false;

      if (direction === "left" && dx < 0) isCandidate = true;
      if (direction === "right" && dx > 0) isCandidate = true;
      if (direction === "up" && dy < 0) isCandidate = true;
      if (direction === "down" && dy > 0) isCandidate = true;

      const distance = Math.sqrt(dx * dx + dy * dy);
      if (isCandidate && distance < minDistance) {
        minDistance = distance;
        bestWin = win;
      }
    });

    if (bestWin) {
      const focusedUpdates = {
        x: bestWin.x,
        y: bestWin.y,
        width: bestWin.width,
        height: bestWin.height,
      };
      const targetUpdates = {
        x: focusedWin.x,
        y: focusedWin.y,
        width: focusedWin.width,
        height: focusedWin.height,
      };
      onUpdateWindow(focusedId, focusedUpdates);
      onUpdateWindow(bestWin.id, targetUpdates);
    }
  };

  useEffect(() => {
    hotkeys("alt+left, alt+right, alt+up, alt+down", (event, handler) => {
      event.preventDefault();
      const direction = handler.key.split("+")[1];
      if (gridRef.current.isEditMode) {
        moveWindow(direction);
      } else {
        jumpToClosestWindow(direction);
      }
    });

    hotkeys("alt+shift+enter", (event) => {
      event.preventDefault();
      onUpdateGrid({ isEditMode: !gridRef.current.isEditMode });
    });

    hotkeys("escape", () => {
      if (gridRef.current.isEditMode) {
        onUpdateGrid({ isEditMode: false });
      }
    });

    // Edit mode hotkeys
    hotkeys("left, right, up, down", (event, handler) => {
      if (!gridRef.current.isEditMode) return;
      event.preventDefault();
      jumpToClosestWindow(handler.key);
    });

    hotkeys("alt+shift+[", (event) => {
      event.preventDefault();
      tileWindow("left");
    });

    hotkeys("alt+shift+]", (event) => {
      event.preventDefault();
      tileWindow("right");
    });

    hotkeys(
      "alt+ctrl+left, alt+ctrl+right, alt+ctrl+up, alt+ctrl+down",
      (event, handler) => {
        if (!gridRef.current.isEditMode) return;
        event.preventDefault();
        const direction = handler.key.split("+")[2];
        switchWindow(direction);
      }
    );

    hotkeys(
      "alt+shift+left, alt+shift+right, alt+shift+up, alt+shift+down",
      (event, handler) => {
        if (!gridRef.current.isEditMode) return;
        event.preventDefault();
        const direction = handler.key.split("+")[2];
        tileWindow(direction);
      }
    );

    return () => {
      hotkeys.unbind("alt+left, alt+right, alt+up, alt+down");
      hotkeys.unbind("alt+shift+enter");
      hotkeys.unbind("escape");
      hotkeys.unbind("left, right, up, down");
      hotkeys.unbind("alt+shift+[");
      hotkeys.unbind("alt+shift+]");
      hotkeys.unbind(
        "alt+ctrl+left, alt+ctrl+right, alt+ctrl+up, alt+ctrl+down"
      );
      hotkeys.unbind(
        "alt+shift+left, alt+shift+right, alt+shift+up, alt+shift+down"
      );
    };
  }, [onFocusWindow, onUpdateGrid, onUpdateWindow]);

  const handleMouseDown = (e) => {
    // Middle mouse (1) OR Space + Left Click (0)
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        setIsSpacePressed(true);
        // Prevent page scrolling
        if (
          document.activeElement.tagName !== "INPUT" &&
          document.activeElement.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsDragging(false);
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const currentGrid = gridRef.current;

      if (e.ctrlKey) {
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.min(Math.max(0.5, currentGrid.zoom + zoomDelta), 2.0);

        // Round to 1 decimal place to keep increments specific
        const roundedZoom = Math.round(newZoom * 10) / 10;

        if (roundedZoom !== currentGrid.zoom) {
          onUpdateGrid({ zoom: roundedZoom });
        }
      } else {
        // Trackpad / Wheel scroll support
        const newX = currentGrid.scrollX - e.deltaX;
        const newY = currentGrid.scrollY - e.deltaY;

        onUpdateGrid({
          scrollX: newX,
          scrollY: newY,
        });

        // Snap to grid after scrolling stops
        if (snapTimeoutRef.current) {
          clearTimeout(snapTimeoutRef.current);
        }
        snapTimeoutRef.current = setTimeout(() => {
          const latestGrid = gridRef.current;
          const snappedX = Math.round(latestGrid.scrollX / 20) * 20;
          const snappedY = Math.round(latestGrid.scrollY / 20) * 20;
          onUpdateGrid({
            scrollX: snappedX,
            scrollY: snappedY,
          });
        }, 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [onUpdateGrid]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        onUpdateGrid({
          scrollX: grid.scrollX + deltaX,
          scrollY: grid.scrollY + deltaY,
        });

        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Snap to grid
        const snappedX = Math.round(grid.scrollX / 20) * 20;
        const snappedY = Math.round(grid.scrollY / 20) * 20;
        onUpdateGrid({
          scrollX: snappedX,
          scrollY: snappedY,
        });
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, lastMousePos, grid.scrollX, grid.scrollY, onUpdateGrid]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#1a1a1a] ${
        isSpacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } ${isDragging ? "select-none" : ""}`}
      onMouseDown={handleMouseDown}
      style={{
        backgroundImage: `radial-gradient(circle, #333 1px, transparent 1px)`,
        backgroundSize: `${20 * grid.zoom}px ${20 * grid.zoom}px`,
        backgroundPosition: `${grid.scrollX}px ${grid.scrollY}px`,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${grid.scrollX}px, ${grid.scrollY}px) scale(${grid.zoom})`,
        }}
      >
        {Object.values(grid.windows).map((win) => (
          <EditorWindow
            key={win.id}
            window={win}
            zoom={grid.zoom}
            isFocused={grid.focusedWindowId === win.id}
            isEditMode={grid.isEditMode}
            onUpdate={(updates) => onUpdateWindow(win.id, updates)}
            onClose={() => onCloseWindow(win.id)}
            onFocus={() => onFocusWindow(win.id)}
          />
        ))}
      </div>

      {/* Grid Indicators */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none select-none">
        <div className="bg-[#252526]/80 text-xs text-gray-400 px-2 py-1 rounded border border-[#333]">
          Zoom: {Math.round(grid.zoom * 100)}%
        </div>
        {grid.isEditMode && (
          <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-pulse uppercase tracking-wider">
            Edit Mode
          </div>
        )}
      </div>

      {/* Edit Mode Overlay */}
      {grid.isEditMode && (
        <div className="absolute inset-0 border-4 border-blue-500/20 pointer-events-none z-[1000]" />
      )}
    </div>
  );
};

export default Grid;
