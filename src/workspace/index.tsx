import {create} from "zustand/react";
import {produce} from "immer";
import {createDragState, DraggableState} from "../utils/drag.ts";
import {useEffect} from "react";
import {screenStore} from "../screen.tsx";
import {TaskManager} from "./taskmanager.tsx";
import {AppLauncher} from "./app-launcher.tsx";
import {DigitalClock} from "./digital-clock.tsx";
import './index.scss';

interface Icon {
    title: string;
    icon: string;
    selected: boolean;

    x: number,
    y: number;
}

const createIcon = (title: string, icon: string): Icon => ({
    title, icon, selected: false,
    x: 0, y: 0,
});

const exampleIcons: Icon[] = [
    createIcon('Home', '/icons/places/folder-activities.svg'),
    createIcon('Trash', '/icons/places/user-trash.svg'),
]

interface WorkspaceState {
    icons: Icon[];
    selectIcon: (index: number, setTo?: boolean) => void,
    setIconPos: (index: number, x: number, y: number) => void,
    cancelSelection: () => void,

    drag: DraggableState;
}

const workspaceStore = create<WorkspaceState>((set) => ({
    icons: exampleIcons,
    setIconPos: (index, x, y) => set((state) =>
        produce(state, (draft) => {
            draft.icons[index].x = x;
            draft.icons[index].y = y;
        })),
    selectIcon: (index, setTo) => set((state) =>
        produce(state, (draft) => {
            draft.icons[index].selected = setTo ?? !draft.icons[index].selected;
        })),
    cancelSelection: () => set((state) =>
        produce(state, (draft) => {
            draft.icons.forEach((icon) => icon.selected = false);
        })),

    drag: createDragState(set),
}));

const IconWidth = 103;
const IconHeight = 93;
const IconMargin = 5;

const iconGridSnap = (x: number, y: number) => {
    return {
        snappedX: Math.round(x / (IconWidth + IconMargin)) * (IconWidth + IconMargin),
        snappedY: Math.round(y / (IconHeight + IconMargin)) * (IconHeight + IconMargin),
    }
}

const iconSearchPlace = (x: number, y: number) => {
    const screen = screenStore.getState().Screen;
    const positions = [];

    for (let i = 0; i < screen.width; i += IconWidth + IconMargin) {
        for (let j = 0; j < screen.height - 44; j += IconHeight + IconMargin) {
            if (getIconIndexByPos(i, j) === -1) {
                positions.push({x: i, y: j});
            }
        }
    }

    positions.sort((a, b) => {
        const distA = Math.hypot(a.x - x, a.y - y);
        const distB = Math.hypot(b.x - x, b.y - y);
        return distA - distB;
    });

    return positions.length > 0 ? positions[0] : null;
}

const getIconIndexByPos = (x: number, y: number) => {
    let res = -1;
    workspaceStore.getState().icons.map((icon, index) => {
        if (icon.x === x && icon.y === y) res = index;
    });
    return res;
}

const onMouseMove = (e: MouseEvent) => {
    const state = workspaceStore.getState();

    if (state.drag.dragging) {
        const index = state.drag.dragging - 1;
        let newX = e.clientX - state.drag.offsetX;
        let newY = e.clientY - state.drag.offsetY;

        state.selectIcon(index, true);

        // check if the icon is out of bounds
        const screen = screenStore.getState().Screen;
        if (newX < 0) {
            newX = 0;
        } else if (newX + IconWidth > screen.width) {
            newX = screen.width - IconWidth;
        }
        if (newY < 0) {
            newY = 0;
        } else if (newY + IconHeight > screen.height - 44) {
            newY = screen.height - IconHeight - 44;
        }

        state.setIconPos(index, newX, newY);
    }
};

const onMouseUp = () => {
    const state = workspaceStore.getState();
    if (state.drag.dragging) {
        const index = state.drag.dragging - 1;
        const {x, y} = state.icons[index];
        const {snappedX, snappedY} = iconGridSnap(x, y);

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        const resIndex = getIconIndexByPos(snappedX, snappedY);
        // TODO

        state.drag.stopDrag();

        if (resIndex === -1) {
            state.setIconPos(index, snappedX, snappedY);
        } else {
            const p = iconSearchPlace(x, y);
            if (p !== null) state.setIconPos(index, p.x, p.y);
            else throw new Error('No where could place icon'); // TODO
        }
    }
}

const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // get the icon index
    const dataIndex = (e.target as HTMLElement).getAttribute('data-index');
    if (dataIndex === null) {
        workspaceStore.getState().cancelSelection();
    } else {
        const dragging = parseInt(dataIndex) + 1;
        const state = workspaceStore.getState();

        state.selectIcon(dragging - 1);
        const {x, y} = state.icons[dragging - 1];
        state.drag.startDrag(e.clientX - x, e.clientY - y, dragging);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
}

export const Workspace = () => {
    const state = workspaceStore((s) => s);
    useEffect(() => {
        const state = workspaceStore.getState();
        const screen = screenStore.getState().Screen;
        for (let i = 1; i < state.icons.length; i++) {
            let newX = state.icons[i - 1].x, newY = state.icons[i - 1].y + 93 + IconMargin
            if (newY + IconHeight > screen.height - 44) {
                if (newX + IconWidth > screen.width) {
                    // TODO: add a more icon to the workspace
                } else {
                    newX += IconWidth + IconMargin;
                    newY = 0;
                }
            }
            state.setIconPos(i, newX, newY);
        }
    }, [])

    return <>
        <div className={'panel'}>
            <AppLauncher/>
            <TaskManager/>
            <DigitalClock/>
        </div>
        <div css={{
            width: '100%',
            height: 'calc(100% - 44px)',
            position: 'absolute',
            userSelect: 'none',
            zIndex: 1,
        }} onMouseDown={(e) => onMouseDown(e as unknown as MouseEvent)}>
            {state.icons.map((icon, index) => (
                <div key={index} css={{
                    borderRadius: '5px',
                    width: '103px',
                    height: '93px',
                    margin: '5px',
                    padding: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    boxSizing: 'border-box',
                    zIndex: '2',
                }} style={{
                    left: icon.x, top: icon.y,
                    outline: icon.selected ? '1px solid rgb(61, 174, 233)' : '0',
                    backgroundColor: icon.selected ? 'rgba(61, 174, 233, 0.2)' : 'transparent',
                }}>
                    <img src={icon.icon} alt={icon.title} css={{
                        width: '64px',
                        margin: 'auto',
                        height: '64px',
                        cursor: 'pointer',
                    }} data-index={index}/>
                    <span css={{
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 'medium',
                    }}>awa</span>
                </div>
            ))}
        </div>
    </>

}