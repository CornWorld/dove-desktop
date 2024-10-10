import {createRef, useImperativeHandle, forwardRef} from 'react';

export interface HeaderbarRef {
	getLeftWidth: () => number;
}
export const Headerbar = forwardRef((_, ref) => {
	const headerbarDividerRef = createRef<HTMLDivElement>();
	const headerbarLeftWidth = headerbarDividerRef.current?.offsetLeft ?? 270;
	useImperativeHandle(ref, () => ({
		getLeftWidth: () => headerbarLeftWidth,
	}));
	
	return <div className={'headerbar'}>
		<button className={'home'} />
		<div className={'search'}>
			<span className={'icon icon-search'} />
			<input type={'text'} placeholder={'Search'} />
		</div>
		<button className={'actions'}></button>
		<div className={'divider'} ref={headerbarDividerRef} />
		<div className={'title'}>Quick Settings</div>
	</div>
})