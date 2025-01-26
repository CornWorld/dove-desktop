import {createSignal, onMount, onCleanup, createEffect} from "solid-js";

const debug = true;

export interface UseDragOptions {
    allowDrag: boolean;
}

export const useDrag = (
    eventElement: HTMLElement,
    dragNotify: (x: number, y: number) => void,
    options?: UseDragOptions
) => {
    options = options ?? { allowDrag: true };

    const [isDragging, setIsDragging] = createSignal(false);
    const [offset, setOffset] = createSignal({ x: 0, y: 0 });

    const onPointerDown = (event: PointerEvent) => {
        if(!options.allowDrag) {
            if(debug) console.log(`onPointerDown(${eventElement.classList}) dragging not allowed`);
            return;
        }

        setIsDragging(true);
        setOffset({ x: event.clientX, y: event.clientY });
        if(debug) console.log(`onPointerDown x: ${event.clientX}, y: ${event.clientY}`);

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }
    const onPointerMove = (event: PointerEvent) => {
        if (isDragging()) {
            const { x, y } = offset();
            const dx = event.clientX - x;
            const dy = event.clientY - y;

            dragNotify(dx, dy);

            if(debug) console.log(`onPointerMove dx: ${dx}, dy: ${dy}`);
        }
    }
    const onPointerUp = () => {
        setIsDragging(false);
        if(debug) console.log(`onPointerUp(${eventElement.classList}) dragging stopped`);

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

const parseTranslate3d = (str: string) =>
    str.slice('translate3d('.length, -')'.length)
        .split(',')
        .map((s)=> s.endsWith('px') ? s.slice(0, -'px'.length) : s)
        .map(Number);

export const useDragWithLastPos = (
    rootElement: HTMLElement,
    eventElement?: HTMLElement,
    dragNotify = (x:number, y:number)=>{
        rootElement.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    },
    options?: UseDragOptions
)=> {
    if(!eventElement) eventElement = rootElement;

    const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 });
    const dragNotifyWithLastPos = (x: number, y: number) => {
        dragNotify(x + lastPos().x, y + lastPos().y);
    }

    const { isDragging } = useDrag(eventElement, dragNotifyWithLastPos, options);
    createEffect(() => {
        if(isDragging()) {
            const [x, y] = Object.values(parseTranslate3d(rootElement.style.transform));
            setLastPos({x, y});
        }
    })
}
