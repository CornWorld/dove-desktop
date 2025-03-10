import {ws, WinState, StackMode} from './sys';
import {createStore, produce} from "solid-js/store";

export interface WMState {
    activeWinId: number | null;
    focusedWinId: number | null;
    displayWidth: number;
    displayHeight: number;
}

interface WindowGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
}

class WindowManager {
    private state: WMState;
    private setState: (fn: (state: WMState) => void) => void;
    private savedGeometry: Map<number, WindowGeometry>;

    constructor(displayWidth: number, displayHeight: number) {
        const [state, setState] = createStore<WMState>({
            activeWinId: null,
            focusedWinId: null,
            displayWidth,
            displayHeight
        });
        
        this.state = state;
        this.setState = (fn) => setState(produce(fn));
        this.savedGeometry = new Map();

        // Listen for window system changes
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // TODO: Add event listeners for window system changes
        // This would typically involve subscribing to window creation, destruction,
        // and configuration change events
    }

    private constrainPosition(x: number, y: number, width: number, height: number): {x: number, y: number} {
        let newX = x;
        let newY = y;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + width > this.state.displayWidth) newX = this.state.displayWidth - width;
        if (newY + height > this.state.displayHeight) newY = this.state.displayHeight - height;

        return {x: newX, y: newY};
    }

    createWindow(props: {
        x: number,
        y: number,
        width: number,
        height: number,
        borderWidth: number
    }): number {
        const {x, y} = this.constrainPosition(props.x, props.y, props.width, props.height);
        const winId = ws.createWindow({
            ...props,
            x,
            y,
            parentId: null
        });

        // Activate and focus the new window
        this.activateWindow(winId);
        
        // Map the window to make it visible
        ws.mappingWindow(winId);

        return winId;
    }

    activateWindow(winId: number) {
        if (!ws.idMap.has(winId)) return;

        // Update active window
        this.setState(state => {
            state.activeWinId = winId;
            state.focusedWinId = winId;
        });

        // Raise window to top
        ws.configureWindow(winId, {
            siblingId: null,
            stackMode: StackMode.Above
        });
    }

    maximizeWindow(winId: number) {
        if (!ws.idMap.has(winId)) return;

        const win = ws.wins[ws.idMap.get(winId)!];
        
        // Save current geometry before maximizing
        if (!this.savedGeometry.has(winId)) {
            this.savedGeometry.set(winId, {
                x: win.x,
                y: win.y,
                width: win.width,
                height: win.height
            });
        }

        // Configure window to fill the screen
        ws.configureWindow(winId, {
            x: 0,
            y: 0,
            width: this.state.displayWidth,
            height: this.state.displayHeight
        });
    }

    restoreWindow(winId: number) {
        if (!ws.idMap.has(winId)) return;

        const savedGeometry = this.savedGeometry.get(winId);
        if (savedGeometry) {
            ws.configureWindow(winId, savedGeometry);
            this.savedGeometry.delete(winId);
        }
    }

    minimizeWindow(winId: number) {
        if (!ws.idMap.has(winId)) {
            ws.unmappingWindow(winId);
        }
    }

    moveWindow(winId: number, x: number, y: number) {
        if (!ws.idMap.has(winId)) return;

        const win = ws.wins[ws.idMap.get(winId)!];
        const {x: newX, y: newY} = this.constrainPosition(x, y, win.width, win.height);
        
        ws.configureWindow(winId, {x: newX, y: newY});
    }

    resizeWindow(winId: number, width: number, height: number) {
        if (!ws.idMap.has(winId)) return;

        const win = ws.wins[ws.idMap.get(winId)!];
        const {x: newX, y: newY} = this.constrainPosition(win.x, win.y, width, height);
        
        ws.configureWindow(winId, {
            x: newX,
            y: newY,
            width,
            height
        });
    }

    closeWindow(winId: number) {
        if (!ws.idMap.has(winId)) return;
        
        ws.destroyWindow(winId);
        this.savedGeometry.delete(winId);

        // Update active/focused window state
        if (this.state.activeWinId === winId) {
            this.setState(state => {
                state.activeWinId = null;
                state.focusedWinId = null;
            });
        }
    }
}

// Create and export window manager instance
export const wm = new WindowManager(window.innerWidth, window.innerHeight); 