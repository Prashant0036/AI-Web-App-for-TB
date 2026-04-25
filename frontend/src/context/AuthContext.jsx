import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from local storage
    const storedUser = localStorage.getItem('tb_user');
    const token = localStorage.getItem('tb_token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('tb_user', JSON.stringify(userData));
    localStorage.setItem('tb_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('tb_user');
    localStorage.removeItem('tb_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
