import { useState, useCallback } from 'react';
import { generateChatResponse, getWeatherAssistantContext, ChatMessage } from '../services/openaiService';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function useChat(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    addMessage(text, true);
    setIsLoading(true);
    setError(null);
    
    try {
      const chatMessages: ChatMessage[] = [
        getWeatherAssistantContext(),
        ...messages.map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text
        })),
        { role: 'user', content: text }
      ];
      
      const response = await generateChatResponse(chatMessages);
      addMessage(response, false);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get a response. Please try again.');
      
      addMessage(
        "I'm having trouble connecting. Please try asking another weather-related question.",
        false
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: '1',
      text: "Hi! I can help you with weather-related questions. Ask me about weather conditions, temperature, pressure, wind speed, or clouds in any location.",
      isUser: false,
      timestamp: new Date()
    }]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
    clearMessages
  };
}