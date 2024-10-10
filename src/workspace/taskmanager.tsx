import {create} from "zustand/react";
import {DescriptionTooltip} from "../component/tooltip.tsx";
import {produce} from "immer";
import {useEffect} from "react";
import {createDragState, DraggableState} from "../utils/drag.ts";

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

interface TaskManagerState {
    tasks: Task[],
    drag: DraggableState,
    setTaskTooltipVisible: (index: number, visible: boolean) => void;
    setTaskPosition: (index: number, x: number) => void;
    swapTaskPosition: (index1: number, index2: number) => void;
    setTaskActive: (index: number, active: boolean) => void;
    setWindowId: (index: number, windowId: string | null) => void;
}

export const taskManagerStore = create<TaskManagerState>((set) => ({
    tasks: [{
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
    }],
    drag: createDragState(set),
    setTaskTooltipVisible: (index, visible) =>
        set((state) =>
            produce(state, (draft) => {
                draft.tasks[index].tooltipVisible = visible;
            })
        ),
    setTaskPosition: (index, x) =>
        set((state) =>
            produce(state, (draft) => {
                draft.tasks[index].x = x;
            })
        ),
    swapTaskPosition: (index1, index2) =>
        set((state) =>
            produce(state, (draft) => {
                const temp = draft.tasks[index1].x;
                draft.tasks[index1].x = draft.tasks[index2].x;
                draft.tasks[index2].x = temp;
            })
        ),
    setTaskActive: (index, active) =>
        set((state) =>
            produce(state, (draft) => {
                draft.tasks[index].active = active;
            })
        ),
    setWindowId: (index, windowId) =>
        set((state) =>
            produce(state, (draft) => {
                draft.tasks[index].windowId = windowId;
                if (windowId === null) {
                    draft.tasks[index].active = false;
                    draft.tasks[index].isWindow = false;
                }
            })
        ),
}));

const taskWidth = 52, taskGap = 2;

const makeTaskToPosition = (index: number, towardsX: number) => {
    const state = taskManagerStore.getState();
    const currX = state.tasks[index].x;
    if (currX === towardsX) return;

    const list = state.tasks
        .map((task, i) => ({x: task.x, i}))
        .sort((a, b) => a.x - b.x);

    const swapAndShift = (start: number, end: number, shift: number) => {
        for (let i = start; i !== end; i += shift) {
            state.setTaskPosition(list[i].i, i - shift);
        }
    };

    state.swapTaskPosition(list[currX].i, list[towardsX].i);
    if (currX < towardsX) {
        swapAndShift(currX + 1, towardsX + 1, 1);
    } else {
        swapAndShift(currX - 1, towardsX - 1, -1);
    }
};

const defaultLastMouseDownState = {
    index: -1,
    time: -1,
};
let lastMouseDownState = defaultLastMouseDownState;

const onMouseMove = (e: MouseEvent) => {
    const state = taskManagerStore.getState();

    if (state.drag.dragging) {
        lastMouseDownState = defaultLastMouseDownState;
        const icon = document.getElementById('dragging-icon');
        if (!icon) return;
        icon.style.display = 'block';
        icon.style.position = 'absolute';

        const x = e.clientX + 10, y = e.clientY + 20;

        icon.style.left = x + 'px';
        icon.style.top = y + 'px';

        const state = taskManagerStore.getState();
        const index = state.drag.dragging - 1;
        // check x,y in the task manager
        const taskManager = document.querySelector('.task-manager') as HTMLElement;
        if (!taskManager) return;
        const rect = taskManager.getBoundingClientRect();
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
        // check x could be placed
        const leftDis = x - rect.left;
        let towardsX = Math.floor(leftDis / (taskWidth + taskGap));
        if (towardsX >= state.tasks.length) towardsX = state.tasks.length - 1;

        makeTaskToPosition(index, towardsX);
    }
};

const onMouseUp = () => {
    const state = taskManagerStore.getState();
    if (state.drag.dragging) {
        if (lastMouseDownState !== defaultLastMouseDownState) {
            const time = new Date().getTime();
            if (time - lastMouseDownState.time < 200) {
                if (state.drag.dragging === 1) {
                    const event = new Event('clickTaskIcon');
                    const id = state.tasks[lastMouseDownState.index].windowId;
                    if (id) document.getElementById(id)?.dispatchEvent(event);
                }
            }
        }
        lastMouseDownState = defaultLastMouseDownState;
        document.getElementById('dragging-icon')?.remove();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        state.setTaskActive(state.drag.dragging - 1, state.drag.offsetY === 1);
    }
}

// TODO: Add touch event handling
const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let ele = e.target as HTMLElement;
    if (ele.tagName === 'UL') return;
    while (ele.tagName !== 'LI') {
        if (ele.parentElement) ele = ele.parentElement;
    }

    const state = taskManagerStore.getState();

    const x = parseInt(getComputedStyle(ele).getPropertyValue('--x'));
    const index = state.tasks.findIndex((task) => task.x === x);

    // add an icon clone along with the mouse
    const icon = ele.querySelector('span')?.cloneNode(true) as HTMLElement;

    icon.style.display = 'none';
    icon.id = 'dragging-icon';
    document.body.appendChild(icon);

    lastMouseDownState = {
        index,
        time: new Date().getTime(),
    }
    state.drag.startDrag(0, state.tasks[index].active ? 1 : 0, index + 1);
    state.setTaskActive(index, true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}

export const TaskManager = () => {
    const state = taskManagerStore((s) => s);
    useEffect(() => {
        // rearrange pos
        const state = taskManagerStore.getState();
        for (let i = 0; i < state.tasks.length; i++) {
            state.setTaskPosition(i, i);
        }
    }, []);

    return (
        <>
            <ul className={'task-manager'}
                onMouseDown={(e) => onMouseDown(e as unknown as MouseEvent)}
            >
                {state.tasks.map((task, index) => (
                    <li key={index} className={
                        task.active ? 'active' : task.isWindow ? 'inactive' : ''
                    }
                        css={{'--x': task.x}}
                        onMouseEnter={() => state.setTaskTooltipVisible(index, true)}
                        onMouseLeave={() => state.setTaskTooltipVisible(index, false)}
                    >
                        <span css={{
                            display: 'inline-block',
                            height: '32px',
                            width: '32px',
                            verticalAlign: 'middle',
                            backgroundImage: `url(${task.icon})`,
                            backgroundSize: 'cover',
                        }}/>
                        {!task.isWindow && <DescriptionTooltip
                            visible={task.tooltipVisible}
                            title={task.title}
                            description={task.description}
                        />
                        }
                    </li>
                ))}
            </ul>
        </>
    );
}

