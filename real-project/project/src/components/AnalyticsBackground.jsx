import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnalyticsBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse movement for subtle parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate mouse position relative to window center
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Generate random data points for the background
  const generateDataPoints = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.2 + 0.1,
      delay: Math.random() * 5,
      duration: Math.random() * 20 + 30,
    }));
  };

  // Generate random connection lines between data points
  const generateConnections = (count, dataPoints) => {
    if (dataPoints.length < 2) return [];
    
    return Array.from({ length: count }, (_, i) => {
      const startPoint = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      let endPoint = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      
      // Ensure we don't connect a point to itself
      while (endPoint.id === startPoint.id) {
        endPoint = dataPoints[Math.floor(Math.random() * dataPoints.length)];
      }
      
      return {
        id: i,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: endPoint.x,
        endY: endPoint.y,
        opacity: Math.random() * 0.1 + 0.05,
        delay: Math.random() * 5,
      };
    });
  };

  const dataPoints = generateDataPoints(30);
  const connections = generateConnections(15, dataPoints);

  // Generate grid lines
  const generateGridLines = () => {
    const verticalLines = Array.from({ length: 10 }, (_, i) => ({
      id: `v-${i}`,
      position: (i + 1) * 10,
      isVertical: true,
    }));
    
    const horizontalLines = Array.from({ length: 10 }, (_, i) => ({
      id: `h-${i}`,
      position: (i + 1) * 10,
      isVertical: false,
    }));
    
    return [...verticalLines, ...horizontalLines];
  };

  const gridLines = generateGridLines();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background - data-focused colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ 
             backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px), radial-gradient(#3b82f6 0.5px, transparent 0.5px)',
             backgroundSize: '20px 20px',
             backgroundPosition: '0 0, 10px 10px'
           }}>
      </div>
      
      {/* Grid lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: mousePosition.x * -5,
          y: mousePosition.y * -5,
        }}
      >
        {gridLines.map((line) => (
          <div
            key={line.id}
            className="absolute bg-blue-200/10"
            style={{
              ...(line.isVertical
                ? {
                    left: `${line.position}%`,
                    top: 0,
                    width: '1px',
                    height: '100%',
                  }
                : {
                    left: 0,
                    top: `${line.position}%`,
                    width: '100%',
                    height: '1px',
                  }),
            }}
          />
        ))}
      </motion.div>
      
      {/* Data flow visualization */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: mousePosition.x * -10,
          y: mousePosition.y * -10,
        }}
      >
        {/* Connection lines between data points */}
        {connections.map((connection) => (
          <motion.div
            key={`connection-${connection.id}`}
            className="absolute bg-blue-400"
            style={{
              left: `${connection.startX}%`,
              top: `${connection.startY}%`,
              width: '1px',
              height: '1px',
              opacity: connection.opacity,
              transformOrigin: 'top left',
            }}
            animate={{
              opacity: [connection.opacity, connection.opacity * 2, connection.opacity],
            }}
            transition={{
              duration: 4,
              delay: connection.delay,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <motion.div
              className="absolute bg-blue-400"
              style={{
                width: `${Math.sqrt(
                  Math.pow(connection.endX - connection.startX, 2) +
                  Math.pow(connection.endY - connection.startY, 2)
                )}%`,
                height: '1px',
                transformOrigin: 'top left',
                transform: `rotate(${Math.atan2(
                  connection.endY - connection.startY,
                  connection.endX - connection.startX
                ) * (180 / Math.PI)}deg)`,
              }}
            />
          </motion.div>
        ))}
        
        {/* Data points */}
        {dataPoints.map((point) => (
          <motion.div
            key={`point-${point.id}`}
            className="absolute rounded-full bg-blue-500"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${point.size}px`,
              height: `${point.size}px`,
              opacity: point.opacity,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [point.opacity, point.opacity * 1.5, point.opacity],
            }}
            transition={{
              duration: 4,
              delay: point.delay,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        ))}
      </motion.div>
      
      {/* Soft glowing areas representing data clusters */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-2/3 left-2/3 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Data flow animation */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <motion.path
          fill="#3b82f6"
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,165.3C96,171,192,181,288,197.3C384,213,480,235,576,218.7C672,203,768,149,864,149.3C960,149,1056,203,1152,202.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,229.3C96,235,192,245,288,261.3C384,277,480,299,576,282.7C672,267,768,213,864,213.3C960,213,1056,267,1152,266.7C1248,267,1344,213,1392,186.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{
            duration: 40,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </svg>
      
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <motion.path
          fill="#6366f1"
          d="M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,213.3C672,203,768,213,864,208C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,213.3C672,203,768,213,864,208C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,181.3C672,171,768,181,864,176C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,288L48,293.3C96,299,192,309,288,298.7C384,288,480,256,576,245.3C672,235,768,245,864,240C960,235,1056,213,1152,218.7C1248,224,1344,256,1392,272L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{
            duration: 30,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: 10,
          }}
        />
      </svg>
    </div>
  );
};

export default AnalyticsBackground;
