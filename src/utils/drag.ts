import {createSignal, onMount, onCleanup, createEffect, Accessor} from "solid-js";

const debug = true;

export interface UseDragOptions {
    allowDrag: boolean | (() => boolean);
    delay?: number; // px. default 0. circle radius to start dragging

}

export const useDrag = (
    eventElement: HTMLElement,
    dragNotify: (x: number, y: number) => void,
    options?: UseDragOptions
) => {

    options ??= { allowDrag: true };

    const [isPointerDown, setPointerDown] = createSignal(false);
    const [isDragging, setIsDragging] = createSignal(false);
    const [offset, setOffset] = createSignal({ x: 0, y: 0 });

    const allowDrag = () => {
        if (typeof options.allowDrag === 'function') {
            return options.allowDrag();
        } else {
            return options.allowDrag;
            }
    }

    const onPointerDown = (event: PointerEvent) => {
        setPointerDown(true);
        setOffset({ x: event.clientX, y: event.clientY });

        if(debug) {
            console.group(`onPointerDown(${eventElement.classList})`);
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }
    const onPointerMove = (event: PointerEvent) => {
        if(!isPointerDown()) return;
        if(!isDragging()) {
            options.delay ??= 0;
            if (Math.abs(event.clientX - offset().x) > options.delay
                || Math.abs(event.clientY - offset().y) > options.delay) {
                if(allowDrag()) {
                    setIsDragging(true);
                    if(debug) console.log(`onPointerMove(${eventElement.classList}) dragging started`);
                }
            }
        }

        const { x, y } = offset();
        const dx = event.clientX - x;
        const dy = event.clientY - y;


        dragNotify(dx, dy);

        if(debug) console.log(`onPointerMove(${eventElement.classList}) dx: ${dx}, dy: ${dy}`);
    }
    const onPointerUp = () => {
        setIsDragging(false);
        if(debug) console.groupEnd();

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    }

    onMount(() => {
        eventElement.addEventListener('pointerdown', onPointerDown);
    });

    onCleanup(() => {
        eventElement.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    });

    return { isDragging };
}
