import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/ManagerDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ManagerDashboard() {
  const [requests, setRequests] = useState([
    { id: 1, type: 'overtime', employee: 'employee@test.com', date: '2025-03-10', hours: '2h', status: 'pending' },
  ]);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Team Productivity',
      data: [75, 82, 90],
      backgroundColor: '#4CAF50',
    }],
  };

  const handleRequestAction = (reqId, action) => {
    setRequests(requests.map(req => 
      req.id === reqId ? { ...req, status: action } : req
    ));
  };

  const handleGenerateReport = () => {
    alert('PDF Report Generated! (Mock action)');
  };

  return (
    <div className="manager-dashboard">
      <h2>Performance Overview</h2>
      <div className="chart-container">
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
      <button onClick={handleGenerateReport}>Generate Report</button>
      <div className="request-approval">
        <h3>Overtime/Leave Approvals</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Employee</th>
              <th>Date</th>
              <th>Hours</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.type}</td>
                <td>{req.employee}</td>
                <td>{req.date}</td>
                <td>{req.hours}</td>
                <td>
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleRequestAction(req.id, 'approved')}>Approve</button>
                      <button onClick={() => handleRequestAction(req.id, 'rejected')}>Reject</button>
                    </>
                  ) : (
                    <span className={`status-${req.status}`}>{req.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagerDashboard;