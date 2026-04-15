import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;

    // only logout if user is inside protected area
    const protectedPages = [
      "/dashboard",
      "/bookings",
      "/payment",
      "/ticket",
      "/profile"
    ];

    const onProtectedPage = protectedPages.some((p) =>
      path.startsWith(p)
    );

    if (status === 401 && onProtectedPage) {
      localStorage.removeItem("token");

      if (path !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;