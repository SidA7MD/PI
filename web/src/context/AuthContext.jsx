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

  const login = async (identifier, password) => {
    try {
      const body = { email: identifier, password };

      const res = await api.post('/auth/login', body);

      // Parents are not allowed on Web
      if (res.data.user.role === 'parent') {
        throw new Error('Les parents ne peuvent se connecter que via l\'application mobile');
      }

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
