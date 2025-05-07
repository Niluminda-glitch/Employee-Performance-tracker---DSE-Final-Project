import React from 'react';

// Background Animation Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50"></div>
      
      {/* Animated Floating Elements */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-purple-500/5 border border-purple-200/20 animate-float"
          style={{
            width: `${Math.random() * 8 + 2}rem`,
            height: `${Math.random() * 8 + 2}rem`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 15}s`
          }}
        ></div>
      ))}
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.015]"></div>
    </div>
  );
};

export default AnimatedBackground;
