import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('用户名和密码不能为空');
      return;
    }
    if (localStorage.getItem('user:' + username.trim())) {
      setError('用户名已存在');
      return;
    }
    localStorage.setItem('user:' + username.trim(), password);
    setSuccess('注册成功！即将跳转登录页...');
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">注册新账号</h1>
        <form onSubmit={handleRegister}>
          <input
            className="login-input"
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); setSuccess(''); }}
            autoFocus
          />
          <input
            className="login-input"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); setSuccess(''); }}
          />
          <button className="login-btn" type="submit" disabled={!username.trim() || !password}>注册</button>
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
        </form>
        <div style={{marginTop: '1rem', textAlign: 'center'}}>
          <a href="/login">已有账号？去登录</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 