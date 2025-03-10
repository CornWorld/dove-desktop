import {Workspace} from "@/workspace";
import {createSignal, onCleanup, onMount, Suspense} from "solid-js";
import {createStore} from "solid-js/store";
import {Settings} from "@/app/settings";
import {Dynamic, For} from "solid-js/web";
import {ws} from "./window-system/sys";
import {FrameWindow} from "./window-system/frame-window";

interface DisplayState {
	width: number;
	height: number;
	backgroundImage?: string;
	backgroundColor?: string;

	resize: (width: number, height: number) => void;
}

const [displayStore, setDisplayStore] = createStore<DisplayState>({
	width: 1366,
	height: 768,
	backgroundImage: '/wallpapers/light/1366x768.png',

	resize: (width, height) => {
		setDisplayStore({width, height});
	}
});

export {displayStore, setDisplayStore};

const [ref, setRef] = createSignal<HTMLDivElement>();

export const transEventPos = (e: PointerEvent) => {
	const rect = ref()!.getBoundingClientRect();
	return {clientX: e.clientX - rect.x, clientY: e.clientY - rect.y};
}

export const transPos = (x: number, y: number) => {
	const rect = ref()!.getBoundingClientRect();
	return {x: x - rect.x, y: y - rect.y};
}

export const Display = () => {
    let localRef: HTMLDivElement | null = null; 

    const setLocalRef = (element: HTMLDivElement) => {
        setRef(element);
        localRef = element;
    };

    onCleanup(() => {
        if (localRef) {
            localRef = null;
            setRef();
        }
    });

	return (
		<div style={{
			"min-height": `${displayStore.height}px`,
			"min-width": `${displayStore.width}px`,
			"z-index": '0',
			position: 'relative',
			background: displayStore.backgroundImage ? `url(${displayStore.backgroundImage})` : displayStore.backgroundColor,
			border: '0.1px solid black',
			perspective: '1000px',
		}} id="display0" ref={setLocalRef}>
			<Suspense fallback={<></>}>
				{/* TODO Loading screen*/}
				<Workspace/>
			</Suspense>
			<For each={ws.wins}>
				{(win) => (
					<FrameWindow state={win} >
						<div>test</div>
					</FrameWindow>
				)}
			</For>
		</div>
	);
}