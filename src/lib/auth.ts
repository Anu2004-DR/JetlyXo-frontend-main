import api from "./axios";

export async function loginUser(email: string, password: string) {
  try {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    const token = res.data?.token;

    if (!token) throw new Error("No token received");

    // ✅ STORE TOKEN
    localStorage.setItem("token", token);

    return res.data;

  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
}

export function logoutUser() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function getToken() {
  return localStorage.getItem("token");
}