import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Absolute minimal React app
function SimpleApp() {
  return (
    <div>
      <h1>Simple Test</h1>
      <p>Testing React without any external dependencies</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
)