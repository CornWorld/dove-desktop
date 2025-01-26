import { createStore } from "solid-js/store";
import { Component } from "solid-js";
import { displayState } from "@/display";
import { workspaceState, setWorkspaceState } from "@/workspace/store";

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

export function createIconStore() {
    const [state, setState] = createStore<IconStore>({
        icons: exampleIcons,
        setIconPos: (index, x, y) => {
            setState('icons', index, {
                ...state.icons[index],
                x,
                y
            });
        },
        setGridPos: (index, col, row) => {
            setState('icons', index, {
                ...state.icons[index],
                col,
                row
            });
        },
        selectIcon: (index, setTo) => {
            setState('icons', index, {
                ...state.icons[index],
                selected: setTo ?? !state.icons[index].selected
            });
        },
        cancelSelection: () => {
            setState('icons', icons => icons.map(icon => ({
                ...icon,
                selected: false
            })));
        }
    });
    return state;
}

interface IconProps {
    icon: Icon;
    index: number;
    isDragging: boolean;
}

export const Icon: Component<IconProps> = (props) => {
    return (
        <div style={{
            "border-radius": "5px",
            width: "103px",
            height: "93px",
            margin: "5px",
            padding: "5px",
            display: "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "align-items": "center",
            position: "absolute",
            "box-sizing": "border-box",
            "z-index": props.isDragging ? "3" : "2",
            left: `${props.icon.x}px`,
            top: `${props.icon.y}px`,
            outline: props.icon.selected ? "1px solid rgb(61, 174, 233)" : "0",
            "background-color": props.icon.selected ? "rgba(61, 174, 233, 0.2)" : "transparent",
            "pointer-events": "all"
        }}>
            <img src={props.icon.path} alt={props.icon.title} style={{
                width: "64px",
                margin: "auto",
                height: "64px",
                cursor: "pointer",
                "pointer-events": "all"
            }} data-index={props.index}/>
            <span style={{
                color: "white",
                "font-size": "13px",
                "font-weight": "medium",
                "pointer-events": "none"
            }}>{props.icon.title}</span>
        </div>
    );
};

const IconWidth = 103;
const IconHeight = 93;
const IconMargin = 5;

export { IconWidth, IconHeight, IconMargin };

const pos2Grid = (x: number, y: number) => {
    return {
        col: Math.round(x / (IconWidth + IconMargin)),
        row: Math.round(y / (IconHeight + IconMargin)),
    }
};

const grid2Pos = (col: number, row: number) => {
    return {
        x: col * (IconWidth + IconMargin),
        y: row * (IconHeight + IconMargin),
    }
};

const findIconIndexByGrid = (col: number, row: number) => {
    return workspaceState.icons.findIndex((icon) => icon.col === col && icon.row === row);
};

export const placeIcon = (index: number, x: number, y: number) => {
    const {col, row} = pos2Grid(x, y);
    const gridPos = grid2Pos(col, row);
    const iconIndex = findIconIndexByGrid(col, row);
    if (iconIndex === -1) {
        setWorkspaceState('icons', index, {
            ...workspaceState.icons[index],
            col,
            row,
            x: gridPos.x,
            y: gridPos.y
        });
    } else {
        const p = findAvailablePlace(index, x, y);
        if (p) {
            const gridPos = grid2Pos(p.col, p.row);
            setWorkspaceState('icons', index, {
                ...workspaceState.icons[index],
                col: p.col,
                row: p.row,
                x: gridPos.x,
                y: gridPos.y
            });
        } else throw new Error('No where could place icon'); // TODO
    }
};

const findAvailablePlace = (index: number, x: number, y: number) => {
    const screen = displayState;
    const {col, row} = workspaceState.icons[index];
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
};