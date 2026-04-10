import React from 'react';
import { X } from 'lucide-react';

const TabSystem = ({ tabs, activeTabId, onTabChange, onTabClose, onNewTab }) => {
  return (
    <div className="flex h-10 bg-[#252526] items-center border-b border-[#333] select-none">
      <div className="flex overflow-x-auto h-full scrollbar-hide">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center h-full px-4 border-r border-[#333] cursor-pointer min-w-[120px] max-w-[200px] group ${
              activeTabId === tab.id ? 'bg-[#1e1e1e] border-t-2 border-t-blue-500' : 'hover:bg-[#2d2d2d]'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={`text-xs truncate flex-1 ${activeTabId === tab.id ? 'text-white' : 'text-gray-400'}`}>
              {tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="ml-2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[#454545] transition-opacity"
            >
              <X size={12} className="text-gray-400" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onNewTab}
        className="px-4 h-full flex items-center hover:bg-[#2d2d2d] text-gray-400 text-sm"
      >
        +
      </button>
    </div>
  );
};

export default TabSystem;
