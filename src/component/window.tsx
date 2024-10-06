import {create} from "zustand/react";
import {screenStore} from "../screen.tsx";
import {createDragState, DraggableState} from "../utils/drag.ts";
import {CSSProperties, useLayoutEffect} from "react";

interface WindowState {
    title: string;
    description: string;
    icon: string;
    widgetId: string;
    active: boolean;
    height: number;
    width: number;
    x: number;
    y: number;
    z: number;
    setPos: (x: number, y: number) => void;
    drag: DraggableState;
}

const windowStore = create<WindowState>((set) => ({
    title: 'Window 1',
    description: 'Window 1 description',
    icon: '/icons/apps/systemsettings.svg',
    widgetId: 'widget1',
    active: true,
    height: 675, width: 931,
    x: 80, y: 45, z: 3,
    setPos: (x, y) => set({x, y}),
    drag: createDragState(set),
}));

const rePosition = (x: number, y: number) => {
    // check if the window is out of bounds
    const state = windowStore.getState();
    const screen = screenStore.getState().Screen;
    if (x < 0) {
        x = 0;
    } else if (x + state.width > screen.width) {
        x = screen.width - state.width;
    }
    if (y < 0) {
        y = 0;
    } else if (y + state.height > screen.height) {
        y = screen.height - state.height;
    }

    state.setPos(x, y);
}


const onMouseMove = (e: MouseEvent) => {
    const state = windowStore.getState();
    if (state.drag.dragging) {
        const newX = e.clientX - state.drag.offsetX;
        const newY = e.clientY - state.drag.offsetY;

        rePosition(newX, newY);
    }
};

const onMouseUp = () => {
    const s = windowStore.getState();
    if (s.drag.dragging) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        s.drag.stopDrag();
    }
}

const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const state = windowStore.getState();
    state.drag.startDrag(e.clientX - state.x, e.clientY - state.y);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}


export const Window = () => {
    const state = windowStore((s) => s);
    const style = {
        left: state.x + 'px',
        top: state.y + 'px',
        width: state.width + 'px',
        height: state.height + 'px',
        zIndex: state.z,
    };

    useLayoutEffect(() => {
        const state = windowStore.getState();
        rePosition(state.x, state.y);
    }, []);

    interface SidebarSelection {
        name: string;
        nodes: SidebarNode[];
    }

    interface SidebarNode {
        name: string;
        icon: string;
        sub?: SidebarNode[]; // when sub=undefined or sub.length=0, it doesn't show the arrow
    }
    
    const emptySidebarNode: SidebarNode = {name: '', icon: ''};
    

    const sidebarSelections: SidebarSelection[] = [
        {
            name: "Input & Output", nodes: [
                {name: "Mouse & Touchpad", icon: "devices/input-mouse.svg", sub: [emptySidebarNode]},
                {name: "Keyboard", icon: "preferences-desktop-keyboard.svg", sub: [emptySidebarNode]},
                {name: "Touchscreen", icon: "preferences-desktop-touchscreen.svg", sub: [emptySidebarNode]},
                {name: "Multimedia", icon: "preferences-desktop-multimedia.svg", sub: [emptySidebarNode]},
                {name: "Game Controller", icon: "devices/input-gaming.svg", sub: [emptySidebarNode]},
                {name: "Drawing Tablet", icon: "preferences-desktop-tablet.svg", sub: [emptySidebarNode]},
                {name: "Sound", icon: "preferences-desktop-sound.svg", sub: [emptySidebarNode]},
                {name: "Display & Monitor", icon: "preferences-desktop-display.svg", sub: [emptySidebarNode]},
                {name: "Accessibility", icon: "preferences-desktop-accessibility.svg", sub: [emptySidebarNode]},
            ]
        },
        {
            name: "Connected Devices", nodes: [
                {name: "Bluetooth", icon: "preferences-system-bluetooth.svg", sub: [emptySidebarNode]},
                {name: "Disks & Cameras", icon: "preferences-system-disks.svg", sub: [emptySidebarNode]},
                {name: "Thunderbolt", icon: "preferences-desktop-thunderbolt.svg", sub: [emptySidebarNode]},
                {name: "KDE Connect", icon: "preferences-kde-connect.svg", sub: [emptySidebarNode]},
                {name: "Printers", icon: "preferences-devices-printer.svg", sub: [emptySidebarNode]},
            ]
        },
        {
            name: "Networking", nodes: [
                {name: "Wi-Fi & Internet", icon: "categories/applications-internet.svg", sub: [emptySidebarNode]},
                {name: "Online Accounts", icon: "preferences-online-accounts.svg", sub: [emptySidebarNode]},
            ]
        },
        {
            name: "Appearance & Style", nodes: [
                {name: "Wallpaper", icon: "preferences-desktop-wallpaper.svg", sub: [emptySidebarNode]},
                {name: "Colors & Themes", icon: "preferences-desktop-theme-global.svg", sub: [emptySidebarNode]},
                {name: "Text & Fonts", icon: "preferences-desktop-font.svg", sub: [emptySidebarNode]},
            ]
        },
        {
            name: "Apps & Windows", nodes: [
                {name: "Default Applications", icon: "applications-other.svg", sub: [emptySidebarNode]},
                {name: "Notifications", icon: "preferences-desktop-notification.svg", sub: [emptySidebarNode]},
                {name: "Window Management", icon: "preferences-desktop-window-management.svg", sub: [emptySidebarNode]},
                {name: "Activities", icon: "preferences-desktop-activities.svg", sub: [emptySidebarNode]},
            ]
        },
        {
            name: "System", nodes: [
                {name: "About this System", icon: "status/dialog-information.svg", sub: [emptySidebarNode]},
                {name: "Power Management", icon: "preferences-system-power-management.svg", sub: [emptySidebarNode]},
                {name: "Users", icon: "system-users.svg", sub: [emptySidebarNode]},
                {name: "Session", icon: "preferences-system-login.svg", sub: [emptySidebarNode]},
            ]
        },
    ];

    const getIcon = (icon: string) => {
        if(icon.includes('/')) {
            return 'url(/icons/' + icon + ')';
        } else {
            return 'url(/icons/preferences/' + icon + ')';
        }
    }

    return <div className={'window system-control'} style={style}>
        <div className={'titlebar'} onMouseDown={(e) => onMouseDown(e as unknown as MouseEvent)}>
            <div className={'windowcontrols left'}>
                <button className={'window-icon'}
                        style={{'--window-icon': 'url(' + state.icon + ')'} as CSSProperties}/>
                <button className={'pin'}/>
            </div>
            <div><label>Quick Settings — System Settings</label></div>
            <div className={'windowcontrols right'}>
                <button className={'minimize'}/>
                <button className={'maximize'}/>
                <button className={'close'}/>
            </div>
        </div>
        <div className={'headerbar'}>
            <button className={'home'}/>
            <div className={'search'}>
                <span className={'icon icon-search'}/>
                <input type={'text'} placeholder={'Search'}/>
            </div>
            <button className={'actions'}></button>
            <div className={'divider'}/>
            <div className={'title'}>Quick Settings</div>
        </div>
        <div className={'sidebar'}>
            {/*<div className={'selection'}>*/}
            {/*    <div className={'name'}>Input & Output</div>*/}
            {/*    <div className={'item link'}>*/}
            {/*        <span className={'icon icon-mouse'}/>*/}
            {/*        <span>Mouse & Touchpad</span>*/}
            {/*    </div>*/}
            {/*    <div className={'item link'}>*/}
            {/*        <span className={'icon icon-keyboard'}/>*/}
            {/*        <span>Keyboard</span>*/}
            {/*    </div>*/}
            {/*    <div className={'item'}>*/}
            {/*        <span className={'icon icon-display'}/>*/}
            {/*        <span>Display & Monitor</span>*/}
            {/*    </div>*/}
            {/*</div>*/}
            {sidebarSelections.map((selection, index) => (
                <div key={index} className={'selection'}>
                    <div className={'name'}>{selection.name}</div>
                    {selection.nodes.map((node, index) => (
                        <div key={index} className={'item'}>
                            <span className={'icon'} css={{'--icon': getIcon(node.icon)}}/>
                            <span>{node.name}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>

    </div>
}