import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateAIResponse } from '../services/geminiProxy';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: string;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, contextData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: 'Mirëdita! I am your TrustBnB personal concierge. How can I assist you with your property today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateAIResponse(input, contextData);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-trust-gray flex flex-col z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-trust-blue text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <div>
            <h3 className="font-semibold text-sm">TrustBnB Concierge</h3>
            <span className="text-xs text-trust-gray opacity-80">AI-Powered Support</span>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-trust-gray space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-trust-blue text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg border border-gray-200 rounded-bl-none flex items-center gap-2">
              <Loader2 className="animate-spin text-trust-blue" size={16} />
              <span className="text-xs text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about revenue, bookings..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-trust-blue text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-trust-green text-white p-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
