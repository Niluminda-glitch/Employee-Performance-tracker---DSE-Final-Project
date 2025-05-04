import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingAnimation, { LoaderType } from '@/components/LoadingAnimation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';

const LoadingDemo = () => {
  const navigate = useNavigate();
  const [color, setColor] = useState('#8b5cf6');
  const [size, setSize] = useState(40);
  const [speed, setSpeed] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const loaderTypes: LoaderType[] = [
    'hash',
    'pacman',
    'beat',
    'bounce',
    'circle',
    'climbing-box',
    'clock',
    'dot',
    'fade',
    'grid',
    'moon',
    'puff',
    'pulse',
    'ring',
    'rise',
    'rotate',
    'scale',
    'sync',
    'propagate',
    'clip'
  ];

  const copyCode = (type: LoaderType) => {
    const code = `<LoadingAnimation type="${type}" color="${color}" size={${size}} speedMultiplier={${speed}} />`;
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen w-full p-6 bg-mesh-gradient">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <h1 className="text-3xl font-bold text-gradient-enhanced">Loading Animation Demo</h1>
        </div>

        <Card className="mb-8 shadow-elevation-2 border-purple-100/80 backdrop-blur-md bg-white/95 rounded-xl">
          <CardHeader>
            <CardTitle>Customize Loaders</CardTitle>
            <CardDescription>Adjust the settings to customize all loaders at once</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center mt-2">
                <Input 
                  id="color" 
                  type="text" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="mr-2"
                />
                <div 
                  className="w-10 h-10 rounded-md border"
                  style={{ backgroundColor: color }}
                ></div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="size">Size: {size}</Label>
              <Slider 
                id="size"
                min={10} 
                max={100} 
                step={1}
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="speed">Speed: {speed.toFixed(1)}x</Label>
              <Slider 
                id="speed"
                min={0.1} 
                max={2} 
                step={0.1}
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loaderTypes.map((type) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative"
            >
              <Card className="h-full shadow-elevation-2 border-purple-100/80 backdrop-blur-md bg-white/95 rounded-xl overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">{type}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col items-center">
                  <div className="h-32 flex items-center justify-center mb-4">
                    <LoadingAnimation 
                      type={type} 
                      color={color} 
                      size={size} 
                      speedMultiplier={speed}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => copyCode(type)}
                  >
                    {copied === type ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;
