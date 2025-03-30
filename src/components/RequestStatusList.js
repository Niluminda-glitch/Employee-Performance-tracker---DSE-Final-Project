import React from 'react';

function RequestStatusList({ requests }) {
  return (
    <div className="request-status-list">
      <h3>Your Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Hours/Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.type}</td>
              <td>{request.date}</td>
              <td>{request.type === 'overtime' ? `${request.hours}h` : 'Leave'}</td>
              <td className={`status-${request.status}`}>{request.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestStatusList;