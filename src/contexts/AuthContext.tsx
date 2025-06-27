import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth-user');
    if (saved) {
      setUsername(saved);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
    localStorage.setItem('auth-user', name);
  };

  const logout = () => {
    setUsername(null);
    setIsLoggedIn(false);
    localStorage.removeItem('auth-user');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 