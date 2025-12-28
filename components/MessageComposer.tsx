import React, { useState } from 'react';
import { Send, X, Smartphone, Mail, Bell, Users, CheckCircle } from 'lucide-react';
import { NotificationChannel } from '../types';

interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: { id: string; name: string }[];
  onSend: (channel: NotificationChannel, subject: string, message: string) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ isOpen, onClose, recipients, onSend }) => {
  const [channel, setChannel] = useState<NotificationChannel>('EMAIL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    // Simulate API call processing
    setTimeout(() => {
      // Trigger the actual notification logic via parent prop
      onSend(channel, subject, message);
      
      setIsSending(false);
      setSentSuccess(true);
      
      // Close modal after showing success message
      setTimeout(() => {
        setSentSuccess(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 1500);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-trust-blue px-6 py-4 flex justify-between items-center text-white">
          <h2 className="font-serif font-bold text-lg flex items-center gap-2">
            <Send size={18} /> Compose Message
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
               <CheckCircle size={32} />
             </div>
             <h3 className="text-xl font-bold text-trust-blue dark:text-white">Message Sent!</h3>
             <p className="text-gray-500 mt-2">Delivered via {channel} to {recipients.length} recipients.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            
            {/* Channel Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Delivery Channel</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setChannel('EMAIL')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    channel === 'EMAIL' 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Mail size={16} /> Email
                </button>
                <button 
                  onClick={() => setChannel('SMS')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    channel === 'SMS' 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone size={16} /> SMS
                </button>
                <button 
                  onClick={() => setChannel('PUSH')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    channel === 'PUSH' 
                      ? 'bg-orange-50 border-orange-200 text-orange-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell size={16} /> Push
                </button>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
               <Users size={16} className="text-gray-400" />
               <span className="text-sm text-gray-600 dark:text-gray-300">
                 Sending to <span className="font-bold text-trust-blue dark:text-white">{recipients.length} Owner(s)</span>
               </span>
            </div>

            {/* Subject (Email/Push only) */}
            {channel !== 'SMS' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Monthly Revenue Update"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm"
                />
              </div>
            )}

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={channel === 'SMS' ? "Write your SMS message here..." : "Write your message..."}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm resize-none"
              />
              {channel === 'SMS' && (
                <div className="text-right text-[10px] text-gray-400">
                  {message.length} characters
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
               <button
                 onClick={handleSend}
                 disabled={!message || isSending}
                 className="bg-trust-blue text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isSending ? 'Sending...' : 'Send Broadcast'}
                 {!isSending && <Send size={16} />}
               </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};