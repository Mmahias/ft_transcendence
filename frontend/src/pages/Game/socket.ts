import { io } from "socket.io-client";

const socket = io('http://localhost:3001'); // URL of your backend server.

export default socket;
