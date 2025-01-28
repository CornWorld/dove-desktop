export const QuickSettings = () => {
	return <>
		<div>
			<span>Theme</span>
			<select onChange={(e) => {
				const theme = e.target.value;
				document.documentElement.setAttribute('data-theme', theme);
			}} style={{
				"margin-left": '10px',
				padding: '5px',
				"border-radius": '5px',
				border: '1px solid rgba(0, 0, 0, 0.1)',
			}}>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</div>
		<div>
			<span>Animation speed</span>
		</div>
		<div style={{
			display: 'flex',
			"flex-direction": 'row',
		}}>
			<button>Change Wallpaper...</button>
			<button>More Appearance Settings...</button>
		</div>
		<div class="divider"/>
		<div>
			<span>Clicking files or folders</span>
		</div>
		<div>
			<span>Most Used Pages</span>
		</div>
	</>
}