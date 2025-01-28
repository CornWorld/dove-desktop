import {render} from 'solid-js/web'
import {Display} from "@/display";

import './global.css'
import './breeze.scss'

const root = document.getElementById('root')

if(root) {
	render(() => <Display/>, root)
}
