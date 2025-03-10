import { createStore } from "solid-js/store";
import { Dynamic, For } from "solid-js/web";
import { createContext } from "solid-js";

// use context to store the window list

const WindowListContext = createContext<[string[], (v: string[]) => void]>([[], () => {}]);

export const RootWindow = () => {
    const [windowList, setWindowList] = createStore<string[]>([]);
    
    return (
        <WindowListContext.Provider value={[windowList, setWindowList]}>
            <For each={windowList}>
                {(window) => (
                    <Dynamic component={window}/>
                )}
            </For>
        </WindowListContext.Provider>
    );
};