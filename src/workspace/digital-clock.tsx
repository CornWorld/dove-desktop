import {useEffect, useState} from "react";
import dayjs from "dayjs";
import {Tooltip} from "../component/tooltip.tsx";

export const DigitalClock = () => {
    const [clock, setClock] = useState<string>('');
    const [tooltipClock, setTooltipClock] = useState<string>('');
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

    const genEffect = (str: string, setClock: (str: string) => void, refresh = false) => {
        return () => {
            setClock(dayjs().format(str));
            if (!refresh) return;
            const interval = setInterval(() => {
                setClock(dayjs().format(str));
            }, 100);
            return () => {
                clearInterval(interval)
            };
        };
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(genEffect('HH:mm:ss\nYYYY/MM/DD', setClock, true), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(genEffect('dddd\n[UTC]Z HH:mm:ss\nYYYY-MM-DD', setTooltipClock, tooltipVisible), [tooltipVisible]);

    return (
        <>
            <div className={'digital-clock'}
                 onMouseEnter={() => setTooltipVisible(true)}
                 onMouseLeave={() => setTooltipVisible(false)}
            >
                {clock.split('\n').map((line, index) => (
                    <span key={index}>{line}</span>
                ))}
                <Tooltip
                    visible={tooltipVisible}>
                    <div className={'digital-clock-tooltip'}>
                        {tooltipClock.split('\n').map((line, index) => (
                            <span key={index}>{line}</span>
                        ))}
                    </div>
                </Tooltip>
            </div>
        </>
    );
}