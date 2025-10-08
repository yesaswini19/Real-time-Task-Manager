// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    // Title of the task (required string)
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    
    // Description of the task (required string)
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    
    // Status of the task (boolean, defaults to false/incomplete)
    isCompleted: {
        type: Boolean,
        default: false
    },
    
    // Automatically added timestamp for creation date
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the Task model
const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;