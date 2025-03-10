import {Component, JSX, createSignal, onMount, onCleanup} from "solid-js";
import {useDrag} from "@/utils/drag";
import {WinState} from "./sys";

interface FrameWindowProps {
    state: WinState;
    children: JSX.Element;
}

// export const FrameWindow: Component<FrameWindowProps> = ({state, children}) => {
//     console.log("awa");
//     return <div>{children}</div>
// }


export const FrameWindow: Component<FrameWindowProps> = ({state, children}) => {
    const [windowRef, setWindowRef] = createSignal<HTMLElement>();
    const [titlebarRef, setTitlebarRef] = createSignal<HTMLElement>();

    onMount(() => {
        windowRef()!.addEventListener('clickTaskIcon', props.store.onClickTaskIcon);
        windowRef()!.addEventListener('dblclick', props.store.onDBClick);

        onCleanup(() => {
            windowRef()!.removeEventListener('clickTaskIcon', props.store.onClickTaskIcon);
            windowRef()!.removeEventListener('dblclick', props.store.onDBClick);
        });

        const [lastPos, setLastPos] = createSignal({x: 0, y: 0});
        const {isDragging} = useDrag(titlebarRef()!, (dx, dy) => {
            const {x: startX, y: startY} = lastPos();
            const {x: newX, y: newY} = rePos(
                props.store,
                startX + dx,
                startY + dy
            );
            props.store.setPos(newX, newY);
        }, {
            allowDrag: () => props.store.status === 'normal'
        });

        createEffect(() => {
            if(isDragging()) {
                setLastPos(untrack(() => ({x: props.store.x, y: props.store.y})));
            }
        });
    });

    return (
        <div
            ref={setWindowRef}
            class="window frame-window"
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
                        style={{"--window-icon": `url(${props.store.icon})`}}
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