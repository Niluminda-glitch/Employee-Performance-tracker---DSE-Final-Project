import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const WellbeingBackground = () => {
  // Colors suitable for a wellbeing theme - reduced opacity for better text visibility
  const colors = [
    'rgba(167, 139, 250, 0.1)', // Purple
    'rgba(196, 181, 253, 0.08)', // Lighter purple
    'rgba(147, 197, 253, 0.08)', // Light blue
    'rgba(186, 230, 253, 0.06)', // Lighter blue
    'rgba(209, 250, 229, 0.08)', // Mint green
  ];

  // Generate random properties for each particle
  const generateParticles = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2, // Size between 2-8rem
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 100, // Position (percentage of viewport)
      y: Math.random() * 100,
      duration: Math.random() * 20 + 30, // Animation duration between 30-50s
      delay: Math.random() * 10, // Delay start by 0-10s
    }));
  };

  const particles = generateParticles(12); // 12 floating particles

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background - lighter to ensure text visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30"></div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-subtle-pattern opacity-[0.03]"></div>

      {/* Soft glowing orbs - reduced opacity for better text visibility */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 left-2/3 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full border border-purple-100/30"
          style={{
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [
              0,
              Math.random() * 20 - 10, // Move randomly within ±10px (reduced movement)
              Math.random() * 15 - 7.5,
              Math.random() * 10 - 5,
              0,
            ],
            y: [
              0,
              Math.random() * 20 - 10,
              Math.random() * 15 - 7.5,
              Math.random() * 10 - 5,
              0,
            ],
            scale: [1, 1.03, 0.99, 1.01, 1], // Reduced scale changes
            opacity: [0.3, 0.4, 0.35, 0.45, 0.3], // Reduced opacity overall
          }}
          transition={{
            duration: particle.duration,
            ease: "easeInOut",
            repeat: Infinity,
            delay: particle.delay,
            repeatType: "mirror",
          }}
        />
      ))}

      {/* Subtle flowing wave effect at the bottom - reduced opacity */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <motion.path
          fill="#a78bfa"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,261.3C672,277,768,267,864,245.3C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
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

      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <motion.path
          fill="#93c5fd"
          d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,186.7C960,192,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,186.7C960,192,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,213.3C672,245,768,267,864,266.7C960,267,1056,245,1152,213.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,208C672,235,768,245,864,240C960,235,1056,213,1152,202.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{
            duration: 25,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: 5,
          }}
        />
      </svg>
    </div>
  );
};

export default WellbeingBackground;
