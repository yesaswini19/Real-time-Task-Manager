// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css'; // General CSS imports (if you have one)
import App from './App';

// If you are using TaskBoard.js, you must have installed axios and socket.io-client:
// npm install axios socket.io-client

// Get the root element from index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Note: If you have an index.css for global styling, you would need to create that too.
