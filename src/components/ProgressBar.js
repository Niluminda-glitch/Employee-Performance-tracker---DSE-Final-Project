import React, { useEffect, useState } from 'react';
import Tooltip from './Tooltip';
import '../styles/ProgressBar.css';

const ProgressBar = ({ progress, message }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to target value
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getBarColor = () => {
    if (progress === 0) return '#FF5252';  // Vibrant red
    if (progress === 50) return '#FFD740'; // Bright amber
    return '#69F0AE'; // Neon green
  };

  return (
    <Tooltip message={message}>
      <div className="progress-wrapper">
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${animatedProgress}%`,
              backgroundColor: getBarColor(),
            }}
          >
            <span className="progress-text">{animatedProgress}%</span>
          </div>
        </div>
        <span className="progress-label">{animatedProgress}%</span>
      </div>
    </Tooltip>
  );
};

export default ProgressBar;