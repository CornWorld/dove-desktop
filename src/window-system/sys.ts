import {produce, createStore} from "solid-js/store";
import {onMount} from "solid-js";

const DEFAULT_DISPLAY = 0;

enum StackMode {
    Above,
    Below,
    TopIf,
    BottomIf,
    Opposite
}

export interface WinState {
    displayId: number;
    id: number;
    parentId: number | null;
    x: number;
    y: number;
    width: number;
    height: number;
    borderWidth: number;
    mapped: boolean;
    siblingId: number | null;
    stackMode: StackMode;
}

interface createWindowProps {
    parentId: number | null;
    x: number;
    y: number;
    width: number;
    height: number;
    borderWidth: number;
}

interface WindowChanges {
    x: number;
    y: number;
    width: number;
    height: number;
    borderWidth: number;
    siblingId: number;
    stackMode: StackMode;
}

interface WinSys {
    wins: WinState[];
    idMap: Map<number, number>; // id to wins' index
    // windows: Map<number, Win>;
    createWindow: (props: createWindowProps) => number;
    mappingWindow: (id: number) => void;
    unmappingWindow: (id: number) => void;
    configureWindow: (id: number, props: Partial<WindowChanges>) => void;
    destroyWindow: (id: number) => void;
    reparentWindow: (id: number, parentId: number) => void;
}

const [ws, setWs] = createStore<WinSys>({
    wins: [],
    idMap: new Map(),
    createWindow: (props: createWindowProps): number => {
        let id; 
        do id = Math.random(); while (ws.idMap.has(id));
    
        const window: WinState = {
            displayId: DEFAULT_DISPLAY,
            id,
            ...props,
            mapped: false,
            siblingId: null,
            stackMode: StackMode.Above
        };
        setWs(produce(ws => {
            ws.wins.push(window);
            ws.idMap.set(id, ws.wins.length - 1);
        }));
        
        return id;
    },
    mappingWindow: (id: number) => {
        setWs('wins', produce(wins => {
            const index = ws.idMap.get(id)!;
            wins[index].mapped = true;
        }));
    },
    unmappingWindow: (id: number) => {
        setWs('wins', produce(wins => {
            const index = ws.idMap.get(id)!;
            wins[index].mapped = false;
        }));
    },
    configureWindow: (id: number, props: Partial<WindowChanges>) => {
        setWs('wins', produce(wins => {
            const index = ws.idMap.get(id)!;
            Object.assign(wins[index], props);
        }));
    },
    destroyWindow: (id: number) => {
        setWs('wins', produce(wins => {
            const index = ws.idMap.get(id)!;        
            wins.splice(index, 1);
            ws.idMap.delete(id);
        }));
    },
    reparentWindow: (id: number, parentId: number) => {
        setWs('wins', produce(wins => {
            const index = ws.idMap.get(id)!;
            wins[index].parentId = parentId;    
        }));
    },
});


// onMount(() => {
    const handle = ws.createWindow({
        parentId: null,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        borderWidth: 1
    });
    ws.mappingWindow(handle);
// });

export {ws};