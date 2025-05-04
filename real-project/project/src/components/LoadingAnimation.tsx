import React from 'react';
import { motion } from 'framer-motion';
import { 
  PacmanLoader, 
  BeatLoader, 
  ClipLoader, 
  BounceLoader, 
  CircleLoader, 
  ClimbingBoxLoader,
  ClockLoader,
  DotLoader,
  FadeLoader,
  GridLoader,
  HashLoader,
  MoonLoader,
  PuffLoader,
  PulseLoader,
  RingLoader,
  RiseLoader,
  RotateLoader,
  ScaleLoader,
  SyncLoader,
  PropagateLoader
} from 'react-spinners';

export type LoaderType = 
  | 'pacman'
  | 'beat'
  | 'clip'
  | 'bounce'
  | 'circle'
  | 'climbing-box'
  | 'clock'
  | 'dot'
  | 'fade'
  | 'grid'
  | 'hash'
  | 'moon'
  | 'puff'
  | 'pulse'
  | 'ring'
  | 'rise'
  | 'rotate'
  | 'scale'
  | 'sync'
  | 'propagate';

interface LoadingAnimationProps {
  type?: LoaderType;
  color?: string;
  size?: number;
  loading?: boolean;
  speedMultiplier?: number;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'hash',
  color = '#8b5cf6', // Purple color to match your theme
  size = 40,
  loading = true,
  speedMultiplier = 1,
  text,
  fullScreen = false,
  className = '',
}) => {
  const getLoader = () => {
    switch (type) {
      case 'pacman':
        return <PacmanLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'beat':
        return <BeatLoader color={color} size={size / 3} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'clip':
        return <ClipLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'bounce':
        return <BounceLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'circle':
        return <CircleLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'climbing-box':
        return <ClimbingBoxLoader color={color} size={size / 3} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'clock':
        return <ClockLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'dot':
        return <DotLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'fade':
        return <FadeLoader color={color} height={size / 2} width={size / 8} radius={size / 10} margin={size / 5} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'grid':
        return <GridLoader color={color} size={size / 3} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'hash':
        return <HashLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'moon':
        return <MoonLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'puff':
        return <PuffLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'pulse':
        return <PulseLoader color={color} size={size / 4} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'ring':
        return <RingLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'rise':
        return <RiseLoader color={color} size={size / 3} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'rotate':
        return <RotateLoader color={color} size={size / 3} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'scale':
        return <ScaleLoader color={color} height={size} width={size / 5} radius={size / 10} margin={size / 10} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'sync':
        return <SyncLoader color={color} size={size / 3} loading={loading} speedMultiplier={speedMultiplier} />;
      case 'propagate':
        return <PropagateLoader color={color} size={size / 3} loading={loading} speedMultiplier={speedMultiplier} />;
      default:
        return <HashLoader color={color} size={size} loading={loading} speedMultiplier={speedMultiplier} />;
    }
  };

  if (!loading) return null;

  const containerClasses = `flex flex-col items-center justify-center ${className} ${
    fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : ''
  }`;

  return (
    <motion.div 
      className={containerClasses}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {getLoader()}
        {/* Optional glowing effect */}
        <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl -z-10"></div>
      </div>
      
      {text && (
        <motion.p 
          className="mt-4 text-purple-700 font-medium text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

export default LoadingAnimation;
