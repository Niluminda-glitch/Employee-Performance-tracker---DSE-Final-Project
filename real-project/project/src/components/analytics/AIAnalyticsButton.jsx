import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Brain, Sparkles } from 'lucide-react';
import AIAnalyticsModal from './AIAnalyticsModal';
import { toast } from 'sonner';

const AIAnalyticsButton = ({ userData, userSkills, taskStats, leaveStats }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Log the data being passed to the AI Analytics component
  useEffect(() => {
    if (isModalOpen) {
      console.log("AI Analytics data:", {
        userData,
        userSkills,
        taskStats,
        leaveStats
      });
    }
  }, [isModalOpen, userData, userSkills, taskStats, leaveStats]);

  const handleOpenModal = () => {
    // Validate that we have the necessary data
    if (!userData || !taskStats) {
      toast.error("Unable to load employee data for AI analysis");
      return;
    }

    // Open the modal
    setIsModalOpen(true);
    toast.info("Analyzing employee performance data...");
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={handleOpenModal}
          className="ai-analytics-button bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 relative overflow-hidden group"
          size="lg"
        >
          <Brain className="h-5 w-5 floating-icon" />
          <span className="gradient-text font-semibold">Advanced AI Analytics</span>

          {/* Animated sparkles */}
          <motion.div
            className="absolute top-0 right-0 -mt-1 -mr-1"
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="h-6 w-6 text-yellow-300 opacity-80" />
          </motion.div>

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-lg pulse-highlight"></div>
        </Button>
      </motion.div>

      <AIAnalyticsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        userData={userData}
        userSkills={userSkills}
        taskStats={taskStats}
        leaveStats={leaveStats}
      />
    </>
  );
};

export default AIAnalyticsButton;
