import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Force clear everything
console.log('EMERGENCY REACT RESET');

const EmergencyApp = () => {
  return React.createElement('div', { 
    style: { 
      padding: '50px', 
      backgroundColor: '#00ff00', 
      color: '#000',
      fontSize: '24px',
      textAlign: 'center'
    } 
  }, 
    React.createElement('h1', {}, 'EMERGENCY MODE ACTIVE'),
    React.createElement('p', {}, 'React is now working safely'),
    React.createElement('p', {}, new Date().toISOString())
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(EmergencyApp)
);