import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login({ toggleTheme, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login logic (replace with real auth when backend is ready)
    const role = email.includes('manager') ? 'manager' : email.includes('supervisor') ? 'supervisor' : 'employee';
    localStorage.setItem('role', role);
    localStorage.setItem('email', email);
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <h1>Employee Performance Tracker</h1>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={(e) => toggleTheme(e)}>
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
    </div>
  );
}

export default Login;