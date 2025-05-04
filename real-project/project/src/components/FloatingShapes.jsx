import React from 'react';
import { motion } from "framer-motion";

const shapes = [
  // Circles - increased opacity and adjusted colors
  { type: "circle", size: 100, color: 'bg-purple-300', top: '5%', left: '10%', delay: 0, opacity: 0.15 },
  { type: "circle", size: 85, color: 'bg-purple-200', bottom: '10%', left: '15%', delay: 1, opacity: 0.12 },
  { type: "circle", size: 75, color: 'bg-blue-200', top: '20%', right: '25%', delay: 1.5, opacity: 0.14 },
  { type: "circle", size: 110, color: 'bg-indigo-300', top: '40%', left: '5%', delay: 3.5, opacity: 0.13 },
  { type: "circle", size: 140, color: 'bg-purple-200', bottom: '5%', right: '8%', delay: 2.2, opacity: 0.12 },
  { type: "circle", size: 65, color: 'bg-blue-300', top: '15%', right: '15%', delay: 4.5, opacity: 0.15 },

  // Squares - increased opacity and size
  { type: "square", size: 60, color: 'bg-indigo-300', bottom: '15%', right: '20%', delay: 2, opacity: 0.14 },
  { type: "square", size: 50, color: 'bg-indigo-200', top: '30%', left: '25%', delay: 3, opacity: 0.13 },
  { type: "square", size: 70, color: 'bg-purple-300', bottom: '30%', left: '40%', delay: 1.8, opacity: 0.12 },
  { type: "square", size: 55, color: 'bg-blue-200', top: '60%', right: '35%', delay: 2.7, opacity: 0.13 },

  // Triangles - increased opacity and adjusted colors
  { type: "triangle", size: 70, color: 'bg-blue-300', top: '60%', right: '10%', delay: 4, opacity: 0.14 },
  { type: "triangle", size: 65, color: 'bg-purple-200', top: '80%', right: '30%', delay: 2.5, opacity: 0.13 },
  { type: "triangle", size: 80, color: 'bg-indigo-200', top: '25%', left: '40%', delay: 3.2, opacity: 0.12 },

  // Hexagons - increased opacity and size
  { type: "hexagon", size: 75, color: 'bg-purple-400', top: '70%', left: '20%', delay: 1.2, opacity: 0.13 },
  { type: "hexagon", size: 60, color: 'bg-indigo-300', top: '10%', left: '35%', delay: 3.8, opacity: 0.14 },

  // Blobs - increased opacity and adjusted colors
  { type: "blob", size: 160, color: 'bg-purple-300', bottom: '20%', right: '5%', delay: 0.5, opacity: 0.08 },
  { type: "blob", size: 180, color: 'bg-indigo-200', top: '5%', right: '5%', delay: 2.8, opacity: 0.07 },
  { type: "blob", size: 200, color: 'bg-blue-200', bottom: '5%', left: '5%', delay: 4.2, opacity: 0.08 },

  // Additional shapes for more visual interest
  { type: "circle", size: 90, color: 'bg-pink-200', top: '35%', right: '45%', delay: 1.7, opacity: 0.12 },
  { type: "square", size: 65, color: 'bg-violet-300', bottom: '45%', right: '15%', delay: 3.3, opacity: 0.13 },
  { type: "triangle", size: 75, color: 'bg-indigo-300', top: '75%', left: '30%', delay: 2.1, opacity: 0.14 },
  { type: "hexagon", size: 70, color: 'bg-purple-300', bottom: '25%', left: '10%', delay: 0.8, opacity: 0.12 },
];

export default function FloatingShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {shapes.map((s, i) => {
        // Triangle shapes
        if (s.type === "triangle") {
          return (
            <motion.div
              key={i}
              className={`${s.color} absolute animate-float`}
              style={{
                top: s.top,
                bottom: s.bottom,
                left: s.left,
                right: s.right,
                width: 0,
                height: 0,
                borderLeft: `${s.size / 2}px solid transparent`,
                borderRight: `${s.size / 2}px solid transparent`,
                borderBottom: `${s.size}px solid`,
                opacity: s.opacity,
                filter: 'blur(1.5px)',
                animationDelay: `${s.delay}s`,
              }}
              animate={{
                y: [0, -20, 5, -10, 0],
                x: [0, 8, -5, 8, 0],
                rotate: [0, 5, -3, 5, 0],
                scale: [1, 1.08, 0.97, 1.05, 1],
                opacity: [s.opacity, s.opacity * 1.6, s.opacity * 1.2, s.opacity * 1.4, s.opacity],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                ease: "easeInOut",
                repeat: Infinity,
                delay: s.delay,
                repeatType: "mirror"
              }}
            />
          );
        }

        // Hexagon shapes (rendered with clip-path)
        if (s.type === "hexagon") {
          return (
            <motion.div
              key={i}
              className={`${s.color} absolute animate-float`}
              style={{
                width: s.size,
                height: s.size,
                top: s.top,
                bottom: s.bottom,
                left: s.left,
                right: s.right,
                opacity: s.opacity,
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                filter: 'blur(2px)',
                animationDelay: `${s.delay}s`,
              }}
              animate={{
                y: [0, -15, 8, -8, 0],
                x: [0, 8, -5, 8, 0],
                rotate: [0, 8, -3, 8, 0],
                scale: [1, 1.06, 0.98, 1.04, 1],
                opacity: [s.opacity, s.opacity * 1.5, s.opacity * 1.1, s.opacity * 1.3, s.opacity],
                boxShadow: [
                  "0 0 0 rgba(124, 58, 237, 0)",
                  "0 0 15px rgba(124, 58, 237, 0.1)",
                  "0 0 5px rgba(124, 58, 237, 0.05)",
                  "0 0 10px rgba(124, 58, 237, 0.08)",
                  "0 0 0 rgba(124, 58, 237, 0)"
                ]
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                ease: "easeInOut",
                repeat: Infinity,
                delay: s.delay,
                repeatType: "mirror"
              }}
            />
          );
        }

        // Blob shapes (larger, more organic shapes with border-radius)
        if (s.type === "blob") {
          return (
            <motion.div
              key={i}
              className={`${s.color} absolute animate-pulse-slow`}
              style={{
                width: s.size,
                height: s.size,
                top: s.top,
                bottom: s.bottom,
                left: s.left,
                right: s.right,
                opacity: s.opacity,
                borderRadius: '60% 40% 50% 50% / 40% 50% 50% 60%',
                filter: 'blur(20px)',
                animationDelay: `${s.delay}s`,
              }}
              animate={{
                y: [0, -25, 15, -15, 0],
                x: [0, 15, -15, 8, 0],
                borderRadius: [
                  '60% 40% 50% 50% / 40% 50% 50% 60%',
                  '50% 60% 40% 50% / 50% 40% 60% 50%',
                  '40% 50% 60% 50% / 60% 50% 40% 50%',
                  '50% 40% 50% 60% / 50% 60% 50% 40%',
                  '60% 40% 50% 50% / 40% 50% 50% 60%'
                ],
                scale: [1, 1.05, 0.97, 1.03, 1],
                opacity: [s.opacity, s.opacity * 1.4, s.opacity * 0.9, s.opacity * 1.2, s.opacity],
                boxShadow: [
                  "0 0 0 rgba(124, 58, 237, 0)",
                  "0 0 25px rgba(124, 58, 237, 0.08)",
                  "0 0 10px rgba(124, 58, 237, 0.04)",
                  "0 0 20px rgba(124, 58, 237, 0.06)",
                  "0 0 0 rgba(124, 58, 237, 0)"
                ]
              }}
              transition={{
                duration: 25 + Math.random() * 15,
                ease: "easeInOut",
                repeat: Infinity,
                delay: s.delay,
                repeatType: "mirror"
              }}
            />
          );
        }

        // Default shapes (circles and squares)
        return (
          <motion.div
            key={i}
            className={`
              ${s.color} absolute
              ${s.type === "circle" ? "rounded-full animate-float" : "animate-float"}
            `}
            style={{
              width: s.size,
              height: s.size,
              top: s.top,
              bottom: s.bottom,
              left: s.left,
              right: s.right,
              opacity: s.opacity,
              filter: s.type === "circle" ? 'blur(3px)' : 'blur(2px)',
              animationDelay: `${s.delay}s`,
              boxShadow: s.type === "circle" ? "0 0 10px rgba(124, 58, 237, 0.05)" : "none"
            }}
            animate={{
              y: [0, -20, 8, -8, 0],
              x: [0, 8, -8, 4, 0],
              rotate: s.type === "square" ? [0, 15, -5, 10, 0] : 0,
              scale: [1, 1.08, 0.96, 1.04, 1],
              opacity: [s.opacity, s.opacity * 1.5, s.opacity * 1.1, s.opacity * 1.3, s.opacity],
              boxShadow: s.type === "circle" ? [
                "0 0 10px rgba(124, 58, 237, 0.05)",
                "0 0 20px rgba(124, 58, 237, 0.1)",
                "0 0 10px rgba(124, 58, 237, 0.05)",
                "0 0 15px rgba(124, 58, 237, 0.08)",
                "0 0 10px rgba(124, 58, 237, 0.05)"
              ] : undefined
            }}
            transition={{
              duration: 18 + Math.random() * 7,
              ease: "easeInOut",
              repeat: Infinity,
              delay: s.delay,
              repeatType: "mirror"
            }}
          />
        );
      })}
    </div>
  );
}
