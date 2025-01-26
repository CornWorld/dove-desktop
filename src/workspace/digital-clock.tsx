import { createSignal, createEffect, onCleanup, For } from "solid-js";
import dayjs from "dayjs";
import { Tooltip } from "../component/tooltip";

export const DigitalClock = () => {
    const [clock, setClock] = createSignal('');
    const [tooltipClock, setTooltipClock] = createSignal('');
    const [tooltipVisible, setTooltipVisible] = createSignal(false);

    const updateClock = (str: string, setTime: (val: string) => void, refresh = false) => {
        setTime(dayjs().format(str));
        if (!refresh) return;
        
        const interval = setInterval(() => {
            setTime(dayjs().format(str));
        }, 100);
        
        onCleanup(() => clearInterval(interval));
    };

    createEffect(() => {
        updateClock('HH:mm:ss\nYYYY/MM/DD', setClock, true);
    });

    createEffect(() => {
        if (tooltipVisible()) {
            updateClock('dddd\n[UTC]Z HH:mm:ss\nYYYY-MM-DD', setTooltipClock, true);
        }
    });

    return (
        <div class="digital-clock"
             onMouseEnter={() => setTooltipVisible(true)}
             onMouseLeave={() => setTooltipVisible(false)}
        >
            <For each={clock().split('\n')}>
                {(line) => <span>{line}</span>}
            </For>
            <Tooltip
                visible={tooltipVisible()}>
                <div class="digital-clock-tooltip">
                    <For each={tooltipClock().split('\n')}>
                        {(line) => <span>{line}</span>}
                    </For>
                </div>
            </Tooltip>
        </div>
    );
};