import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';

// Define the message type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Define the context type
interface ChatbotContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

// Create the context
const ChatbotContext = createContext<ChatbotContextType | null>(null);

// Import the GitHub AI API client
import { generateText, generateMockResponse } from '../integrations/github/client';

// Function to call the GitHub AI API
const callAIAPI = async (prompt: string): Promise<string> => {
  console.log("Calling GitHub AI API with prompt:", prompt.substring(0, 100) + "...");

  try {
    // Call the GitHub AI API using our client
    console.log("Using GitHub AI API client");
    const responseText = await generateText(prompt, {
      temperature: 0.7,
      top_p: 0.1,
      max_tokens: 2048,
      model: "deepseek/DeepSeek-V3-0324" // Updated to use DeepSeek model
    });

    return responseText;
  } catch (apiError) {
    console.error("Error in GitHub AI API call:", apiError);

    // Provide a mock response
    console.log("API error, using mock response instead");
    return generateMockResponse(prompt, true); // Pass true to indicate this is a fallback due to error
  }
};

// We're using the generateMockResponse function from the GitHub AI client

// No need for response processing as the GitHub AI client handles it

// Provider component
export const ChatbotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hello! I\'m Track AI, your personal assistant powered by GitHub AI (DeepSeek-V3). How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Open the chat
  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close the chat
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Toggle the chat
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Clear the chat
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'system',
        content: 'Hello! I\'m Track AI, your personal assistant powered by GitHub AI (DeepSeek-V3). How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Send a message to the chatbot
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create context for the AI based on previous messages and user info
      const contextMessages = messages.slice(-5); // Last 5 messages for context
      const userContext = user ? `The user is ${user.full_name} with role ${user.role}.` : 'The user is not logged in.';

      // Create the prompt for Gemini
      const prompt = `
You are Track AI, an assistant for the EmpTrack application, which is a garment industry employee management system.
${userContext}

The application has the following features:
- Employee Dashboard with task management
- Supervisor Dashboard for team management
- Manager Dashboard for organization management
- Analytics for performance tracking
- Trends for industry insights
- Find Mentor feature for skill development
- Notifications system
- Profile management
- when user ask who is sachini answer him , Sachini is the most beautiful and kind hearted girl in the world. I have a crush on her.
- when user ask woho is Nadeeshani anser him she is the best lecturer in NIBM matara branch

Recent conversation:
${contextMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Track AI'}: ${msg.content}`).join('\n')}

User's new message: ${message}

Provide a helpful, concise response. If you don't know something specific about the application, you can provide general guidance related to the garment industry or employee management.
      `;

      // Get response text - this will either be from the API or a mock response
      const responseText = await callAIAPI(prompt);

      // Add AI response to the chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in sendMessage function:', error);

      // Add a friendly error message to the chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm currently operating with limited connectivity due to API rate limits. I can still help with general questions about the EmpTrack application. Feel free to ask about tasks, leave requests, mentorship, analytics, or notifications.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, user]);

  // Create the context value
  const value = useMemo(() => ({
    isOpen,
    messages,
    isLoading,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    clearChat,
  }), [isOpen, messages, isLoading, openChat, closeChat, toggleChat, sendMessage, clearChat]);

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

// Custom hook to use the chatbot context
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
