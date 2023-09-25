import axios from "axios";
import Cookie from 'js-cookie';

const APP_URL = import.meta.env.VITE_APP_URL;
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;
const BASE_URL = `${APP_URL}:${BACKEND_PORT}`;

const jwtToken = Cookie.get('jwt');

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  },
});

console.log(`BASE_URL: ${BASE_URL}`);
console.log(`BASE_URL: ${jwtToken}`);

export { api, BASE_URL };
