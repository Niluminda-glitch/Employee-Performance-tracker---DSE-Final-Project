import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const AnimationTest = () => {
  // Initialize AOS on component mount
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-8">Animation Test Page</h1>
      
      <h2 className="text-xl font-bold mb-4">AOS Animations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div 
          className="bg-blue-100 p-6 rounded-lg shadow-md"
          data-aos="fade-up"
        >
          <h3 className="font-bold">Fade Up</h3>
          <p>This element should fade up on scroll</p>
        </div>
        
        <div 
          className="bg-green-100 p-6 rounded-lg shadow-md"
          data-aos="fade-left"
          data-aos-delay="200"
        >
          <h3 className="font-bold">Fade Left (with delay)</h3>
          <p>This element should fade in from left</p>
        </div>
        
        <div 
          className="bg-purple-100 p-6 rounded-lg shadow-md"
          data-aos="zoom-in"
          data-aos-delay="400"
        >
          <h3 className="font-bold">Zoom In</h3>
          <p>This element should zoom in</p>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Framer Motion Animations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="bg-orange-100 p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-bold">Fade Up</h3>
          <p>This element should fade up immediately</p>
        </motion.div>
        
        <motion.div 
          className="bg-red-100 p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-bold">Slide in from Left</h3>
          <p>This element should slide in from left</p>
        </motion.div>
        
        <motion.div 
          className="bg-yellow-100 p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <h3 className="font-bold">Scale + Hover Effect</h3>
          <p>This element should scale up + has hover effect</p>
        </motion.div>
      </div>
      
      <div className="mt-20 mb-20">
        <h2 className="text-xl font-bold mb-4">Scroll down to see more animations</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          className="bg-indigo-100 p-6 rounded-lg shadow-md"
          data-aos="flip-left"
        >
          <h3 className="font-bold">Flip Left</h3>
          <p>This element should flip on scroll</p>
        </div>
        
        <div 
          className="bg-pink-100 p-6 rounded-lg shadow-md"
          data-aos="flip-right"
          data-aos-delay="200" 
        >
          <h3 className="font-bold">Flip Right</h3>
          <p>This element should flip on scroll</p>
        </div>
      </div>
      
      <div className="flex justify-center mt-12">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => AOS.refresh()}
        >
          Refresh AOS Animations
        </button>
      </div>
    </div>
  );
};

export default AnimationTest;
