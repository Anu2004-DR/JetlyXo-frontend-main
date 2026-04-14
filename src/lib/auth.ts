import api from "./axios";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};

/*export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};*/

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};