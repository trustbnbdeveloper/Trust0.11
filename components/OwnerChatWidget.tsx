import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Shield, Check, CheckCheck, Camera, Image as ImageIcon, Lock } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Owner } from '../types';

interface OwnerChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Owner;
}

export const OwnerChatWidget: React.FC<OwnerChatWidgetProps> = ({ isOpen, onClose, currentUser }) => {
  const { directMessages, sendDirectMessage, markMessagesAsRead, decryptMessage } = useAppContext();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = directMessages[currentUser.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, previewUrl]);

  // Mark messages as read when chat is open
  useEffect(() => {
    if (isOpen) {
      markMessagesAsRead(currentUser.id, 'owner');
    }
  }, [isOpen, messages.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    await sendDirectMessage(currentUser.id, input, 'owner', selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-20 w-96 h-[500px] bg-white dark:bg-trust-darkcard rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden font-sans animate-in slide-in-from-bottom-2 fade-in">
      {/* Header */}
      <div className="bg-trust-blue text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-full relative">
             <Shield size={20} className="text-trust-green" />
             <div className="absolute -bottom-1 -right-1 bg-trust-darkbg rounded-full p-0.5">
                <Lock size={8} className="text-white" />
             </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">Priority Support</h3>
            <span className="text-[10px] text-gray-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> End-to-End Encrypted
            </span>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 space-y-4">
        <div className="flex justify-center">
           <span className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 border border-yellow-200 dark:border-yellow-900/50">
             <Lock size={8} /> Messages are secured with E2E encryption
           </span>
        </div>
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <MessageCircle size={32} opacity={0.5} />
            <p className="text-sm">Start a secure conversation.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm relative group ${
                  msg.sender === 'owner' 
                    ? 'bg-trust-blue text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                }`}
              >
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attachment" className="rounded-lg mb-2 max-h-40 object-cover w-full border border-white/20" />
                )}
                {msg.text && <p className="leading-relaxed">{decryptMessage(msg.text)}</p>}
                
                <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                  msg.sender === 'owner' ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {msg.isEncrypted && <Lock size={8} className="opacity-70" />}
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'owner' && (
                    msg.read ? <CheckCheck size={12} /> : <Check size={12} />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-trust-darkcard border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <img src={previewUrl} className="w-10 h-10 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
             <span className="text-xs text-gray-500 dark:text-gray-400">Image attached</span>
           </div>
           <button onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
             <X size={14} className="text-gray-500" />
           </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-trust-darkcard border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 items-end">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" // Enables camera on mobile
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-trust-blue dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            title="Take Photo or Upload"
          >
            <Camera size={20} />
          </button>
          
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type encrypted message..."
              className="w-full px-4 py-2.5 bg-transparent border-none focus:outline-none text-sm dark:text-white"
            />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() && !selectedImage}
            className="bg-trust-blue text-white p-2.5 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};