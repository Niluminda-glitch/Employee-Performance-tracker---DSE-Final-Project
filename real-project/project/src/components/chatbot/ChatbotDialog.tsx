import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Trash2, Loader2 } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import '@/styles/chatbot.css';

interface ChatbotDialogProps {
  className?: string;
}

const ChatbotDialog: React.FC<ChatbotDialogProps> = ({ className }) => {
  const { isOpen, messages, isLoading, sendMessage, clearChat } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle send message
  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const message = inputValue;
      setInputValue('');
      await sendMessage(message);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Render message bubble
  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    return (
      <motion.div
        key={message.id}
        className={cn(
          "flex w-full mb-4",
          isUser ? "justify-end" : "justify-start"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div
          className={cn(
            "flex flex-col max-w-[80%]",
            isUser ? "items-end" : "items-start"
          )}
        >
          <div className="flex items-center mb-1">
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mr-2">
                <Bot className="h-3 w-3 text-white" />
              </div>
            )}
            <span className="text-xs text-gray-500">
              {isUser ? 'You' : isSystem ? 'Track AI' : 'Assistant'} • {format(new Date(message.timestamp), 'h:mm a')}
            </span>
          </div>
          <div
            className={cn(
              "rounded-2xl px-4 py-2 break-words message-bubble",
              isUser
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                : isSystem
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            )}
          >
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 chatbot-dialog",
            className
          )}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Track AI</h3>
                <p className="text-xs text-white/80">Your garment industry assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 chatbot-messages">
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-purple-600 mt-2">
                <div className="flex space-x-1 mr-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full typing-dot"></div>
                  <div className="h-2 w-2 bg-purple-500 rounded-full typing-dot"></div>
                  <div className="h-2 w-2 bg-purple-500 rounded-full typing-dot"></div>
                </div>
                <span className="text-sm">Track AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotDialog;
