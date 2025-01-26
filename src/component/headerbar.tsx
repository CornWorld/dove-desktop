import { createSignal, onMount, createEffect } from 'solid-js';
import type { Component } from 'solid-js';

export interface HeaderbarRef {
    getLeftWidth: () => number;
}

export interface HeaderbarProps {
    ref?: (el: HeaderbarRef) => void;
}

export const Headerbar: Component<HeaderbarProps> = (props) => {
    let dividerRef: HTMLDivElement | undefined;
    const [headerbarLeftWidth, setHeaderbarLeftWidth] = createSignal(270);

    onMount(() => {
        if (dividerRef) {
            setHeaderbarLeftWidth(dividerRef.offsetLeft);
        }
    });

    createEffect(() => {
        if (props.ref) {
            props.ref({
                getLeftWidth: () => headerbarLeftWidth()
            });
        }
    });

    return (
        <div class="headerbar">
            <button class="home"/>
            <div class="search">
                <span class="icon icon-search"/>
                <input 
                    type="text" 
                    placeholder="Search" 
                    style={{ width: "190px" }}
                />
            </div>
            <button class="actions"/>
            <div class="divider" ref={dividerRef}/>
            <div class="title">Quick Settings</div>
        </div>
    );
};