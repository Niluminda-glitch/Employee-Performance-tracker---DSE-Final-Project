import React from 'react';
import '../styles/RequestList.css';

function RequestList({ requests, onStatusChange }) {
  return (
    <div className="request-list">
      <h3>Pending Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
            {requests.map((request) => (
            <tr key={request.id}>
                <td>{request.employeeEmail}</td>
                <td>{request.type}</td>
                <td>{request.date}</td>
                <td>
                {/* Ensure ONLY the <select> is here */}
                <select
                    value={request.status}
                    onChange={(e) => onStatusChange(request.id, e.target.value)}
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                </td>
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestList;

