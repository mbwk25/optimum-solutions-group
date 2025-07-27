import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Minimal test to isolate React issue
const TestApp = () => {
  return React.createElement('div', {}, 
    React.createElement('h1', {}, 'React Test'),
    React.createElement('p', {}, 'Basic functionality test')
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(TestApp));
}
