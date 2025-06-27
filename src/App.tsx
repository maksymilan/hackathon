// src/App.tsx (最终布局版)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Dashboard from './pages/Dashboard.tsx';
import ProfilePage from './pages/ProfilePage';
import ChatSpace from './pages/ChatSpace';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// AppLayout 现在是所有页面的"外壳"
const AppLayout: React.FC = () => (
  <div className="app-container"> {/* 新增一个总容器 */}
    <NavigationBar />
    <main className="main-content">
      <Outlet /> {/* 子页面 (Dashboard, ProfilePage, ChatSpace) 会在这里渲染 */}
    </main>
  </div>
);

// 路由保护组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    window.location.href = '/login';
    return null;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/chat/:topic" element={<ProtectedRoute><ChatSpace /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;