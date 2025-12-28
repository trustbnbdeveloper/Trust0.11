import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone, X, Check, Home, Briefcase, Diamond } from 'lucide-react';
import { AppNotification, NotificationChannel } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onNotificationClick?: (notification: AppNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose, 
  notifications,
  onMarkRead,
  onNotificationClick
}) => {
  if (!isOpen) return null;

  const getIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'EMAIL': return <Mail size={16} className="text-blue-500" />;
      case 'SMS': return <Smartphone size={16} className="text-green-500" />;
      case 'PUSH': return <Bell size={16} className="text-orange-500" />;
      default: return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'Airbnb': 
        return { icon: Home, className: 'text-[#FF385C] bg-[#FF385C]/10 border-[#FF385C]/20', label: 'Airbnb' };
      case 'Booking': 
        return { icon: Briefcase, className: 'text-[#003580] bg-[#003580]/10 border-[#003580]/20', label: 'Booking.com' };
      case 'Direct': 
        return { icon: Diamond, className: 'text-[#2FA36B] bg-[#2FA36B]/10 border-[#2FA36B]/20', label: 'TrustBnB' };
      default: 
        return null;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] sm:hidden"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className={`
        fixed left-4 right-4 top-24 z-[100] 
        sm:absolute sm:inset-auto sm:top-12 sm:right-0 sm:w-96
        bg-white dark:bg-trust-darkcard rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 
        overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200
      `}>
        <div className="bg-trust-blue p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Bell size={16} /> Notifications
          </h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              No new notifications.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notif) => {
                const sourceBadge = getSourceBadge(notif.source);
                const SourceIcon = sourceBadge?.icon;

                return (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      if (onNotificationClick) {
                        onNotificationClick(notif);
                        onClose();
                      }
                    }}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-3 cursor-pointer ${notif.read ? 'opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                  >
                    <div className="mt-1">
                      {getIcon(notif.channel)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{notif.channel}</span>
                        <span className="text-[10px] text-gray-400">{notif.timestamp}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-trust-blue dark:text-white leading-tight">{notif.title}</h4>
                        {sourceBadge && SourceIcon && (
                          <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 font-medium ${sourceBadge.className}`}>
                            <SourceIcon size={10} /> {sourceBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{notif.message}</p>
                      
                      {!notif.read && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }}
                          className="mt-2 text-[10px] flex items-center gap-1 text-trust-blue hover:underline"
                        >
                          <Check size={10} /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-xs text-trust-blue dark:text-blue-300 font-medium hover:underline">
            View All History
          </button>
        </div>
      </div>
    </>
  );
};