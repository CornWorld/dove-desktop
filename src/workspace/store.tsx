import { IconStore, createIconStore } from "@/workspace/icon";
import { createStore } from "solid-js/store";
import { WindowState, WindowHandler } from "@/component/window";

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

interface WorkspaceState extends WindowManagerStore {
	// TODO move to panel store
	panelFloat: boolean;
	setPanelFloat: (float: boolean) => void;
}

const [workspaceStore, setWorkspaceStore] = createStore<WorkspaceState>({
	...createWindowManagerStore(),
	
	panelFloat: false,
	setPanelFloat: (float) => setWorkspaceStore('panelFloat', float),
});

export const iconStore = createIconStore();

// Initialize drags after store creation since they need the setter
// const iconDrag = createDragState(setWorkspaceState, 'iconDrag');
// const windowDrag = createDragState(setWorkspaceState, 'windowDrag');
//
// setWorkspaceState('iconDrag', iconDrag);
// setWorkspaceState('windowDrag', windowDrag);
// TODO

export { workspaceStore, setWorkspaceStore };