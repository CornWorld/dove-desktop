import {createSignal, onMount, onCleanup, createEffect} from "solid-js";

const debug = true;


export const useDrag = (
    eventElement: HTMLElement,
    dragNotify: (x: number, y: number) => void
) => {

    const [isDragging, setIsDragging] = createSignal(false);
    const [offset, setOffset] = createSignal({ x: 0, y: 0 });

    const onPointerDown = (event: PointerEvent) => {
        setIsDragging(true);
        setOffset({ x: event.clientX, y: event.clientY });
        if(debug) console.log(`x: ${event.clientX}, y: ${event.clientY}`);
    }
    const onPointerMove = (event: PointerEvent) => {
        if (isDragging()) {
            const { x, y } = offset();
            const dx = event.clientX - x;
            const dy = event.clientY - y;

            dragNotify(dx, dy);

            if(debug) console.log(`dx: ${dx}, dy: ${dy}`);
        }
    }
    const onPointerUp = () => {
        setIsDragging(false);
        if(debug) console.log('dragging stopped');
    }

    onMount(() => {
        eventElement.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
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
    }
)=> {
    if(!eventElement) eventElement = rootElement;

    const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 });
    const dragNotifyWithLastPos = (x: number, y: number) => {
        dragNotify(x + lastPos().x, y + lastPos().y);
    }

    const { isDragging } = useDrag(eventElement, dragNotifyWithLastPos);
    createEffect(() => {
        if(isDragging()) {
            const [x, y] = Object.values(parseTranslate3d(rootElement.style.transform));
            setLastPos({x, y});
        }
    })
}
