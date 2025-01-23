import {produce} from "immer";
import {StateCreator} from "zustand";
import {displayStore} from "../display.tsx";
import {workspaceStore} from "./store.tsx";

interface Icon {
    title: string,
    path: string,
    selected: boolean,

    x: number,
    y: number,

    col: number,
    row: number,
}

const createIcon = (title: string, path: string): Icon => ({
    title, path: path, selected: false,
    x: 0, y: 0, col: 0, row: 0,
});

const exampleIcons: Icon[] = [
    createIcon('Home', '/icons/places/folder-activities.svg'),
    createIcon('Trash', '/icons/places/user-trash.svg'),
];

export interface IconStore {
    icons: Icon[];
    selectIcon: (index: number, setTo?: boolean) => void,
    setIconPos: (index: number, x: number, y: number) => void,
    setGridPos: (index: number, col: number, row: number) => void,
    cancelSelection: () => void,
}

export const createIconStore: StateCreator<IconStore, [], [], IconStore> = (set) => ({
    icons: exampleIcons,
    setIconPos: (index, x, y) => set((state) =>
        produce(state, (draft) => {
            draft.icons[index].x = x;
            draft.icons[index].y = y;
        })),
    setGridPos: (index, col, row) => set((state) =>
        produce(state, (draft) => {
            draft.icons[index].col = col;
            draft.icons[index].row = row;
        })),
    selectIcon: (index, setTo) => set((state) =>
        produce(state, (draft) => {
            draft.icons[index].selected = setTo ?? !draft.icons[index].selected;
        })),
    cancelSelection: () => set((state) =>
        produce(state, (draft) => {
            draft.icons.forEach((icon) => icon.selected = false);
        })),
});

interface _IconProps {
    icon: Icon;
    index: number;
    isDragging: boolean;
}

export const _Icon: React.FC<_IconProps> = ({icon, index, isDragging}) => {
    return (
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
            zIndex: isDragging ? 3 : 2,
        }} style={{
            left: icon.x, top: icon.y,
            outline: icon.selected ? '1px solid rgb(61, 174, 233)' : '0',
            backgroundColor: icon.selected ? 'rgba(61, 174, 233, 0.2)' : 'transparent',
        }}>
            <img src={icon.path} alt={icon.title} css={{
                width: '64px',
                margin: 'auto',
                height: '64px',
                cursor: 'pointer',
            }} data-index={index}/>
            <span css={{
                color: 'white',
                fontSize: '13px',
                fontWeight: 'medium',
            }}>{icon.title}</span>
        </div>
    )
}

const IconWidth = 103;
const IconHeight = 93;
const IconMargin = 5;

export {IconWidth, IconHeight, IconMargin};

const pos2Grid = (x: number, y: number) => {
    return {
        col: Math.round(x / (IconWidth + IconMargin)),
        row: Math.round(y / (IconHeight + IconMargin)),
    }
}
const grid2Pos = (col: number, row: number) => {
    return {
        x: col * (IconWidth + IconMargin),
        y: row * (IconHeight + IconMargin),
    }
}

const findIconIndexByGrid = (col: number, row: number) => {
    return workspaceStore.getState().icons.findIndex((icon) => icon.col === col && icon.row === row);
}

// get the place to put the icon
// 1. get the closest position, check if the position is occupied, if not, place the icon
// 2. find the next closest position, continue the process
export const placeIcon = (index: number, x: number, y: number) => {
    const state = workspaceStore.getState();
    const {col, row} = pos2Grid(x, y);
    const gridPos = grid2Pos(col, row);
    const iconIndex = findIconIndexByGrid(col, row);
    if (iconIndex === -1) {
        state.setGridPos(index, col, row);
        state.setIconPos(index, gridPos.x, gridPos.y);
    } else {
        const p = findAvailablePlace(index, x, y);
        if (p) {
            const gridPos = grid2Pos(p.col, p.row);
            state.setIconPos(index, gridPos.x, gridPos.y);
            state.setGridPos(index, p.col, p.row);
        } else throw new Error('No where could place icon'); // TODO
    }
}
const findAvailablePlace = (index: number, x: number, y: number) => {
    const screen = displayStore.getState().Display;
    const state = workspaceStore.getState();
    const {col, row} = state.icons[index];
    const positions = [];
    const maxCol = Math.floor(screen.width / (IconWidth + IconMargin));
    const maxRow = Math.floor((screen.height - 44) / (IconHeight + IconMargin));
    for (let i = 0; i < maxCol; i++) {
        for (let j = 0; j < maxRow; j++) {
            if ((i === col && j === row) || findIconIndexByGrid(i, j) === -1) {
                positions.push({col: i, row: j});
            }
        }
    }

    positions.sort((a, b) => {
        const posA = grid2Pos(a.col, a.row);
        const posB = grid2Pos(b.col, b.row);
        const distA = Math.hypot(posA.x - x, posA.y - y);
        const distB = Math.hypot(posB.x - x, posB.y - y);
        return distA - distB;
    });

    return positions.length > 0 ? positions[0] : null;
}