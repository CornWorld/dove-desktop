import {Workspace} from "@/workspace";
import {Suspense} from "solid-js";
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
    width: 1024,
    height: 768,
    backgroundImage: '/wallpapers/light/1024x768.png',

    resize: (width, height) => {
        setDisplayStore({ width, height });
    }
});

export { displayStore, setDisplayStore };

export const Display = () => {
    return (
        <div style={{
            "min-height": `${displayStore.height}px`,
            "min-width": `${displayStore.width}px`,
            "z-index": '0',
            position: 'relative',
            background: displayStore.backgroundImage ? `url(${displayStore.backgroundImage})` : displayStore.backgroundColor,
            border: '0.1px solid black',
            perspective: '1000px',
        }} id="display">
            <Suspense fallback={<></>}>
                {/* TODO Loading screen*/}
                <Workspace/>
                <Settings/>
            </Suspense>
        </div>
    );
}