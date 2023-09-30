import axios from "axios";
import Cookie from 'js-cookie';

const axiosPublic = axios.create({
  baseURL: '/api',
});

const api = axios.create({
  baseURL: '/api',
});

const axiosPrivate = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export { api, axiosPublic, axiosPrivate };
