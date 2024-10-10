import './siderbar.scss';

export interface SidebarSelection {
    name: string;
    nodes: SidebarNode[];
}

export interface SidebarNode {
    name: string;
    icon: string;
    sub?: SidebarNode[]; // when sub=undefined or sub.length=0, it doesn't show the arrow

    empty: () => boolean;
}

export const createSidebarNode = (name: string, icon: string, sub?: SidebarNode[]): SidebarNode => {
    return {name, icon, sub, empty: () => sub === undefined || sub.length === 0};
}
const getIcon = (icon: string) => {
    if (icon.includes('/')) {
        return 'url(/icons/' + icon + ')';
    } else {
        return 'url(/icons/preferences/' + icon + ')';
    }
}

interface SidebarProps {
    width?: number;
    selections: SidebarSelection[];

    onSelect?: (node: SidebarNode) => void;
}

export const Sidebar = ({width, selections}: SidebarProps) => {
    return <div className={'sidebar'} css={{'--width': width ? (width) + 'px' : '100%'}}>
        {selections.map((selection, index) => (
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
}