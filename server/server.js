// server/server.js 
// Load environment variables from .env file
require('dotenv').config({ path: './.env' }); 
console.log('--- ENV DEBUG ---');
console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');
console.log('PORT loaded:', process.env.PORT);
console.log('--- ENV DEBUG END ---');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const PORT = process.env.PORT || 8081;
const MONGO_URI = "mongodb+srv://pamidiyesaswini08_db_user:database@taskcluster1.3jbubs.mongodb.net/";
// CORS setup: Allow requests from the React client (localhost:3000)
// This is critical for development
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}));

// Middleware to parse JSON bodies from requests
app.use(express.json());

// --------------------------------------------------
// SOCKET.IO SETUP
// --------------------------------------------------

// Initialize Socket.io server, allowing connections from the client
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Client URL
        methods: ['GET', 'POST']
    }
});

// Attach the socket.io instance to the request object so routes can use it
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io connection logging
io.on('connection', (socket) => {
    console.log(`[Socket] A user connected: ${socket.id}`);
    socket.on('disconnect', (reason) => {
        console.log(`[Socket] User disconnected: ${socket.id}. Reason: ${reason}`);
    });
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

// Prefix all task routes with /api/tasks
app.use('/api/tasks', taskRoutes);

// Simple default route check
app.get('/', (req, res) => {
    res.send('Task Manager API is running!');
});

// --------------------------------------------------
// DATABASE CONNECTION AND SERVER START
// --------------------------------------------------

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully.');
        // Start the HTTP server only after successful DB connection
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection disconnected.');
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    });
});