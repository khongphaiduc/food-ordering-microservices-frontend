import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7150",
});

api.interceptors.request.use(config => {

  const token = localStorage.getItem("token");   // gáp token khi call api 

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
