// client/src/components/TaskItem.js
import React from 'react';

// This component handles displaying a single task and button interactions
const TaskItem = ({ task, onToggleComplete, onDelete }) => {
  const itemStyle = {
    padding: '15px', 
    margin: '10px 0', 
    border: `1px solid ${task.isCompleted ? '#28a745' : '#ccc'}`, 
    borderRadius: '4px',
    backgroundColor: task.isCompleted ? '#e9f7ef' : 'white',
    transition: 'background-color 0.3s'
  };

  const titleStyle = { 
    textDecoration: task.isCompleted ? 'line-through' : 'none',
    color: task.isCompleted ? '#6c757d' : '#333'
  };

  return (
    <div style={itemStyle}>
      <h4 style={titleStyle}>
        {task.title}
      </h4>
      <p style={{ color: '#555' }}>{task.description}</p>
      
      <button 
        onClick={() => onToggleComplete(task._id, !task.isCompleted)}
        style={{ 
          padding: '8px 12px', 
          backgroundColor: task.isCompleted ? '#ffc107' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        {task.isCompleted ? 'Re-open Task' : 'Complete Task'}
      </button>

      <button 
        onClick={() => onDelete(task._id)} 
        style={{ 
          marginLeft: '10px', 
          padding: '8px 12px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        Delete
      </button>
      
      <span style={{ float: 'right', fontSize: '12px', color: '#666' }}>
        Status: {task.isCompleted ? 'Done' : 'Pending'}
      </span>
    </div>
  );
};

export default TaskItem;