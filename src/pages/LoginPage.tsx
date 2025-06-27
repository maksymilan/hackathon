import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { profile, refreshProfile } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('用户名和密码不能为空');
      return;
    }
    const savedPassword = localStorage.getItem('user:' + username.trim());
    if (!savedPassword) {
      setError('用户不存在');
      return;
    }
    if (savedPassword !== password) {
      setError('用户名或密码错误');
      return;
    }
    login(username.trim());
    const newProfile = {
      ...(profile || {}),
      nickname: username.trim(),
      avatar: profile?.avatar || '',
      interests: profile?.interests || []
    };
    localStorage.setItem('profile-local', JSON.stringify(newProfile));
    refreshProfile();
    navigate('/');
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">欢迎登录 AI 学习空间</h1>
        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            autoFocus
          />
          <input
            className="login-input"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
          />
          <button className="login-btn" type="submit" disabled={!username.trim() || !password}>登录</button>
          {error && <div className="login-error">{error}</div>}
        </form>
        <div style={{marginTop: '1rem', textAlign: 'center'}}>
          <a href="/register">没有账号？去注册</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 