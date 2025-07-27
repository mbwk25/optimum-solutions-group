// Clear all potential caches and force fresh start
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Emergency minimal React test - timestamp to force reload
console.log('LOADING FRESH REACT APP - ' + new Date().toISOString());

function EmergencyApp() {
  return React.createElement('div', { style: { padding: '20px', backgroundColor: 'lightgreen' } }, 
    React.createElement('h1', {}, 'EMERGENCY TEST APP'),
    React.createElement('p', {}, 'If you see this, React is working: ' + new Date().toISOString()),
    React.createElement('p', {}, 'No hooks, no external libraries, pure React')
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(React.createElement(EmergencyApp));