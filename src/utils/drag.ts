import { SetStoreFunction } from "solid-js/store";

export interface DragState {
    offsetX: number;
    offsetY: number;
    dragging: number;
}

interface DragStore {
    drag: DragState;
}

export const createDragState = (setState: SetStoreFunction<DragStore>) => {
    const state: DragState = {
        offsetX: 0,
        offsetY: 0,
        dragging: 0
    };

    return {
        ...state,
        startDrag(offsetX: number, offsetY: number, dragging: number = 1) {
            setState('drag', {
                offsetX,
                offsetY,
                dragging
            });
        },
        stopDrag() {
            setState('drag', {
                offsetX: 0,
                offsetY: 0,
                dragging: 0
            });
        }
    };
};