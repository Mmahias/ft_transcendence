import axios from "axios";

const APP_URL = import.meta.env.VITE_APP_URL;
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;
const BASE_URL = `${APP_URL}:${BACKEND_PORT}`;

const api = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true,
});

export { api, BASE_URL };
