import React from 'react';
import '../styles/PriorityIndicator.css';

const PriorityIndicator = ({ priority }) => {
  const getPriorityDetails = () => {
    switch (priority) {
      case 'High':
        return { icon: '🔥', color: '#ff4444', label: 'High Priority' };
      case 'Medium':
        return { icon: '⚠️', color: '#ffdd44', label: 'Medium Priority' };
      case 'Low':
        return { icon: '🌿', color: '#4CAF50', label: 'Low Priority' };
      default:
        return { icon: '', color: 'gray', label: 'Unknown' };
    }
  };

  const { icon, color, label } = getPriorityDetails();

  return (
    <div className="priority-indicator" style={{ color: color }}>
      <span role="img" aria-label={label}>{icon}</span>
    </div>
  );
};

export default PriorityIndicator;