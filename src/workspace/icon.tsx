import { produce } from "immer";
import { StateCreator } from "zustand";

interface Icon {
	title: string;
	path: string;
	selected: boolean;
	
	x: number,
	y: number;
}

const createIcon = (title: string, path: string): Icon => ({
	title, path: path, selected: false,
	x: 0, y: 0,
});

const exampleIcons: Icon[] = [
	createIcon('Home', '/icons/places/folder-activities.svg'),
	createIcon('Trash', '/icons/places/user-trash.svg'),
];

export interface IconStore {
	icons: Icon[];
	selectIcon: (index: number, setTo?: boolean) => void,
	setIconPos: (index: number, x: number, y: number) => void,
	cancelSelection: () => void,
}

export const createIconStore:StateCreator<IconStore, [], [], IconStore> = (set) => ({
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
			}} data-index={index} />
			<span css={{
				color: 'white',
				fontSize: '13px',
				fontWeight: 'medium',
			}}>{icon.title}</span>
		</div>
	)
}