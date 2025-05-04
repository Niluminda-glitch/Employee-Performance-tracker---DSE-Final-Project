import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

// Initialize AOS once globally
export const initializeAOS = () => {
  // Safety check to make sure AOS is defined
  if (typeof AOS === 'undefined') {
    console.warn('AOS is not defined');
    return () => {};
  }
  
  console.log('Initializing AOS');
  
  // Force AOS to be applied by first destroying any existing instances
  if (typeof AOS.refresh === 'function') {
    AOS.refreshHard();
  }
  
  // Initialize with more aggressive settings to ensure animations work
  AOS.init({
    // Animation duration - shorter for more immediate feedback
    duration: 600,
    
    // Animation easing - use a simple easing function for better performance
    easing: 'ease-out', 
    
    // Whether animation should happen only once - set to false to repeat on scroll
    once: false,
    
    // Lower offset to trigger animations sooner
    offset: 40,
    
    // No delay by default
    delay: 0,
    
    // Don't animate elements on back-scroll
    mirror: false,
    
    // Don't disable on mobile devices
    disable: false,
    
    // Make sure animations are triggered early
    anchorPlacement: 'top-bottom', 
    
    // Debug class for styling
    initClassName: 'aos-init',
    
    // Debug setting logs to console to help find issues
    debug: true,
    
    // Use a custom event to trigger animations
    startEvent: 'DOMContentLoaded'
  });
  
  // Add scroll event handler to force refresh on scroll
  window.addEventListener('scroll', () => {
    if (typeof AOS !== 'undefined' && typeof AOS.refresh === 'function') {
      AOS.refresh();
    }
  }, { passive: true });
  
  // Add resize event handler to ensure animations work on window resize
  window.addEventListener('resize', () => AOS.refresh());
  
  // Force immediate refresh after a brief delay
  setTimeout(() => {
    if (typeof AOS !== 'undefined' && typeof AOS.refresh === 'function') {
      console.log('Immediate AOS refresh');
      AOS.refresh();
    }
  }, 100);
  
  // Set up multiple refresh intervals at different timings
  const intervals = [
    setInterval(() => {
      if (typeof AOS !== 'undefined' && typeof AOS.refresh === 'function') {
        AOS.refresh();
      }
    }, 1000),
    setInterval(() => {
      if (typeof AOS !== 'undefined' && typeof AOS.refresh === 'function') {
        console.log('AOS refresh triggered');
        AOS.refresh();
      }
    }, 3000)
  ];
  
  return () => {
    intervals.forEach(interval => clearInterval(interval));
    window.removeEventListener('scroll', AOS.refresh);
    window.removeEventListener('resize', AOS.refresh);
  };
};

// Refresh AOS when needed (call this when data or state changes)
export const refreshAOS = () => {
  if (typeof AOS !== 'undefined') {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
};

// Framer Motion animation component that triggers on scroll
export const ScrollAnimationSection = ({ children, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animation variants for reuse
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

export const slideUpVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25 
    } 
  },
  exit: { 
    y: -20, 
    opacity: 0, 
    transition: { duration: 0.3 } 
  },
  hover: { 
    y: -5, 
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 20 
    } 
  }
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const cardItemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 } 
  },
  hover: { 
    scale: 1.05,
    y: -5,
    transition: { duration: 0.2 }
  }
};

export const progressBarVariants = {
  hidden: { width: 0 },
  visible: (percent) => ({
    width: `${percent}%`,
    transition: { 
      duration: 1.2, 
      ease: "easeOut",
      delay: 0.3
    }
  })
};

// Card component with animation built in
export const AnimatedCard = ({ title, description, children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
      className={className}
      data-aos="fade-up"
      data-aos-delay={delay * 1000}
    >
      {children}
    </motion.div>
  );
};
