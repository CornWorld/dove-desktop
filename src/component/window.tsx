import {create} from "zustand/react";
import {screenStore} from "../screen.tsx";
import {createDragState, DraggableState} from "../utils/drag.ts";
import {createRef, CSSProperties, useLayoutEffect} from "react";
import {workspaceStore} from "../workspace";

export interface WindowState {
    title: string;
    description: string;
    icon: string;
    id: string;
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
    id: 'widget1',
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

    // check window's position. if it's too close to the edge, float the panel
    const workspace = workspaceStore.getState();
    if(screen.height - y - state.height < 44 + 7) {
        workspace.setPanelFloat(false);
    } else {
        workspace.setPanelFloat(true);
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
        }, {
            name: "Connected Devices", nodes: [
                {name: "Bluetooth", icon: "preferences-system-bluetooth.svg", sub: [emptySidebarNode]},
                {name: "Disks & Cameras", icon: "preferences-system-disks.svg", sub: [emptySidebarNode]},
                {name: "Thunderbolt", icon: "preferences-desktop-thunderbolt.svg", sub: [emptySidebarNode]},
                {name: "KDE Connect", icon: "preferences-kde-connect.svg", sub: [emptySidebarNode]},
                {name: "Printers", icon: "preferences-devices-printer.svg", sub: [emptySidebarNode]},
            ]
        }, {
            name: "Networking", nodes: [
                {name: "Wi-Fi & Internet", icon: "categories/applications-internet.svg", sub: [emptySidebarNode]},
                {name: "Online Accounts", icon: "preferences-online-accounts.svg", sub: [emptySidebarNode]},
            ]
        }, {
            name: "Appearance & Style", nodes: [
                {name: "Wallpaper", icon: "preferences-desktop-wallpaper.svg", sub: [emptySidebarNode]},
                {name: "Colors & Themes", icon: "preferences-desktop-theme-global.svg", sub: [emptySidebarNode]},
                {name: "Text & Fonts", icon: "preferences-desktop-font.svg", sub: [emptySidebarNode]},
            ]
        }, {
            name: "Apps & Windows", nodes: [
                {
                    name: "Default Applications",
                    icon: "preferences-desktop-default-applications.svg",
                    sub: [emptySidebarNode]
                },
                {name: "Notifications", icon: "preferences-desktop-notification-bell.svg", sub: [emptySidebarNode]},
                {name: "Window Management", icon: "preferences-system-windows.svg", sub: [emptySidebarNode]},
                {name: "Activities", icon: "preferences-desktop-activities.svg", sub: [emptySidebarNode]},
            ]
        }, {
            name: "System", nodes: [
                {name: "About this System", icon: "status/dialog-information.svg", sub: [emptySidebarNode]},
                {name: "Power Management", icon: "preferences-system-power-management.svg", sub: [emptySidebarNode]},
                {name: "Users", icon: "system-users.svg", sub: [emptySidebarNode]},
                {name: "Session", icon: "preferences-system-login.svg", sub: [emptySidebarNode]},
            ]
        },
    ];

    const getIcon = (icon: string) => {
        if (icon.includes('/')) {
            return 'url(/icons/' + icon + ')';
        } else {
            return 'url(/icons/preferences/' + icon + ')';
        }
    }

    const headerbarDividerRef = createRef<HTMLDivElement>();
    const headerbarLeftWidth = headerbarDividerRef.current?.offsetLeft ?? 270;

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
            <div className={'divider'} ref={headerbarDividerRef}/>
            <div className={'title'}>Quick Settings</div>
        </div>
        <div css={{
            display: 'flex',
            flexDirection: 'row',
            userSelect: 'none',
            height: '100%',
            overflow: 'auto',
        }}>
            <div className={'sidebar'} css={{'--width': (headerbarLeftWidth + 1) + 'px'}}>
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
            <div className={'content quick-setting'}>
                {/* TODO: add label layout */}
                <div>
                    <span>Theme</span>
                    <select onChange={(e) => {
                        const theme = e.target.value;
                        document.documentElement.setAttribute('data-theme', theme);
                    }} css={{ // TODO
                        marginLeft: '10px',
                        padding: '5px',
                        borderRadius: '5px',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                <div>
                    <span>Animation speed</span>
                </div>
                <div css={{
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                    <button>Change Wallpaper...</button>
                    <button>More Appearance Settings...</button>
                </div>
                <div className={'divider'}/>
                <div>
                    <span>Clicking files or folders</span>
                </div>
                <div>
                    <span>Most Used Pages</span>
                </div>
            </div>
        </div>
    </div>
}