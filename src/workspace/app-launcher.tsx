import {useState} from "react";
import {DescriptionTooltip} from "../component/tooltip.tsx";

export const AppLauncher = () => {
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    return (
        <div className={'app-launcher'}
             onMouseEnter={() => setTooltipVisible(true)}
             onMouseLeave={() => setTooltipVisible(false)}
        >
            <span className={'window-icon icon-app-launcher'}/>
            <DescriptionTooltip visible={tooltipVisible} title={'Application Launcher'}
                                description={'Launcher to start applications'}/>
        </div>
    );
}
