import {create, StoreApi, UseBoundStore} from "zustand";
import {screenStore} from "../screen.tsx";
import {createDragState, DraggableState} from "../utils/drag.ts";
import {useLayoutEffect} from "react";
import {workspaceStore} from "../workspace";
import {taskManagerStore} from "../workspace/taskmanager.tsx";

import './window.scss';

export interface WindowState {
    title: string;
    description: string;
    icon: string;
    id: string;
    active: boolean;
    height: number;
    width: number;
    x: number;
    y: number;
    z: number;
    status: string;
    originInfo?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }
}

export interface WindowStore extends WindowState {
    setPos: (x: number, y: number) => void;
    setSize: (width: number, height: number) => void;
    setStatus: (status: string) => void;
    setActive: (a:boolean) => void;
    
    maximize: () => void;
    minimize: () => void;
    close: () => void;
    onClickTaskIcon: () => void;
    onMouseDown: (e: MouseEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: (e: MouseEvent) => void;
    onDBClick: (e: MouseEvent) => void;

    drag: DraggableState;
}

const rePos = (state:WindowState, x: number, y: number) => {
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
    
    // check window's position. if it's too close to the edge, float the panel
    const workspace = workspaceStore.getState();
    if (screen.height - y - state.height < 44 + 7) {
        workspace.setPanelFloat(false);
    } else {
        workspace.setPanelFloat(true);
    }
    return {x, y};
}

export const useDefaultWindowFunc = (state: WindowState) => {
    const store = create<WindowStore>((set)=>({
        ...state,
        originInfo: {
            x: state.x, y: state.y, width: state.width, height: state.height,
        },
        setPos: (x, y) => set({x, y}),
        setSize: (width, height) => set({width, height}),
        setStatus: (status) => set({status}),
        setActive: (active) => set({active: active}),
        
        drag: createDragState(set),
        maximize: () => {
            const state = store.getState();
            state.setStatus('maximized');
            const screen = screenStore.getState().Screen;
            state.setPos(0, 0);
            state.setSize(screen.width, screen.height);
        },
        minimize: () => {
            const state = store.getState();
            state.setStatus('minimized');
            state.setPos(0, screenStore.getState().Screen.height + 100);
        },
        close: ()=>{
            document.getElementById(state.id)?.remove();
            taskManagerStore.getState().setWindowId(0, null);
        },
        onClickTaskIcon: ()=>{
            const state = store.getState();
            if(state.status === 'minimized' && state.originInfo) {
                state.setStatus('normal');
                state.setPos(state.originInfo.x, state.originInfo.y);
                state.setSize(state.originInfo.width, state.originInfo.height);
            } else if(state.status === 'normal') {
                state.minimize();
            }
        },
        onMouseDown: (e) =>{
            const state = store.getState();
            e.preventDefault();
            e.stopPropagation();
            const ele = e.target as HTMLElement;
            if(ele && ele.tagName==='BUTTON' || ele.tagName==='INPUT') return;
            state.drag.startDrag(e.clientX - state.x, e.clientY - state.y);
            window.addEventListener('mousemove', state.onMouseMove);
            window.addEventListener('mouseup', state.onMouseUp);
        },
        onMouseMove: (e) => {
            const state = store.getState();
            const newX = e.clientX - state.drag.offsetX;
            const newY = e.clientY - state.drag.offsetY;
            const {x, y} = rePos(state, newX, newY);
            store.getState().setPos(x, y);
        },
        onMouseUp: ()=>{
            const state = store.getState();
            if (state.drag.dragging) {
                window.removeEventListener('mousemove', state.onMouseMove);
                window.removeEventListener('mouseup', state.onMouseUp);
                state.drag.stopDrag();
            }
        },
        onDBClick: ()=>{
            const state = store.getState();
            if (state.status === 'maximized' && state.originInfo) {
                state.setStatus('normal');
                state.setPos(state.originInfo.x, state.originInfo.y);
                state.setSize(state.originInfo.width, state.originInfo.height);
            } else {
                state.maximize();
            }
        },
    }));
    return store;
}

// const windowStore = useDefaultWindowFunc({
//     title: 'Window 1',
//     description: 'Window 1 description',
//     icon: '/icons/apps/systemsettings.svg',
//     id: 'widget1',
//     active: true,
//     height: 675, width: 931,
//     x: 80, y: 35, z: 3,
//     status: 'normal',
//     originInfo: {
//         x: 80, y: 45, width: 931, height: 675,
//     },
// });
// const maximize = () => {
//     const state = windowStore.getState();
//     state.setStatus('maximized');
//     const screen = screenStore.getState().Screen;
//     state.setPos(0, 0);
//     state.setSize(screen.width, screen.height);
// }
//
// const rev_maximize = () => {
//     const state = windowStore.getState();
//     if(state.status === 'maximized' && state.originInfo) {
//         state.setStatus('normal');
//         state.setPos(state.originInfo.x, state.originInfo.y);
//         state.setSize(state.originInfo.width, state.originInfo.height);
//     }
// }

// const minimize = () => {
//     const state = windowStore.getState();
//     state.setStatus('minimized');
//     state.setPos(0, screenStore.getState().Screen.height + 100);
// }

// const close = () => {
//     document.getElementById('widget1')?.remove();
//     taskManagerStore.getState().setWindowId(0, null);
// }
//
// const rev_minimize = () => {
//     const state = windowStore.getState();
//     if(state.status === 'minimized' && state.originInfo) {
//         state.setStatus('normal');
//         state.setPos(state.originInfo.x, state.originInfo.y);
//         state.setSize(state.originInfo.width, state.originInfo.height);
//     }
// }
//
// export const onClickTaskIcon = () => {
//     const state = windowStore.getState();
//     if(state.status === 'minimized') {
//         rev_minimize();
//     } else if(state.status === 'normal') {
//         minimize();
//     }
// }
//
// const onDBClick = () => {
//     const state = windowStore.getState();
//     if (state.status === 'maximized') {
//         rev_maximize();
//     } else {
//         maximize();
//     }
// }

// const rePosition = (x: number, y: number) => {
//     // check if the window is out of bounds
//     const state = windowStore.getState();
//     state.setPos(x, y);
// }

// const defaultLastMouseDownState = {index: -1, time: 0};
// let lastMouseDownState = defaultLastMouseDownState;
//
// const onMouseMove = (e: MouseEvent) => {
//     const state = windowStore.getState();
//     if (state.drag.dragging) {
//         const newX = e.clientX - state.drag.offsetX;
//         const newY = e.clientY - state.drag.offsetY;
//         lastMouseDownState = defaultLastMouseDownState;
//         rePosition(newX, newY);
//     }
// };
//
// const onMouseUp = () => {
//     const s = windowStore.getState();
//     if (s.drag.dragging) {
//         window.removeEventListener('mousemove', onMouseMove);
//         window.removeEventListener('mouseup', onMouseUp);
//         s.drag.stopDrag();
//     }
// }

// const onMouseDown = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const ele = e.target as HTMLElement;
//     if(ele && ele.tagName==='BUTTON' || ele.tagName==='INPUT') return;
//     if(lastMouseDownState !== defaultLastMouseDownState) {
//         const time = new Date().getTime();
//         if (time - lastMouseDownState.time < 200) {
//             if(windowStore.getState().drag.dragging === 1) onDBClick();
//         }
//     }
//     lastMouseDownState = {index: -1, time: new Date().getTime()};
//     const state = windowStore.getState();
//     state.drag.startDrag(e.clientX - state.x, e.clientY - state.y);
//     window.addEventListener('mousemove', onMouseMove);
//     window.addEventListener('mouseup', onMouseUp);
// }

export const createWindow = (
    store: UseBoundStore<StoreApi<WindowStore>>,
    customCss: string[] = [],
    content: JSX.Element,
    ) =>{
    const state = store((s) => s);
    const style = {
        left: state.x + 'px',
        top: state.y + 'px',
        width: state.width + 'px',
        height: state.height + 'px',
        zIndex: state.z,
    };
    useLayoutEffect(() => {
        const ele = document.getElementById(state.id);
        if (ele) {
            ele.addEventListener('clickTaskIcon', state.onClickTaskIcon);
            // ele.addEventListener('mousedown', state.onMouseDown);
            // ele.addEventListener('dblclick', state.onDBClick);
        }
        state.setPos(state.x, state.y);
    }, []);

    return <div className={'window'} style={style} id={state.id}>
        <div className={'titlebar'}
             onMouseDown={(e) => {
                 state.onMouseDown(e as unknown as MouseEvent)}
             }
        >
            <div className={'windowcontrols left'}>
                <button className={'window-icon'}
                        css={{'--window-icon': 'url(' + state.icon + ')'}} />
                <button className={'pin'} />
            </div>
            <div><label>{state.title}</label></div>
            <div className={'windowcontrols right'}>
                <button className={'minimize'} onClick={state.minimize} />
                <button className={'maximize'} onClick={state.maximize} />
                <button className={'close'} onClick={state.close} />
            </div>
        </div>
        <div className={['content', ...customCss].join(' ')}>{content}</div>
    </div>
}

// export const Window = () => {
//     const state = windowStore((s) => s);
//     const style = {
//         left: state.x + 'px',
//         top: state.y + 'px',
//         width: state.width + 'px',
//         height: state.height + 'px',
//         zIndex: state.z,
//     };
//
//     useLayoutEffect(() => {
//         state.setPos(state.x, state.y);
//     }, []);
//
//
//     return <div className={'window system-control'} style={style} id={'widget1'}>
//         <div className={'titlebar'} onMouseDown={(e) => state.onMouseDown(e as unknown as MouseEvent)}>
//             <div className={'windowcontrols left'}>
//                 <button className={'window-icon'}
//                         style={{'--window-icon': 'url(' + state.icon + ')'} as CSSProperties}/>
//                 <button className={'pin'}/>
//             </div>
//             <div><label>Quick Settings — System Settings</label></div>
//             <div className={'windowcontrols right'}>
//                 <button className={'minimize'} onClick={state.minimize}/>
//                 <button className={'maximize'} onClick={state.maximize}/>
//                 <button className={'close'} onClick={state.close}/>
//             </div>
//         </div>
//
//     </div>
// }