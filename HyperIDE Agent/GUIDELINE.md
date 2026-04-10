___
# HyprIDE

HyprIDE is a programming IDE similar to Visual Studio code featuring an infinite "canvas" or grid, in which editor tabs and windows are rendered. Open editors, rather than being created as a new tab, are placed onto the grid and can be moved, resized, tiled (like the window manager Hyprland), or closed at will. Other "windows" such as IDE settings or terminal instances, are also placed on the grid. The editor still features a "tab" system for various project folders or separate canvas instances.

# AGENT TOOLS

The `AGENT` folder contains content to be used in the editing process. `AGENT/mock` is a folder containing sudo-code and mockup's for features to be implemented. `AGENT/Objectives` is a folder containing the current objective for a prompt.

___

# Feature breakdown

## The GRID

Grid/canvas instances are infinite, scrolling canvas in which editors and windows are rendered. They are rendered in a similar tab based system like that of VScode. The GRID is a dark background with grey dotted grid indicators. The GRID can be scrolling using a trackpad, middling clicking and dragging with the mouse, or by using keyboard shortcuts. Separate "quick views" can also be created, which are saved view port positions that can be easily switched to, rather than having to be scrolled manually. the view port should also try to align with the grid when not being scrolled, so that it is uniform and flush with the editor. The actual editor itself, with feature a sort of "window" search, by pressing "ctrl-p" to open a floating overlay to search through open windows on the grid, and quickly jump to that editor, or open that file in the current view port.

## Editor Layout

The actual editor will feature a sidebar, like that of visual studio code, with sections for project files, "outline" view (shows various functions in a file, like vscode), a search button, and a settings button. There should also be a top bar, with options like file, edit, view, etc.

#### Actual Editor Windows

The editor windows, where you edit the code, should feature the complex behaviors of a typical IDE, such as language servers, syntax highlighting, auto formatting options, scroll view, tab completion, etc. Use the Microsoft's Monaco editor (or whatever VScode uses) for this. Editors should support all major languages.

#### Miscellaneous Windows

The GRID should also support other windows than just open editors, like terminal instances, markdown previews, or browser pages.

---

# Tech Stack Breakdown
The following things will be used:
- Electron
- NodeJS
- NPM
- Vite
The tech stack should be similar to that of Visual Studio Code's, as this is a desktop application. 
Also make sure to install:
- Monaco Editor
- shadcn UI
The majority of the UI should be built using shadcn.