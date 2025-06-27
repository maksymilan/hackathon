import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  return (
    <nav className="main-nav">
      <div className="nav-logo">智学卡片</div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>主页</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>个人中心</NavLink>
      </div>
    </nav>
  );
};
export default NavigationBar;