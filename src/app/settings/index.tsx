import { Headerbar } from "@/component/headerbar";
import { createSidebarNode, Sidebar, SidebarSelection } from "@/component/sidebar";
import { createSignal } from "solid-js";
import '@/app/settings.scss';
import { Window, createWindowStore } from "@/component/window";
import { QuickSettings } from "./quick-settings";

const [windowState] = createWindowStore({
    title: 'Window 1',
    description: 'Window 1 description',
    icon: '/icons/apps/systemsettings.svg',
    id: 'window1',
    active: true,
    height: 675,
    width: 931,
    x: 80,
    y: 35,
    z: 3,
    status: 'normal',
    originInfo: {
        x: 80,
        y: 45,
        width: 931,
        height: 675,
    },
});

export const Settings = () => {
    const [headerbarWidth, setHeaderbarWidth] = createSignal(270);

    const sidebarSelections: SidebarSelection[] = [
        {
            name: "Input & Output",
            nodes: [
                createSidebarNode("Mouse & Touchpad", "devices/input-mouse.svg"),
                createSidebarNode("Keyboard", "preferences-desktop-keyboard.svg"),
                createSidebarNode("Touchscreen", "preferences-desktop-touchscreen.svg"),
                createSidebarNode("Multimedia", "preferences-desktop-multimedia.svg"),
                createSidebarNode("Game Controller", "devices/input-gaming.svg"),
                createSidebarNode("Drawing Tablet", "preferences-desktop-tablet.svg"),
                createSidebarNode("Sound", "preferences-desktop-sound.svg"),
                createSidebarNode("Display & Monitor", "preferences-desktop-display.svg"),
                createSidebarNode("Accessibility", "preferences-desktop-accessibility.svg"),
            ]
        },
        {
            name: "Connected Devices",
            nodes: [
                createSidebarNode("Bluetooth", "preferences-system-bluetooth.svg"),
                createSidebarNode("Disks & Cameras", "preferences-system-disks.svg"),
                createSidebarNode("Thunderbolt", "preferences-desktop-thunderbolt.svg"),
                createSidebarNode("KDE Connect", "preferences-kde-connect.svg"),
                createSidebarNode("Printers", "preferences-devices-printer.svg"),
            ]
        },
        {
            name: "Networking",
            nodes: [
                createSidebarNode("Wi-Fi & Internet", "categories/applications-internet.svg"),
                createSidebarNode("Online Accounts", "preferences-online-accounts.svg"),
            ]
        },
        {
            name: "Appearance & Style",
            nodes: [
                createSidebarNode("Wallpaper", "preferences-desktop-wallpaper.svg"),
                createSidebarNode("Colors & Themes", "preferences-desktop-theme-global.svg"),
                createSidebarNode("Text & Fonts", "preferences-desktop-font.svg"),
            ]
        },
        {
            name: "Apps & Windows",
            nodes: [
                createSidebarNode("Default Applications", "preferences-desktop-default-applications.svg"),
                createSidebarNode("Notifications", "preferences-desktop-notification-bell.svg"),
                createSidebarNode("Window Management", "preferences-system-windows.svg"),
            ]
        },
        {
            name: "System",
            nodes: [
                createSidebarNode("About this System", "status/dialog-information.svg"),
                createSidebarNode("Power Management", "preferences-system-power-management.svg"),
                createSidebarNode("Users", "system-users.svg"),
                createSidebarNode("Session", "preferences-system-login.svg"),
            ]
        },
    ];

    return (
        <Window 
            store={windowState}
            customCss={['quick-settings']}
        >
            <Headerbar ref={(el) => {
                if (el?.getLeftWidth) {
                    setHeaderbarWidth(el.getLeftWidth());
                }
            }}/>
            <div style={{
                display: 'flex',
                "flex-direction": 'row',
                "user-select": 'none',
                height: '100%',
                overflow: 'auto',
            }}>
                <Sidebar 
                    selections={sidebarSelections}
                    width={headerbarWidth()}
                />
                <div class="content">
                    <QuickSettings/>
                </div>
            </div>
        </Window>
    );
};

