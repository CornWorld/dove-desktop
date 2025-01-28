import {displayStore} from "@/display";
import {TaskManager} from "@/workspace/taskmanager";
import {AppLauncher} from "@/workspace/app-launcher";
import {DigitalClock} from "@/workspace/digital-clock";
import './index.scss';
import {workspaceStore, iconStore} from "@/workspace/store";
import {Icon, IconHeight, IconMargin, IconWidth, makePos, placeIcon} from "@/workspace/icon";
import { For } from "solid-js";
import { onMount } from "solid-js";
import {exampleDesktopFiles} from "@/utils/files";

// const onMouseMove = (e: MouseEvent) => {
//     if (workspaceState.iconDrag.dragging) {
//         const index = workspaceState.iconDrag.dragging - 1;
//         let newX = e.clientX - workspaceState.iconDrag.offsetX;
//         let newY = e.clientY - workspaceState.iconDrag.offsetY;
//
//         workspaceState.selectIcon(index, true);
//
//         // check if the icon is out of bounds
//         if (newX < 0) {
//             newX = 0;
//         } else if (newX + IconWidth > displayState.width) {
//             newX = displayState.width - IconWidth;
//         }
//         if (newY < 0) {
//             newY = 0;
//         } else if (newY + IconHeight > displayState.height - 44) {
//             newY = displayState.height - IconHeight - 44;
//         }
//
//         workspaceState.setIconPos(index, newX, newY);
//     }
// };
//
// const onMouseUp = () => {
//     if (workspaceState.iconDrag.dragging) {
//         const index = workspaceState.iconDrag.dragging - 1;
//         const {x, y} = workspaceState.icons[index];
//
//         window.removeEventListener('mousemove', onMouseMove);
//         window.removeEventListener('mouseup', onMouseUp);
//
//         setWorkspaceState('iconDrag', {
//             offsetX: 0,
//             offsetY: 0,
//             dragging: 0
//         });
//         placeIcon(index, x, y);
//     }
// };
// const onMouseDown = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     // get the icon index
//     const dataIndex = (e.target as HTMLElement).getAttribute('data-index');
//     if (dataIndex === null) {
//         workspaceState.cancelSelection();
//     } else {
//         const dragging = parseInt(dataIndex) + 1;
//         const index = dragging - 1;
//         const icon = workspaceState.icons[index];
//
//         workspaceState.selectIcon(index, true);
//
//         setWorkspaceState('iconDrag', {
//             offsetX: e.clientX - icon.x,
//             offsetY: e.clientY - icon.y,
//             dragging
//         });
//         window.addEventListener('mousemove', onMouseMove);
//         window.addEventListener('mouseup', onMouseUp);
//     }
// };

export const Workspace = () => {
    onMount(() => {

        exampleDesktopFiles.forEach((f) => {
            iconStore.add(f.name, f.icon);
        });
        console.log(iconStore)
        console.log(iconStore.findClosestPos(makePos(0, 0)));
    });

    return (
        <>
            <div class={`panel${workspaceStore.panelFloat ? ' float' : ''}`}>
                <AppLauncher/>
                <TaskManager/>
                <DigitalClock/>
            </div>
            <div style={{
                width: '100%',
                height: 'calc(100% - 44px)',
                position: 'absolute',
                "user-select": 'none',
                "z-index": 1,
                "pointer-events": "all"
            }} >
                <For each={iconStore.icons}>
                    {(icon) => (
                        <Icon {...icon} />
                    )}
                </For>
            </div>
        </>
    );
}