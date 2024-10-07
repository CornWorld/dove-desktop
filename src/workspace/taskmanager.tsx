import {create} from "zustand/react";
import {DescriptionTooltip} from "../component/tooltip.tsx";
import {produce} from "immer";

interface Task {
    title: string;
    description: string;
    icon: string;
    isWindow: boolean;
    widgetId: string | null;
    active: boolean;
    tooltipVisible: boolean;
}

interface TaskManagerState {
    tasks: Task[],
    setTaskTooltipVisible: (index: number, visible: boolean) => void;
}

const useTaskManagerStore = create<TaskManagerState>((set) => ({
    tasks: [{
        title: 'System Settings',
        description: 'Configuration tools for your computer',
        icon: '/icons/apps/systemsettings.svg',
        widgetId: 'widget1',
        isWindow: true,
        active: true,
        tooltipVisible: false,
    }, {
        title: 'Ark',
        description: 'Achieving Tool',
        icon: '/icons/apps/ark.svg',
        widgetId: 'widget2',
        isWindow: true,
        active: false,
        tooltipVisible: false,
    }, {
        title: 'Kate',
        description: 'Advanced Text Editor',
        icon: '/icons/apps/kate.svg',
        isWindow: false,
        widgetId: null,
        active: false,
        tooltipVisible: false,
    }],
    setTaskTooltipVisible: (index, visible) =>
        set((state) =>
            produce(state, (draft) => {
                draft.tasks[index].tooltipVisible = visible;
            })
        ),
}));

export const TaskManager = () => {
    const state = useTaskManagerStore();

    return (
        <ul className={'task-manager'}>
            {state.tasks.map((task, index) => (
                <li key={index} className={
                    task.active ? 'active' : task.isWindow ? 'inactive' : ''
                }
                    onMouseEnter={() => state.setTaskTooltipVisible(index, true)}
                    onMouseLeave={() => state.setTaskTooltipVisible(index, false)}
                >
                    <img alt={task.title} src={task.icon} css={{
                        display: 'inline-block',
                        height: '32px',
                        width: '32px',
                        verticalAlign: 'middle',
                    }}/>
                    {!task.isWindow && <DescriptionTooltip
                        visible={task.tooltipVisible}
                        title={task.title}
                        description={task.description}
                    />
                    }
                </li>
            ))}
        </ul>);
}

