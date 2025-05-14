import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TypewriterEffect component that simulates an AI typing text
 *
 * @param {string} text - The full text to be displayed
 * @param {number} typingSpeed - Speed of typing in milliseconds per character
 * @param {number} startDelay - Delay before typing starts in milliseconds
 * @param {boolean} showCursor - Whether to show the blinking cursor
 * @param {string} className - Additional CSS classes
 * @param {boolean} formatAsList - Whether to format the text as a numbered list
 * @param {boolean} isLoading - Whether the component is in loading state
 * @returns {JSX.Element}
 */
const TypewriterEffect = ({
  text,
  typingSpeed = 30,
  startDelay = 300,
  showCursor = true,
  className = "",
  formatAsList = false,
  isLoading = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [points, setPoints] = useState([]);
  const textRef = useRef(text);

  // Update the ref when text prop changes
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Handle the typing animation
  useEffect(() => {
    if (!text || isLoading) {
      setDisplayedText('');
      setPoints([]);
      return;
    }

    let timeout;

    // Reset and start typing after delay
    const startTyping = () => {
      setIsTyping(true);
      setDisplayedText('');
      setPoints([]);

      if (formatAsList) {
        // Split text into points for list formatting
        const textPoints = text.split('\n')
          .filter(line => line.trim())
          .map(line => line.trim());

        let currentPointIndex = 0;
        let currentCharIndex = 0;
        let currentPoints = [];

        const typeNextChar = () => {
          if (currentPointIndex >= textPoints.length) {
            setIsTyping(false);
            return;
          }

          const currentPoint = textPoints[currentPointIndex];

          if (currentCharIndex <= currentPoint.length) {
            currentPoints[currentPointIndex] = currentPoint.substring(0, currentCharIndex);
            setPoints([...currentPoints]);
            currentCharIndex++;
            timeout = setTimeout(typeNextChar, typingSpeed);
          } else {
            currentPointIndex++;
            currentCharIndex = 0;
            currentPoints.push('');
            timeout = setTimeout(typeNextChar, typingSpeed * 5); // Longer pause between points
          }
        };

        timeout = setTimeout(typeNextChar, startDelay);
      } else {
        // Regular typing animation for non-list text
        let i = 0;
        const typeText = () => {
          if (i <= textRef.current.length) {
            setDisplayedText(textRef.current.substring(0, i));
            i++;
            timeout = setTimeout(typeText, typingSpeed);
          } else {
            setIsTyping(false);
          }
        };

        timeout = setTimeout(typeText, startDelay);
      }
    };

    startTyping();

    return () => {
      clearTimeout(timeout);
      setIsTyping(false);
    };
  }, [text, typingSpeed, startDelay, formatAsList, isLoading]);

  // Format the points with numbers if needed
  const formattedPoints = points.map((point, index) => {
    // Skip empty points
    if (!point) return null;

    // Check if the point already starts with a number (like "1. ")
    const hasNumberPrefix = /^\d+\.\s/.test(point);

    // If it already has a number, return as is, otherwise add the number
    return hasNumberPrefix ? point : `${index + 1}. ${point}`;
  }).filter(Boolean);

  return (
    <div className={`typewriter-effect ${className}`}>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <motion.div
              className="h-2 w-2 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
            />
            <motion.div
              className="h-2 w-2 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
            />
            <motion.div
              className="h-2 w-2 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
            />
          </div>
          <span className="text-sm text-indigo-600 font-medium">AI is thinking...</span>
        </div>
      ) : formatAsList ? (
        <div className="space-y-3">
          <AnimatePresence>
            {formattedPoints.map((point, index) => (
              <motion.div
                key={`point-${index}-${point.substring(0, 10)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="leading-relaxed"
              >
                {point}
              </motion.div>
            ))}
          </AnimatePresence>
          {showCursor && isTyping && (
            <motion.span
              key="cursor"
              className="inline-block h-4 w-0.5 ml-0.5 bg-indigo-500"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
      ) : (
        <div className="relative">
          <span>{displayedText}</span>
          {showCursor && isTyping && (
            <motion.span
              className="inline-block h-4 w-0.5 ml-0.5 bg-indigo-500"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TypewriterEffect;
