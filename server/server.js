// Load environment variables from .env file
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path'); 
const app = express();
const server = http.createServer(app); 
// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const isDevelopment = process.env.NODE_ENV !== 'production'; 

// CRITICAL FIX: Explicitly define the allowed origin(s). 
// Render requires the HTTPS origin to be explicitly allowed for WebSocket.
const allowedOrigins = [
    'http://localhost:3000', // Local Dev
    'https://real-time-task-manager.onrender.com' // Render Production URL
];

// CORS setup: Allow requests from the React client 
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) and explicit allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}));

// Middleware to parse JSON bodies from requests
app.use(express.json());

// --------------------------------------------------
// SOCKET.IO SETUP
// --------------------------------------------------

// Initialize Socket.io server
const io = new Server(server, {
    path: '/socket.io/', 
    cors: {
        // CRITICAL FIX: Socket.IO CORS must also explicitly allow the Render origin
        origin: allowedOrigins, 
        methods: ['GET', 'POST']
    }
});
const taskRoutes = require('./routes/taskRoutes')(io);
app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log("[Socket] A user connected: ${socket.id}");
    socket.on('disconnect', (reason) => {
        console.log("[Socket] User disconnected: ${socket.id}. Reason: ${reason}");
    });
});

// ... (Rest of the file remains the same)

// Prefix all task API routes with /api/tasks
app.use('/api/tasks', taskRoutes);

// --------------------------------------------------
// DEPLOYMENT CONFIGURATION: SERVE STATIC CLIENT FILES
// --------------------------------------------------

// 1. Serve static files (JS, CSS, images) from the client's build folder
const buildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));

// 2. Fallback Route: For any non-API request, serve the index.html
app.get('*', (req, res) => {
    
    // Safety check for local dev
    if (isDevelopment) {
        // If still in dev, serve the simple test message
        return res.send('Task Manager API is running in Development Mode!');
    }
    
    // In production, always serve the React index.html for all non-API routes.
    res.sendFile(path.join(buildPath, 'index.html'));
});

// ... (The database connection and server start block)
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