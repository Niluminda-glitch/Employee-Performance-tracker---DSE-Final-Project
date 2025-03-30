import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Notifications.css';

function Notifications({ toggleTheme, theme }) {
  const navigate = useNavigate();
  const notifications = [
    { id: 1, message: 'New task assigned: Complete Production Batch #123', date: '2025-03-05' },
    { id: 2, message: 'Overtime request approved for 2h', date: '2025-03-04' },
  ];

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>
            {notif.message} - <span>{notif.date}</span>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      <button onClick={(e) => toggleTheme(e)}>
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
    </div>
  );
}

export default Notifications;