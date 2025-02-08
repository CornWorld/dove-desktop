import {createStore, produce} from "solid-js/store";
import {Component, onMount, useContext} from "solid-js";
import {DisplayContext} from "@/display";

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
		const col = x >= 0 ? Math.floor(x / dis) : Math.ceil(x / dis);
		const row = y >= 0 ? Math.floor(y / dis) : Math.ceil(y / dis);
		return makeGridPos(col, row);
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
		}}>
			<img alt={props.title} src={props.iconPath} style={{
				width: "64px",
				margin: "auto",
				height: "64px",
				cursor: "pointer",
				"pointer-events": "none"
			}}/>
			<span style={{
				color: "white",
				"font-size": "13px",
				"font-weight": "medium",
			}}>{props.title}</span>
		</div>
	);
};

export interface IconStore {
	icons: Icon[];
	gridMap: number[][];
	enableGrid: boolean;

	add: (title: string, iconPath: string) => number;
	remove: (index: number) => void;
	select: (index: number, isSelected: boolean) => void;
	selectAll: () => void;
	cancelSelect: () => void;

	drag: (dx: number, dy: number) => void;
	drop: () => void;

	/**
	 * Get the next available position in grid for the icon by index
	 * */
	getNextPosByIndex: () => GridPos;
	/**
	 * Find the closest available position in grid for the icon by position
	 * */
	findClosestPos: (pos: Pos) => GridPos;

	/**
	 * Get the index of the icon that is clicked
	 * */
	getClicked: (x: number, y: number) => number;

	snapToGrid: () => void;
	
	/**
	 * Update the grid map
	 */
	updateGridMap: () => void;
}


export function createIconStore(enableGrid = true): IconStore {
	const display = useContext(DisplayContext)!;

	const dis = IconWidth + IconMargin;
	const maxCol = Math.floor(display.width / dis);
	const maxRow = Math.floor(display.height / dis);


	const [store, setStore] = createStore<IconStore>({
		icons: [] as Icon[],
		gridMap: [] as number[][],
		enableGrid: enableGrid,
		updateGridMap: () => {
			if(!store.enableGrid) return;


			// Create a fresh grid map each time
			const gridMap: number[][] = [];
			for (let row = 0; row < maxRow; row++) {
				gridMap[row] = [];
				for (let col = 0; col < maxCol; col++) {
					gridMap[row][col] = -1; // -1: empty
				}
			}

			store.icons.forEach((icon, index) => {
				const gridPos = icon.pos.toGrid();
				if (gridPos.row >= 0 && gridPos.row < maxRow && gridPos.col >= 0 && gridPos.col < maxCol) {
					gridMap[gridPos.row][gridPos.col] = index;
				}
			});
			setStore('gridMap', gridMap);
		},
		add: (title: string, iconPath: string): number => {
			const pos = store.getNextPosByIndex().toPos();
			const icon = {title, iconPath, pos, isSelected: false};
			setStore('icons', (prev) => [...prev, icon]);
			if(store.enableGrid)
				setStore('gridMap', produce((gridMap) => {
					const gridPos = icon.pos.toGrid();
					gridMap[gridPos.row][gridPos.col] = store.icons.length;
				}));

			return store.icons.length - 1;
		},
		remove: (index: number) => {
			setStore('icons', (prev) =>
				prev.filter((_, i) => i !== index));
			if(store.enableGrid)
				setStore('gridMap', produce((gridMap) => {
					const gridPos = store.icons[index].pos.toGrid();
					gridMap[gridPos.row][gridPos.col] = -1;
				}));
		},
		select: (index, isSelected) => setStore('icons', (prev) =>
			prev.map((icon, i) => i === index ? {
				...icon,
				isSelected
			} : icon)),
		selectAll: () => setStore('icons', produce(icon => {
			icon.forEach((i) => i.isSelected = true);
		})),
		cancelSelect: () => setStore('icons', produce(icon => {
			icon.forEach((i) => i.isSelected = false);
		})),
		getNextPosByIndex: () => {
			for (let col = 0; col < maxCol; col++) {
				for (let row = 0; row < maxRow; row++) {
					if(store.gridMap[row][col] === -1) {
						return makeGridPos(col, row);
					}
				}
			}
			throw new Error('No available position');
		},
		findClosestPos: (pos: Pos) => {
			const gridPos = pos.toGrid();
			if(gridPos.row >= 0 && gridPos.row < maxRow && 
			   gridPos.col >= 0 && gridPos.col < maxCol && 
			   store.gridMap[gridPos.row][gridPos.col] === -1) {
				return gridPos;
			}

			let minDis = Infinity;
			let closestPos = gridPos;
			for (let col = 0; col < maxCol; col++) {
				for (let row = 0; row < maxRow; row++) {
					if(store.gridMap[row][col] === -1) {
						// try to minimize the distance
						const dx = col * dis - pos.x;
						const dy = row * dis - pos.y;
						const d = dx * dx + dy * dy;
						if(d < minDis) {
							minDis = d;
							closestPos = makeGridPos(col, row);
						}
					}
				}
			}
			return closestPos;
		},
		drag: (dx: number, dy: number) => {
			const selected = store.icons
				.map((i: Icon, index: number) => i.isSelected ? index : -1)
				.filter((i: number) => i != -1);
			setStore('icons', selected, produce(icon => {
				icon.pos.x += dx;
				icon.pos.y += dy;
			}));
		},
		drop: () => {
			if(store.enableGrid) {
				store.snapToGrid();
			}
		},
		getClicked: (x: number, y: number): number => {
			return store.icons.findIndex((icon: Icon) => {
				const {x: ix, y: iy} = icon.pos;
				return x >= ix && x <= ix + IconWidth
					&& y >= iy && y <= iy + IconHeight;
			});
		},
		snapToGrid: () => {
			const selected = store.icons
				.map((i: Icon, index: number) => i.isSelected ? index : -1)
				.filter((i: number) => i != -1);
			setStore(produce((store) => {
				selected.forEach((index: number) => {
					const icon = store.icons[index];
					const gridPos = icon.pos.toGrid();
					const newPos = store.findClosestPos(icon.pos).toPos();
					icon.pos = newPos;
					store.gridMap[gridPos.row][gridPos.col] = -1;
					const newGridPos = newPos.toGrid();
					store.gridMap[newGridPos.row][newGridPos.col] = index;
				});
			}));
		},
	});

	onMount(() => {
		store.updateGridMap();
	});
	return store;
}

