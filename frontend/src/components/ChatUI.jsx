import { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import { sendMessage } from '../services/api';

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Call backend API
      const response = await sendMessage(text, messages);
      
      // Add AI response
      const aiMessage = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || 'Failed to get response from server');
      
      // Add error message to chat
      const errorMessage = { 
        role: 'system', 
        content: `Error: ${err.response?.data?.error || err.message}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Chat</h2>
          <button
            onClick={handleClearChat}
            className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors text-sm font-medium"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center px-6">
              <div>
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Start a conversation
                </h3>
                <p className="text-purple-200">
                  Ask me anything! I'm powered by OpenAI GPT.
                </p>
              </div>
            </div>
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error display */}
        {error && (
          <div className="px-6 py-3 bg-red-500/20 border-t border-red-500/30">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Input box */}
        <InputBox onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatUI;
