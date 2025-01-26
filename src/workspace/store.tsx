import { createDragState, DragState } from "../utils/drag";
import { IconStore, createIconStore } from "./icon";
import { createStore } from "solid-js/store";
import { WindowState, WindowHandler } from "../component/window";

type Window = WindowState & WindowHandler;

interface WindowManagerStore {
	window: Window[];
	addWindow: (window: WindowState & WindowHandler) => void;
	removeWindow: (id: string) => void;
}

function createWindowManagerStore() {
	const [state, setState] = createStore<WindowManagerStore>({
		window: [],
		addWindow: (window) => setState('window', (prev) => [...prev, window]),
		removeWindow: (id) => setState('window', (prev) => prev.filter((w) => w.id !== id))
	});
	return state;
}

interface WorkspaceState extends IconStore, WindowManagerStore {
	// TODO move to panel store
	panelFloat: boolean;
	setPanelFloat: (float: boolean) => void;
	
	iconDrag: DragState;
	windowDrag: DragState;
}

const emptyDragState: DragState = {
	offsetX: 0,
	offsetY: 0,
	dragging: 0
};

const [workspaceState, setWorkspaceState] = createStore<WorkspaceState>({
	...createIconStore(),
	...createWindowManagerStore(),
	
	panelFloat: false,
	setPanelFloat: (float) => setWorkspaceState('panelFloat', float),
	
	iconDrag: emptyDragState,
	windowDrag: emptyDragState
});

// Initialize drags after store creation since they need the setter
const iconDrag = createDragState(setWorkspaceState, 'iconDrag');
const windowDrag = createDragState(setWorkspaceState, 'windowDrag');

setWorkspaceState('iconDrag', iconDrag);
setWorkspaceState('windowDrag', windowDrag);

export { workspaceState, setWorkspaceState };