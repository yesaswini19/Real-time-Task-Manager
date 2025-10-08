// client/src/App.js
import React from 'react';
import './App.css';
import TaskBoard from './components/TaskBoard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-Time Task Manager</h1>
        <p>Powered by MERN Stack and Socket.io</p>
      </header>
      
      <div className="task-board-container">
        {/* The main logic and UI lives inside the TaskBoard component */}
        <TaskBoard />
      </div>
    </div>
  );
}

export default App;
