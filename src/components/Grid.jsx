import React, { useRef, useState, useEffect } from "react";
import EditorWindow from "./EditorWindow";

const Grid = ({ grid, onUpdateGrid, onUpdateWindow, onCloseWindow }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

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
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.min(Math.max(0.5, grid.zoom + zoomDelta), 2.0);

        // Round to 1 decimal place to keep increments specific
        const roundedZoom = Math.round(newZoom * 10) / 10;

        if (roundedZoom !== grid.zoom) {
          onUpdateGrid({ zoom: roundedZoom });
        }
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
    };
  }, [grid.zoom, onUpdateGrid, isSpacePressed]);

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
            onUpdate={(updates) => onUpdateWindow(win.id, updates)}
            onClose={() => onCloseWindow(win.id)}
          />
        ))}
      </div>

      {/* Zoom Indicator overlay */}
      <div className="absolute bottom-4 left-4 bg-[#252526]/80 text-xs text-gray-400 px-2 py-1 rounded border border-[#333] select-none pointer-events-none">
        {Math.round(grid.zoom * 100)}%
      </div>
    </div>
  );
};

export default Grid;
