import type { Component } from 'solid-js';
import { For } from 'solid-js';
import '@/component/sidebar.scss';

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

export const Sidebar: Component<SidebarProps> = (props) => {
    return <div class="sidebar" style={{ "--width": props.width ? `${props.width}px` : '100%' }}>
        <For each={props.selections}>
            {(selection) => (
                <div class="selection">
                    <div class="name">{selection.name}</div>
                    <For each={selection.nodes}>
                        {(node) => (
                            <div 
                                class="item"
                                onClick={() => props.onSelect?.(node)}
                            >
                                <span 
                                    class="icon" 
                                    style={{ "--icon": getIcon(node.icon) }}
                                />
                                <span>{node.name}</span>
                            </div>
                        )}
                    </For>
                </div>
            )}
        </For>
    </div>
}