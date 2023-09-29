import axios from "axios";
import Cookie from 'js-cookie';

const jwtToken = Cookie.get('jwt');

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  },
});

export { api };
