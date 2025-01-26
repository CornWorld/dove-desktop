import {displayState} from "../display";
import {TaskManager} from "./taskmanager";
import {AppLauncher} from "./app-launcher";
import {DigitalClock} from "./digital-clock";
import './index.scss';
import {workspaceState, setWorkspaceState} from "./store";
import {Icon, IconHeight, IconMargin, IconWidth, placeIcon} from "./icon";
import { For } from "solid-js";
import { onMount } from "solid-js";

const onMouseMove = (e: MouseEvent) => {
    if (workspaceState.iconDrag.dragging) {
        const index = workspaceState.iconDrag.dragging - 1;
        let newX = e.clientX - workspaceState.iconDrag.offsetX;
        let newY = e.clientY - workspaceState.iconDrag.offsetY;

        workspaceState.selectIcon(index, true);

        // check if the icon is out of bounds
        if (newX < 0) {
            newX = 0;
        } else if (newX + IconWidth > displayState.width) {
            newX = displayState.width - IconWidth;
        }
        if (newY < 0) {
            newY = 0;
        } else if (newY + IconHeight > displayState.height - 44) {
            newY = displayState.height - IconHeight - 44;
        }

        workspaceState.setIconPos(index, newX, newY);
    }
};

const onMouseUp = () => {
    if (workspaceState.iconDrag.dragging) {
        const index = workspaceState.iconDrag.dragging - 1;
        const {x, y} = workspaceState.icons[index];

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        setWorkspaceState('iconDrag', {
            offsetX: 0,
            offsetY: 0,
            dragging: 0
        });
        placeIcon(index, x, y);
    }
};

const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // get the icon index
    const dataIndex = (e.target as HTMLElement).getAttribute('data-index');
    if (dataIndex === null) {
        workspaceState.cancelSelection();
    } else {
        const dragging = parseInt(dataIndex) + 1;
        const index = dragging - 1;
        const icon = workspaceState.icons[index];

        workspaceState.selectIcon(index, true);

        setWorkspaceState('iconDrag', {
            offsetX: e.clientX - icon.x,
            offsetY: e.clientY - icon.y,
            dragging
        });
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
};

export const Workspace = () => {
    onMount(() => {
        const display = document.getElementById('display');
        if (!display) return;

        const rect = display.getBoundingClientRect();
        const maxCol = Math.floor(rect.width / (IconWidth + IconMargin));
        const maxRow = Math.floor((rect.height - 44) / (IconHeight + IconMargin));

        workspaceState.icons.forEach((_, i) => {
            const col = i % maxCol;
            const row = Math.floor(i / maxCol);
            if (row >= maxRow) return;
            placeIcon(i, col * (IconWidth + IconMargin), row * (IconHeight + IconMargin));
        });
    });

    return (
        <>
            <div class={`panel${workspaceState.panelFloat ? ' float' : ''}`}>
                <AppLauncher/>
                <TaskManager/>
                <DigitalClock/>
            </div>
            <div style={{
                width: '100%',
                height: 'calc(100% - 44px)',
                position: 'absolute',
                "user-select": 'none',
                "z-index": 1,
                "pointer-events": "all"
            }} onMouseDown={onMouseDown}>
                <For each={workspaceState.icons}>
                    {(icon, index) => (
                        <Icon 
                            icon={icon} 
                            index={index()} 
                            isDragging={workspaceState.iconDrag.dragging === index() + 1}
                        />
                    )}
                </For>
            </div>
        </>
    );
}