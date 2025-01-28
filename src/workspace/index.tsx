import {transEventPos, transPos} from "@/display";
import {TaskManager} from "@/workspace/taskmanager";
import {AppLauncher} from "@/workspace/app-launcher";
import {DigitalClock} from "@/workspace/digital-clock";
import './index.scss';
import {workspaceStore, iconStore} from "@/workspace/store";
import {Icon} from "@/workspace/icon";
import {createEffect, createSignal, For, on, untrack} from "solid-js";
import {onMount} from "solid-js";
import {exampleDesktopFiles} from "@/utils/files";
import {useDrag} from "@/utils/drag";

export const Workspace = () => {
    const [iconsRef, setIconsRef] = createSignal<HTMLElement>();

    onMount(() => {
        exampleDesktopFiles.forEach((f) => {
            iconStore.add(f.name, f.icon);
        });

        iconsRef()!.addEventListener('pointerdown', (e) => {
            const {clientX, clientY} = transEventPos(e);
            const clicked = iconStore.getClicked(clientX, clientY);
            console.log(e.clientX, e.clientY, clientX, clientY, clicked);
            if(clicked == -1) {
                iconStore.cancelSelect();
            } else {
                iconStore.select(clicked, true);
            }
        });

        const [last, setLast] = createSignal({x: 0, y: 0});

        const dragNotify = (dx: number, dy:number) => {
            const map : Record<string, (dx: number, dy: number) => void> = {
                none: () => {},
                move: (dx, dy)=> {
                    untrack(()=>iconStore.drag(dx - last().x, dy - last().y));
                    setLast({x:dx, y:dy});
                },
            }
            map[dragNotifySwitch()](dx, dy);
        }

        const [dragNotifySwitch, setDragNotifySwitch] = createSignal("none");
        const {isDragging, offset} = useDrag(iconsRef()!, dragNotify);

        createEffect(on(isDragging,(dragging)=>{
            if(dragging) {
                // calc whether the pointer is on the icons
                const {x, y} = transPos(offset().x, offset().y);
                const clicked = iconStore.getClicked(x, y);
                if(clicked != -1) {
                    const selected = iconStore.icons
                        .map((i, index)=>i.isSelected ? index : -1)
                        .filter(i=>i!=-1);

                    if(selected.includes(clicked)) {
                        // move the selected icons
                        setDragNotifySwitch('move');
                        setLast({x: 0, y: 0});

                        return;
                    }
                }
            }
            setDragNotifySwitch('none');
        }));
    });

    return (
        <div>
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
            }} ref={setIconsRef}>
                <For each={iconStore.icons}>
                    {(icon) => (
                        <Icon {...icon} />
                    )}
                </For>
            </div>
        </div>
    );
}