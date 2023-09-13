import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);    // Attach express app to HTTP server
const io = new Server(server);            // Attach socket.io to the same HTTP server

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('playerMove', (data: any) => {
        socket.broadcast.emit('opponentMove', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3001, () => {
    console.log('WebSocket server listening on port 3001');
});
