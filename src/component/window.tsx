import {create} from "zustand/react";
import {screenStore} from "../screen.tsx";
import {createDragState, DraggableState} from "../utils/drag.ts";

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
    setPos: (x: number, y: number) => void;
    drag: DraggableState;
}

const windowStore = create<WindowState>((set) => ({
    title: 'Window 1',
    description: 'Window 1 description',
    icon: '/assets/breeze-icons/icons/apps/16/anydesk.svg',
    widgetId: 'widget1',
    active: true,
    height: 300, width: 200,
    x: 500, y: 300,
    setPos: (x, y) => set({ x, y }),
    drag: createDragState(set),
}));

export const Window = () => {
    const state = windowStore((s)=>s);
    const style = {
        left: state.x+'px',
        top: state.y+'px',
        width: state.width+'px',
        height: state.height+'px',
    };

    const onMouseMove = (e:MouseEvent) => {
        const state = windowStore.getState();
        if(state.drag.dragging) {
            let newX = e.clientX - state.drag.offsetX;
            let newY = e.clientY - state.drag.offsetY;

            // check if the window is out of bounds
            const screen = screenStore.getState().Screen;
            if(newX < 0) {
                newX = 0;
            } else if(newX + state.width > screen.width) {
                newX = screen.width - state.width;
            }
            if (newY < 0) {
                newY = 0;
            } else if (newY + state.height > screen.height) {
                newY = screen.height - state.height;
            }

            state.setPos(newX, newY);
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

    const onMouseDown = (e:MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const state = windowStore.getState();
        state.drag.startDrag(e.clientX - state.x, e.clientY - state.y);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    return <div className={'window'} style={style}>
        <div className={'headerbar'} onMouseDown={(e)=>onMouseDown(e as unknown as MouseEvent)}>
            <div className={'windowcontrols left'}></div>
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