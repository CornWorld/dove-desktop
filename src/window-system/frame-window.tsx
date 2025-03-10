import {Component, JSX, createSignal, onMount, onCleanup, createEffect, untrack} from "solid-js";
import {useDrag} from "@/utils/drag";
import {WinState, ws} from "./sys";

interface FrameWindowProps {
    winId: number;
    children: JSX.Element;
    customCss?: string[];
}

// export const FrameWindow: Component<FrameWindowProps> = ({state, children}) => {
//     console.log("awa");
//     return <div>{children}</div>
// }


export const FrameWindow: Component<FrameWindowProps> = (props) => {
    const [windowRef, setWindowRef] = createSignal<HTMLElement>();
    const [titlebarRef, setTitlebarRef] = createSignal<HTMLElement>();

    onMount(() => {
        const win = ws.wins[ws.idMap.get(props.winId)!];
        
        const handleMinimize = () => {
            ws.unmappingWindow(props.winId);
        };

        const handleMaximize = () => {
            // TODO: Get display dimensions from context
            ws.configureWindow(props.winId, {
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        const handleClose = () => {
            ws.destroyWindow(props.winId);
        };

        windowRef()!.addEventListener('minimize', handleMinimize);
        windowRef()!.addEventListener('maximize', handleMaximize);
        windowRef()!.addEventListener('close', handleClose);

        onCleanup(() => {
            windowRef()!.removeEventListener('minimize', handleMinimize);
            windowRef()!.removeEventListener('maximize', handleMaximize);
            windowRef()!.removeEventListener('close', handleClose);
        });

        const [lastPos, setLastPos] = createSignal({x: win.x, y: win.y});
        const {isDragging} = useDrag(titlebarRef()!, (dx, dy) => {
            const {x: startX, y: startY} = lastPos();
            // TODO: Add bounds checking
            ws.configureWindow(props.winId, {
                x: startX + dx,
                y: startY + dy
            });
        });

        createEffect(() => {
            if(isDragging()) {
                const win = ws.wins[ws.idMap.get(props.winId)!];
                setLastPos(untrack(() => ({x: win.x, y: win.y})));
            }
        });
    });

    const win = () => ws.wins[ws.idMap.get(props.winId)!];

    return (
        <div
            ref={setWindowRef}
            class="window frame-window"
            style={{
                transform: `translate3d(${win().x}px, ${win().y}px, 0)`,
                width: `${win().width}px`,
                height: `${win().height}px`,
                visibility: win().mapped ? 'visible' : 'hidden'
            }}
        >
            <div
                class="titlebar"
                ref={setTitlebarRef}
            >
                <div class="windowcontrols left">
                    <button class="window-icon"/>
                    <button class="pin"/>
                </div>
                <div><label>Window {props.winId}</label></div>
                <div class="windowcontrols right">
                    <button class="minimize" onClick={() => windowRef()!.dispatchEvent(new Event('minimize'))}/>
                    <button class="maximize" onClick={() => windowRef()!.dispatchEvent(new Event('maximize'))}/>
                    <button class="close" onClick={() => windowRef()!.dispatchEvent(new Event('close'))}/>
                </div>
            </div>
            <div class={['content', ...(props.customCss || [])].join(' ')}>
                {props.children}
            </div>
        </div>
    );
};