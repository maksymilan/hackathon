// src/App.tsx (最终布局版)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ChatSpace from './pages/ChatSpace';

// AppLayout 现在是所有页面的“外壳”
const AppLayout: React.FC = () => (
  <div className="app-container"> {/* 新增一个总容器 */}
    <NavigationBar />
    <main className="main-content">
      <Outlet /> {/* 子页面 (Dashboard, ProfilePage, ChatSpace) 会在这里渲染 */}
    </main>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* --- 关键修改：将ChatSpace也移入AppLayout中 --- */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat/:topic" element={<ChatSpace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;