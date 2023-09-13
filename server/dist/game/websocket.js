"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('playerMove', (data) => {
        socket.broadcast.emit('opponentMove', data);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
server.listen(3001, () => {
    console.log('WebSocket server listening on port 3001');
});
//# sourceMappingURL=websocket.js.map