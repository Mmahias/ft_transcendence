type Player = any;
type Lobby = {
    id: string;
    host: Player;
    players: Player[];
    gameSettings: any;
};
declare function createLobby(hostPlayer: Player): Lobby;
declare function joinLobby(lobbyID: string, player: Player): boolean;
declare function leaveLobby(lobbyID: string, player: Player): void;
declare function getLobby(lobbyID: string): Lobby | undefined;
export { createLobby, joinLobby, leaveLobby, getLobby };
