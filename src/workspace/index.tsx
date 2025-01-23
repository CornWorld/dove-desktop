import {useEffect} from "react";
import {displayStore} from "../display.tsx";
import {TaskManager} from "./taskmanager.tsx";
import {AppLauncher} from "./app-launcher.tsx";
import {DigitalClock} from "./digital-clock.tsx";
import './index.scss';
import {workspaceStore} from "./store.tsx";
import {_Icon, IconHeight, IconMargin, IconWidth, placeIcon} from "./icon.tsx";


const onMouseMove = (e: MouseEvent) => {
    const state = workspaceStore.getState();

    if (state.drag.dragging) {
        const index = state.drag.dragging - 1;
        let newX = e.clientX - state.drag.offsetX;
        let newY = e.clientY - state.drag.offsetY;

        state.selectIcon(index, true);

        // check if the icon is out of bounds
        const screen = displayStore.getState().Display;
        if (newX < 0) {
            newX = 0;
        } else if (newX + IconWidth > screen.width) {
            newX = screen.width - IconWidth;
        }
        if (newY < 0) {
            newY = 0;
        } else if (newY + IconHeight > screen.height - 44) {
            newY = screen.height - IconHeight - 44;
        }

        state.setIconPos(index, newX, newY);
    }
};
const onMouseUp = () => {
    const state = workspaceStore.getState();
    if (state.drag.dragging) {
        const index = state.drag.dragging - 1;
        const {x, y} = state.icons[index];

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        state.drag.stopDrag();

        placeIcon(index, x, y);
    }
}
const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // get the icon index
    const dataIndex = (e.target as HTMLElement).getAttribute('data-index');
    if (dataIndex === null) {
        workspaceStore.getState().cancelSelection();
    } else {
        const dragging = parseInt(dataIndex) + 1;
        const state = workspaceStore.getState();

        state.selectIcon(dragging - 1);
        const {x, y} = state.icons[dragging - 1];
        state.drag.startDrag(e.clientX - x, e.clientY - y, dragging);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
}

export const Workspace = () => {
    const state = workspaceStore((s) => s);
    useEffect(() => {
        const state = workspaceStore.getState();
        const screen = displayStore.getState().Display;
        for (let i = 1; i < state.icons.length; i++) {
            let newX = state.icons[i - 1].x, newY = state.icons[i - 1].y + 93 + IconMargin
            let col = state.icons[i - 1].col, row = state.icons[i - 1].row + 1;
            if (newY + IconHeight > screen.height - 44) {
                if (newX + IconWidth > screen.width) {
                    // TODO: add a more icon to the workspace
                } else {
                    newX += IconWidth + IconMargin;
                    newY = 0;
                    col += 1;
                    row = 0;
                }
            }
            state.setIconPos(i, newX, newY);
            state.setGridPos(i, col, row);
        }
    }, []);

    return <>
        <div className={'panel' + (state.panelFloat ? ' float' : '')}>
            <AppLauncher/>
            <TaskManager/>
            <DigitalClock/>
        </div>
        <div css={{
            width: '100%',
            height: 'calc(100% - 44px)',
            position: 'absolute',
            userSelect: 'none',
            zIndex: 1,
        }} onMouseDown={(e) => onMouseDown(e as unknown as MouseEvent)}>
            {state.icons.map((icon, index) => (
                <_Icon key={index} index={index} icon={icon} isDragging={state.drag.dragging - 1 === index}/>
            ))}
        </div>
    </>

}