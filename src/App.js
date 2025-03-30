import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import './styles/App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [showAnimation, setShowAnimation] = useState(false); // Animation state
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 }); // Click position

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (showAnimation) {
      const timer = setTimeout(() => setShowAnimation(false), 800); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [theme, showAnimation]);

  const toggleTheme = (e) => {
    const { clientX: x, clientY: y } = e; // Get click position
    if (theme === 'light') {
      setAnimationPosition({ x, y });
      setShowAnimation(true); // Trigger animation only for Dark Mode
    }
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className="app">
        {showAnimation && (
          <div
            className="dark-mode-animation"
            style={{
              left: `${animationPosition.x}px`,
              top: `${animationPosition.y}px`,
            }}
          />
        )}
        <Routes>
          <Route path="/" element={<Login toggleTheme={toggleTheme} theme={theme} />} />
          <Route path="/dashboard" element={<Dashboard toggleTheme={toggleTheme} theme={theme} />} />
          <Route path="/profile" element={<Profile toggleTheme={toggleTheme} theme={theme} />} />
          <Route path="/notifications" element={<Notifications toggleTheme={toggleTheme} theme={theme} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;