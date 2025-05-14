import React from 'react';
import ChatbotButton from './ChatbotButton';
import ChatbotDialog from './ChatbotDialog';
import { ChatbotProvider } from '@/context/ChatbotContext';

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className }) => {
  return (
    <ChatbotProvider>
      <ChatbotButton className={className} />
      <ChatbotDialog />
    </ChatbotProvider>
  );
};

export default Chatbot;
