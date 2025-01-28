import {Workspace} from "@/workspace";
import {createSignal, onCleanup, Suspense} from "solid-js";
import {createStore} from "solid-js/store";
import {Settings} from "@/app/settings";

interface DisplayState {
	width: number;
	height: number;
	backgroundImage?: string;
	backgroundColor?: string;

	resize: (width: number, height: number) => void;
}

const [displayStore, setDisplayStore] = createStore<DisplayState>({
	width: 1920,
	height: 1080,
	backgroundImage: '/wallpapers/light/1920x1080.png',

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
    let localRef: HTMLDivElement | null = null; // hack for HMR

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
		}} id="display" ref={setLocalRef}>
			<Suspense fallback={<></>}>
				{/* TODO Loading screen*/}
				<Workspace/>
				<Settings/>
			</Suspense>
		</div>
	);
}