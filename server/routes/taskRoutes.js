// server/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// CRITICAL FIX: Export a function that accepts the Socket.IO instance (io)
module.exports = (io) => {

    // --------------------------------------------------
    // GET all tasks (Read)
    // --------------------------------------------------
    router.get('/', async (req, res) => {
        try {
            // Find all tasks and sort by creation date (newest first)
            const tasks = await Task.find().sort({ createdAt: -1 });
            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching tasks', error: error.message });
        }
    });

    // --------------------------------------------------
    // POST a new task (Create)
    // --------------------------------------------------
    router.post('/', async (req, res) => {
        const { title, description } = req.body;

        // Basic validation
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        try {
            const newTask = new Task({ title, description });
            const savedTask = await newTask.save();

            // CRITICAL REAL-TIME STEP: Broadcast the new task object
            io.emit('new_task', savedTask);

            res.status(201).json(savedTask);
        } catch (error) {
            res.status(400).json({ message: 'Error creating task', error: error.message });
        }
    });

    // --------------------------------------------------
    // PATCH/Update a task (e.g., toggle isCompleted)
    // --------------------------------------------------
    router.patch('/:id', async (req, res) => {
        const { id } = req.params;
        const updates = req.body; // Can contain { isCompleted: true/false } or other fields

        try {
            const updatedTask = await Task.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true } // Return the updated doc and run validation checks
            );

            if (!updatedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }

            // CRITICAL REAL-TIME STEP: Broadcast the updated task object
            io.emit('task_updated', updatedTask);

            res.status(200).json(updatedTask);
        } catch (error) {
            res.status(400).json({ message: 'Error updating task', error: error.message });
        }
    });

    // --------------------------------------------------
    // DELETE a task (Delete)
    // --------------------------------------------------
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const deletedTask = await Task.findByIdAndDelete(id);

            if (!deletedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }

            // CRITICAL REAL-TIME STEP: Broadcast the ID of the deleted task
            io.emit('task_deleted', { id });

            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting task', error: error.message });
        }
    });

    return router; // Return the configured router instance
};
