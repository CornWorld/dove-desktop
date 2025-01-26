import { createSignal, onMount, onCleanup } from "solid-js";
import { DescriptionTooltip } from "../component/tooltip";
import { createSidebarNode, Sidebar, SidebarSelection } from "../component/sidebar";

interface KickoffProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const Kickoff = (props: KickoffProps) => {
    let ref: HTMLDivElement | undefined;

    onMount(() => {
        const handleClickOutside = (e: Event) => {
            if (ref && !ref.contains(e.target as Node)) {
                // make the app launcher button not close the kickoff
                const kickoffButton = document.querySelector('.app-launcher');
                if (!kickoffButton || !kickoffButton.contains(e.target as Node)) {
                    props.setOpen(false);
                }
            }
        };

        if (props.open) {
            window.addEventListener('mousedown', handleClickOutside, { capture: true });
            onCleanup(() => {
                window.removeEventListener('mousedown', handleClickOutside, { capture: true });
            });
        }
    });

    const leftWidth = 240;
    const selections: SidebarSelection[] = [{
        name: '', nodes: [
            createSidebarNode('Favorites', 'actions/bookmarks.svg', []),
            createSidebarNode('All Applications', 'categories/applications-all.svg', []),
        ]
    }, {
        name: 'Categories', nodes: [
            // Development, Graphics, Internet, Multimedia, Engineering, Games, Office, Eduction, Settings, System, Utilities, Help
            createSidebarNode('Development', 'categories/applications-development.svg', []),
            createSidebarNode('Graphics', 'categories/applications-graphics.svg', []),
            createSidebarNode('Internet', 'categories/applications-internet.svg', []),
            createSidebarNode('Multimedia', 'categories/applications-multimedia.svg', []),
            createSidebarNode('Engineering', 'categories/applications-engineering.svg', []),
            createSidebarNode('Games', 'categories/applications-games.svg', []),
            createSidebarNode('Office', 'categories/applications-office.svg', []),
            createSidebarNode('Education', 'categories/applications-education.svg', []),
            createSidebarNode('Settings', 'apps/systemsettings.svg', []),
            createSidebarNode('System', 'categories/applications-system.svg', []),
            createSidebarNode('Utilities', 'categories/applications-utilities.svg', []),
            createSidebarNode('Help', 'apps/system-help.svg', []),
        ]
    },
    ]
    const appSelections: SidebarSelection[] = [{
        name: 'A', nodes: [
            createSidebarNode('Ark', 'apps/ark.svg'),
        ]
    },
    ];

    return <div class={`kickoff${props.open ? ' open' : ''}`} ref={ref} tabIndex={-1}
                onBlur={() => props.setOpen(false)} style={{ "--left-width": `${leftWidth}px` }}
    >
        <div class="headerbar">
            <div class="user">
                <span/>
                <span>CornWorld</span>
            </div>
            <div style={{
                "flex-grow": "1",
                display: "flex",
                "flex-direction": "column",
            }}>
                <div class="search">
                    <span class="icon icon-search"/>
                    <input type="text" placeholder="Search"/>
                </div>
                <button class="configure"/>
                <button class="pin"/>
            </div>
        </div>
        <div class="content">
            <Sidebar width={leftWidth} selections={selections}/>
            <div class="icons">
                <Sidebar selections={appSelections}/>
            </div>
        </div>
        <div class="footerbar"/>
    </div>
}

export const AppLauncher = () => {
    const [tooltipVisible, setTooltipVisible] = createSignal(false);
    const [kickoffOpen, setKickoffOpen] = createSignal(false);
    return (
        <>
            <div class={`app-launcher${kickoffOpen() ? ' active' : ''}`}
                 onMouseEnter={() => setTooltipVisible(true)}
                 onMouseLeave={() => setTooltipVisible(false)}
                 onClick={() => {
                     setKickoffOpen(!kickoffOpen());
                     setTooltipVisible(false);
                 }}
            >
                <span class="window-icon icon-app-launcher"/>
                <DescriptionTooltip 
                    visible={tooltipVisible()} 
                    title="Application Launcher"
                    description="Launcher to start applications"
                />
            </div>
            <Kickoff open={kickoffOpen()} setOpen={setKickoffOpen}/>
        </>
    );
}
