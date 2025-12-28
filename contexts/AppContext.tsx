import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Theme, AppNotification, DirectMessage, Property } from '../types';
import { TRANSLATIONS } from '../translations';
import { MOCK_PROPERTIES } from '../constants';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
  notifications: AppNotification[];
  addNotification: (note: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  // Property Management
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'status' | 'qualityScore' | 'occupancyRate' | 'monthlyRevenue' | 'nextGuest'>) => void;
  // Messaging Context
  directMessages: Record<string, DirectMessage[]>;
  sendDirectMessage: (ownerId: string, text: string, sender: 'admin' | 'owner', imageFile?: File) => Promise<void>;
  markMessagesAsRead: (ownerId: string, viewer: 'admin' | 'owner') => void;
  decryptMessage: (text: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Encryption Utilities (Simulation for Prototype) ---
// In a production app, use Web Crypto API with public/private keys
const mockEncrypt = (text: string): string => {
  if (!text) return '';
  return 'ENC:' + btoa(text); // Base64 encoding with a prefix to simulate encryption
};

const mockDecrypt = (text: string): string => {
  if (text.startsWith('ENC:')) {
    try {
      return atob(text.substring(4));
    } catch (e) {
      return 'Error decrypting';
    }
  }
  return text; // Return as is if not encrypted (legacy messages)
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('sq'); // Default to Albanian as per brand mission
  const [theme, setTheme] = useState<Theme>('light');

  // Global Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', title: 'New Booking', message: 'Villa Saranda has a new booking for Aug 24.', channel: 'PUSH', timestamp: '10 min ago', read: false, source: 'Airbnb' },
    { id: '2', title: 'Monthly Revenue', message: 'Your July report is ready for download.', channel: 'EMAIL', timestamp: '2 hours ago', read: false },
    { id: '3', title: 'Welcome', message: 'Welcome to TrustBnB Ecosystem v1.0.', channel: 'SYSTEM', timestamp: '1 day ago', read: true },
  ]);

  // Property State
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);

  // Global Direct Message State (Owner ID -> Messages[])
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({
    '1': [
      { id: '1', text: mockEncrypt('Hi Arben, just checking in on the renovation progress.'), sender: 'admin', timestamp: new Date(Date.now() - 86400000), read: true, isEncrypted: true },
      { id: '2', text: mockEncrypt('Hello! It is going well. The contractors are finishing the kitchen tomorrow.'), sender: 'owner', timestamp: new Date(Date.now() - 82800000), read: true, isEncrypted: true },
    ]
  });

  // Request Notification Permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Theme Side Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  };

  const addNotification = (note: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNote: AppNotification = {
      ...note,
      id: Date.now().toString(),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addProperty = (newPropData: Omit<Property, 'id' | 'status' | 'qualityScore' | 'occupancyRate' | 'monthlyRevenue' | 'nextGuest'>) => {
    const newProperty: Property = {
      ...newPropData,
      id: (properties.length + 1).toString(),
      status: 'Review', // All new properties start in Review
      qualityScore: 0,
      occupancyRate: 0,
      monthlyRevenue: 0,
      nextGuest: null,
      images: newPropData.images || [newPropData.imgUrl]
    };
    setProperties(prev => [...prev, newProperty]);

    addNotification({
      title: 'Property Registered',
      message: `${newProperty.name} has been submitted for review.`,
      channel: 'SYSTEM'
    });
  };

  const sendDirectMessage = async (ownerId: string, text: string, sender: 'admin' | 'owner', imageFile?: File) => {
    let imageUrl = undefined;

    if (imageFile) {
      // Convert file to Base64
      imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }

    const newMessage: DirectMessage = {
      id: Date.now().toString(),
      text: mockEncrypt(text), // Encrypt before storing
      imageUrl: imageUrl,
      sender,
      timestamp: new Date(),
      read: false,
      isEncrypted: true
    };

    setDirectMessages(prev => ({
      ...prev,
      [ownerId]: [...(prev[ownerId] || []), newMessage]
    }));

    // --- Notification Logic ---

    // 1. In-App Notifications
    if (sender === 'admin') {
      addNotification({
        title: 'New Secure Message',
        message: 'You have received an encrypted message from Support.',
        channel: 'PUSH'
      });
    } else {
      addNotification({
        title: 'New Owner Message',
        message: `Owner ${ownerId} sent a new message.`,
        channel: 'SYSTEM'
      });
    }

    // 2. Native Browser Notifications (Alerts outside app)
    if (Notification.permission === "granted" && document.hidden) {
      new Notification("TrustBnB Secure Chat", {
        body: sender === 'admin' ? "New message from TrustBnB Support" : "New message from Property Owner",
        icon: "/favicon.ico" // Assuming favicon exists, or remove
      });
    }
  };

  const markMessagesAsRead = (ownerId: string, viewer: 'admin' | 'owner') => {
    setDirectMessages(prev => {
      const messages = prev[ownerId] || [];
      const updatedMessages = messages.map(msg => {
        // If viewer is admin, mark owner messages as read
        if (viewer === 'admin' && msg.sender === 'owner' && !msg.read) return { ...msg, read: true };
        // If viewer is owner, mark admin messages as read
        if (viewer === 'owner' && msg.sender === 'admin' && !msg.read) return { ...msg, read: true };
        return msg;
      });
      return { ...prev, [ownerId]: updatedMessages };
    });
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      theme, setTheme,
      t,
      notifications, addNotification, markAsRead,
      properties, addProperty,
      directMessages, sendDirectMessage, markMessagesAsRead,
      decryptMessage: mockDecrypt
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};