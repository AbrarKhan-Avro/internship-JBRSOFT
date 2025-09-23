import React, { createContext, useState, useEffect } from "react";
import * as jwtDecode from "jwt-decode";
import api from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
      // fetch user profile
      api.get("/auth/me/").then(res => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }).catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      });
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [token]);

  const login = (accessToken) => {
    setToken(accessToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
