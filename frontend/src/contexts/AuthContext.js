import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const sessionToken = sessionStorage.getItem('sessionToken');
    if (savedUser && sessionToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('sessionToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('sessionToken', 'active');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('sessionToken');
  };

  const signup = (userData) => {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = existingUsers.find(u => u.email === userData.email);
    if (!userExists) {
      existingUsers.push({
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    }
  };

  const authenticateUser = (email, password) => {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    return user;
  };

  const value = {
    user,
    login,
    logout,
    signup,
    authenticateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 