import { createStore, produce } from "solid-js/store";
import { onMount, For } from "solid-js";
import { DescriptionTooltip } from "@/component/tooltip";
import { DragState } from "@/utils/drag";

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
    tasks: Task[];
    drag: DragState;
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

const emptyDragState: DragState = {
    offsetX: 0,
    offsetY: 0,
    dragging: 0
};

const [taskState, setTaskState] = createStore<TaskManagerState>({
    tasks: initialTasks,
    drag: emptyDragState
});

export { taskState, setTaskState };

export const setTaskWindowId = (index: number, windowId: string | null) => {
    setTaskState('tasks', index, produce((task) => {
        task.windowId = windowId;
        if (windowId === null) {
            task.active = false;
            task.isWindow = false;
        }
    }));
};

const setTaskTooltipVisible = (index: number, visible: boolean) => {
    setTaskState('tasks', index, produce((task) => {
        task.tooltipVisible = visible;
    }));
};

const setTaskPosition = (index: number, x: number) => {
    setTaskState('tasks', index, produce((task) => {
        task.x = x;
    }));
};

const swapTaskPosition = (index1: number, index2: number) => {
    setTaskState('tasks', produce((tasks) => {
        const temp = tasks[index1].x;
        tasks[index1].x = tasks[index2].x;
        tasks[index2].x = temp;
    }));
};

const setTaskActive = (index: number, active: boolean) => {
    setTaskState('tasks', index, produce((task) => {
        task.active = active;
    }));
};

const taskWidth = 52, taskGap = 2;

const makeTaskToPosition = (index: number, towardsX: number) => {
    const currX = taskState.tasks[index].x;
    if (currX === towardsX) return;

    const list = taskState.tasks
        .map((task, i) => ({x: task.x, i}))
        .sort((a, b) => a.x - b.x);

    const swapAndShift = (start: number, end: number, shift: number) => {
        for (let i = start; i !== end; i += shift) {
            setTaskPosition(list[i].i, i - shift);
        }
    };

    swapTaskPosition(list[currX].i, list[towardsX].i);
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
    if (taskState.drag.dragging) {
        lastMouseDownState = defaultLastMouseDownState;
        const icon = document.getElementById('dragging-icon');
        if (!icon) return;
        icon.style.display = 'block';
        icon.style.position = 'absolute';

        const x = e.clientX + 10, y = e.clientY + 20;

        icon.style.left = x + 'px';
        icon.style.top = y + 'px';

        const index = taskState.drag.dragging - 1;
        // check x,y in the task manager
        const taskManager = document.querySelector('.task-manager') as HTMLElement;
        if (!taskManager) return;
        const rect = taskManager.getBoundingClientRect();
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
        // check x could be placed
        const leftDis = x - rect.left;
        let towardsX = Math.floor(leftDis / (taskWidth + taskGap));
        if (towardsX >= taskState.tasks.length) towardsX = taskState.tasks.length - 1;

        makeTaskToPosition(index, towardsX);
    }
};

const onMouseUp = () => {
    if (taskState.drag.dragging) {
        const index = taskState.drag.dragging - 1;
        const task = taskState.tasks[index];
        
        if (lastMouseDownState !== defaultLastMouseDownState) {
            const time = new Date().getTime();
            if (time - lastMouseDownState.time < 200) {
                if (task.windowId) {
                    const event = new Event('clickTaskIcon');
                    document.getElementById(task.windowId)?.dispatchEvent(event);
                }
            }
        }
        lastMouseDownState = defaultLastMouseDownState;
        document.getElementById('dragging-icon')?.remove();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        
        // Keep task active if it's a window and was previously active
        setTaskActive(index, task.isWindow && task.active);
        setTaskState('drag', emptyDragState);
    }
};

const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let ele = e.target as HTMLElement;
    if (ele.tagName === 'UL') return;
    while (ele.tagName !== 'LI') {
        if (ele.parentElement) ele = ele.parentElement;
    }

    const x = parseInt(getComputedStyle(ele).getPropertyValue('--x'));
    const index = taskState.tasks.findIndex((task) => task.x === x);

    // add an icon clone along with the mouse
    const icon = ele.querySelector('span')?.cloneNode(true) as HTMLElement;

    icon.style.display = 'none';
    icon.id = 'dragging-icon';
    document.body.appendChild(icon);

    lastMouseDownState = {
        index,
        time: new Date().getTime(),
    };
    
    setTaskState('drag', {
        offsetX: 0,
        offsetY: taskState.tasks[index].active ? 1 : 0,
        dragging: index + 1
    });
    
    setTaskActive(index, true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
};

export const TaskManager = () => {
    onMount(() => {
        // rearrange pos
        for (let i = 0; i < taskState.tasks.length; i++) {
            setTaskPosition(i, i);
        }
    });

    return (
        <ul class="task-manager"
            onMouseDown={(e) => onMouseDown(e)}
        >
            <For each={taskState.tasks}>
                {(task, index) => (
                    <li class={task.active ? 'active' : task.isWindow ? 'inactive' : ''}
                        style={{ "--x": task.x }}
                        onMouseEnter={() => setTaskTooltipVisible(index(), true)}
                        onMouseLeave={() => setTaskTooltipVisible(index(), false)}
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

