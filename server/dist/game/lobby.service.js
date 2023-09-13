"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLobby = exports.leaveLobby = exports.joinLobby = exports.createLobby = void 0;
const uuid_1 = require("uuid");
let MAX_PLAYERS = 2;
let lobbies = [];
function generateUniqueID() {
    return (0, uuid_1.v4)();
}
function createLobby(hostPlayer) {
    const lobby = {
        id: generateUniqueID(),
        host: hostPlayer,
        players: [hostPlayer],
        gameSettings: {},
    };
    lobbies.push(lobby);
    return lobby;
}
exports.createLobby = createLobby;
function joinLobby(lobbyID, player) {
    const lobby = lobbies.find(l => l.id === lobbyID);
    if (lobby && lobby.players.length < MAX_PLAYERS) {
        lobby.players.push(player);
        return true;
    }
    return false;
}
exports.joinLobby = joinLobby;
function leaveLobby(lobbyID, player) {
    const lobby = lobbies.find(l => l.id === lobbyID);
    if (lobby) {
        lobby.players = lobby.players.filter(p => p !== player);
        if (lobby.players.length === 0) {
            lobbies = lobbies.filter(l => l.id !== lobbyID);
        }
        else if (lobby.host === player) {
            lobby.host = lobby.players[0];
        }
    }
}
exports.leaveLobby = leaveLobby;
function getLobby(lobbyID) {
    return lobbies.find(l => l.id === lobbyID);
}
exports.getLobby = getLobby;
//# sourceMappingURL=lobby.service.js.map