import { createStore, produce } from "solid-js/store";
import {onMount, onCleanup, Component, JSX, createSignal, createEffect} from "solid-js";
import { displayState } from "@/display";
import {useDrag, useDragWithLastPos} from "@/utils/drag";
import { setWorkspaceState } from "@/workspace/store";
import { setTaskWindowId } from "@/workspace/taskmanager";

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
    onDBClick: (e: MouseEvent) => void;
}

const rePos = (state: WindowState, x: number, y: number) => {
    const screen = displayState;
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
    if (screen.height - y - state.height < 44 + 7) {
        setWorkspaceState('panelFloat', false);
    } else {
        setWorkspaceState('panelFloat', true);
    }
    return {x, y};
};

export const createWindowStore = (initialState: WindowState) => {
    const [state, setState] = createStore<WindowStore>({
        ...initialState,
        originInfo: {
            x: initialState.x,
            y: initialState.y,
            width: initialState.width,
            height: initialState.height,
        },
        setPos: (x: number, y: number) => setState(produce((s) => { s.x = x; s.y = y; })),
        setSize: (width: number, height: number) => setState(produce((s) => { s.width = width; s.height = height; })),
        setStatus: (status: string) => setState(produce((s) => { s.status = status; })),
        setActive: (active: boolean) => setState(produce((s) => { s.active = active; })),
        maximize: () => {
            setState(produce((s) => {
                s.status = 'maximized';
                s.x = 0;
                s.y = 0;
                s.width = displayState.width;
                s.height = displayState.height;
            }));
        },
        minimize: () => {
            setState(produce((s) => {
                s.status = 'minimized';
                s.x = 0;
                s.y = displayState.height + 100;
            }));
        },
        close: () => {
            document.getElementById(state.id)?.remove();
            setTaskWindowId(0, null);
        },
        onClickTaskIcon: () => {
            if (state.status === 'minimized' && state.originInfo) {
                setState(produce((s) => {
                    s.status = 'normal';
                    s.x = state.originInfo!.x;
                    s.y = state.originInfo!.y;
                    s.width = state.originInfo!.width;
                    s.height = state.originInfo!.height;
                }));
            } else if (state.status === 'normal') {
                state.minimize();
            }
        },
        onDBClick: () => {
            if (state.status === 'maximized' && state.originInfo) {
                setState(produce((s) => {
                    s.status = 'normal';
                    s.x = state.originInfo!.x;
                    s.y = state.originInfo!.y;
                    s.width = state.originInfo!.width;
                    s.height = state.originInfo!.height;
                }));
            } else {
                state.maximize();
            }
        },
    });

    return [state, setState] as const;
};

interface WindowProps {
    store: ReturnType<typeof createWindowStore>[0];
    customCss?: string[];
    children: JSX.Element;
}

export const Window: Component<WindowProps> = (props) => {
    const [windowRef, setWindowRef] = createSignal<HTMLElement>();
    const [titlebarRef, setTitlebarRef] = createSignal<HTMLElement>();

    onMount(() => {
        const ele = document.getElementById(props.store.id);
        if (ele) {
            ele.addEventListener('clickTaskIcon', props.store.onClickTaskIcon);
            ele.addEventListener('dblclick', props.store.onDBClick);
        }
        props.store.setPos(props.store.x, props.store.y);

        onCleanup(() => {
            if (ele) {
                ele.removeEventListener('clickTaskIcon', props.store.onClickTaskIcon);
                ele.removeEventListener('dblclick', props.store.onDBClick);
            }
        });

        createEffect(() => {
            useDragWithLastPos(windowRef()!, titlebarRef()!, (x, y) => {
                const {x: newX, y: newY} = rePos(props.store, x, y);
                props.store.setPos(newX, newY);
            }, {
                allowDrag: props.store.status === 'normal'
            });
        });
    });

    return (
        <div
            ref={setWindowRef}
            class="window" 
            style={{
                transform: `translate3d(${props.store.x}px, ${props.store.y}px, 0)`,
                width: `${props.store.width}px`,
                height: `${props.store.height}px`,
                "z-index": props.store.z,
                "pointer-events": props.store.status === 'minimized' ? 'none' : 'auto',
                visibility: props.store.status === 'minimized' ? 'hidden' : 'visible'
            }} 
            id={props.store.id}
        >
            <div 
                class="titlebar"
                ref={setTitlebarRef}
            >
                <div class="windowcontrols left">
                    <button 
                        class="window-icon"
                        style={{ "--window-icon": `url(${props.store.icon})` }}
                    />
                    <button class="pin"/>
                </div>
                <div><label>{props.store.title}</label></div>
                <div class="windowcontrols right">
                    <button class="minimize" onClick={() => props.store.minimize()}/>
                    <button class="maximize" onClick={() => props.store.maximize()}/>
                    <button class="close" onClick={() => props.store.close()}/>
                </div>
            </div>
            <div class={['content', ...(props.customCss || [])].join(' ')}>
                {props.children}
            </div>
        </div>
    );
};
