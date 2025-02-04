import {transEventPos, transPos} from "@/display";
import {TaskManager} from "@/workspace/taskmanager";
import {AppLauncher} from "@/workspace/app-launcher";
import {DigitalClock} from "@/workspace/digital-clock";
import './index.scss';
import {iconStore, workspaceStore} from "@/workspace/store";
import {Icon} from "@/workspace/icon";
import {createEffect, createSignal, For, on, onCleanup, onMount, untrack} from "solid-js";
import {exampleDesktopFiles} from "@/utils/files";
import {useDrag} from "@/utils/drag";
import {RubberBandSelector} from "@/workspace/rubber-band-selector";

export const Workspace = () => {
	const [iconsRef, setIconsRef] = createSignal<HTMLElement>();

    const selectorDefault = {isShown: false, from: {x: 0, y: 0}, to: {x: 0, y: 0}};
    const [selector, setSelector] = createSignal(selectorDefault);

    const onPointerDown = (e:PointerEvent) => {
        const {clientX, clientY} = transEventPos(e);
        const clicked = iconStore.getClicked(clientX, clientY);
		const hasSelected = iconStore.icons.some(i => i.isSelected);
		if(clicked == -1) {
            if(hasSelected) iconStore.cancelSelect();
        } else {
            // TODO add shift key to select multiple icons
            if(hasSelected) iconStore.cancelSelect();
            iconStore.select(clicked, true);
        }
    };

	onMount(() => {
		exampleDesktopFiles.forEach((f) => {
			iconStore.add(f.name, f.icon);
		});

		iconsRef()!.addEventListener('pointerdown', onPointerDown);
        onCleanup(() => iconsRef()?.removeEventListener('pointerdown', onPointerDown));

		const [last, setLast] = createSignal({x: 0, y: 0});

		const dragNotify = (dx: number, dy: number) => {
			const map: Record<string, (dx: number, dy: number) => void> = {
				none: (dx: number, dy: number) => {
                    setSelector({
                        isShown: true,
                        from: transPos(offset().x, offset().y),
                        to: transPos(offset().x + dx, offset().y + dy)
                    });
				},
				move: (dx, dy) => {
					untrack(() => iconStore.drag(dx - last().x, dy - last().y));
					setLast({x: dx, y: dy});
				},
			}
			map[dragNotifySwitch()](dx, dy);
		}

		const [dragNotifySwitch, setDragNotifySwitch] = createSignal("none");
		const {isDragging, offset} = useDrag(iconsRef()!, dragNotify);

		createEffect(on(isDragging, (dragging) => {
			if(dragging) {
				// calc whether the pointer is on the icons
				const {x, y} = transPos(offset().x, offset().y);
				const clicked = iconStore.getClicked(x, y);
				if(clicked != -1) {
					const selected = iconStore.icons
						.map((i, index) => i.isSelected ? index : -1)
						.filter(i => i != -1);

					if(selected.includes(clicked)) {
						// move the selected icons
						setDragNotifySwitch('move');
						setLast({x: 0, y: 0});

						return;
					}
				}
			} else {
                setSelector(selectorDefault);
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
			{selector().isShown && <RubberBandSelector from={selector().from} to={selector().to} />}
		</div>
	);
}