import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const NavigationBar: React.FC = () => {
  const { profile, isLoading } = useUser();

  const renderAvatar = () => {
    if (isLoading) {
      return <div className="avatar-placeholder skeleton" />;
    }

    if (profile?.avatar) {
      return <img src={profile.avatar} alt="User Avatar" className="nav-avatar" />;
    }

    return (
      <div className="avatar-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    );
  };

  return (
    <nav className="main-nav">
      <div className="nav-logo">智学卡片</div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>主页</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>个人中心</NavLink>
      </div>
      <div className="nav-avatar-container">
        {renderAvatar()}
      </div>
    </nav>
  );
};
export default NavigationBar;