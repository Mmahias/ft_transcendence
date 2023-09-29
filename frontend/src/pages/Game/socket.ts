import { BACKEND_FULL_URL } from "constants/constants";
import { io } from "socket.io-client";

const socket = io(BACKEND_FULL_URL); // URL of your backend server.

export default socket;
