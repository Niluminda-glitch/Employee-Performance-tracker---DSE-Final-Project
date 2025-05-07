import React from 'react';
import { motion } from "framer-motion";

// Custom shapes specifically designed for the Profile page
// These are more subtle and professional than the general FloatingShapes component
const profileShapes = [
  // Subtle circles with purple/indigo theme
  { type: "circle", size: 120, color: 'bg-purple-200', top: '15%', right: '5%', delay: 0.5, opacity: 0.08 },
  { type: "circle", size: 80, color: 'bg-indigo-200', bottom: '20%', left: '8%', delay: 1.2, opacity: 0.07 },
  { type: "circle", size: 150, color: 'bg-purple-100', top: '60%', right: '15%', delay: 2.5, opacity: 0.06 },
  
  // Small accent circles
  { type: "circle", size: 40, color: 'bg-indigo-300', top: '25%', left: '20%', delay: 1.8, opacity: 0.05 },
  { type: "circle", size: 30, color: 'bg-purple-300', bottom: '30%', right: '25%', delay: 0.8, opacity: 0.06 },
  
  // Squares (more professional looking)
  { type: "square", size: 70, color: 'bg-indigo-100', top: '40%', left: '5%', delay: 2.2, opacity: 0.05 },
  { type: "square", size: 50, color: 'bg-purple-100', bottom: '15%', right: '10%', delay: 1.5, opacity: 0.04 },
  
  // Blobs (very subtle, large and blurred)
  { type: "blob", size: 250, color: 'bg-purple-100', top: '5%', left: '0%', delay: 0, opacity: 0.04 },
  { type: "blob", size: 300, color: 'bg-indigo-100', bottom: '0%', right: '0%', delay: 3, opacity: 0.03 },
  
  // Decorative elements that look like UI elements or document icons
  { type: "card", size: 60, color: 'bg-white', top: '70%', left: '15%', delay: 2, opacity: 0.07 },
  { type: "card", size: 45, color: 'bg-white', top: '10%', left: '30%', delay: 1, opacity: 0.06 },
  { type: "card", size: 55, color: 'bg-white', bottom: '25%', right: '20%', delay: 3.5, opacity: 0.05 },
];

export default function ProfileFloatingElements() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {profileShapes.map((s, i) => {
        // Blob shapes (larger, more organic shapes with border-radius)
        if (s.type === "blob") {
          return (
            <motion.div
              key={i}
              className={`${s.color} absolute`}
              style={{
                width: s.size,
                height: s.size,
                top: s.top,
                bottom: s.bottom,
                left: s.left,
                right: s.right,
                opacity: s.opacity,
                borderRadius: '60% 40% 50% 50% / 40% 50% 50% 60%',
                filter: 'blur(40px)',
              }}
              animate={{
                y: [0, -15, 10, -5, 0],
                x: [0, 10, -5, 8, 0],
                borderRadius: [
                  '60% 40% 50% 50% / 40% 50% 50% 60%',
                  '50% 60% 40% 50% / 50% 40% 60% 50%',
                  '40% 50% 60% 50% / 60% 50% 40% 50%',
                  '50% 40% 50% 60% / 50% 60% 50% 40%',
                  '60% 40% 50% 50% / 40% 50% 50% 60%'
                ],
                scale: [1, 1.03, 0.98, 1.02, 1],
                opacity: [s.opacity, s.opacity * 1.2, s.opacity * 0.9, s.opacity * 1.1, s.opacity],
              }}
              transition={{
                duration: 30 + Math.random() * 20,
                ease: "easeInOut",
                repeat: Infinity,
                delay: s.delay,
                repeatType: "mirror"
              }}
            />
          );
        }

        // Card-like shapes (document or UI element look)
        if (s.type === "card") {
          return (
            <motion.div
              key={i}
              className={`${s.color} absolute shadow-sm border border-purple-100`}
              style={{
                width: s.size,
                height: s.size * 1.3,
                top: s.top,
                bottom: s.bottom,
                left: s.left,
                right: s.right,
                opacity: s.opacity,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.9))',
              }}
              animate={{
                y: [0, -15, 5, -10, 0],
                x: [0, 5, -3, 5, 0],
                rotate: [0, 2, -1, 2, 0],
                scale: [1, 1.05, 0.98, 1.02, 1],
                opacity: [s.opacity, s.opacity * 1.3, s.opacity, s.opacity * 1.2, s.opacity],
                boxShadow: [
                  "0 1px 3px rgba(124, 58, 237, 0.05)",
                  "0 3px 6px rgba(124, 58, 237, 0.08)",
                  "0 1px 3px rgba(124, 58, 237, 0.05)",
                  "0 2px 5px rgba(124, 58, 237, 0.07)",
                  "0 1px 3px rgba(124, 58, 237, 0.05)"
                ]
              }}
              transition={{
                duration: 20 + Math.random() * 10,
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
              ${s.type === "circle" ? "rounded-full" : ""}
            `}
            style={{
              width: s.size,
              height: s.size,
              top: s.top,
              bottom: s.bottom,
              left: s.left,
              right: s.right,
              opacity: s.opacity,
              filter: s.type === "circle" ? 'blur(5px)' : 'blur(3px)',
            }}
            animate={{
              y: [0, -10, 5, -5, 0],
              x: [0, 5, -3, 5, 0],
              rotate: s.type === "square" ? [0, 5, -2, 5, 0] : 0,
              scale: [1, 1.05, 0.98, 1.03, 1],
              opacity: [s.opacity, s.opacity * 1.3, s.opacity, s.opacity * 1.2, s.opacity],
            }}
            transition={{
              duration: 25 + Math.random() * 10,
              ease: "easeInOut",
              repeat: Infinity,
              delay: s.delay,
              repeatType: "mirror"
            }}
          />
        );
      })}
      
      {/* Decorative lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(139, 92, 246)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-purple-50/0 via-purple-50/5 to-indigo-50/10 opacity-50"
        style={{ mixBlendMode: 'overlay' }}
      />
    </div>
  );
}
