import React, { useState, useEffect } from 'react';
import {
    Search, Send, Paperclip, MoreVertical, Phone, Mail,
    MapPin, Clock, Calendar, Star, CheckCircle, Zap, User as UserIcon
} from 'lucide-react';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_QUICK_REPLIES, Message } from '../mockMessagingData';

export const AdminMessaging: React.FC = () => {
    useEffect(() => {
        console.log('AdminMessaging mounted');
    }, []);

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.id || null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'resolved'>('all');

    // Local state for messages to simulate sending
    const [messages, setMessages] = useState(MOCK_MESSAGES);

    const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConversationId);
    const currentMessages = selectedConversationId ? messages[selectedConversationId] : [];

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversationId) return;

        const newMessage: Message = {
            id: `M${Date.now()}`,
            conversationId: selectedConversationId,
            senderId: 'ADMIN',
            senderName: 'Support Team',
            senderRole: 'admin',
            content: messageInput,
            timestamp: new Date().toISOString(),
            read: true,
            type: 'text'
        };

        setMessages({
            ...messages,
            [selectedConversationId]: [...messages[selectedConversationId], newMessage]
        });
        setMessageInput('');
    };

    const insertQuickReply = (content: string) => {
        const formattedContent = content.replace('{guest_name}', selectedConversation?.guestName.split(' ')[0] || 'Guest');
        setMessageInput(formattedContent);
    };

    const filteredConversations = MOCK_CONVERSATIONS.filter(c => {
        const matchesSearch = c.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.propertyName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'unread' && c.unreadCount > 0) ||
            (filterStatus === 'resolved' && c.status === 'resolved');
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            {/* Sidebar - Conversation List */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header & Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search guests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-trust-blue/20"
                        />
                    </div>
                    <div className="flex gap-2 text-xs font-medium">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1 rounded-full ${filterStatus === 'all' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus('unread')}
                            className={`px-3 py-1 rounded-full ${filterStatus === 'unread' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilterStatus('resolved')}
                            className={`px-3 py-1 rounded-full ${filterStatus === 'resolved' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                        >
                            Resolved
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedConversationId(conv.id)}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedConversationId === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className="relative">
                                    <img
                                        src={conv.guestPhoto}
                                        alt={conv.guestName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    {conv.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white dark:border-gray-800">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                            {conv.guestName}
                                        </h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mb-1">{conv.propertyName}</p>
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                    {/* Header */}
                    <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-gray-900 dark:text-white">{selectedConversation.guestName}</h2>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded font-medium">
                                {selectedConversation.propertyName}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                            <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Phone size={20} />
                            </button>
                            <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {currentMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.senderRole === 'guest' && (
                                    <img
                                        src={selectedConversation.guestPhoto}
                                        alt={msg.senderName}
                                        className="w-8 h-8 rounded-full self-end"
                                    />
                                )}
                                <div className={`max-w-[70%] ${msg.senderRole === 'admin' ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-sm ${msg.senderRole === 'admin'
                                            ? 'bg-trust-blue text-white rounded-br-none'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.senderRole === 'admin' && msg.read && ' • Read'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Replies */}
                    <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto">
                        {MOCK_QUICK_REPLIES.map(reply => (
                            <button
                                key={reply.id}
                                onClick={() => insertQuickReply(reply.content)}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors flex items-center gap-1"
                            >
                                <Zap size={12} className="text-yellow-500" />
                                {reply.title}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <button type="button" className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-4 focus:ring-2 focus:ring-trust-blue/20"
                            />
                            <button
                                type="submit"
                                disabled={!messageInput.trim()}
                                className="p-3 bg-trust-blue text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <Mail size={48} className="mb-4 opacity-20" />
                    <p>Select a conversation to start messaging</p>
                </div>
            )}

            {/* Right Sidebar - Guest Profile */}
            {selectedConversation && (
                <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 hidden xl:block">
                    <div className="text-center mb-6">
                        <img
                            src={selectedConversation.guestPhoto}
                            alt={selectedConversation.guestName}
                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-gray-50 dark:border-gray-700"
                        />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedConversation.guestName}</h3>
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                            <MapPin size={12} /> New York, USA
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Mail size={16} />
                                <span className="truncate">{selectedConversation.guestEmail}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Phone size={16} />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>

                        {/* Current Booking */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Booking</h4>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg space-y-3">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{selectedConversation.propertyName}</p>
                                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        Dec 24 - Jan 02
                                    </div>
                                    <span className="font-bold text-trust-blue">Confirmed</span>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-gray-500">Total Payout</span>
                                    <span className="font-bold text-gray-900 dark:text-white">€1,850</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Guest Stats</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                                    <p className="text-xs text-gray-500">Bookings</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
                                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-base font-bold text-gray-900 dark:text-white">4.9</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Verification */}
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-xs font-bold text-green-700 dark:text-green-400">Identity Verified</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
