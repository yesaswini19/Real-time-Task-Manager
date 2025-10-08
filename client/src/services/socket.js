// client/src/services/socket.js
import { io } from 'socket.io-client';

// Define the URL for your server.
// IMPORTANT: This must match the URL where your Node.js server is running.
// Use 'http://localhost:8081' for development.
const SERVER_URL = 'http://localhost:8081'; 

// Create and export the single socket instance.
// autoConnect is true by default, meaning it connects immediately.
export const socket = io(SERVER_URL);

// Optional: You can add connection status logging here
socket.on('connect', () => {
    console.log(`[Socket] Connected to server: ${socket.id}`);
});

socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected from server. Reason: ${reason}`);
});

// Export the socket instance for use in components like TaskBoard.js
export default socket;