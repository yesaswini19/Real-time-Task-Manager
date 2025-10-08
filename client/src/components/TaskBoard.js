// client/src/components/TaskBoard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { socket } from '../services/socket'; // Import the shared socket instance

// We'll use the server's local address for development.
// For production, this should be the AWS Elastic Beanstalk API URL.
const API_BASE_URL = 'http://localhost:8081/api/tasks';

// A simple TaskItem component (you'd make this more complex)
const TaskItem = ({ task, onToggleComplete, onDelete }) => (
  <div style={{ 
    padding: '10px', 
    margin: '5px 0', 
    border: '1px solid #ccc', 
    borderRadius: '4px',
    backgroundColor: task.isCompleted ? '#d4edda' : 'white' 
  }}>
    <h4 style={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
      {task.title}
    </h4>
    <p>{task.description}</p>
    <button onClick={() => onToggleComplete(task._id, !task.isCompleted)}>
      {task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
    </button>
    <button onClick={() => onDelete(task._id)} style={{ marginLeft: '10px', color: 'red' }}>
      Delete
    </button>
  </div>
);

// Component for adding new tasks
const TaskForm = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST request to Express server
      await axios.post(API_BASE_URL, { title, description });
      
      // The server will handle the broadcast via socket.io,
      // so we just clear the form here.
      setTitle('');
      setDescription('');
      
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #007bff' }}>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Add New Task (Real-Time)</button>
    </form>
  );
};


const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);

  // 1. Function to fetch initial data (REST call)
  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  // 2. REST API call to update the task status
  const toggleComplete = async (id, isCompleted) => {
    try {
      // PATCH request to Express server
      await axios.patch(`${API_BASE_URL}/${id}`, { isCompleted });
      // The socket event from the server will trigger the UI update (no manual state change needed here)
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // 3. REST API call to delete a task
  const deleteTask = async (id) => {
    try {
      // DELETE request to Express server
      await axios.delete(`${API_BASE_URL}/${id}`);
       // The socket event from the server will trigger the UI update
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };


  useEffect(() => {
    fetchTasks(); // Fetch data when the component mounts

    // ------------------------------------------------------------------
    // 4. SOCKET.IO EVENT LISTENERS (The Real-Time Part)
    // ------------------------------------------------------------------

    // Listener for new tasks created by any client
    const handleNewTask = (newTask) => {
      console.log('Real-Time: New task received', newTask);
      setTasks(prevTasks => [...prevTasks, newTask]);
    };

    // Listener for tasks updated by any client
    const handleTaskUpdated = (updatedTask) => {
      console.log('Real-Time: Task updated', updatedTask);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    };
    
    // Listener for tasks deleted by any client
    const handleTaskDeleted = (data) => {
      console.log('Real-Time: Task deleted', data.id);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== data.id));
    };


    socket.on('new_task', handleNewTask);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);
    
    // Cleanup function: important to remove listeners to prevent duplicates (React Strict Mode issue)
    return () => {
      socket.off('new_task', handleNewTask);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
    };
  }, [fetchTasks]); // Dependency array ensures listeners are only set up/cleaned up when needed


  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Real-Time Task Board</h1>
      <TaskForm />

      <h2>Tasks ({tasks.filter(t => !t.isCompleted).length} pending)</h2>
      {tasks
        .filter(t => !t.isCompleted) // Filter for incomplete tasks
        .map(task => (
          <TaskItem 
            key={task._id} 
            task={task} 
            onToggleComplete={toggleComplete}
            onDelete={deleteTask}
          />
        ))}

      <h2 style={{ marginTop: '30px' }}>Completed Tasks ({tasks.filter(t => t.isCompleted).length})</h2>
      {tasks
        .filter(t => t.isCompleted) // Filter for complete tasks
        .map(task => (
          <TaskItem 
            key={task._id} 
            task={task} 
            onToggleComplete={toggleComplete}
            onDelete={deleteTask}
          />
        ))}
        
        <p style={{ marginTop: '20px', fontStyle: 'italic', fontSize: '12px' }}>
          Socket Status: {socket.connected ? 'Connected' : 'Disconnected'}
        </p>
    </div>
  );
};

export default TaskBoard;