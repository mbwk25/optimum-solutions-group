import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Simple test component
const SimpleApp = () => {
  return (
    <div>
      <h1>Simple React Test</h1>
      <p>Testing basic React functionality</p>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<SimpleApp />);
}