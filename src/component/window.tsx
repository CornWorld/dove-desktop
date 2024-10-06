import {create} from "zustand/react";
import {screenStore} from "../screen.tsx";
import {createDragState, DraggableState} from "../utils/drag.ts";
import {CSSProperties, useLayoutEffect} from "react";

interface WindowState {
    title: string;
    description: string;
    icon: string;
    widgetId: string;
    active: boolean;
    height: number;
    width: number;
    x: number;
    y: number;
    z: number;
    setPos: (x: number, y: number) => void;
    drag: DraggableState;
}

const windowStore = create<WindowState>((set) => ({
    title: 'Window 1',
    description: 'Window 1 description',
    icon: '/icons/apps/systemsettings.svg',
    widgetId: 'widget1',
    active: true,
    height: 675, width: 931,
    x: 80, y: 45, z: 3,
    setPos: (x, y) => set({x, y}),
    drag: createDragState(set),
}));

const rePosition = (x: number, y: number) => {
    // check if the window is out of bounds
    const state = windowStore.getState();
    const screen = screenStore.getState().Screen;
    if (x < 0) {
        x = 0;
    } else if (x + state.width > screen.width) {
        x = screen.width - state.width;
    }
    if (y < 0) {
        y = 0;
    } else if (y + state.height > screen.height) {
        y = screen.height - state.height;
    }

    state.setPos(x, y);
}


const onMouseMove = (e: MouseEvent) => {
    const state = windowStore.getState();
    if (state.drag.dragging) {
        const newX = e.clientX - state.drag.offsetX;
        const newY = e.clientY - state.drag.offsetY;

        rePosition(newX, newY);
    }
};

const onMouseUp = () => {
    const s = windowStore.getState();
    if (s.drag.dragging) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        s.drag.stopDrag();
    }
}

const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const state = windowStore.getState();
    state.drag.startDrag(e.clientX - state.x, e.clientY - state.y);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}


export const Window = () => {
    const state = windowStore((s) => s);
    const style = {
        left: state.x + 'px',
        top: state.y + 'px',
        width: state.width + 'px',
        height: state.height + 'px',
        zIndex: state.z,
    };

    useLayoutEffect(() => {
        const state = windowStore.getState();
        rePosition(state.x, state.y);
    }, []);

    return <div className={'window'} style={style}>
        <div className={'headerbar'} onMouseDown={(e) => onMouseDown(e as unknown as MouseEvent)}>
            <div className={'windowcontrols left'}>
                <button className={'window-icon'} style={{'--window-icon': 'url('+state.icon+')'} as CSSProperties} />
                <button className={'pin'} />
            </div>
            <div><label>awa</label></div>
            <div className={'windowcontrols right'}>
                <button className={'minimize'}/>
                <button className={'maximize'}/>
                <button className={'close'}/>
            </div>
        </div>
        <div></div>
    </div>
}