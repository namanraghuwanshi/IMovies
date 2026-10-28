// Authentication Context
// Provides user authentication state, login, register, and logout across the React app
import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on initial app load and fetch current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await API.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Session expired or invalid token:', error.response?.data?.message || error.message);
          // Token is invalid/expired, clean up
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token: newToken, ...userData } = response.data;

    // Save token in localStorage and update state
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  // Register handler
  const register = async (name, email, password) => {
    const response = await API.post('/auth/register', { name, email, password });
    const { token: newToken, ...userData } = response.data;

    // Save token in localStorage and update state
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
