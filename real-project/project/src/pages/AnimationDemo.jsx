import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopNavigation from "@/components/TopNavigation";
import { Button } from "@/components/ui/button";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/animations.css";

const AnimationDemo = () => {
  // Initialize AOS
  useEffect(() => {
    console.log("Initializing AOS");
    
    // Force any previous instances to clean up
    if (typeof AOS.refresh === 'function') {
      AOS.refresh();
    }
    
    // Initialize AOS with debug enabled
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: false,
      offset: 100,
      delay: 0,
      mirror: false,
      anchorPlacement: 'top-bottom',
      debug: true
    });
    
    // Add scroll event listener to force refresh AOS on scroll
    const handleScroll = () => {
      if (typeof AOS !== 'undefined' && typeof AOS.refresh === 'function') {
        AOS.refresh();
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Set up an interval to periodically refresh AOS
    const interval = setInterval(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);
  
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole="employee" />
      
      <div className="container mx-auto p-4 max-w-6xl pt-8">
        <h1 className="text-3xl font-bold mb-8" data-aos="fade-down">Animation Demo</h1>
        
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6" data-aos="fade-right">AOS (Animate On Scroll) Animations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-md" data-aos="fade-up" data-aos-delay="100">
              <CardHeader>
                <CardTitle>Fade Up Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card fades up when scrolled into view. It has a 100ms delay.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md" data-aos="fade-left" data-aos-delay="200">
              <CardHeader>
                <CardTitle>Fade Left Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card fades in from the left when scrolled into view. It has a 200ms delay.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md" data-aos="zoom-in" data-aos-delay="300">
              <CardHeader>
                <CardTitle>Zoom In Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card zooms in when scrolled into view. It has a 300ms delay.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md" data-aos="flip-left" data-aos-duration="1000">
              <CardHeader>
                <CardTitle>Flip Left Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card flips from the left when scrolled into view. It has a 1000ms duration.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md" data-aos="flip-right" data-aos-duration="1000">
              <CardHeader>
                <CardTitle>Flip Right Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card flips from the right when scrolled into view. It has a 1000ms duration.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="my-20">
          <div className="flex justify-center">
            <Button 
              onClick={() => AOS.refresh()}
              className="bg-purple-600 hover:bg-purple-700 mb-8"
              data-aos="zoom-in"
            >
              Refresh AOS Animations
            </Button>
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6" data-aos="fade-right">Framer Motion Animations</h2>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} whileHover="hover">
              <Card className="shadow-md h-full">
                <CardHeader>
                  <CardTitle>Staggered Animation 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card animates in with a staggered effect. It also has a hover animation.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover="hover">
              <Card className="shadow-md h-full">
                <CardHeader>
                  <CardTitle>Staggered Animation 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card animates in after the first one. It also has a hover animation.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover="hover">
              <Card className="shadow-md h-full">
                <CardHeader>
                  <CardTitle>Staggered Animation 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card animates in after the second one. It also has a hover animation.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6" data-aos="fade-right">Progress Bar Animations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md" data-aos="fade-up">
              <CardHeader>
                <CardTitle>Animated Progress Bars</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Task Completion</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="progress-bar-animate h-2.5 rounded-full bg-green-500" style={{"--progress-width": "75%"}} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="progress-bar-animate h-2.5 rounded-full bg-blue-500" style={{"--progress-width": "90%"}} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Project Completion</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="progress-bar-animate h-2.5 rounded-full bg-purple-500" style={{"--progress-width": "60%"}} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md" data-aos="fade-up" data-aos-delay="200">
              <CardHeader>
                <CardTitle>Animated Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center" data-aos="zoom-in" data-aos-delay="400">
                    <div className="text-3xl font-bold text-blue-600 pulse-animation">42</div>
                    <div className="text-sm text-gray-500">Tasks</div>
                  </div>
                  
                  <div className="text-center" data-aos="zoom-in" data-aos-delay="500">
                    <div className="text-3xl font-bold text-green-600 pulse-animation">98%</div>
                    <div className="text-sm text-gray-500">Accuracy</div>
                  </div>
                  
                  <div className="text-center" data-aos="zoom-in" data-aos-delay="600">
                    <div className="text-3xl font-bold text-purple-600 pulse-animation">12</div>
                    <div className="text-sm text-gray-500">Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="stagger-list p-6 bg-white rounded-lg shadow-md mb-16" data-aos="fade-up">
          <h2 className="text-2xl font-semibold mb-6">Staggered List Animations</h2>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(item => (
              <div key={item} className="stagger-item p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-full text-purple-600 font-bold mr-4">
                    {item}
                  </div>
                  <div>
                    <h3 className="font-medium">List Item {item}</h3>
                    <p className="text-sm text-gray-500">This is a staggered list item with automatic delay.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 mb-6 text-center">
          <Button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;
