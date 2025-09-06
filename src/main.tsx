import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { serviceWorkerManager } from './shared/utils/serviceWorkerManager'

// Register service worker before rendering
serviceWorkerManager.register()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)