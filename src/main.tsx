import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Screen} from "./screen.tsx";

import './global.css'
import './breeze.scss'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Screen/>
    </StrictMode>,
)
