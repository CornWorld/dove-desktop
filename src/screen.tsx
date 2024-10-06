import {Workspace} from "./workspace";
import {Suspense} from "react";
import {create} from "zustand/react";
import {TaskManager} from "./workspace/taskmanager";
import {Window} from "./component/window.tsx";

interface ScreenState {
    Screen: {
        width: number;
        height: number;
        backgroundImage?: string;
        backgroundColor?: string;
    };
    resize: (width: number, height: number) => void;
}

export const screenStore = create<ScreenState>((set) => ({
    Screen: {
        width: 1024,
        height: 768,
        backgroundImage: '/wallpapers/light/1024x768.png',
    },
    resize: (width, height) => set((s) => ({Screen: {...s.Screen, width, height}})),
}))

export const Screen = () => {
    const state = screenStore((s) => s.Screen);
    return <div css={{
        minHeight: state.height,
        minWidth: state.width,
        zIndex: '0',
        position: 'relative',
        background: state.backgroundImage !== undefined ? `url(${state.backgroundImage})` : state.backgroundColor,
        border: '0.1px solid black',
        perspective: '1000px',
        // overflow: 'hidden',
    }} id={'screen'}>
        <Suspense>
            {/* TODO Loading screen*/}
            <Workspace/>
            <TaskManager/>
            <Window/>
        </Suspense>
    </div>
}