import {PropsWithChildren, useLayoutEffect, useRef} from "react";
import '../breeze.scss';

interface TooltipProps extends PropsWithChildren{
    visible: boolean;
}

export const Tooltip = ({children, visible}:TooltipProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const tooltip = ref.current;
        const screen = document.querySelector<HTMLElement>('#screen');
        if(tooltip && screen) {
            const rect = tooltip.getBoundingClientRect();
            const screenRect = screen.getBoundingClientRect();

            if(rect.left < screenRect.left) {
                tooltip.style.left = '0';
            }
            if(rect.top < screenRect.top) {
                tooltip.style.top = '0';
            }
            if(rect.right > screenRect.right) {
                tooltip.style.right = (rect.right - screenRect.right) + 'px';
            }
            if(rect.bottom > screenRect.bottom) {
                tooltip.style.bottom = (rect.bottom - screenRect.bottom) + 'px';
            }
        }
    }, [visible/* Not a good way, but it works! */]);
    return <div ref={ref} className={'tooltip background' + (visible ? ' visible' : '')}  >
        {children}
    </div>
}

interface DescriptionTooltipProps extends TooltipProps{
    title: string;
    description: string;
}

export const DescriptionTooltip = ({children, visible, title, description}:DescriptionTooltipProps) => {
    return <Tooltip visible={visible}>
        <div css={{
            textWrap: 'nowrap',
            'b': {
                opacity: 1,
                fontWeight: 'bold',
            },
            'p': {
                margin: '0',
                fontSize: '14px',
                opacity: 0.6,
                lineHeight: '18px',
                fontWeight: 'normal',
            }
        }}>
            <b>{title}</b>
            <p>{description}</p>
            {children}
        </div>
    </Tooltip>
}