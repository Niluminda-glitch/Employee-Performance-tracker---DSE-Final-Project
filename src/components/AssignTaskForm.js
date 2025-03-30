import React, { useState } from 'react';
import { mockUsers } from '../services/mockUsers'; // For dropdown options
import '../styles/AssignTaskForm.css';

function AssignTaskForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');

  const employees = mockUsers.filter((user) => user.role === 'employee');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, assignee, deadline, priority });
    // Reset form
    setTitle('');
    setAssignee('');
    setDeadline('');
    setPriority('Medium');
  };

  return (
    <div className="assign-task-form">
      <h3>Assign New Task</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          required
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.email} value={employee.email}>
              {employee.email}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Assign Task</button>
      </form>
    </div>
  );
}

export default AssignTaskForm;