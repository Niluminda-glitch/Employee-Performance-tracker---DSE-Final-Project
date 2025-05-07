import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/analytics-floating-aura.css';

// Ensure styles are loaded
const styles = `
  .floating-aura-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: -10;
  }

  .analytics-bg-gradient {
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(243, 232, 255, 0.9), rgba(237, 233, 254, 1), rgba(224, 231, 255, 0.9));
    background-size: 300% 300%;
    animation: gradient-shift 30s ease-in-out infinite;
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// SVG paths for different shapes
const svgPaths = {
  blob1: "M45.5,0.5c31.6,0.3,42.5,27.4,42.5,49.5s-10.9,49.2-42.5,49.5c-31.6,0.3-42.5-27.4-42.5-49.5S13.9,0.2,45.5,0.5z",
  blob2: "M53.5,0.5c27.3,0.3,42.5,23.4,42.5,49.5s-15.2,49.2-42.5,49.5c-27.3,0.3-53.5-23.4-53.5-49.5S26.2,0.2,53.5,0.5z",
  circle: "M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0 Z",
  roundedSquare: "M25,0 h50 a25,25 0 0 1 25,25 v50 a25,25 0 0 1 -25,25 h-50 a25,25 0 0 1 -25,-25 v-50 a25,25 0 0 1 25,-25 z",
  star: "M50,0 L63,38 L100,38 L69,61 L82,100 L50,77 L18,100 L31,61 L0,38 L37,38 Z",
  sparkle: "M50,0 L60,40 L100,50 L60,60 L50,100 L40,60 L0,50 L40,40 Z"
};

// Floating shape component
const FloatingShape = ({
  svgPath,
  size,
  duration,
  delay,
  left,
  top,
  color1,
  color2,
  animationType = "float-up",
  className = ""
}) => {
  return (
    <div
      className={`floating-shape ${animationType} ${className}`}
      style={{
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-50">
        <path d={svgPath} fill={`url(#grad-${left}-${top})`} />
        <defs>
          <linearGradient id={`grad-${left}-${top}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Generate random particles
const generateParticles = (count) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 60 + 60,
      delay: Math.random() * 10,
    });
  }
  return particles;
};

// Main FloatingAura component
const FloatingAura = () => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particles = generateParticles(30);

  // Shapes configuration
  const shapes = [
    {
      svgPath: svgPaths.blob1,
      size: '250px',
      duration: 25,
      delay: 0,
      left: 10,
      top: 15,
      color1: '#C4B5FD',
      color2: '#A78BFA',
      animationType: 'float-up'
    },
    {
      svgPath: svgPaths.circle,
      size: '120px',
      duration: 30,
      delay: 5,
      left: 80,
      top: 20,
      color1: '#DDD6FE',
      color2: '#C4B5FD',
      animationType: 'float-diagonal'
    },
    {
      svgPath: svgPaths.roundedSquare,
      size: '150px',
      duration: 35,
      delay: 10,
      left: 30,
      top: 70,
      color1: '#EDE9FE',
      color2: '#DDD6FE',
      animationType: 'float-circle'
    },
    {
      svgPath: svgPaths.blob2,
      size: '280px',
      duration: 40,
      delay: 15,
      left: 70,
      top: 60,
      color1: '#A78BFA',
      color2: '#8B5CF6',
      animationType: 'float-diagonal'
    },
    {
      svgPath: svgPaths.star,
      size: '80px',
      duration: 20,
      delay: 8,
      left: 20,
      top: 40,
      color1: '#DDD6FE',
      color2: '#A78BFA',
      animationType: 'float-circle'
    },
    {
      svgPath: svgPaths.sparkle,
      size: '60px',
      duration: 15,
      delay: 12,
      left: 60,
      top: 30,
      color1: '#EDE9FE',
      color2: '#C4B5FD',
      animationType: 'float-up'
    },
  ];

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const { clientX, clientY } = e;
      const { width, height } = containerRef.current.getBoundingClientRect();

      // Calculate mouse position relative to container center
      const x = (clientX / width - 0.5) * 2;
      const y = (clientY / height - 0.5) * 2;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Inject styles directly
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="floating-aura-container -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 analytics-bg-gradient"></div>

      {/* Floating shapes */}
      <motion.div
        className="absolute inset-0 parallax-layer"
        style={{
          x: mousePosition.x * -20,
          y: mousePosition.y * -20
        }}
      >
        {shapes.map((shape, index) => (
          <FloatingShape key={index} {...shape} />
        ))}
      </motion.div>

      {/* Particles */}
      <motion.div
        className="absolute inset-0 parallax-layer"
        style={{
          x: mousePosition.x * -10,
          y: mousePosition.y * -10
        }}
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>

      {/* Glow effects */}
      <div className="glow-effect" style={{ left: '20%', top: '30%' }}></div>
      <div className="glow-effect" style={{ left: '70%', top: '60%' }}></div>
      <div className="glow-effect" style={{ left: '40%', top: '10%' }}></div>
      <div className="glow-effect" style={{ left: '10%', top: '70%' }}></div>
      <div className="glow-effect" style={{ left: '80%', top: '20%' }}></div>
    </div>
  );
};

export default FloatingAura;
