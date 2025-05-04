import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingAnimation from './LoadingAnimation';

interface LoadingScreenProps {
  text?: string;
  showLogo?: boolean;
  loaderType?: 'pacman' | 'hash' | 'moon' | 'propagate' | 'rise' | 'rotate';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = 'Loading amazing things...',
  showLogo = true,
  loaderType = 'hash'
}) => {
  // Random loading messages for a fun experience
  const loadingMessages = [
    'Loading amazing things...',
    'Preparing your dashboard...',
    'Gathering your data...',
    'Almost there...',
    'Just a moment...',
    'Brewing some coffee...',
    'Connecting the dots...',
    'Generating awesomeness...',
    'Loading the magic...',
    'Calculating the universe...'
  ];

  const [message, setMessage] = useState(text);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);

  // Track mouse position for cursor-responsive animations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Change message every 3 seconds for a dynamic feel
  useEffect(() => {
    if (text === 'Loading amazing things...') { // Only use random messages if default text is used
      const interval = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [text, loadingMessages]);

  // Update message with animation
  useEffect(() => {
    setMessage(loadingMessages[currentMessageIndex]);
  }, [currentMessageIndex, loadingMessages]);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (Math.random() * 2);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-[10%] w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-[10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-20 left-[20%] w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Cursor-responsive glow */}
        <motion.div
          className="fixed w-40 h-40 rounded-full bg-purple-400/10 mix-blend-multiply filter blur-xl pointer-events-none"
          style={{
            left: mousePosition.x - 80,
            top: mousePosition.y - 80,
            opacity: 0.5
          }}
        />

        {/* Animated particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{
              y: [null, Math.random() * -50],
              opacity: [null, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="text-center mb-8"
          >
            <motion.div className="relative inline-block">
              <motion.div
                className="absolute -inset-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 opacity-0 blur-xl -z-10"
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.8, 1.1, 0.8]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              />
              <motion.h1
                className="text-5xl font-bold text-gradient-enhanced mb-3"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                EmpTrack
              </motion.h1>
            </motion.div>

            <motion.p
              className="text-sm text-purple-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Employee Management System
            </motion.p>
          </motion.div>
        )}

        <motion.div
          className="relative"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            className="absolute -inset-8 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-70 blur-md"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          />
          <LoadingAnimation
            type={loaderType}
            size={60}
            color="#8b5cf6"
            speedMultiplier={0.8}
          />
        </motion.div>

        <div className="mt-8 w-64">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              className="text-purple-700 font-medium text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.p>
          </AnimatePresence>

          <div className="mt-4 h-1 w-full bg-purple-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: `${progress}%` }}
              initial={{ width: "0%" }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
