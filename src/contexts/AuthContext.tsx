import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialAuth() {
  const savedUser = localStorage.getItem('auth-user');
  const savedLogin = localStorage.getItem('auth-logged-in');
  return {
    isLoggedIn: !!savedUser && savedLogin === 'true',
    username: savedUser || null
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getInitialAuth().isLoggedIn);
  const [username, setUsername] = useState<string | null>(() => getInitialAuth().username);

  const login = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
    localStorage.setItem('auth-user', name);
    localStorage.setItem('auth-logged-in', 'true');
  };

  const logout = () => {
    setUsername(null);
    setIsLoggedIn(false);
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-logged-in');
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