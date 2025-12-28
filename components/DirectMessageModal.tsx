import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Search, MessageCircle, User, Check, CheckCheck, Camera, Lock } from 'lucide-react';
import { Owner } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  owners: Owner[];
  initialOwnerId?: string | null;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({ isOpen, onClose, owners, initialOwnerId }) => {
  const { directMessages, sendDirectMessage, markMessagesAsRead, decryptMessage } = useAppContext();
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(initialOwnerId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  
  // Image handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update selected owner when modal opens with a specific ID
  useEffect(() => {
    if (isOpen) {
      setSelectedOwnerId(initialOwnerId || null);
    }
  }, [isOpen, initialOwnerId]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (isOpen && selectedOwnerId) {
      markMessagesAsRead(selectedOwnerId, 'admin');
    }
  }, [selectedOwnerId, isOpen, directMessages[selectedOwnerId!]?.length]);

  const getUnreadCount = (ownerId: string) => {
    const msgs = directMessages[ownerId] || [];
    return msgs.filter(m => m.sender === 'owner' && !m.read).length;
  };

  const getLastMessageTime = (ownerId: string) => {
    const msgs = directMessages[ownerId] || [];
    const lastMsg = msgs[msgs.length - 1];
    return lastMsg ? new Date(lastMsg.timestamp).getTime() : 0;
  };

  const filteredOwners = owners.filter(owner => 
    owner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort owners: Unread first, then by most recent message
  const sortedOwners = [...filteredOwners].sort((a, b) => {
    const unreadA = getUnreadCount(a.id);
    const unreadB = getUnreadCount(b.id);
    
    // Primary: Unread counts (Higher is better/top)
    if (unreadA > 0 && unreadB === 0) return -1;
    if (unreadA === 0 && unreadB > 0) return 1;
    
    // Secondary: Recent message time (Newest is better/top)
    const timeA = getLastMessageTime(a.id);
    const timeB = getLastMessageTime(b.id);
    return timeB - timeA;
  });

  const activeOwner = owners.find(o => o.id === selectedOwnerId);
  const currentMessages = selectedOwnerId ? (directMessages[selectedOwnerId] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedOwnerId, directMessages, isOpen, previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedOwnerId) return;

    await sendDirectMessage(selectedOwnerId, messageInput, 'admin', selectedImage || undefined);
    setMessageInput('');
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Left Sidebar: Owner List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800/50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-trust-blue dark:text-white mb-4 flex items-center gap-2">
              <MessageCircle size={20} /> Secure Chat
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue/20 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {sortedOwners.map(owner => {
              const lastMsg = directMessages[owner.id]?.slice(-1)[0];
              const unread = getUnreadCount(owner.id);

              return (
                <div 
                  key={owner.id}
                  onClick={() => setSelectedOwnerId(owner.id)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 ${
                    selectedOwnerId === owner.id 
                      ? 'bg-white dark:bg-trust-darkcard border-l-4 border-l-trust-blue shadow-sm' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedOwnerId === owner.id 
                        ? 'bg-trust-blue text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {owner.avatarInitials}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm border border-white dark:border-gray-800">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`text-sm font-semibold truncate ${
                        selectedOwnerId === owner.id ? 'text-trust-blue dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      } ${unread > 0 ? 'font-bold' : ''}`}>
                        {owner.name}
                      </h3>
                      {lastMsg && (
                        <span className={`text-[10px] ${unread > 0 ? 'text-trust-blue font-bold' : 'text-gray-400'}`}>
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate flex items-center gap-1 ${unread > 0 ? 'font-bold text-gray-800 dark:text-white' : 'text-gray-500'}`}>
                      {lastMsg ? (
                        <>
                          {lastMsg.isEncrypted && <Lock size={8} />}
                          {(lastMsg.sender === 'admin' ? 'You: ' : '') + (lastMsg.imageUrl ? 'Photo' : decryptMessage(lastMsg.text))}
                        </>
                      ) : 'No messages'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content: Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-trust-darkcard">
          {selectedOwnerId && activeOwner ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-trust-darkcard">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-trust-blue text-white flex items-center justify-center text-sm font-bold">
                    {activeOwner.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-bold text-trust-blue dark:text-white flex items-center gap-2">
                        {activeOwner.name}
                        <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-mono border border-green-200 flex items-center gap-1">
                            <Lock size={8} /> E2EE
                        </span>
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeOwner.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-xs text-gray-500">{activeOwner.location}</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-trust-blue dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-trust-darkbg/20">
                {currentMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Lock size={32} />
                    </div>
                    <p className="font-medium text-gray-600 dark:text-gray-300">End-to-End Encrypted</p>
                    <p className="text-xs mt-1">Start a secure conversation with {activeOwner.name}</p>
                  </div>
                ) : (
                  currentMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm text-sm ${
                        msg.sender === 'admin' 
                          ? 'bg-trust-blue text-white rounded-br-none' 
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                      }`}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="Attachment" className="rounded-lg mb-2 max-h-48 w-full object-cover border border-white/20" />
                        )}
                        {msg.text && <p>{decryptMessage(msg.text)}</p>}
                        
                        <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          msg.sender === 'admin' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {msg.isEncrypted && <Lock size={8} />}
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.sender === 'admin' && (
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
                <div className="px-4 py-2 bg-white dark:bg-trust-darkcard border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <img src={previewUrl} className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
                     <span className="text-xs text-gray-500 dark:text-gray-400">Preparing encrypted upload...</span>
                   </div>
                   <button onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                     <X size={16} className="text-gray-500" />
                   </button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-trust-darkcard">
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-trust-blue dark:text-gray-500 dark:hover:text-white p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    title="Attach Image"
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a secure message..."
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-blue text-sm dark:text-white"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() && !selectedImage}
                    className="bg-trust-blue text-white p-3 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
                <X size={24} />
              </button>
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600">
                <User size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">Select an Owner</h3>
              <p className="text-sm mt-2 max-w-xs text-center">Choose an owner from the list to view history or start a new direct message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};