import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export const NotFound = () => {
  useEffect(() => {
    // Initialize visibility for elements
    const fingersBack = document.querySelectorAll('#fingersBackL, #fingersBackR');
    const fingersFront = document.querySelectorAll('#fingersFrontL, #fingersFrontR');
    const light = document.querySelector('#light');

    // Animation functions
    const setVisibility = (elements: NodeListOf<Element> | Element[] | null, visible: boolean) => {
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
      
      // Show back fingers first
      setTimeout(() => setVisibility(fingersBack, true), 300);
      
      // Then show front fingers
      setTimeout(() => setVisibility(fingersFront, true), 400);
      
      // Finally show the light
      setTimeout(() => {
        if (light instanceof SVGElement) {
          light.style.visibility = 'visible';
        }
      }, 600);
      
      // Reset after animation
      setTimeout(() => resetYetiAnimation(), 1800);
    };

    // Start initial animation
    animateYeti();

    // Set up interval for repeated animation
    const animationInterval = setInterval(animateYeti, 3000);

    // Clean up on component unmount
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="min-h-screen relative bg-[#09334f] overflow-hidden">
      {/* Yeti SVG */}
      <svg id="yetiSVG" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 470" className="w-[600px] h-[470px] absolute top-0 left-0 overflow-hidden">
        <linearGradient id="flashlightGrad" x1="126.5842" x2="90.5842" y1="176.5625" y2="213.5625" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#333"/>
          <stop offset=".076" stopColor="#414141"/>
          <stop offset=".2213" stopColor="#555"/>
          <stop offset=".3651" stopColor="#626262"/>
          <stop offset=".5043" stopColor="#666"/>
          <stop offset=".6323" stopColor="#606060"/>
          <stop offset=".8063" stopColor="#4e4e4e"/>
          <stop offset="1" stopColor="#333"/>
        </linearGradient>
        <path fill="#24658F" d="M0 0h600v470H0z"/>
        <g id="pillow">
          <path fill="#09334F" d="M241.3 124.6c-52.9 28.6-112.6 48-181.8 54.4-40.9 6.8-64.6-82.3-31.9-106.6C84 43.8 144.8 26.2 209.4 18c32.8 13 48.5 75.3 31.9 106.6z"/>
          <path fill="none" stroke="#001726" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M52.8 91.3c10 7.4 25.4 50.7 16.1 65.8M241.3 124.6c-52.9 28.6-112.6 48-181.8 54.4-40.9 6.8-64.6-82.3-31.9-106.6C84 43.8 144.8 26.2 209.4 18c32.8 13 48.5 75.3 31.9 106.6z"/>
          <path fill="#09334F" stroke="#001726" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M201.9 21.9c4.9-8 14.1-11.3 20.6-7.3s7.7 13.7 2.8 21.7"/>
          <path fill="#09334F" stroke="#001726" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M242.1 103.1c1.8.3 3.6.9 5.3 1.8 8.4 4.1 12.6 13 9.3 19.8s-12.9 9-21.3 4.9c-1.9-.9-3.6-2.1-5-3.4"/>
          <path fill="#09334F" stroke="#001726" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M70.3 172c.2 1.4.2 2.8.1 4.3-.8 9.4-8.3 16.4-16.7 15.6S39.2 183 40 173.7c.1-1.6.5-3.1 1-4.5"/>
          <path fill="#09334F" stroke="#001726" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.9 85.1c-4.1-5-5.1-11.6-2.1-16.9 4.1-7.2 14-9.2 22.1-4.6 3.7 2.1 6.4 5.2 7.9 8.6"/>
        </g>
        <g id="yeti">
          <path id="bodyBG" fill="#67B1E0" d="M80.9 291.4l-17.1-72.8c-6.3-27 10.4-54 37.4-60.3l93.1-29.6c26.5-8.1 54.6 6.8 62.7 33.3l21.9 71.5"/>
          <path className="hlFur" id="hlBody" fill="#FFF" d="M67.1 232.7c15.6-8.7 27.7-23.7 38-38.7 5.5-8 10.9-16.4 18.3-22.7 13.1-11.2 31.3-14.8 48.6-15 4.9 0 9.9.1 14.5-1.7 3.6-1.5 6.5-4.1 9.3-6.9 6.5-6.5 12-14 18-21-6.4-.6-12.9 0-19.4 2l-93.1 29.6c-27 6.3-43.7 33.4-37.4 60.3l3.2 14.1z"/>
          <path id="bodyOutline" fill="none" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M80.9 291.4l-17.1-72.8c-6.3-27 10.4-54 37.4-60.3l93.1-29.6c26.5-8.1 54.6 6.8 62.7 33.3l21.9 71.5"/>
          <path fill="#67B1E0" d="M197.5 132.4l-11.2-47.9c-6.3-26.7-32.7-44.1-59.5-38.2-27.4 6-44.5 33.1-38.1 60.3l13.6 56.2"/>
          <path className="hlFur" id="hlHead" fill="#FFF" d="M100.4 132.3l7.4 29.8 89.7-28.8-11.4-48.9c-1.6-6.8-4.5-12.9-8.4-18.3-9.6-7.9-28.5-12.9-46.9-8.5-24.9 5.9-34.5 23.6-38.1 37.9-.8.8-3.8 3-5.1 5.4.2 1.9.5 3.7 1 5.6l7 28.8 4.8-3z"/>
          <path fill="#67B1E0" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M182.1 71.6c3.8 3.6 7 7.7 9.5 12-1.8.4-3.6.9-5.3 1.6 3.2 2.9 5.7 6.3 7.6 9.9-1.1.3-2.2.7-3.3 1.1 2.5 3.5 4.3 7.4 5.4 11.5-.8-.5-2.2-.8-3.3-1"/>
          <path fill="none" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M197.5 132.4l-11.2-47.9c-6.3-26.7-32.7-44.1-59.5-38.2-27.4 6-44.5 33.1-38.1 60.3l13.6 56.2"/>
          <g id="fingersBackL" style={{ visibility: 'hidden' }} fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
            <path d="M149.2 177.5l-5.6-23.3c-.6-2.7 1-5.4 3.7-6 2.7-.6 5.4 1 6 3.7l4.4 18.4c.6 2.7-1 5.4-3.7 6l-4.8 1.2M139.4 179.8l-5.6-23.3c-.6-2.7 1-5.4 3.7-6 2.7-.6 5.4 1 6 3.7l5.6 23.3-9.7 2.3z"/>
            <path d="M128.6 177.3l-4.4-18.4c-.6-2.7 1-5.4 3.7-6 2.7-.6 5.4 1 6 3.7l5.6 23.3-4.9 1.2c-2.7.5-5.4-1.2-6-3.8z"/>
          </g>
          <g id="fingersBackR" style={{ visibility: 'hidden' }} fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
            <path d="M215.5 152l-15.9-17.9c-1.8-2.1-1.6-5.2.4-7.1 2.1-1.8 5.2-1.6 7.1.4l12.6 14.2c1.8 2.1 1.6 5.2-.4 7l-3.8 3.4"/>
            <path d="M208 158.6l-15.9-17.9c-1.8-2.1-1.6-5.2.4-7.1 2.1-1.8 5.2-1.6 7.1.4l15.9 17.9-7.5 6.7z"/>
            <path d="M197.2 161.5l-12.6-14.2c-1.8-2.1-1.6-5.2.4-7.1 2.1-1.8 5.2-1.6 7.1.4l15.9 17.9-3.7 3.3c-2.1 2-5.2 1.8-7.1-.3z"/>
          </g>
          <g id="eyeL">
            <circle cx="135.9" cy="105.3" r="3.5" fill="#265D85"/>
            <circle cx="133.7" cy="103.5" r="1" fill="#FFF"/>
          </g>
          <g id="eyeR">
            <circle cx="163.2" cy="96.3" r="3.5" fill="#265D85"/>
            <circle cx="160.9" cy="94.5" r="1" fill="#FFF"/>
          </g>
          <path id="nose" fill="#265D85" d="M149.3 101.2l4.4-1.6c1.8-.6 3.6 1 3.1 2.9l-1.1 3.9c-.4 1.6-2.3 2.2-3.6 1.3l-3.3-2.3c-1.7-1.1-1.3-3.5.5-4.2z"/>
          <g id="fingersFrontL">
            <path fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M146.2 165.1l2.8 11.6c.6 2.7 3.3 4.3 6 3.7 2.7-.6 4.3-3.3 3.7-6l-1.6-6.8c-.6-2.7-3.3-4.3-6-3.7l-4.9 1.2"/>
            <path fill="#A9DDF3" d="M151.4 173.8l.5 2.2c.3 1.1 1.3 1.7 2.4 1.5 1.1-.3 1.7-1.3 1.5-2.4l-.5-2.2-3.9.9z"/>
            <path fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M136.5 167.4l2.8 11.6c.6 2.7 3.3 4.3 6 3.7 2.7-.6 4.3-3.3 3.7-6l-2.8-11.6-9.7 2.3z"/>
            <path fill="#A9DDF3" d="M141.7 176.2l.5 2.2c.3 1.1 1.3 1.7 2.4 1.5 1.1-.3 1.7-1.3 1.5-2.4l-.5-2.2-3.9.9z"/>
            <path fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M127.9 174.6l1.6 6.8c.6 2.7 3.3 4.3 6 3.7 2.7-.6 4.3-3.3 3.7-6l-2.8-11.6-4.9 1.2c-2.6.5-4.2 3.2-3.6 5.9z"/>
            <path fill="#A9DDF3" d="M131.9 178.5l.5 2.2c.3 1.1 1.3 1.7 2.4 1.5 1.1-.3 1.7-1.3 1.5-2.4l-.5-2.2-3.9.9z"/>
          </g>
          <g id="fingersFrontR">
            <path fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M207.1 142.5l7.9 8.9c1.8 2.1 5 2.3 7.1.4 2.1-1.8 2.3-5 .4-7.1l-4.6-5.2c-1.8-2.1-5-2.2-7-.4l-3.8 3.4"/>
            <path fill="#A9DDF3" d="M215.8 147.7l1.5 1.7c.7.8 2 .9 2.8.2.8-.7.9-2 .2-2.8l-1.5-1.7-3 2.6z"/>
            <path fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M199.6 149.1l7.9 8.9c1.8 2.1 5 2.3 7.1.4 2.1-1.8 2.3-5 .4-7.1l-7.9-8.9-7.5 6.7z"/>
            <path fill="#A9DDF3" d="M208.3 154.4l1.5 1.7c.7.8 2 .9 2.8.2.8-.7.9-2 .2-2.8l-1.5-1.7-3 2.6z"/>
            <path fill="#88C9F2" stroke="#265D85" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M195.4 159.5l4.6 5.2c1.8 2.1 5 2.3 7.1.4 2.1-1.8 2.3-5 .4-7.1l-7.9-8.9-3.7 3.3c-2.1 1.9-2.3 5-.5 7.1z"/>
            <path fill="#A9DDF3" d="M200.8 161l1.5 1.7c.7.8 2 .9 2.8.2.8-.7.9-2 .2-2.8l-1.5-1.7-3 2.6z"/>
          </g>
          <path id="flashlightFront" fill="#1A1A1A" d="M83.9 181.4l4.6 26.4 34.6-33.6-24.5-6.2c-8.9-2.6-16.6 3.9-14.7 13.4z"/>
        </g>
      </svg>

      {/* Light SVG */}
      <svg id="lightSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 470" className="w-[600px] h-[470px] absolute top-0 left-0 overflow-visible">
        <filter id="white-glow">
          <feFlood result="flood" floodColor="#ffffff" floodOpacity=".6"></feFlood>
          <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>
          <feMorphology in="mask" result="dilated" operator="dilate" radius="3"></feMorphology>
          <feGaussianBlur in="dilated" result="blurred" stdDeviation="8"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="blurred"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <g id="light" style={{ visibility: 'hidden' }}>
          <path filter="url(#white-glow)" fill="#F8FFE8" d="M122.2 177.4c-5.2-1.6-13.6 2.1-20.6 8.3-7.7 6.8-11.4 16.8-9.3 22.1L421 1683h1534V733L122.2 177.4z"/>
          <path opacity="0.7" fill="#FFFFFF" d="M101.6,185.7c-8.2,7.3-11.9,18.2-8.8,23.1c2.6,4.1,13.6-1.1,21.8-8.4s13.6-18.1,9.9-21.6 C120.1,174.6,109.8,178.4,101.6,185.7z"/>
        </g>
      </svg>

      {/* Content */}
      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto text-center mt-[320px]">
          <h2 className="text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-[#d1e2ed] text-lg mb-8">
            We know it's scary, but the page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
