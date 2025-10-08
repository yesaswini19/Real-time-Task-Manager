// client/src/components/TaskForm.js
import React, { useState } from 'react';

// This component is purely for form input and state
const TaskForm = ({ onTaskSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return; 

    // Pass the new task data up to the parent component (TaskBoard)
    onTaskSubmit({ title, description });

    // Clear the form
    setTitle('');
    setDescription('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        border: '2px solid #007bff', 
        borderRadius: '8px', 
        backgroundColor: '#f8f9fa' 
      }}
    >
      <h3>Create New Task</h3>
      <input
        type="text"
        placeholder="Task Title (required)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ width: '95%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <textarea
        placeholder="Task Description (required)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows="3"
        style={{ width: '95%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <button 
        type="submit"
        style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;