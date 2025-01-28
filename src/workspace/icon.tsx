import {createStore, produce} from "solid-js/store";
import {Component} from "solid-js";
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

	add: (title: string, iconPath: string) => number;
	remove: (index: number) => void;
	select: (index: number, isSelected: boolean) => void;
	selectAll: () => void;
	cancelSelect: () => void;

	drag: (dx: number, dy: number) => void;

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
}

export function createIconStore() {
	/**
	 * Create a grid map for icons.
	 * DO NOT USE THIS in the initial store creation
	 * */
	const createGridMap = () => {
		const dis = IconWidth + IconMargin;
		const maxCol = Math.floor(displayStore.width / dis);
		const maxRow = Math.floor(displayStore.height / dis);
		const gridMap = new Array(maxRow).fill(0).map(() => new Array(maxCol).fill(false));
		return {dis, maxCol, maxRow, gridMap};
	};

	const [store, setStore] = createStore<IconStore>({
		icons: [],
		add: (title, iconPath) => {
			const pos = store.getNextPosByIndex().toPos();
			const icon = {title, iconPath, pos, isSelected: false};
			setStore('icons', (prev) => [...prev, icon]);
			return store.icons.length;
		},
		remove: (index) => {
			setStore('icons', (prev) =>
				prev.filter((_, i) => i !== index))
		},
		select: (index, isSelected) => setStore('icons', (prev) =>
			prev.map((icon, i) => i === index ? {
				...icon,
				isSelected
			} : icon)),
		selectAll: () => setStore('icons', (prev) =>
			prev.map((icon) => ({...icon, isSelected: true}))),
		cancelSelect: () => setStore('icons', (prev) =>
			prev.map((icon) => ({...icon, isSelected: false}))),

		getNextPosByIndex: () => {
			const {maxCol, maxRow, gridMap} = createGridMap();
			store.icons.forEach((icon) => {
				const gridPos = icon.pos.toGrid();
				gridMap[gridPos.row][gridPos.col] = true;
			});

			for (let col = 0; col < maxCol; col++) {
				for (let row = 0; row < maxRow; row++) {
					if(!gridMap[row][col]) {
						return makeGridPos(col, row);
					}
				}
			}
			throw new Error('No available position');
		},
		findClosestPos: (pos) => {
			const {dis, maxCol, maxRow, gridMap} = createGridMap();
			store.icons.forEach((icon) => {
				const gridPos = icon.pos.toGrid();
				gridMap[gridPos.row][gridPos.col] = true;
			});

			const gridPos = pos.toGrid();
			if(!gridMap[gridPos.row][gridPos.col]) {
				return gridPos;
			}

			let minDis = Infinity;
			let closestPos = gridPos;
			for (let col = 0; col < maxCol; col++) {
				for (let row = 0; row < maxRow; row++) {
					if(!gridMap[row][col]) {
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
		drag: (dx, dy) => {
			const selected = store.icons
				.map((i, index) => i.isSelected ? index : -1)
				.filter(i => i != -1);
			setStore('icons', selected, produce(icon => {
				icon.pos.x += dx;
				icon.pos.y += dy;
				console.log({x: icon.pos.x, y: icon.pos.y});
			}));
		},

		getClicked: (x, y): number /* ? when remove `: number`, a lint error append */ => {
			return store.icons.findIndex((icon: Icon) => {
				const {x: ix, y: iy} = icon.pos;
				return x >= ix && x <= ix + IconWidth
					&& y >= iy && y <= iy + IconHeight;
			});
		},
	});

	return store;
}

