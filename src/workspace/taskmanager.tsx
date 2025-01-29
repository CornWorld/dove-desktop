import {createStore, produce} from "solid-js/store";
import {createEffect, createSignal, For, on, onCleanup, onMount} from "solid-js";
import {DescriptionTooltip} from "@/component/tooltip";
import {useDrag} from "@/utils/drag";

interface Task {
	title: string;
	description: string;
	icon: string;
	isWindow: boolean;
	windowId: string | null;
	active: boolean;
	tooltipVisible: boolean;
	x: number;
}

interface TaskStore {
	tasks: Task[];

	setPosition: (index: number, x: number) => void;
	setActive: (index: number, active: boolean) => void;
	swapPosition: (index1: number, index2: number) => void;
	setTooltipVisible: (index: number, visible: boolean) => void;
	setWindowId: (index: number, windowId: string | null) => void;
	makeToPosition: (index: number, towardsX: number) => void;
}

const initialTasks: Task[] = [{
	title: 'System Settings',
	description: 'Configuration tools for your computer',
	icon: '/icons/apps/systemsettings.svg',
	windowId: 'window1',
	isWindow: true,
	active: true,
	tooltipVisible: false,
	x: 0,
}, {
	title: 'Ark',
	description: 'Achieving Tool',
	icon: '/icons/apps/ark.svg',
	windowId: 'window2',
	isWindow: true,
	active: false,
	tooltipVisible: false,
	x: 0,
}, {
	title: 'Kate',
	description: 'Advanced Text Editor',
	icon: '/icons/apps/kate.svg',
	isWindow: false,
	windowId: null,
	active: false,
	tooltipVisible: false,
	x: 0,
}];


const [taskStore, setTaskStore] = createStore<TaskStore>({
	tasks: initialTasks,

	setPosition: (index: number, x: number) => {
		setTaskStore('tasks', index, produce((task) => {
			task.x = x;
		}));
	},
	setActive: (index: number, active: boolean) => {
		setTaskStore('tasks', index, produce((task) => {
			task.active = active;
		}));
	},
	swapPosition: (index1: number, index2: number) => {
		setTaskStore('tasks', produce((tasks) => {
			const temp = tasks[index1].x;
			tasks[index1].x = tasks[index2].x;
			tasks[index2].x = temp;
		}));
	},
	setTooltipVisible: (index: number, visible: boolean) => {
		setTaskStore('tasks', index, produce((task) => {
			task.tooltipVisible = visible;
		}));
	},
	setWindowId: (index: number, windowId: string | null) => {
		setTaskStore('tasks', index, produce((task) => {
			task.windowId = windowId;
		}));
	},

	makeToPosition: (index: number, towardsX: number) => {
		const currX = taskStore.tasks[index].x;
		if(currX === towardsX) return;

		const list = taskStore.tasks
			.map((task, i) => ({x: task.x, i}))
			.sort((a, b) => a.x - b.x);

		const swapAndShift = (start: number, end: number, shift: number) => {
			for (let i = start; i !== end; i += shift) {
				taskStore.setPosition(list[i].i, i - shift);
			}
		};

		taskStore.swapPosition(list[currX].i, list[towardsX].i);
		if(currX < towardsX) {
			swapAndShift(currX + 1, towardsX + 1, 1);
		} else {
			swapAndShift(currX - 1, towardsX - 1, -1);
		}
	},
});

export {taskStore, setTaskStore};

const taskWidth = 52, taskGap = 2;

export const TaskManager = () => {
	const [ref, setRef] = createSignal<HTMLElement>();
	const [draggingIconIndex, setDraggingIconIndex] = createSignal<number>(-1);
	const [draggingIcon, setDraggingIcon] = createSignal<HTMLElement>();

	onMount(() => {
		// rearrange pos
		for (let i = 0; i < taskStore.tasks.length; i++) {
			taskStore.setPosition(i, i);
		}
	})

	const getClicked = (x: number, y: number): number => {
		const rect = ref()!.getBoundingClientRect();
		if(x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return -1;
		return Math.min(Math.floor((x - rect.left) / (taskWidth + taskGap)), taskStore.tasks.length - 1);
	}

	onMount(() => {
		const {isDragging, offset} = useDrag(ref()!, (dx, dy) => {
			const style = draggingIcon()!.style;
			const rect = ref()!.getBoundingClientRect();

			const [rx, ry] = [offset().x - rect.x, offset().y - rect.y];
			const x = rx + dx + 10, y = ry + dy + 10;

			style.transform = `translate3d(${x}px, ${y}px, 0px)`;
			style.display = 'block';

			const overIndex = getClicked(offset().x + dx, offset().y + dy);
			if(overIndex === -1) return;
			taskStore.makeToPosition(draggingIconIndex(), overIndex);
		}, {
			delay: 10,
		});

		createEffect(on(isDragging, (dragging) => {
			if(dragging) {
				const index = getClicked(offset().x, offset().y);
				if(index === -1) return;

				ref()!.style.pointerEvents = 'none';
				setDraggingIconIndex(index);
				const clone = ref()!.children[index].querySelector('span')?.cloneNode(true) as HTMLElement;
				clone.style.display = 'none';
				clone.id = 'dragging-icon';
				ref()!.appendChild(clone);
				setDraggingIcon(clone);
			} else {
				ref()!.style.pointerEvents = 'initial';
				draggingIcon()?.remove();
				setDraggingIcon();
			}
		}));

		onCleanup(() => {
			draggingIcon()?.remove();
		});
	});

	onMount(() => {
		ref()!.addEventListener('click', (e) => {
			const index = getClicked(e.clientX, e.clientY);
			if(index === -1) return;

			const task = taskStore.tasks[index];

			taskStore.setActive(index, !task.active);
		});
	});

	return (
		<ul class="task-manager" ref={setRef}>
			<For each={taskStore.tasks}>
				{(task, index) => (
					<li class={task.active ? 'active' : task.isWindow ? 'inactive' : ''}
					    style={{"--x": task.x}}
					    onMouseEnter={() => taskStore.setTooltipVisible(index(), true)}
					    onMouseLeave={() => taskStore.setTooltipVisible(index(), false)}
					>
                        <span style={{
	                        display: 'inline-block',
	                        height: '32px',
	                        width: '32px',
	                        "vertical-align": 'middle',
	                        "background-image": `url(${task.icon})`,
	                        "background-size": 'cover',
                        }}/>
						{!task.isWindow && (
							<DescriptionTooltip
								visible={task.tooltipVisible}
								title={task.title}
								description={task.description}
							/>
						)}
					</li>
				)}
			</For>
		</ul>
	);
};

