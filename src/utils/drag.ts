export interface DraggableState {
    offsetX: number;
    offsetY: number;
    dragging: number;
    startDrag: (offsetX: number, offsetY: number, dragging?: number) => void;
    stopDrag: (dragging?: number) => void;
}

export const createDragState = (setFunc: any): DraggableState => ({
    offsetX: 0, offsetY: 0,
    dragging: 0,
    startDrag: (offsetX, offsetY, dragging?: number) => setFunc((state: any) => ({
        drag: {...state.drag, offsetX, offsetY, dragging: dragging ?? 1}
    })),
    stopDrag: () => setFunc((state: any) => ({
        drag: {...state.drag, offsetX: 0, offsetY: 0, dragging: 0}
    }))
});