import { createDragState, DraggableState } from "../utils/drag.ts";
import { IconStore, createIconStore } from "./icon.tsx";
import { create, StateCreator } from "zustand";
import { WindowState, WindowHandler } from "../component/window.tsx";


type Window = WindowState & WindowHandler;
interface WindowManagerStore {
	window: Window[];
	addWindow: (window: WindowState & WindowHandler) => void;
	removeWindow: (id: string) => void;
}

const createWindowManagerStore:StateCreator<WindowManagerStore, [], [], WindowManagerStore> = (set) => ({
	window: [],
	addWindow: (window) => set((state) => ({window: [...state.window, window]})),
	removeWindow: (id) => set((state) => ({window: state.window.filter((w) => w.id !== id)})),
});

interface WorkspaceState extends IconStore, WindowManagerStore {
	// TODO move to panel store
	panelFloat: boolean;
	setPanelFloat: (float: boolean) => void;
	
	drag: DraggableState;
}

export const workspaceStore = create<WorkspaceState>((set, get, api) => ({
	...createIconStore(set, get, api),
	...createWindowManagerStore(set, get, api),
	
	panelFloat: false,
	setPanelFloat: (float) => set(() => ({panelFloat: float})),
	
	drag: createDragState(set),
}));