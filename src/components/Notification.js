import React, { useEffect, useState, useRef } from 'react';

function Notification({ message, type, onClose, isMuted }) {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef(null);
  const interactionRegistered = useRef(false);

  // Initialize audio once
  useEffect(() => {
    audioRef.current = new Audio(`${process.env.PUBLIC_URL}/sounds/notification.mp3`);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
    };
  }, []);

  // Handle user interaction and sound
  useEffect(() => {
    const handleInteraction = () => {
      interactionRegistered.current = true;
    };

    if (type === 'info' && !isMuted) {
      // Register click/touch anywhere on the page
      window.addEventListener('click', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);

      // Try playing sound after interaction
      const tryPlay = () => {
        if (interactionRegistered.current && audioRef.current) {
          audioRef.current.play().catch(error => {
            console.error('Sound blocked:', error);
          });
        }
      };

      tryPlay(); // Immediate attempt
      const retry = setTimeout(tryPlay, 1000); // Retry after 1 second

      return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        clearTimeout(retry);
      };
    }
  }, [type, isMuted]);

  // Auto-close notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Browser notifications
  useEffect(() => {
    if (visible && type === 'info' && window.Notification?.permission === 'granted') {
      new window.Notification('New Request', { body: message });
    }
  }, [visible, message, type]);

  return visible ? (
    <div className={`notification ${type}`}>
      {message}
    </div>
  ) : null;
}

export default Notification;