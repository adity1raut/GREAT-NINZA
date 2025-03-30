import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Loader2, Menu, X, User, Bot } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Extended timeout - 30 seconds instead of 15
  const REQUEST_TIMEOUT = 30000;

  // Memoize the welcome message to avoid unnecessary re-renders
  const welcomeMessage = useMemo(() => (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
          {isAuthenticated ? `Welcome back, ${currentUser?.name}` : 'Hey, I\'m Pravesh'}
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Your AI Assistant ready to help with anything you need
        </p>
      </div>
    </div>
  ), [isAuthenticated, currentUser?.name]);
  
  const userId = localStorage.getItem('userId');

  // Improved history saving function
  const saveToHistory = useCallback(async (queryText, responseText = null) => {
    try {
      const payload = {
        query: queryText,
        userId: userId
      };
      
      // Add response to payload if available
      if (responseText) {
        payload.response = responseText;
      }
      
      const saveResponse = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        // Add a dedicated timeout for saving history
        signal: AbortSignal.timeout(10000)
      });
      
      if (!saveResponse.ok) {
        console.warn('History save returned non-OK status:', saveResponse.status);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving chat history:', error.message);
      return false;
    }
  }, [userId]);

  // Handle chat submission with optimized fetch and improved history saving
  const handleChat = async (e) => {
    e.preventDefault();
    const queryText = query.trim();
    if (!queryText) return;

    // Add user message
    setMessages(prev => [...prev, {
      text: queryText,
      sender: 'user',
      timestamp: new Date(),
      isError: false
    }]);
    
    setQuery('');
    setIsLoading(true);
    setError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // Get AI response with extended timeout
      const res = await Promise.race([
        fetch('http://127.0.0.1:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `query=${encodeURIComponent(queryText)}`,
          signal
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
        )
      ]);

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      
      const data = await res.json();
      const responseText = data.response || "I couldn't process that request";
      
      // Only save history after successful response
      if (data.response) {
        try {
          await saveToHistory(queryText, responseText);
        } catch (historyError) {
          console.error('Failed to save chat history:', historyError);
          // Continue without failing the main flow
        }
      }
      
      setMessages(prev => [...prev, {
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        isError: !!data.error
      }]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMsg = `Error: ${err.message}`;
        setError(err.message);
        setMessages(prev => [...prev, {
          text: errorMsg,
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Auto-scroll with throttling
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // Memoize message formatting function
  const formatResponse = useCallback((text) => {
    return text.split('\n').map((para, i) => (
      <p key={i} className="mb-2 last:mb-0">{para || <br />}</p>
    ));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  // Update textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [query, adjustTextareaHeight]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="p-4 border-b border-gray-800 bg-gray-800 flex items-center">
          <button 
            className="md:hidden mr-4"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Pravesh AI Assistant
          </h1>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4">
          {messages.length === 0 ? (
            welcomeMessage
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[90%] md:max-w-[80%] p-4 rounded-xl ${
                    msg.sender === 'user' 
                      ? 'bg-purple-600 rounded-l-xl rounded-tr-xl'
                      : msg.isError
                        ? 'bg-red-900 rounded-r-xl rounded-tl-xl'
                        : 'bg-gray-800 rounded-r-xl rounded-tl-xl'
                  }`}>
                    <div className="mr-3 mt-1 flex-shrink-0">
                      {msg.sender === 'user' ? (
                        <User className="w-5 h-5 text-purple-200" />
                      ) : (
                        <Bot className={`w-5 h-5 ${msg.isError ? 'text-red-300' : 'text-blue-300'}`} />
                      )}
                    </div>
                    <div>
                      <div className="text-sm mb-1 font-medium">
                        {msg.sender === 'user' ? 'You' : 'Pravesh AI'}
                      </div>
                      <div className={msg.isError ? 'text-red-200' : ''}>
                        {formatResponse(msg.text)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-r-xl rounded-tl-xl p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-blue-300" />
                      <div className="flex space-x-1">
                        {[0, 150, 300].map(delay => (
                          <div 
                            key={delay}
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Input Area */}
        <footer className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleChat}>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChat(e);
                    }
                  }}
                  placeholder="Message Pravesh AI..."
                  className="w-full p-4 pr-14 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={1}
                  style={{ minHeight: '60px', maxHeight: '200px' }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200 ${
                    isLoading
                      ? 'bg-gray-600'
                      : !query.trim()
                        ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-lg'
                  }`}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Chat;