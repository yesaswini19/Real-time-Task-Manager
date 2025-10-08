// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const taskRoutes = require('./routes/taskRoutes');

const path = require('path'); // Import the path module

const app = express();
const server = http.createServer(app); 

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const PORT = process.env.PORT || 8081;
// Use the variable name MONGODB_URI which is set on Render
const MONGO_URI = process.env.MONGODB_URI; 
const isDevelopment = process.env.NODE_ENV !== 'production'; // Check if NOT production

// CORS setup: Only enable CORS for local development
if (isDevelopment) {
    // Only applies locally, Render handles production CORS automatically
    app.use(cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true
    }));
}

// Middleware to parse JSON bodies from requests
app.use(express.json());

// --------------------------------------------------
// SOCKET.IO SETUP
// --------------------------------------------------

// Initialize Socket.io server
const io = new Server(server, {
    cors: {
        // In development, allow localhost:3000. In production, same origin works.
        origin: isDevelopment ? 'http://localhost:3000' : false, 
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


// --------------------------------------------------
// DEPLOYMENT CONFIGURATION: SERVE STATIC CLIENT FILES
// --------------------------------------------------

// The client files (React build) should be served FIRST.
// We assume that the client build step (npm run build) has run and created the build directory.

// 1. Serve any static files (like JS, CSS, images) from the client's build folder
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// 2. Handle any requests not handled by the API routes by serving the client's index.html
// This allows the React routing to take over. This route MUST be last.
app.get('*', (req, res) => {
    // If running in development and we hit this route, it's the simple test message.
    if (isDevelopment) {
        return res.send('Task Manager API is running in Development Mode!');
    }
    
    // In production, serve the React application
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
});


// --------------------------------------------------
// DATABASE CONNECTION AND SERVER START
// --------------------------------------------------

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in the environment.");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully.');
        // Start the HTTP server only after successful DB connection
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
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
