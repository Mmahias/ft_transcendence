import { createLobby, joinLobby, leaveLobby, getLobby } from './lobby.service';  // Import the getLobby function

export function setupLobbyGateway(io: any) {
  io.on('connection', (socket) => {
    socket.on('createLobby', (player) => {
      const lobby = createLobby(player);
      socket.join(lobby.id);
      io.to(lobby.id).emit('lobbyUpdate', lobby);
    });

    socket.on('joinLobby', (lobbyID, player) => {
      const success = joinLobby(lobbyID, player);
      if (success) {
        socket.join(lobbyID);
        const lobby = getLobby(lobbyID); // Get the lobby details after joining
        io.to(lobbyID).emit('lobbyUpdate', lobby);
      } else {
        socket.emit('joinFailed');
      }
    });

    socket.on('leaveLobby', (lobbyID, player) => {
      leaveLobby(lobbyID, player);
      const lobby = getLobby(lobbyID); // Get the lobby details after leaving
      socket.leave(lobbyID);
      io.to(lobbyID).emit('lobbyUpdate', lobby);
    });
  });
}
