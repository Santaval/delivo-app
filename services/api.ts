import config from "@/config/env";
import axios from "axios";

const api = axios.create({
  baseURL: config.apiUrl || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});


export default api;