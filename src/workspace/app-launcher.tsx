import {useEffect, useRef, useState} from "react";
import {DescriptionTooltip} from "../component/tooltip.tsx";
import {createSidebarNode, Sidebar, SidebarSelection} from "../component/sidebar.tsx";

interface KickoffProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const Kickoff = ({open, setOpen}: KickoffProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            const kickoff = ref.current;
            if (kickoff && !kickoff.contains(e.target as Node)) {
                // make the app launcher button not close the kickoff
                const kickoffButton = document.querySelector('.app-launcher');
                if (!kickoffButton || !kickoffButton.contains(e.target as Node)) {
                    setOpen(false);
                }
            }
        }

        if (open) addEventListener('mousedown', handleClickOutside, {capture: true});
        return () => {
            if (open) removeEventListener('mousedown', handleClickOutside, {capture: true});
        }
    }, [open, setOpen]);

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

    return <div className={'kickoff' + (open ? ' open' : '')} ref={ref} tabIndex={-1}
                onBlur={() => setOpen(false)} css={{'--left-width': leftWidth + 'px'}}
    >
        <div className={'headerbar'}>
            <div className={'user'}>
                <span/>
                <span>CornWorld</span>
            </div>
            <div css={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div className={'search'}>
                    <span className={'icon icon-search'}/>
                    <input type={'text'} placeholder={'Search'}/>
                </div>
                <button className={'configure'}/>
                <button className={'pin'}/>
            </div>
        </div>
        <div className={'content'}>
            <Sidebar width={leftWidth} selections={selections}/>
            <div className={'icons'}>
                <Sidebar selections={appSelections}/>
            </div>
        </div>
        <div className={'footerbar'}>

        </div>
    </div>
}

export const AppLauncher = () => {
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const [kickoffOpen, setKickoffOpen] = useState<boolean>(false);
    return (
        <>
            <div className={'app-launcher' + (kickoffOpen ? ' active' : '')}
                 onMouseEnter={() => setTooltipVisible(true)}
                 onMouseLeave={() => setTooltipVisible(false)}
                 onClick={() => {
                     setKickoffOpen(!kickoffOpen);
                     setTooltipVisible(false);
                 }}
            >
                <span className={'window-icon icon-app-launcher'}/>
                <DescriptionTooltip visible={tooltipVisible} title={'Application Launcher'}
                                    description={'Launcher to start applications'}/>
            </div>
            <Kickoff open={kickoffOpen} setOpen={setKickoffOpen}/>
        </>
    );
}
