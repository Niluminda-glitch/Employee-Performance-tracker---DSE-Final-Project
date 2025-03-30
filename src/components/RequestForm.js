import React, { useState } from 'react';

function RequestForm({ onSubmit }) {
  const [type, setType] = useState('overtime');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type, hours, date });
    setHours('');
    setDate('');
  };

  return (
    <div className="request-form">
      <h3>Submit Request</h3>
      <form onSubmit={handleSubmit}>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
        >
          <option value="overtime">Overtime</option>
          <option value="leave">Leave</option>
        </select>
        
        {type === 'overtime' && (
          <input
            type="number"
            placeholder="Hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        )}
        
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default RequestForm;