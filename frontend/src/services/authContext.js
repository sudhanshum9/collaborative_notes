// AuthContext.js
import React, { createContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Use environment variable for API URL with fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/token/login/`, {
        email,
        password
      });
      setToken(response.data.auth_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.auth_token);
      }
      // Fetch user data
      fetchUser();
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Propagate error to handle it in the UI
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/auth/users/me/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Fetching user failed", error);
      // If unauthorized, clear the invalid token
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
