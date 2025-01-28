import {createStore} from "solid-js/store";
import {Component, createEffect, createSignal, onMount} from "solid-js";
import {displayStore} from "@/display";

const IconWidth = 103;
const IconHeight = 93;
const IconMargin = 5;
export {IconWidth, IconHeight, IconMargin};

interface Pos {
    x: number,
    y: number,

    toGrid(): GridPos;
}

interface GridPos {
    col: number,
    row: number,

    toPos(): Pos;
}

const makePos = (x: number, y: number): Pos => ({
    x, y,

    toGrid() {
        const dis = IconWidth + IconMargin;
        return makeGridPos(Math.round(x / dis), Math.round(y / dis),);
    }
});

const makeGridPos = (col: number, row: number): GridPos => ({
    col, row,

    toPos() {
        const dis = IconWidth + IconMargin;
        return makePos(col * dis, row * dis);
    }
});

export {makePos, makeGridPos};

interface Icon {
    title: string;
    iconPath: string;
    pos: Pos;
    isSelected: boolean;
}

export const placeIcon = (index: number, x: number, y: number) => {
    console.warn('placeIcon not implemented');
}

export const Icon: Component<Icon> = (props) => {
    return (
        <div style={{
            "border-radius": "5px",
            width: `${IconWidth}px`,
            height: `${IconHeight}px`,
            margin: `${IconMargin}px`,
            padding: "5px",
            display: "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "align-items": "center",
            position: "absolute",
            "box-sizing": "border-box",
            "z-index": props.isSelected ? "3" : "2",
            outline: props.isSelected ? "1px solid rgb(61, 174, 233)" : "0",
            "background-color": props.isSelected ? "rgba(61, 174, 233, 0.2)" : "transparent",
            "transform": `translate3d(${props.pos.x}px, ${props.pos.y}px, 0px)`,
            // "pointer-events": "all"
        }}>
            <img alt={props.title} src={props.iconPath} style={{
                width: "64px",
                margin: "auto",
                height: "64px",
                cursor: "pointer",
                // "pointer-events": "all"
            }}/>
            <span style={{
                color: "white",
                "font-size": "13px",
                "font-weight": "medium",
                // "pointer-events": "none"
            }}>{props.title}</span>
        </div>
    );
};

export interface IconStore {
    icons: Icon[];

    add: (title: string, iconPath: string) => number;
    remove: (index: number) => void;
    select: (index: number, isSelected: boolean) => void;
    selectAll: () => void;
    cancelSelect: () => void;

    /**
     * Get the next available position in grid for the icon by index
     * */
    getNextPosByIndex: () => GridPos;
    /**
     * Find the closest available position in grid for the icon by position
     * */
    findClosestPos: (pos: Pos) => GridPos;
}

export function createIconStore() {
    const createGridMap = () => {
        const dis = IconWidth + IconMargin;
        const maxCol = Math.floor(displayStore.width / dis);
        const maxRow = Math.floor(displayStore.height / dis);
        const gridMap = new Array(maxRow).fill(0).map(() => new Array(maxCol).fill(false));
        return { dis, maxCol, maxRow, gridMap };
    };

    const [store, setStore] = createStore<IconStore>({
        icons: [],
        add: (title, iconPath) => {
            const pos = store.getNextPosByIndex().toPos();
            const icon = { title, iconPath, pos, isSelected: false };
            setStore('icons', (prev) => [...prev, icon]);
            return store.icons.length;
        },
        remove: (index) => {
            setStore('icons', (prev) => prev.filter((_, i) => i !== index))
        },
        select: (index, isSelected) => setStore('icons', (prev) => prev.map((icon, i) => i === index ? { ...icon, isSelected } : icon)),
        selectAll: () => setStore('icons', (prev) => prev.map((icon) => ({ ...icon, isSelected: true }))),
        cancelSelect: () => setStore('icons', (prev) => prev.map((icon) => ({ ...icon, isSelected: false }))),

        getNextPosByIndex: () => {
            const { dis, maxCol, maxRow, gridMap } = createGridMap();
            store.icons.forEach((icon) => {
                const gridPos = icon.pos.toGrid();
                gridMap[gridPos.row][gridPos.col] = true;
            });

            for (let col = 0; col < maxCol; col++) {
                for (let row = 0; row < maxRow; row++) {
                    if (!gridMap[row][col]) {
                        return makeGridPos(col, row);
                    }
                }
            }
            throw new Error('No available position');
        },
        findClosestPos: (pos) => {
            const { dis, maxCol, maxRow, gridMap } = createGridMap();
            store.icons.forEach((icon) => {
                const gridPos = icon.pos.toGrid();
                gridMap[gridPos.row][gridPos.col] = true;
            });

            const gridPos = pos.toGrid();
            if (!gridMap[gridPos.row][gridPos.col]) {
                return gridPos;
            }

            let minDis = Infinity;
            let closestPos = gridPos;
            for (let col = 0; col < maxCol; col++) {
                for (let row = 0; row < maxRow; row++) {
                    if (!gridMap[row][col]) {
                        const dx = col * dis - pos.x;
                        const dy = row * dis - pos.y;
                        const d = dx * dx + dy * dy;
                        if (d < minDis) {
                            minDis = d;
                            closestPos = makeGridPos(col, row);
                        }
                    }
                }
            }
            return closestPos;
        }
    });

    return store;
}

