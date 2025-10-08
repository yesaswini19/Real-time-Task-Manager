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
const MONGO_URI = "mongodb+srv://pamidiyesaswini08_db_user:database@taskcluster1.3jbubs.mongodb.net/";
const isDevelopment = process.env.NODE_ENV !== 'production'; 

// CORS setup: Only enable CORS for local development (Render handles production automatically)
if (isDevelopment) {
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

const io = new Server(server, {
    cors: {
        origin: isDevelopment ? 'http://localhost:3000' : false, 
        methods: ['GET', 'POST']
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log(`[Socket] A user connected: ${socket.id}`);
    socket.on('disconnect', (reason) => {
        console.log(`[Socket] User disconnected: ${socket.id}. Reason: ${reason}`);
    });
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

// Prefix all task API routes with /api/tasks
app.use('/api/tasks', taskRoutes);

// --------------------------------------------------
// DEPLOYMENT CONFIGURATION: SERVE STATIC CLIENT FILES
// --------------------------------------------------

// --- FIX START: FORCE SERVING OF CLIENT BUILD ---

// 1. Serve static files (JS, CSS, images) from the client's build folder
const buildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));

// 2. Fallback Route: For any non-API request, serve the index.html
// This ensures the React application is loaded for the root path and any internal React routes.
app.get('*', (req, res) => {
    
    // Safety check for local dev, preventing files from breaking locally
    if (isDevelopment) {
        return res.send('Task Manager API is running in Development Mode!');
    }
    
    // In production, always serve the React index.html for all non-API routes.
    res.sendFile(path.join(buildPath, 'index.html'));
});

// --- FIX END ---

// --------------------------------------------------
// DATABASE CONNECTION AND SERVER START
// --------------------------------------------------

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in the environment.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully.');
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

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