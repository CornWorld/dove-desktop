import { createEffect } from "solid-js";
import type { Component, JSX } from "solid-js";
import '@/breeze.scss';

interface TooltipProps {
    children?: JSX.Element;
    visible: boolean;
}

export const Tooltip: Component<TooltipProps> = (props) => {
    let tooltipRef: HTMLDivElement | undefined;

    createEffect(() => {
        if (!tooltipRef) return;
        
        const screen = document.querySelector<HTMLElement>('#screen');
        if (screen) {
            const rect = tooltipRef.getBoundingClientRect();
            const screenRect = screen.getBoundingClientRect();

            if (rect.left < screenRect.left) {
                tooltipRef.style.left = '0';
            }
            if (rect.top < screenRect.top) {
                tooltipRef.style.top = '0';
            }
            if (rect.right > screenRect.right) {
                tooltipRef.style.right = (rect.right - screenRect.right) + 'px';
            }
            if (rect.bottom > screenRect.bottom) {
                tooltipRef.style.bottom = (rect.bottom - screenRect.bottom) + 'px';
            }
        }
    });

    return (
        <div 
            ref={tooltipRef} 
            class={`tooltip background${props.visible ? ' visible' : ''}`}
        >
            {props.children}
        </div>
    );
};

interface DescriptionTooltipProps extends TooltipProps {
    title: string;
    description: string;
}

export const DescriptionTooltip: Component<DescriptionTooltipProps> = (props) => {
    return (
        <Tooltip visible={props.visible}>
            <div style={{
                "text-wrap": "nowrap",
            }}>
                <b class="heading" style={{
                    opacity: "1",
                    "font-weight": "bold"
                }}>{props.title}</b>
                <p style={{
                    margin: "0",
                    "font-size": "14px",
                    opacity: "0.6",
                    "line-height": "18px",
                    "font-weight": "normal"
                }}>{props.description}</p>
                {props.children}
            </div>
        </Tooltip>
    );
};