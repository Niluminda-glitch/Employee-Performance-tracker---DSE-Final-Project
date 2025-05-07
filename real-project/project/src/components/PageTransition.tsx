import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  easing: 'ease',
  speed: 500,
  minimum: 0.1,
  trickleSpeed: 200
});

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'zoom' | 'none';
  duration?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionType = 'fade',
  duration = 0.3
}) => {
  const location = useLocation();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Start the progress bar
    NProgress.start();

    // Complete the progress bar after a short delay to ensure it's visible
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.remove();
    };
  }, [location.pathname, isFirstRender]);

  // Define different transition variants
  const getVariants = () => {
    switch (transitionType) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          in: { opacity: 1 },
          out: { opacity: 0 },
        };
      case 'slide':
        return {
          initial: { opacity: 0, y: 20 },
          in: { opacity: 1, y: 0 },
          out: { opacity: 0, y: -20 },
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.98 },
          in: { opacity: 1, scale: 1 },
          out: { opacity: 0, scale: 1.02 },
        };
      case 'none':
      default:
        return {
          initial: { opacity: 1 },
          in: { opacity: 1 },
          out: { opacity: 1 },
        };
    }
  };

  const pageVariants = getVariants();

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: duration,
  };

  // Skip animation on first render
  if (isFirstRender) {
    return <div className="page-transition-wrapper">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="page-transition-wrapper"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
