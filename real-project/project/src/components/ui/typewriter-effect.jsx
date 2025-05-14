import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const TypewriterEffect = ({ 
  text, 
  typingSpeed = 30, 
  startDelay = 0, 
  formatAsList = false,
  isLoading = false,
  className = ""
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    
    // Apply start delay
    const startTimer = setTimeout(() => {
      setStartTyping(true);
    }, startDelay);
    
    return () => clearTimeout(startTimer);
  }, [text, startDelay]);

  useEffect(() => {
    if (!text || !startTyping || currentIndex >= text.length) return;
    
    const typingTimer = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, typingSpeed);
    
    return () => clearTimeout(typingTimer);
  }, [text, currentIndex, typingSpeed, startTyping]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Generating content...</span>
      </div>
    );
  }

  if (!text) return null;

  if (formatAsList) {
    // Split text by numbered points (1., 2., etc.)
    const points = text.split(/\n\d+\.\s+/).filter(Boolean);
    
    if (points.length <= 1) {
      // If no numbered points found, try splitting by newlines
      const lines = displayedText.split('\n').filter(line => line.trim());
      
      return (
        <ul className={`list-disc pl-5 space-y-2 ${className}`}>
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      );
    }
    
    return (
      <ol className={`list-decimal pl-5 space-y-3 ${className}`}>
        {points.map((point, index) => (
          <li key={index} className="pl-2">
            {index < displayedText.length / (text.length / points.length) ? point : ''}
          </li>
        ))}
      </ol>
    );
  }

  return <div className={className}>{displayedText}</div>;
};
