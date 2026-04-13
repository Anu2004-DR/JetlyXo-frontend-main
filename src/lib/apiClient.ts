import axios from "axios";
import { getToken, logout } from "./auth";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    console.log("TOKEN:", token); // debug

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized - token invalid or expired");

      // Only logout if token exists
      const token = getToken();
      if (token) {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;