// client/src/services/socket.js

import { io } from 'socket.io-client';

// --- CRITICAL DEPLOYMENT FIX ---
// Determine the base URL based on the environment
const isDevelopment = process.env.NODE_ENV === 'development';
const SOCKET_SERVER_URL = isDevelopment 
    ? 'http://localhost:8081' // Local development target
    : window.location.origin; // Production target (current domain: https://real-time-task-manager.onrender.com)

// Initialize the socket connection
export const socket = io(SOCKET_SERVER_URL, {
    // Optional: Add transport options if needed, but simple connection should work.
    transports: ['websocket', 'polling'] 
});

// Add listeners for connection status
socket.on('connect', () => {
    console.log('Socket.io connected successfully.');
});

socket.on('disconnect', (reason) => {
    console.log('Socket.io disconnected. Reason:', reason);
});

socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
});
