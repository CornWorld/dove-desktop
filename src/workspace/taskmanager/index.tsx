import {create} from "zustand/react";
import './index.scss';
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import {DescriptionTooltip, Tooltip} from "../../component/tooltip.tsx";
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

    return (<div className={'panel'}>
        <AppLauncher/>
        <ul className={'task-manager'}>
            {state.tasks.map((task, index) => (
                <li key={index} className={
                    task.active ? 'active' : task.isWindow ? 'inactive': ''
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
        </ul>
        <DigitalClock/>
    </div>);
}

const AppLauncher = () => {
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    return (
        <div className={'app-launcher'}
             onMouseEnter={() => setTooltipVisible(true)}
             onMouseLeave={() => setTooltipVisible(false)}
        >
            <span className={'window-icon icon-app-launcher'}/>
            <DescriptionTooltip visible={tooltipVisible} title={'Application Launcher'}
                                description={'Launcher to start applications'}/>
        </div>
    );
}

const DigitalClock = () => {
    const [clock, setClock] = useState<string>('');
    const [tooltipClock, setTooltipClock] = useState<string>('');
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

    const genEffect = (str: string, setClock: (str: string) => void, refresh = false) => {
        return () => {
            setClock(dayjs().format(str));
            if (!refresh) return;
            const interval = setInterval(() => {
                setClock(dayjs().format(str));
            }, 100);
            return () => {
                clearInterval(interval)
            };
        };
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(genEffect('HH:mm:ss\nYYYY/MM/DD', setClock, true), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(genEffect('dddd\n[UTC]Z HH:mm:ss\nYYYY-MM-DD', setTooltipClock, tooltipVisible), [tooltipVisible]);

    return (
        <>
            <div className={'digital-clock'}
                 onMouseEnter={() => setTooltipVisible(true)}
                 onMouseLeave={() => setTooltipVisible(false)}
            >
                {clock.split('\n').map((line, index) => (
                    <span key={index}>{line}</span>
                ))}
                <Tooltip
                    visible={tooltipVisible}>
                    <div className={'digital-clock-tooltip'}>
                        {tooltipClock.split('\n').map((line, index) => (
                            <span key={index}>{line}</span>
                        ))}
                    </div>
                </Tooltip>
            </div>
        </>
    );
}