import { render } from 'solid-js/web'
import { Display } from "./display.tsx";

import './global.css'
import './breeze.scss'

const root = document.getElementById('root')

if (root) {
  render(() => <Display/>, root)
}
