import { Headerbar, HeaderbarRef } from "../../component/headerbar.tsx";
import { createSidebarNode, Sidebar, SidebarSelection } from "../../component/sidebar.tsx";
import { useRef } from "react";
import './settings.scss'
import { createWindow, useDefaultWindowFunc } from "../../component/window.tsx";
import { QuickSettings } from "./quick-settings.tsx";

const windowStore = useDefaultWindowFunc({
	title: 'Window 1',
	description: 'Window 1 description',
	icon: '/icons/apps/systemsettings.svg',
	id: 'window1',
	active: true,
	height: 675, width: 931,
	x: 80, y: 35, z: 3,
	status: 'normal',
	originInfo: {
		x: 80, y: 45, width: 931, height: 675,
	},
});

export const Settings = () =>{
	const sidebarSelections: SidebarSelection[] = [
		{
			name: "Input & Output", nodes: [
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
		}, {
			name: "Connected Devices", nodes: [
				createSidebarNode("Bluetooth", "preferences-system-bluetooth.svg"),
				createSidebarNode("Disks & Cameras", "preferences-system-disks.svg"),
				createSidebarNode("Thunderbolt", "preferences-desktop-thunderbolt.svg"),
				createSidebarNode("KDE Connect", "preferences-kde-connect.svg"),
				createSidebarNode("Printers", "preferences-devices-printer.svg"),
			]
		}, {
			name: "Networking", nodes: [
				createSidebarNode("Wi-Fi & Internet", "categories/applications-internet.svg"),
				createSidebarNode("Online Accounts", "preferences-online-accounts.svg"),
			
			]
		}, {
			name: "Appearance & Style", nodes: [
				createSidebarNode("Wallpaper", "preferences-desktop-wallpaper.svg"),
				createSidebarNode("Colors & Themes", "preferences-desktop-theme-global.svg"),
				createSidebarNode("Text & Fonts", "preferences-desktop-font.svg"),
			]
		}, {
			name: "Apps & Windows", nodes: [
				createSidebarNode("Default Applications", "preferences-desktop-default-applications.svg"),
				createSidebarNode("Notifications", "preferences-desktop-notification-bell.svg"),
				createSidebarNode("Window Management", "preferences-system-windows.svg"),
			]
		}, {
			name: "System", nodes: [
				createSidebarNode("About this System", "status/dialog-information.svg"),
				createSidebarNode("Power Management", "preferences-system-power-management.svg"),
				createSidebarNode("Users", "system-users.svg"),
				createSidebarNode("Session", "preferences-system-login.svg"),
			]
		},
	];
	const headerbarRef = useRef<HeaderbarRef>(null);
	
	return createWindow(windowStore, ['quick-settings'],
		<>
			<Headerbar ref={headerbarRef} />
			<div css={{
				display: 'flex',
				flexDirection: 'row',
				userSelect: 'none',
				height: '100%',
				overflow: 'auto',
			}}>
				<Sidebar selections={sidebarSelections}
				         width={headerbarRef.current?.getLeftWidth() ?? 270} />
				{/* TODO: add label layout */}
				<div className={'content'}>
					<QuickSettings />
				</div>
			</div>
		</>
	);
}

