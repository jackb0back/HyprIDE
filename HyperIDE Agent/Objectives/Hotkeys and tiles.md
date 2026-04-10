___
# Hotkeys
## Window
- `alt-left` Jump to closest window on the left
- `alt-right` Jump to closest window on the right
- `alt-up` Jump to closest window up
- `alt-down` Jump to closest window below
- `alt-shift-[` Quick tile window left
- `alt-shift-]` Quick tile window right
- `alt-shift-enter` Enter "edit" mode

# Edit Mode Hotkeys 
## Window
- `left`/`right`/`up`/`down` switch focus to closest window in that direction
- `alt-[arrow key]` move window 1 grid unit in pressed direction 
- `alt-shift-[arrow key]` tile window in pressed direction 
- `alt-ctrl-[arrow key]` switch window with closest in that direction (x, y, width, height)

___
# Window tiling
Windows should be tiled similar to that of Hyprland, the window manager and wayland compositor. 
# Focusing windows
Focusing a window or moving a window with a keybind should also move the GRID scroll to ensure the window is in view. Windows focused this way should not be centered in the viewport - it should move the viewport just enough so that the window is entirely visible in the viewport. (viewport means the currently visible area of the GRID)

# Edit mode
Edit mode is a mode that is toggled on or off via the keybind, and can be exited by pressing escape as well. In edit mode there are certain key binds that are enabled, and prevents the user from focusing on a window and interacting with it. "Edit" mode is for moving and arranging windows via the keyboard quickly. 