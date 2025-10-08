// client/src/services/api.js
import axios from 'axios';

// Define the base URL for your Express API.
// Use localhost:8081 for development. 
// For AWS Elastic Beanstalk deployment, this needs to be updated to your EB URL.
const API_BASE_URL = 'http://localhost:8081/api/tasks';

// ----------------------------------------------------
// AXIOS INSTANCE (Optional, but good practice)
// ----------------------------------------------------
// Create a reusable Axios client for your API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // You would add interceptors here for error handling or authentication tokens
});

// ----------------------------------------------------
// TASK CRUD FUNCTIONS
// ----------------------------------------------------

// GET: Fetch all tasks
export const fetchAllTasks = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    // Throw error to be handled by the calling component
    throw error; 
  }
};

// POST: Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/', taskData);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// PATCH: Update an existing task (e.g., toggle isCompleted)
export const updateTask = async (id, updates) => {
  try {
    const response = await apiClient.patch(`/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
};

// DELETE: Delete a task
export const deleteTaskApi = async (id) => {
  try {
    await apiClient.delete(`/${id}`);
    return { success: true, message: "Task deleted" };
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
};