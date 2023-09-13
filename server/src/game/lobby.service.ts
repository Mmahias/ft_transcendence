import { v4 as uuidv4 } from 'uuid';

type Player = any; // Define this based on your player structure

type Lobby = {
  id: string;
  host: Player;
  players: Player[];
  gameSettings: any; // Define this based on your gameSettings structure
};

let MAX_PLAYERS = 2;
let lobbies: Lobby[] = [];

function generateUniqueID(): string {
    return uuidv4();
}

function createLobby(hostPlayer: Player): Lobby {
  const lobby: Lobby = {
    id: generateUniqueID(),
    host: hostPlayer,
    players: [hostPlayer],
    gameSettings: {}, // defaultSettings logic here
  };
  lobbies.push(lobby);
  return lobby;
}

function joinLobby(lobbyID: string, player: Player): boolean {
  const lobby = lobbies.find(l => l.id === lobbyID);
  if (lobby && lobby.players.length < MAX_PLAYERS) {
    lobby.players.push(player);
    return true; // Successfully joined
  }
  return false; // Failed to join
}

function leaveLobby(lobbyID: string, player: Player): void {
  const lobby = lobbies.find(l => l.id === lobbyID);
  if (lobby) {
    lobby.players = lobby.players.filter(p => p !== player);
    if (lobby.players.length === 0) {
      // Remove the lobby if empty
      lobbies = lobbies.filter(l => l.id !== lobbyID);
    } else if (lobby.host === player) {
      // Nominate a new host if the host leaves
      lobby.host = lobby.players[0];
    }
  }
}

function getLobby(lobbyID: string): Lobby | undefined {
    return lobbies.find(l => l.id === lobbyID);
  }

export { createLobby, joinLobby, leaveLobby, getLobby };
