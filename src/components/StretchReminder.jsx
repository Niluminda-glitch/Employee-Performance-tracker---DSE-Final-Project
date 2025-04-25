
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Activity, Timer, ArrowRight } from "lucide-react";

// Stretch exercises data
const stretchExercises = [
  {
    id: 1,
    name: "Wrist and Finger Stretch",
    description: "Extend your arm with palm up, gently pull fingers back with other hand. Hold for 10 seconds, then repeat with palm down.",
    icon: "✋",
    duration: "20 seconds"
  },
  {
    id: 2,
    name: "Shoulder Rolls",
    description: "Roll your shoulders backward in a circular motion 5 times, then forward 5 times.",
    icon: "🔄",
    duration: "15 seconds"
  },
  {
    id: 3,
    name: "Neck Stretch",
    description: "Tilt your head toward your shoulder until you feel a gentle stretch. Hold for 10 seconds, then repeat on the other side.",
    icon: "🧘‍♀️",
    duration: "20 seconds"
  },
  {
    id: 4,
    name: "Back Stretch",
    description: "Sitting tall, reach your arms overhead and interlock your fingers. Push your palms toward the ceiling for 10 seconds.",
    icon: "⬆️",
    duration: "15 seconds"
  },
  {
    id: 5,
    name: "Eye Rest",
    description: "Look away from your screen to a distant object for 20 seconds, then blink rapidly for 5 seconds.",
    icon: "👁️",
    duration: "25 seconds"
  }
];

// Main reminder component
const StretchReminder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeSinceLastReminder, setTimeSinceLastReminder] = useState(0);
  
  // Time between reminders (in minutes)
  const reminderInterval = 60; // 60 minutes
  
  // Show the next exercise
  const showNextExercise = useCallback(() => {
    setCurrentExerciseIndex(prev => (prev + 1) % stretchExercises.length);
  }, []);
  
  // Show a reminder toast
  const showReminderToast = useCallback(() => {
    toast(
      <div className="flex items-start gap-3">
        <Activity className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="font-medium text-xs">Time for a quick stretch break!</strong>
          <p className="text-xs text-muted-foreground mt-1">
            Taking a 1-minute break can help reduce strain and fatigue.
          </p>
        </div>
      </div>,
      {
        duration: 8000,
        position: "top-right",
        action: {
          label: "View Stretches",
          onClick: () => setIsModalOpen(true)
        },
      }
    );
    // Reset the timer when a reminder is shown
    setTimeSinceLastReminder(0);
  }, []);
  
  // Timer logic for periodic reminders
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeSinceLastReminder(prev => prev + 1);
    }, 60000); // Check every minute
    
    return () => clearInterval(timerInterval);
  }, []);
  
  // Check if it's time to show a reminder
  useEffect(() => {
    if (timeSinceLastReminder >= reminderInterval) {
      showReminderToast();
    }
  }, [timeSinceLastReminder, reminderInterval, showReminderToast]);
  
  // For demonstration purposes, show a reminder soon after the component mounts
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showReminderToast();
    }, 30000); // Show first reminder after 30 seconds for demo purposes
    
    return () => clearTimeout(initialDelay);
  }, [showReminderToast]);
  
  const currentExercise = stretchExercises[currentExerciseIndex];
  
  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border border-purple-200 shadow-elevation-2 outline outline-2 outline-offset-0 outline-gradient-purple">
          <DialogHeader>
            <DialogTitle className="text-gradient-enhanced text-base">
              Quick Stretch Break
            </DialogTitle>
            <DialogDescription className="text-xs">
              Take a moment to relieve tension and reduce fatigue
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4 px-1">
            <div className="w-14 h-14 flex items-center justify-center text-3xl bg-purple-100 rounded-full mb-3">
              {currentExercise.icon}
            </div>
            
            <h3 className="text-base font-medium text-center mb-2">{currentExercise.name}</h3>
            <p className="text-center text-xs text-muted-foreground mb-3">
              {currentExercise.description}
            </p>
            
            <div className="flex items-center text-xs text-purple-600 mb-4">
              <Timer className="h-3 w-3 mr-1.5" />
              <span>{currentExercise.duration}</span>
            </div>
            
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-700 border-purple-200 text-xs"
                onClick={showNextExercise}
              >
                Next Stretch <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
              
              <DialogClose asChild>
                <Button size="sm" className="text-xs">Done for Now</Button>
              </DialogClose>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2 pt-3 border-t border-purple-100">
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1.5" />
              Exercise {currentExerciseIndex + 1} of {stretchExercises.length}
            </div>
            <p className="text-xs text-muted-foreground">Your well-being matters!</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StretchReminder;
