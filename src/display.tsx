import {Workspace} from "./workspace";
import {Suspense} from "solid-js";
import {createStore} from "solid-js/store";
import {Settings} from "./app/settings";

interface DisplayState {
    width: number;
    height: number;
    backgroundImage?: string;
    backgroundColor?: string;
}

const [displayState, setDisplayState] = createStore<DisplayState>({
    width: 1024,
    height: 768,
    backgroundImage: '/wallpapers/light/1024x768.png',
});

export { displayState, setDisplayState };

export const resize = (width: number, height: number) => {
    setDisplayState({ width, height });
};

export const Display = () => {
    return (
        <div style={{
            "min-height": `${displayState.height}px`,
            "min-width": `${displayState.width}px`,
            "z-index": '0',
            position: 'relative',
            background: displayState.backgroundImage ? `url(${displayState.backgroundImage})` : displayState.backgroundColor,
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