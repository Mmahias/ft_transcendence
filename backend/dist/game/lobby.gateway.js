"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLobbyGateway = void 0;
const lobby_service_1 = require("./lobby.service");
function setupLobbyGateway(io) {
    io.on('connection', (socket) => {
        socket.on('createLobby', (player) => {
            const lobby = (0, lobby_service_1.createLobby)(player);
            socket.join(lobby.id);
            io.to(lobby.id).emit('lobbyUpdate', lobby);
        });
        socket.on('joinLobby', (lobbyID, player) => {
            const success = (0, lobby_service_1.joinLobby)(lobbyID, player);
            if (success) {
                socket.join(lobbyID);
                const lobby = (0, lobby_service_1.getLobby)(lobbyID);
                io.to(lobbyID).emit('lobbyUpdate', lobby);
            }
            else {
                socket.emit('joinFailed');
            }
        });
        socket.on('leaveLobby', (lobbyID, player) => {
            (0, lobby_service_1.leaveLobby)(lobbyID, player);
            const lobby = (0, lobby_service_1.getLobby)(lobbyID);
            socket.leave(lobbyID);
            io.to(lobbyID).emit('lobbyUpdate', lobby);
        });
    });
}
exports.setupLobbyGateway = setupLobbyGateway;
//# sourceMappingURL=lobby.gateway.js.map