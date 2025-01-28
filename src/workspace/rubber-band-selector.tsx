import { createSignal, createEffect } from 'solid-js';

type Pos = {
	x: number,
	y: number,
}

interface RubberBandSelectorProps {
	from: Pos;
	to: Pos;
}

export const RubberBandSelector = (props: RubberBandSelectorProps) => {
	const [style, setStyle] = createSignal({});

	createEffect(() => {
		const fromX = Math.min(props.from.x, props.to.x);
		const fromY = Math.min(props.from.y, props.to.y);
		const toX = Math.max(props.from.x, props.to.x);
		const toY = Math.max(props.from.y, props.to.y);

		setStyle({
			position: "absolute",
			"pointer-events": "none",
			border: "1px solid rgba(#000, 0.7)",
			'border-radius': '5px',
			background: "rgba(#000, 0.1)",
			left: `${fromX}px`,
			top: `${fromY}px`,
			width: `${toX - fromX}px`,
			height: `${toY - fromY}px`,
			"z-index": 1000,
		});
	});

	return (
		<div style={style()} />
	);
}