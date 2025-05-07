import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NotificationsBackground = () => {
  // Colors suitable for a connectivity/network theme
  const colors = [
    'rgba(167, 139, 250, 0.15)', // Purple
    'rgba(147, 197, 253, 0.12)', // Light blue
    'rgba(196, 181, 253, 0.10)', // Lighter purple
    'rgba(186, 230, 253, 0.08)', // Lighter blue
  ];

  // Generate random nodes for the network
  const generateNodes = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // Size between 2-6rem
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 100, // Position (percentage of viewport)
      y: Math.random() * 100,
      duration: Math.random() * 20 + 40, // Animation duration between 40-60s
      delay: Math.random() * 5, // Delay start by 0-5s
    }));
  };

  // Generate connections between nodes
  const generateConnections = (nodes, maxConnections = 15) => {
    const connections = [];

    // Create a limited number of connections
    for (let i = 0; i < maxConnections; i++) {
      const startNode = nodes[Math.floor(Math.random() * nodes.length)];
      const endNode = nodes[Math.floor(Math.random() * nodes.length)];

      // Avoid self-connections
      if (startNode.id !== endNode.id) {
        connections.push({
          id: `${startNode.id}-${endNode.id}`,
          startNode,
          endNode,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: Math.random() * 10 + 20, // Animation duration between 20-30s
          delay: Math.random() * 10, // Delay start by 0-10s
          pulseSpeed: Math.random() * 3 + 2, // Speed of pulse animation
        });
      }
    }

    return connections;
  };

  // Generate data points that will travel along connections
  const generateDataPoints = (connections, count = 10) => {
    return Array.from({ length: count }, (_, i) => {
      const connection = connections[Math.floor(Math.random() * connections.length)];
      return {
        id: i,
        connectionId: connection.id,
        startNode: connection.startNode,
        endNode: connection.endNode,
        size: Math.random() * 1.5 + 0.5, // Size between 0.5-2rem
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 4 + 3, // Animation duration between 3-7s
        delay: Math.random() * 15, // Delay start by 0-15s
      };
    });
  };

  const nodes = generateNodes(12); // 12 network nodes
  const connections = generateConnections(nodes, 15); // 15 connections
  const dataPoints = generateDataPoints(connections, 10); // 10 data points

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90"></div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"></div>

      {/* Network nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full border border-purple-100/30"
          style={{
            width: `${node.size}rem`,
            height: `${node.size}rem`,
            backgroundColor: node.color,
            left: `${node.x}%`,
            top: `${node.y}%`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [
              0,
              Math.random() * 30 - 15, // Move randomly within ±15px
              Math.random() * 20 - 10,
              Math.random() * 10 - 5,
              0,
            ],
            y: [
              0,
              Math.random() * 30 - 15,
              Math.random() * 20 - 10,
              Math.random() * 10 - 5,
              0,
            ],
            scale: [1, 1.05, 0.98, 1.02, 1],
            opacity: [0.3, 0.5, 0.4, 0.5, 0.3],
          }}
          transition={{
            duration: node.duration,
            ease: "easeInOut",
            repeat: Infinity,
            delay: node.delay,
            repeatType: "mirror",
          }}
        />
      ))}

      {/* Network connections */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((connection) => {
          // Calculate start and end positions
          const startX = connection.startNode.x;
          const startY = connection.startNode.y;
          const endX = connection.endNode.x;
          const endY = connection.endNode.y;

          return (
            <motion.line
              key={connection.id}
              x1={`${startX}%`}
              y1={`${startY}%`}
              x2={`${endX}%`}
              y2={`${endY}%`}
              stroke={connection.color}
              strokeWidth="0.5"
              strokeOpacity="0.3"
              strokeDasharray="3,3"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                strokeOpacity: [0.05, 0.2, 0.05],
              }}
              transition={{
                duration: connection.duration,
                ease: "easeInOut",
                repeat: Infinity,
                delay: connection.delay,
                repeatType: "mirror",
              }}
            />
          );
        })}
      </svg>

      {/* Data points traveling along connections */}
      {dataPoints.map((point) => {
        const startX = point.startNode.x;
        const startY = point.startNode.y;
        const endX = point.endNode.x;
        const endY = point.endNode.y;

        return (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              width: `${point.size}rem`,
              height: `${point.size}rem`,
              backgroundColor: point.color,
              left: `${startX}%`,
              top: `${startY}%`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              left: [`${startX}%`, `${endX}%`],
              top: [`${startY}%`, `${endY}%`],
              scale: [1, 1.2, 1],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: point.duration,
              ease: "easeInOut",
              repeat: Infinity,
              delay: point.delay,
              repeatType: "loop",
            }}
          />
        );
      })}

      {/* Soft glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Subtle flowing wave effect at the bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <motion.path
          fill="#a78bfa"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,197.3C96,203,192,213,288,202.7C384,192,480,160,576,165.3C672,171,768,213,864,229.3C960,245,1056,235,1152,202.7C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,197.3C672,203,768,245,864,261.3C960,277,1056,267,1152,234.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{
            duration: 30,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </svg>
    </div>
  );
};

export default NotificationsBackground;
