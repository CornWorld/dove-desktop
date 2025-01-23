import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Display} from "./display.tsx";

import './global.css'
import './breeze.scss'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Display/>
    </StrictMode>,
)
