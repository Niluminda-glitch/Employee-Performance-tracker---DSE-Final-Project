import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import ManagerDashboard from './ManagerDashboard';
import '../styles/Dashboard.css';

function Dashboard({ toggleTheme, theme }) {
  const role = localStorage.getItem('role') || 'employee';
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <nav>
        <button onClick={() => navigate('/profile')}>Profile</button>
        <button onClick={() => navigate('/notifications')}>Notifications</button>
        <button onClick={(e) => toggleTheme(e)}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </nav>
      <h1>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
      {role === 'employee' && <EmployeeDashboard />}
      {role === 'supervisor' && <SupervisorDashboard />}
      {role === 'manager' && <ManagerDashboard />}
    </div>
  );
}

export default Dashboard;