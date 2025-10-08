// client/src/services/api.js

import axios from 'axios';

// --- CRITICAL DEPLOYMENT FIX ---
// In development (local machine), the client runs on 3000 and the server on 8081.
// In production (on Render), the server hosts the client on the same URL,
// so the API base URL should be the current host's URL (i.e., just '/api/').
const isDevelopment = process.env.NODE_ENV === 'development';

const apiClient = axios.create({
    // If running locally, target the backend at localhost:8081
    // If running in production (on Render), use an empty string or '/' to target the same host.
    baseURL: isDevelopment ? 'http://localhost:8081/api/tasks' : '/api/tasks',
    
    // NOTE: If you were using credentials (like cookies), you would include:
    // withCredentials: true,
});
// -------------------------------

// Helper function to handle API calls
export const fetchTasksApi = async () => {
    try {
        const response = await apiClient.get('/');
        return { success: true, tasks: response.data };
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { success: false, error };
    }
};

export const createTaskApi = async (taskData) => {
    try {
        const response = await apiClient.post('/', taskData);
        return { success: true, task: response.data };
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error };
    }
};

export const updateTaskApi = async ({ id, updates }) => {
    try {
        const response = await apiClient.patch(`/${id}`, updates);
        return { success: true, task: response.data };
    } catch (error) {
        console.error('Error updating task:', error);
        return { success: false, error };
    }
};

export const deleteTaskApi = async (id) => {
    try {
        await apiClient.delete(`/${id}`);
        return { success: true, message: "Task deleted successfully" };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, error };
    }
};
