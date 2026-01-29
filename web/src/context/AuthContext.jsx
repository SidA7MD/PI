// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password, loginType = 'school') => {
    try {
      let body;
      
      // Build request body based on login type
      switch (loginType) {
        case 'school':
          // Schools login with email
          body = { email: identifier, password };
          break;
        case 'teacher':
          // Teachers can login with phone or username
          if (/^[0-9]+$/.test(identifier)) {
            body = { phone: identifier, password };
          } else if (identifier.includes('@')) {
            body = { email: identifier, password };
          } else {
            body = { username: identifier, password };
          }
          break;
        case 'superadmin':
          // Superadmin logs in with username
          body = { username: identifier, password };
          break;
        default:
          body = { username: identifier, password };
      }
      
      const res = await api.post('/auth/login', body);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de connexion';
      throw errorMessage;
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register-school', data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'inscription';
      throw errorMessage;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
