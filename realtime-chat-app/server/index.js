// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // IMPORTANT: This 'cors' setting allows your frontend to connect.
    // Adjust the 'origin' URL to match where your frontend is running.
    // - If you're using Vue.js (default port 8080), it should be "http://localhost:8080"
    // - If you're using React.js (default port 3000), it should be "http://localhost:3000"
    cors: {
        origin: "http://localhost:8080", // <--- CHANGE THIS IF YOUR FRONTEND IS ON A DIFFERENT PORT (e.g., 3000 for React)
        methods: ["GET", "POST"]
    }
});

// A simple array to store messages in memory.
// In a real application, you'd use a database like MongoDB or PostgreSQL for persistent storage.
let messages = [];

// This block listens for new WebSocket connections.
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id); // Log the unique ID of the new connection

    // 1. When a new user connects, send them the existing message history.
    socket.emit('message history', messages); // 'emit' sends a message to THIS specific client.

    // 2. Listen for 'chat message' events sent from any client.
    socket.on('chat message', (msg) => {
        console.log('Message received:', msg);

        // Store the incoming message.
        messages.push(msg);

        // 3. Broadcast the received message to ALL connected clients.
        // 'io.emit' sends a message to every single client connected to the server.
        io.emit('chat message', msg);
    });

    // 4. Listen for when a client disconnects.
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Set the port for your backend server.
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`WebSocket server listening on port ${PORT}`);
});