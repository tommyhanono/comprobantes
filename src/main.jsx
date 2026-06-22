import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/styles.css'

const root = document.getElementById('root')

// Mobile shell: max-width 390px centered
root.style.maxWidth = '390px'
root.style.margin = '0 auto'
root.style.minHeight = '100dvh'
root.style.backgroundColor = 'var(--color-bg)'

ReactDOM.createRoot(root).render(<App />)
