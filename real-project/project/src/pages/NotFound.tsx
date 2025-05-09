import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Home, AlertTriangle } from 'lucide-react';
import ProfileFloatingElements from '@/components/ProfileFloatingElements';
import { motion } from 'framer-motion';

export const NotFound = () => {
  useEffect(() => {
    const fingersBack = document.querySelectorAll('#fingersBackL, #fingersBackR');
    const fingersFront = document.querySelectorAll('#fingersFrontL, #fingersFrontR');
    const light = document.querySelector('#light');

    const setVisibility = (elements, visible) => {
      if (!elements) return;
      elements.forEach((el) => {
        if (el instanceof SVGElement) {
          el.style.visibility = visible ? 'visible' : 'hidden';
        }
      });
    };

    const resetYetiAnimation = () => {
      setVisibility(fingersBack, false);
      setVisibility(fingersFront, false);
      if (light instanceof SVGElement) {
        light.style.visibility = 'hidden';
      }
    };

    const animateYeti = () => {
      resetYetiAnimation();
      setTimeout(() => setVisibility(fingersBack, true), 300);
      setTimeout(() => setVisibility(fingersFront, true), 400);
      setTimeout(() => {
        if (light instanceof SVGElement) {
          light.style.visibility = 'visible';
        }
      }, 600);
      setTimeout(() => resetYetiAnimation(), 1800);
    };

    animateYeti();
    const animationInterval = setInterval(animateYeti, 3000);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="min-h-screen relative bg-[#09334f] overflow-hidden flex items-center justify-center">
      <ProfileFloatingElements />
      <div className="relative z-10 w-full max-w-md mx-auto px-2 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Card className="w-full shadow-2xl border-0 bg-white/30 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -inset-1 rounded-2xl z-0 pointer-events-none animate-border-gradient" style={{ background: 'linear-gradient(120deg, #a78bfa 0%, #38bdf8 100%)', filter: 'blur(8px)', opacity: 0.5 }} />
            <CardHeader className="flex flex-col items-center relative z-10">
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}>
                <AlertTriangle className="w-12 h-12 text-indigo-400 mb-2 animate-bounce-slow" />
              </motion.div>
              <CardTitle className="text-3xl md:text-4xl text-center font-bold text-indigo-900 drop-shadow">404 - Not Found</CardTitle>
              <CardDescription className="text-center text-base text-indigo-800/80 mt-2">Oops! The page you’re looking for doesn’t exist.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
                <Button asChild variant="gradient" size="lg" className="mt-2">
                  <Link to="/">
                    <Home className="w-5 h-5" /> Go Home
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <svg id="yetiSVG" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 470" className="w-[600px] h-[470px] absolute top-0 left-0 overflow-hidden pointer-events-none select-none">
        {/* ...existing SVG code... */}
      </svg>
      <svg id="lightSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 470" className="w-[600px] h-[470px] absolute top-0 left-0 overflow-visible pointer-events-none select-none">
        {/* ...existing SVG code... */}
      </svg>
      <style>{`
        .animate-border-gradient {
          animation: borderGradientMove 4s linear infinite;
        }
        @keyframes borderGradientMove {
          0% { filter: blur(8px) hue-rotate(0deg); }
          100% { filter: blur(8px) hue-rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 2.2s infinite;
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
