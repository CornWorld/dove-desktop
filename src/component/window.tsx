import {create, StoreApi, UseBoundStore} from "zustand";
import {screenStore} from "../screen.tsx";
import {createDragState, DraggableState} from "../utils/drag.ts";
import {useLayoutEffect} from "react";
import {taskManagerStore} from "../workspace/taskmanager.tsx";

import './window.scss';
import { workspaceStore } from "../workspace/store.tsx";

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
export interface WindowHandler {
    maximize: () => void;
    minimize: () => void;
    close: () => void;
    
    setPos: (x: number, y: number) => void;
    setSize: (width: number, height: number) => void;
    setStatus: (status: string) => void;
    setActive: (a: boolean) => void;
}

export interface WindowStore extends WindowState, WindowHandler {
    onClickTaskIcon: () => void;
    onMouseDown: (e: MouseEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: (e: MouseEvent) => void;
    onDBClick: (e: MouseEvent) => void;

    drag: DraggableState;
}

const rePos = (state: WindowState, x: number, y: number) => {
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

export const createWindowStore = (state: WindowState) => {
    return create<WindowStore>((set, get) => ({
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
            const state = get();
            state.setStatus('maximized');
            const screen = screenStore.getState().Screen;
            state.setPos(0, 0);
            state.setSize(screen.width, screen.height);
        },
        minimize: () => {
            const state = get();
            state.setStatus('minimized');
            state.setPos(0, screenStore.getState().Screen.height + 100);
        },
        close: () => {
            document.getElementById(state.id)?.remove();
            taskManagerStore.getState().setWindowId(0, null);
        },
        onClickTaskIcon: () => {
            const state = get();
            if (state.status === 'minimized' && state.originInfo) {
                state.setStatus('normal');
                state.setPos(state.originInfo.x, state.originInfo.y);
                state.setSize(state.originInfo.width, state.originInfo.height);
            } else if (state.status === 'normal') {
                state.minimize();
            }
        },
        onMouseDown: (e) => {
            const state = get();
            e.preventDefault();
            e.stopPropagation();
            const ele = e.target as HTMLElement;
            if (ele && ele.tagName === 'BUTTON' || ele.tagName === 'INPUT') return;
            state.drag.startDrag(e.clientX - state.x, e.clientY - state.y);
            window.addEventListener('mousemove', state.onMouseMove);
            window.addEventListener('mouseup', state.onMouseUp);
        },
        onMouseMove: (e) => {
            const state = get();
            const newX = e.clientX - state.drag.offsetX;
            const newY = e.clientY - state.drag.offsetY;
            const {x, y} = rePos(state, newX, newY);
            state.setPos(x, y);
        },
        onMouseUp: () => {
            const state = get();
            if (state.drag.dragging) {
                window.removeEventListener('mousemove', state.onMouseMove);
                window.removeEventListener('mouseup', state.onMouseUp);
                state.drag.stopDrag();
            }
        },
        onDBClick: () => {
            const state = get();
            if (state.status === 'maximized' && state.originInfo) {
                state.setStatus('normal');
                state.setPos(state.originInfo.x, state.originInfo.y);
                state.setSize(state.originInfo.width, state.originInfo.height);
            } else {
                state.maximize();
            }
        },
    }));
}

export const CreateWindow = (
    store: UseBoundStore<StoreApi<WindowStore>>,
    customCss: string[] = [],
    content: JSX.Element,
) => {
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
            ele.addEventListener('dblclick', state.onDBClick);
        }
        state.setPos(state.x, state.y);

        return () => {
            if (ele) {
                ele.removeEventListener('clickTaskIcon', state.onClickTaskIcon);
                ele.removeEventListener('dblclick', state.onDBClick);
            }
        }
    }, []);

    return <div className={'window'} style={style} id={state.id}>
        <div className={'titlebar'}
             onMouseDown={(e) => {
                 state.onMouseDown(e as unknown as MouseEvent)
             }}
        >
            <div className={'windowcontrols left'}>
                <button className={'window-icon'}
                        css={{'--window-icon': 'url(' + state.icon + ')'}}/>
                <button className={'pin'}/>
            </div>
            <div><label>{state.title}</label></div>
            <div className={'windowcontrols right'}>
                <button className={'minimize'} onClick={state.minimize}/>
                <button className={'maximize'} onClick={state.maximize}/>
                <button className={'close'} onClick={state.close}/>
            </div>
        </div>
        <div className={['content', ...customCss].join(' ')}>{content}</div>
    </div>
}
