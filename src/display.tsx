import {Workspace} from "@/workspace";
import {createSignal, onCleanup, ParentComponent, Suspense} from "solid-js";
import {Settings} from "@/app/settings";
import {createContext} from "solid-js";
import {createStore} from "solid-js/store";

export interface DisplayStore {
	width: number;
	height: number;
	backgroundImage?: string;
	backgroundColor?: string;
	resize: (width: number, height: number) => void;

	ref?: HTMLElement;
	setRef: (ref: HTMLElement) => void;

	transEventPos: (e: PointerEvent) => {x: number, y: number};
	transPos: (x: number, y: number) => {x: number, y: number};
}

const [displayStore, setDisplayStore] = createStore<DisplayStore>({
	width: 1920,
	height: 1080,
	backgroundImage: '/wallpapers/light/1920x1080.png',
	resize: (width, height) => {
		setDisplayStore({width, height});
	},

	setRef: (ref) => {
		setDisplayStore({ref});
	},
	transEventPos: (e):{x: number, y:number} => {
		const rect = displayStore.ref!.getBoundingClientRect();
		return {x: e.clientX - rect.x, y: e.clientY - rect.y};
	},
	transPos: (x, y): {x:number, y:number} => {
		const rect = displayStore.ref!.getBoundingClientRect();
		return {x: x - rect.x, y: y - rect.y};
	}
});

const DisplayContext = createContext<DisplayStore>();

export {DisplayContext, displayStore};

export const Display = () => {
	return (
		<DisplayContext.Provider value={displayStore}>
		<div style={{
				"min-height": `${displayStore.height}px`,
				"min-width": `${displayStore.width}px`,
			"z-index": '0',
			position: 'relative',
				background: displayStore.backgroundImage ? `url(${displayStore.backgroundImage})` : displayStore.backgroundColor,
			border: '0.1px solid black',
			perspective: '1000px',
		}} id="display" ref={displayStore.setRef}>
			<Suspense fallback={<></>}>
				{/* TODO Loading screen*/}
				<Workspace/>
				<Settings/>
			</Suspense>
		</div>
		</DisplayContext.Provider>
	);
}