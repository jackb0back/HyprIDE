import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditorWindow = ({
  window,
  zoom = 1,
  isFocused = false,
  isEditMode = false,
  onUpdate,
  onClose,
  onFocus,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, winX: 0, winY: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handleMouseDown = (e) => {
    if (isEditMode) return;
    onFocus();
    const isModifierActive = e.shiftKey && e.altKey;

    if (
      e.target.closest(".window-header") ||
      (isModifierActive && e.button === 0)
    ) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX,
        y: e.clientY,
        winX: window.x,
        winY: window.y,
      });
      if (isModifierActive) e.preventDefault();
    } else if (isModifierActive && e.button === 2) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        w: window.width,
        h: window.height,
      });
      e.preventDefault();
    }
  };

  const handleContextMenu = (e) => {
    if (e.shiftKey && e.altKey) {
      e.preventDefault();
    }
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: window.width,
      h: window.height,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = (e.clientX - dragOffset.x) / zoom;
        const deltaY = (e.clientY - dragOffset.y) / zoom;

        onUpdate({
          x: dragOffset.winX + deltaX,
          y: dragOffset.winY + deltaY,
        });
      } else if (isResizing) {
        const deltaX = (e.clientX - resizeStart.x) / zoom;
        const deltaY = (e.clientY - resizeStart.y) / zoom;

        onUpdate({
          width: Math.max(100, resizeStart.w + deltaX),
          height: Math.max(80, resizeStart.h + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);

      // Snap to grid on release
      if (isDragging) {
        onUpdate({
          x: Math.round(window.x / 20) * 20,
          y: Math.round(window.y / 20) * 20,
        });
      } else if (isResizing) {
        onUpdate({
          width: Math.round(window.width / 20) * 20,
          height: Math.round(window.height / 20) * 20,
        });
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    resizeStart,
    onUpdate,
    zoom,
    window.x,
    window.y,
    window.width,
    window.height,
  ]);

  return (
    <div
      className={`absolute bg-[#1e1e1e] border shadow-lg flex flex-col pointer-events-auto transition-colors duration-200 ${
        isDragging || isResizing || isFocused
          ? "border-blue-500 shadow-blue-500/20"
          : "border-[#333] hover:border-[#444]"
      } ${isDragging || isResizing ? "select-none" : ""} ${
        isEditMode ? "cursor-default" : ""
      }`}
      style={{
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: isDragging || isResizing ? 1000 : isFocused ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`window-header h-8 flex items-center justify-between px-3 border-b select-none ${
          isFocused
            ? "bg-[#2d2d2d] border-blue-500/30"
            : "bg-[#252526] border-[#333]"
        } ${isEditMode ? "cursor-default" : "cursor-move"}`}
      >
        <span
          className={`text-xs truncate font-medium ${
            isFocused ? "text-blue-400" : "text-gray-400"
          }`}
        >
          {window.title}
        </span>
        <button
          onClick={(e) => {
            if (isEditMode) return;
            e.stopPropagation();
            onClose();
          }}
          className={`p-1 rounded transition-colors group ${
            isEditMode ? "cursor-default opacity-50" : "hover:bg-[#c42b1c]"
          }`}
        >
          <X size={14} className="text-gray-400 group-hover:text-white" />
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-[#1e1e1e] relative">
        <div className="p-4 text-gray-500 italic text-sm">
          {window.content || "Empty Editor"}
        </div>
      </div>
      {/* Visual Resize Handle */}
      {!isEditMode && (
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 group/resize"
          onMouseDown={handleResizeStart}
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-gray-600 group-hover/resize:border-blue-500 transition-colors" />
        </div>
      )}
    </div>
  );
};

export default EditorWindow;
