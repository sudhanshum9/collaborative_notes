// AuthContext.js
import React, { createContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/token/login/', {
        email,
        password
      });
      setToken(response.data.auth_token);
      localStorage.setItem("token", response.data.auth_token);
      // Fetch user data
      fetchUser();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/auth/users/me/', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Fetching user failed", error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
