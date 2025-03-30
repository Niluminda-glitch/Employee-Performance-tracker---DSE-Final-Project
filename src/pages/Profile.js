import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/mockUserData';
import '../styles/Profile.css';

function Profile({ toggleTheme, theme }) {
  const role = localStorage.getItem('role') || 'employee';
  const profileData = getUserProfile(role);
  const [email, setEmail] = useState(profileData.email);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate saving to backend
    localStorage.setItem('email', email);
    setMessage('Profile updated successfully!');
    setPassword('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="profile-container">
      <h2>{profileData.role} Profile</h2>
      <div className="profile-stats">
        {role === 'employee' && (
          <>
            <p><strong>Tasks Completed:</strong> {profileData.tasksCompleted}</p>
            <p><strong>Tasks Pending:</strong> {profileData.tasksPending}</p>
            <p><strong>Overtime Hours:</strong> {profileData.overtimeHours}h</p>
          </>
        )}
        {role === 'supervisor' && (
          <>
            <p><strong>Team Size:</strong> {profileData.teamSize}</p>
            <p><strong>Tasks Assigned:</strong> {profileData.tasksAssigned}</p>
            <p><strong>Requests Approved:</strong> {profileData.requestsApproved}</p>
          </>
        )}
        {role === 'manager' && (
          <>
            <p><strong>Reports Generated:</strong> {profileData.reportsGenerated}</p>
            <p><strong>Employees Managed:</strong> {profileData.employeesManaged}</p>
            <p><strong>Overtime Approved:</strong> {profileData.overtimeApproved}h</p>
          </>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password (optional):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
      <button onClick={(e) => toggleTheme(e)}>
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
    </div>
  );
}

export default Profile;