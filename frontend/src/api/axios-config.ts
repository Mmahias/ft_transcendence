import axios from "axios";
const axiosPublic = axios.create({
  baseURL: '/api',
});

const axiosPrivate = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export { axiosPublic, axiosPrivate };
