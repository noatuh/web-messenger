/**************************************
 * server.js
 **************************************/

// 1. IMPORTS
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// 2. APP SETUP
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve the public folder for static files
app.use(express.static(path.join(__dirname, 'public')));

// 3. SOCKET.IO LOGIC
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a "join" event that will carry the username
  socket.on('join', (username) => {
    socket.username = username;
    console.log(`${socket.username} joined the chat!`);
    
    // Broadcast to all except this socket that a new user has joined
    socket.broadcast.emit('chat message', {
      username: 'System',
      message: `${socket.username} has joined the chat!`
    });
  });

  // Listen for "chat message"
  socket.on('chat message', (msg) => {
    // Broadcast the message to everyone, including sender
    io.emit('chat message', {
      username: socket.username,
      message: msg
    });
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      // Notify the rest of the users
      socket.broadcast.emit('chat message', {
        username: 'System',
        message: `${socket.username} has left the chat.`
      });
    }
  });
});

// 4. START THE SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
