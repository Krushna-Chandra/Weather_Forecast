import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../hooks/useChat';

export const ChatSupport: React.FC = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat([{
    id: '1',
    text: "Hi! I can help you with weather-related questions. Ask me about weather conditions, temperature, pressure, wind speed, or clouds in any location.",
    isUser: false,
    timestamp: new Date()
  }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    await sendMessage(userMessage);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleReset = () => {
    clearMessages();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatWindowSize = () => {
    if (windowWidth < 640) {
      return {
        width: 'w-full',
        height: isMinimized ? 'h-12' : 'h-[70vh]',
        right: 'right-0',
        bottom: 'bottom-0',
        rounded: isMinimized ? 'rounded-t-lg' : 'rounded-t-lg'
      };
    } else {
      return {
        width: 'w-96',
        height: isMinimized ? 'h-12' : 'h-[500px]',
        right: 'right-6',
        bottom: 'bottom-6',
        rounded: 'rounded-lg'
      };
    }
  };

  const size = getChatWindowSize();

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
          aria-label="Open chat support"
        >
          <MessageCircle />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${size.bottom} ${size.right} ${size.width} ${size.height} bg-white dark:bg-gray-800 ${size.rounded} shadow-xl overflow-hidden z-50 transition-all duration-300 flex flex-col`}
          >
            <div className="p-3 bg-blue-500 dark:bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center">
                <MessageCircle size={18} className="mr-2" />
                <h3 className="font-semibold">Weather Support</h3>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={handleReset} 
                  className="mr-2 p-1 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-full"
                  title="Reset conversation"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  onClick={toggleMinimize} 
                  className="mr-2 p-1 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-full"
                >
                  <ChevronDown size={16} className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-900"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`${
                          msg.isUser 
                            ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg' 
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tr-lg rounded-tl-sm rounded-br-lg'
                        } p-3 max-w-[85%] shadow-sm relative`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-xs opacity-70 mt-1 block text-right">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-tr-lg rounded-tl-sm rounded-br-lg max-w-[85%] shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          <p className="text-sm">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-2 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about weather..."
                      className="flex-1 p-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className={`${
                        isLoading || !input.trim() 
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                      } text-white p-2 rounded-lg transition-colors`}
                    >
                      {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};