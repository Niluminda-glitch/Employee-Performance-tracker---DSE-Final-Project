import React from 'react';
import { motion } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import { cn } from '@/lib/utils';

interface ChatbotButtonProps {
  className?: string;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ className }) => {
  const { isOpen, toggleChat } = useChatbot();

  return (
    <motion.div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.button
        onClick={toggleChat}
        className={cn(
          "flex items-center justify-center rounded-full shadow-lg chatbot-button",
          isOpen
            ? "bg-red-500 hover:bg-red-600 p-3"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 p-4"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-white" />
            <span className="ml-2 text-white font-medium">Track AI</span>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

export default ChatbotButton;
