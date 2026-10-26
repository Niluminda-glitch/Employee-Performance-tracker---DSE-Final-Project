import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

interface CursorEffectProps {
  mixBlendMode?: string;
}

const CursorEffect: React.FC<CursorEffectProps> = ({
  mixBlendMode = 'multiply',
}) => {
  const {
    cursorSize: size,
    cursorColor: color,
    cursorOpacity: opacity,
    cursorBlur: blur,
    cursorDisabled: disabled
  } = useCursor();

  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Track mouse position for cursor-responsive animations
  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Track hover state on interactive elements
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button') {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseover', handleMouseEnter);
    document.body.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseover', handleMouseEnter);
      document.body.removeEventListener('mouseout', handleMouseOut);
    };
  }, [disabled, isVisible]);

  if (disabled) return null;

  const blurClass = `blur-${blur}`;
  const radius = size / 2;

  // Adjust cursor size when hovering over interactive elements
  const currentSize = isHovering ? size * 0.7 : size;

  return (
    <motion.div
      className={`fixed w-full h-full pointer-events-none z-[9999] overflow-hidden`}
      style={{ top: 0, left: 0 }}
    >
      <motion.div
        className={`fixed rounded-full pointer-events-none ${blurClass}`}
        style={{
          width: currentSize * 2,
          height: currentSize * 2,
          backgroundColor: color,
          mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode'],
          opacity: isVisible ? opacity : 0,
          left: mousePosition.x - currentSize,
          top: mousePosition.y - currentSize,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isVisible ? (isHovering ? 1.2 : 1) : 0.8,
          opacity: isVisible ? (isHovering ? opacity * 1.2 : opacity) : 0,
          x: 0,
          y: 0
        }}
        transition={{
          scale: { type: 'spring', stiffness: 400, damping: 28 },
          opacity: { duration: 0.2 }
        }}
      />

      {/* Additional inner glow for interactive elements */}
      {isHovering && (
        <motion.div
          className="fixed rounded-full pointer-events-none"
          style={{
            width: currentSize,
            height: currentSize,
            backgroundColor: color.replace(/[\d.]+\)$/, '0.3)'),
            left: mousePosition.x - currentSize / 2,
            top: mousePosition.y - currentSize / 2,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 0.8
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 28
          }}
        />
      )}
    </motion.div>
  );
};

export default CursorEffect;
