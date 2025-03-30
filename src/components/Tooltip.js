import React, { useState } from 'react';
import '../styles/Tooltip.css';

const Tooltip = ({ message, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && <div className="tooltip">{message}</div>}
    </div>
  );
};

export default Tooltip;