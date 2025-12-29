import React, { useState, useRef, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Wallet, Home, Calendar, ArrowUpRight, ShieldCheck, TrendingUp, Bell, Settings, Eye, EyeOff, Lock, Hammer, CheckSquare, Globe, Diamond, Briefcase, Info, X, ChevronRight, ChevronLeft, PieChart, CreditCard, Receipt, Sparkles, Loader2, RefreshCw, BarChart3, ArrowDownLeft, Sun, Moon, MessageSquare, Filter, Plus
} from 'lucide-react';
import { MOCK_PROPERTIES, REVENUE_DATA, COLORS, MOCK_TRANSACTIONS, MOCK_TASKS, MOCK_OWNERS } from '../constants';
import { AIChat } from '../components/AIChat';
import { OwnerChatWidget } from '../components/OwnerChatWidget';
import { NotificationCenter } from '../components/NotificationCenter';
import { OwnerProfile } from '../components/OwnerProfile';
import { generateAIResponse } from '../services/geminiProxy';
import { useAppContext } from '../contexts/AppContext';
import { Owner, Property, AppNotification } from '../types';
import { FooterInfoModal, FooterModalType } from '../components/FooterInfoModal';
import { GlassCard } from '../components/core/GlassCard';
import { TrustButton } from '../components/core/TrustButton';

// Helper for Channel Branding
const getChannelConfig = (channel: string) => {
  switch (channel) {
    case 'Airbnb':
      return {
        color: '#FF385C', // Airbnb Rausch
        bg: 'bg-[#FF385C]/10',
        text: 'text-[#FF385C]',
        border: 'border-[#FF385C]/20',
        icon: Home,
        label: 'Airbnb'
      };
    case 'Booking':
      return {
        color: '#003580', // Booking.com Blue
        bg: 'bg-[#003580]/10',
        text: 'text-[#003580]',
        border: 'border-[#003580]/20',
        icon: Briefcase,
        label: 'Booking.com'
      };
    case 'Direct':
      return {
        color: '#2FA36B', // TrustBnB Green
        bg: 'bg-[#2FA36B]/10',
        text: 'text-[#2FA36B]',
        border: 'border-[#2FA36B]/20',
        icon: Diamond,
        label: 'TrustBnB'
      };
    default:
      return {
        color: '#6B7280',
        bg: 'bg-gray-100',
        text: 'text-gray-500',
        border: 'border-gray-200',
        icon: Globe,
        label: channel
      };
  }
};

// Full Calendar Modal Component
const PropertyFullCalendarModal: React.FC<{ property: Property, onClose: () => void }> = ({ property, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 1)); // Start at August 2024

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDayOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-trust-blue/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-trust-blue p-5 text-white flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl font-serif">{property.name}</h3>
            <p className="text-xs opacity-70 flex items-center gap-1 mt-1"><Calendar size={12} /> Availability Calendar</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6 px-2">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-trust-blue dark:text-white text-lg select-none w-40 text-center">{monthLabel}</span>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <span key={d} className="text-xs text-gray-400 font-bold uppercase tracking-wider">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              // Deterministic pseudo-random booking logic based on property ID and current month
              const seed = property.id.charCodeAt(0) + day + currentDate.getMonth();
              const isBooked = (seed % 3 === 0) || (seed % 7 === 0);
              let channel = '';
              if (isBooked) {
                const channelSeed = seed % 3;
                channel = channelSeed === 0 ? 'Airbnb' : channelSeed === 1 ? 'Booking' : 'Direct';
              }
              const config = channel ? getChannelConfig(channel) : null;

              return (
                <div key={day} className="aspect-square flex items-center justify-center relative group">
                  <div className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm ${isBooked ? 'text-white' : 'bg-white border border-gray-100 text-gray-600 hover:border-trust-blue dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                    }`}
                    style={{ backgroundColor: isBooked && config ? config.color : undefined }}
                  >
                    {day}
                  </div>
                  {isBooked && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 whitespace-nowrap">
                      <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                        {channel} • Guest Arriving
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs justify-center font-medium text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]"></div> Airbnb</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#003580]"></div> Booking.com</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#2FA36B]"></div> TrustBnB</div>
          </div>

          {/* Footer Metrics */}
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Occupancy: <strong className="text-gray-700 dark:text-gray-200">{property.occupancyRate}%</strong></span>
            <span>Revenue: <strong className="text-gray-700 dark:text-gray-200">€{property.monthlyRevenue}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Onboarding Modal Component ---
const PropertyOnboardingModal: React.FC<{ isOpen: boolean, onClose: () => void, onComplete: (data: any) => void }> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: 'Coastal' as const,
    pricePerNight: 100,
    channels: ['Direct'] as ('Airbnb' | 'Booking' | 'Direct')[],
    amenities: [] as string[],
    imgUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  });

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const handleSubmit = () => {
    onComplete(formData);
    onClose();
    setStep(1); // Reset for next time
  };

  const AMENITIES_OPTIONS = ['Pool', 'WiFi', 'Sea View', 'City View', 'Gym', 'Workspace', 'Concierge', 'Smart Lock', 'Garden', 'AC'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-trust-blue/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-trust-blue p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-xl font-serif">Register New Property</h3>
            <p className="text-xs opacity-70 mt-1">Step {step} of 4</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 shrink-0">
          <div className="bg-trust-green h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="font-bold text-trust-blue dark:text-white text-lg">Identity & Location</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Property Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Villa Saranda Breeze"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-trust-blue outline-none dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">City / Neighborhood</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarandë, Albania"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-trust-blue outline-none dark:text-white"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Coastal', 'Urban', 'Mountain'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${formData.category === cat
                          ? 'bg-trust-blue text-white border-trust-blue'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-trust-blue'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="font-bold text-trust-blue dark:text-white text-lg">Amenities & Features</h4>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES_OPTIONS.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => {
                      const newAmenities = formData.amenities.includes(amenity)
                        ? formData.amenities.filter(a => a !== amenity)
                        : [...formData.amenities, amenity];
                      setFormData({ ...formData, amenities: newAmenities });
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${formData.amenities.includes(amenity)
                      ? 'bg-trust-green/10 border-trust-green text-trust-green'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                      }`}
                  >
                    <CheckSquare size={14} className={formData.amenities.includes(amenity) ? 'opacity-100' : 'opacity-0'} />
                    {amenity}
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 italic">Professional photography will be scheduled during our onboarding review.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="font-bold text-trust-blue dark:text-white text-lg">Setup & Pricing</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Target Price Per Night (€)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-trust-blue outline-none dark:text-white font-bold"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Distribution Channels</label>
                  <div className="space-y-2">
                    {(['Airbnb', 'Booking', 'Direct'] as const).map(ch => (
                      <div key={ch} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-bold text-trust-blue dark:text-white uppercase tracking-wider">{ch === 'Direct' ? 'TrustBnB Direct' : ch}</span>
                        <button
                          onClick={() => {
                            const newChannels = formData.channels.includes(ch)
                              ? formData.channels.filter(c => c !== ch)
                              : [...formData.channels, ch];
                            setFormData({ ...formData, channels: newChannels });
                          }}
                          className={`w-10 h-5 rounded-full transition-all relative ${formData.channels.includes(ch) ? 'bg-trust-green' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.channels.includes(ch) ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h4 className="font-bold text-trust-blue dark:text-white text-lg">Ready for Review</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please review your property details before submitting to our curators.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Property</span>
                  <span className="font-bold text-trust-blue dark:text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Location</span>
                  <span className="font-medium text-gray-600 dark:text-gray-300">{formData.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Category</span>
                  <span className="font-bold text-trust-green">{formData.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Target Price</span>
                  <span className="font-mono font-bold text-trust-blue dark:text-white">€{formData.pricePerNight}/night</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between shrink-0">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-2 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-bold text-sm hover:bg-white dark:hover:bg-gray-700 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 4 ? handleSubmit : handleNext}
            disabled={step === 1 && !formData.name}
            className="px-6 py-2 bg-trust-blue text-white rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {step === 4 ? 'Submit for Review' : 'Next Step'}
            {step < 4 && <ArrowUpRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

type InsightType = 'REVENUE' | 'MAINTENANCE' | 'CASHFLOW';

export const OwnerDashboard: React.FC = () => {
  const { t, notifications, markAsRead, addNotification, theme, setTheme, directMessages, properties, addProperty } = useAppContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true); // Default to true for security
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // State for Navigation and Current User
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'PROFILE'>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<Owner>(MOCK_OWNERS[0]); // Default to first mock owner

  // Property Filtering State
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<'All' | 'Active' | 'Maintenance' | 'Onboarding' | 'Review'>('All');
  const [propertyChannelFilter, setPropertyChannelFilter] = useState<'All' | 'Airbnb' | 'Booking' | 'Direct'>('All');

  // Modal State for Cards
  const [activeModal, setActiveModal] = useState<'OCCUPANCY' | 'PAYOUT' | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Calendar Modal State
  const [calendarProperty, setCalendarProperty] = useState<Property | null>(null);

  // Smart Insight Card State
  const [insightType, setInsightType] = useState<InsightType>('REVENUE');
  const [aiInsightText, setAiInsightText] = useState<string>('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  // Footer Modal State
  const [footerModalType, setFooterModalType] = useState<FooterModalType>(null);

  // Interaction Logic Refs
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const isTouchInteraction = useRef(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Calculate unread support messages for this owner
  const unreadSupportCount = (directMessages[currentUser.id] || []).filter(m => m.sender === 'admin' && !m.read).length;

  // Filter properties based on selection
  const filteredProperties = properties.filter(p => {
    const matchesStatus = propertyStatusFilter === 'All' || p.status === propertyStatusFilter;
    const matchesChannel = propertyChannelFilter === 'All' || p.channels.includes(propertyChannelFilter as any);
    return matchesStatus && matchesChannel;
  });

  // Derive context for AI using ALL properties (portfolio view)
  const totalRev = properties.reduce((acc, curr) => acc + curr.monthlyRevenue, 0);
  const aiContext = `Owner has ${properties.length} properties. Total monthly revenue is €${totalRev}. Top performing property is Villa Saranda Breeze.`;

  // Clear insight when tab changes so new one must be requested
  useEffect(() => {
    setAiInsightText('');
  }, [insightType]);

  const handleGenerateAI = async () => {
    if (isGeneratingInsight) return;

    setIsGeneratingInsight(true);
    setAiInsightText('');

    let promptContext = '';
    let userPrompt = '';

    if (insightType === 'REVENUE') {
      promptContext = `Revenue Data: ${JSON.stringify(REVENUE_DATA)}. Total Revenue: €${totalRev}. Growth: +12.5%.`;
      userPrompt = "Generate a 2-sentence executive summary of my revenue performance trends and a quick projection.";
    } else if (insightType === 'MAINTENANCE') {
      promptContext = `Tasks: ${JSON.stringify(MOCK_TASKS)}. Quality Score Avg: 93/100.`;
      userPrompt = "Generate a 2-sentence summary of property health, highlighting critical maintenance tasks and value-add opportunities.";
    } else if (insightType === 'CASHFLOW') {
      promptContext = `Recent Transactions: ${JSON.stringify(MOCK_TRANSACTIONS.slice(0, 3))}. Next Payout: €2,450.`;
      userPrompt = "Generate a 2-sentence financial health check focused on cashflow and incoming payouts.";
    }

    const response = await generateAIResponse(userPrompt, promptContext);
    setAiInsightText(response);
    setIsGeneratingInsight(false);
  };

  const handleNotificationClick = (notification: AppNotification) => {
    const lowerTitle = notification.title.toLowerCase();
    const lowerMsg = notification.message.toLowerCase();

    if (lowerTitle.includes('booking') || lowerMsg.includes('booking')) {
      // Find property mentioned in notification or default to first one
      const prop = properties.find(p => lowerMsg.includes(p.name)) || properties[0];
      if (prop) {
        setCalendarProperty(prop);
      }
    } else if (lowerTitle.includes('revenue') || lowerTitle.includes('payout')) {
      setActiveModal('PAYOUT');
    } else if (lowerTitle.includes('message') || lowerMsg.includes('message')) {
      setIsSupportOpen(true);
    } else if (lowerTitle.includes('profile')) {
      setViewMode('PROFILE');
    }
    // Mark as read when clicked
    markAsRead(notification.id);
  };

  const renderFinancialValue = (value: string | number) => {
    if (privacyMode) return <span className="blur-sm select-none">€8,888.88</span>;
    return value;
  };

  const handleProfileSave = (updatedOwner: Owner) => {
    setCurrentUser(updatedOwner);
    setViewMode('DASHBOARD');
    addNotification({
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      channel: 'SYSTEM',
    });
  };

  // --- Card Interaction Handlers (General Stats) ---
  const handleTouchStart = (type: 'OCCUPANCY' | 'PAYOUT') => {
    isTouchInteraction.current = true;
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      setActiveModal(type);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTimeout(() => {
      isTouchInteraction.current = false;
    }, 500);
  };

  const handleCardClick = (type: 'OCCUPANCY' | 'PAYOUT') => {
    if (isTouchInteraction.current) return;
    setActiveModal(type);
  };

  // --- Property Interaction Handlers ---
  const handlePropertyTouchStart = (prop: Property) => {
    isTouchInteraction.current = true;
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      setCalendarProperty(prop);
    }, 500); // Long press to open modal on mobile
  };

  const handlePropertyTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTimeout(() => {
      isTouchInteraction.current = false;
    }, 500);
  };

  const handlePropertyClick = (prop: Property) => {
    // Only trigger on desktop click (when not touch interaction)
    if (isTouchInteraction.current) return;
    setCalendarProperty(prop);
  };

  return (
    <div className="min-h-screen bg-trust-gray dark:bg-trust-darkbg font-sans transition-colors duration-200 pb-20 md:pb-0">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-trust-darkcard border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('DASHBOARD')}>
          <div className="w-8 h-8 bg-trust-blue rounded-lg flex items-center justify-center text-white">
            <Diamond size={18} fill="currentColor" />
          </div>
          <span className="text-trust-blue dark:text-white font-bold text-lg tracking-tight">TRUST<span className="font-light">BNB</span></span>
        </div>

        {/* Security Badge in Nav */}
        <div className="hidden lg:flex items-center gap-2 bg-trust-gray dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
          <Lock size={12} className="text-trust-green" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Vault Encrypted</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-500 hover:text-trust-blue dark:text-gray-400 dark:hover:text-white transition-colors p-1"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative text-gray-500 hover:text-trust-blue dark:text-gray-400 dark:hover:text-white transition-colors p-1"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationCenter
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkRead={markAsRead}
              onNotificationClick={handleNotificationClick}
            />
          </div>

          <div
            className="flex items-center gap-3 border-l pl-6 border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setViewMode(viewMode === 'DASHBOARD' ? 'PROFILE' : 'DASHBOARD')}
            title="Manage Profile"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-trust-blue dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.location}</p>
            </div>
            <div className="w-10 h-10 bg-trust-beige dark:bg-trust-blue rounded-full flex items-center justify-center text-trust-blue dark:text-white font-semibold border border-gray-200 dark:border-gray-700">
              {currentUser.avatarInitials}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {viewMode === 'PROFILE' ? (
          <OwnerProfile
            owner={currentUser}
            onSave={handleProfileSave}
            onBack={() => setViewMode('DASHBOARD')}
          />
        ) : (
          <>
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h1 className="text-2xl font-serif font-bold text-trust-blue dark:text-white">Mirëdita, {currentUser.name.split(' ')[0]}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here is your property portfolio performance.</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Total Revenue with Commission Breakdown */}
              <GlassCard
                variant="elevated"
                padding="md"
                className="col-span-1 md:col-span-2 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-trust-blue/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-trust-blue/5 dark:bg-white/5 rounded-xl text-trust-blue dark:text-white">
                    <Wallet size={28} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="flex items-center text-trust-green text-sm font-bold bg-trust-green/10 px-2 py-1 rounded-lg mb-1">
                      +12.5% <TrendingUp size={14} className="ml-1" />
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">vs last month</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>{t('fin_gross')}</span>
                    <span className="font-mono">{renderFinancialValue('€6,775.00')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-medium border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span>{t('fin_commission')} (20%)</span>
                    <span className="text-red-500 font-mono">-{renderFinancialValue('€1,355.00')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">{t('fin_net')}</p>
                    <div className="flex items-center gap-3">
                      <h3 className="text-4xl font-black text-trust-blue dark:text-white tracking-tighter">
                        {renderFinancialValue('€5,420.00')}
                      </h3>
                      <button
                        onClick={() => setPrivacyMode(!privacyMode)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
                        aria-label={privacyMode ? "Show sensitive data" : "Hide sensitive data"}
                      >
                        {privacyMode ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                  <TrustButton variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold">
                    View Ledger
                  </TrustButton>
                </div>
              </GlassCard>

              {/* Occupancy */}
              <GlassCard
                variant="elevated"
                padding="md"
                className="col-span-1 flex flex-col justify-between cursor-pointer group active:scale-[0.98] transition-all"
                onClick={() => handleCardClick('OCCUPANCY')}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-trust-blue/5 dark:bg-white/5 rounded-xl text-trust-blue dark:text-white group-hover:scale-110 transition-transform">
                    <Home size={22} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Occupancy</p>
                    <p className="text-xs text-trust-green font-bold">Stable</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-trust-blue dark:text-white tracking-tighter">82%</h3>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Portfolio Average</p>
                </div>
              </GlassCard>

              {/* Upcoming Payout */}
              <GlassCard
                variant="elevated"
                padding="md"
                className="col-span-1 flex flex-col justify-between cursor-pointer group active:scale-[0.98] transition-all"
                onClick={() => handleCardClick('PAYOUT')}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-trust-blue/5 dark:bg-white/5 rounded-xl text-trust-blue dark:text-white group-hover:scale-110 transition-transform">
                    <Calendar size={22} />
                  </div>
                  <span className="px-2 py-0.5 bg-trust-blue text-white text-[10px] font-bold rounded-lg animate-pulse">
                    IN 2 DAYS
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-trust-blue dark:text-white tracking-tighter truncate">
                    {renderFinancialValue('€2,450')}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Verified Transfer</p>
                </div>
              </GlassCard>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

              {/* Interactive Smart Insights Card */}
              <GlassCard
                variant="glass"
                padding="none"
                className="lg:col-span-2 shadow-sm flex flex-col h-[450px] lg:h-[550px]"
              >
                {/* Header with Tabs */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30 dark:bg-black/20">
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <TrustButton
                      onClick={handleGenerateAI}
                      isLoading={isGeneratingInsight}
                      variant="primary"
                      size="sm"
                      className="w-10 h-10 rounded-full"
                      aria-label="Generate AI Insight"
                    >
                      <Sparkles size={16} />
                    </TrustButton>
                    <div>
                      <h3 className="font-serif font-bold text-trust-blue dark:text-white text-lg leading-tight">Smart Portfolio Insights</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Powered by TrustAI</p>
                    </div>
                  </div>

                  <div className="flex bg-white dark:bg-trust-darkcard rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm w-full sm:w-auto">
                    {(['REVENUE', 'MAINTENANCE', 'CASHFLOW'] as InsightType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setInsightType(type)}
                        className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${insightType === type
                          ? 'bg-trust-blue text-white shadow-lg'
                          : 'text-gray-400 hover:text-trust-blue dark:hover:text-white'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Content Body */}
                <div className="flex-1 p-6 relative overflow-hidden flex flex-col">

                  {/* View: Revenue */}
                  {insightType === 'REVENUE' && (
                    <div className="h-full w-full flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Performance Trend</h4>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-trust-blue"></span>
                          <span className="text-[10px] text-gray-500">Actual</span>
                          <span className="w-2 h-2 rounded-full bg-trust-blue/30 border border-trust-blue/50 border-dashed"></span>
                          <span className="text-[10px] text-gray-500">Projected</span>
                        </div>
                      </div>
                      <div className={`flex-1 w-full transition-all duration-300 ${privacyMode ? 'filter blur-md opacity-50' : ''}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={REVENUE_DATA}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(val) => `€${val}`} />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: number) => [`€${value}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke={COLORS.blue} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* View: Maintenance */}
                  {insightType === 'MAINTENANCE' && (
                    <div className="h-full w-full overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 gap-3">
                        {MOCK_TASKS.map(task => (
                          <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                              {task.priority === 'High' ? <ArrowUpRight size={18} /> : <CheckSquare size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-trust-blue dark:text-white text-sm truncate">{task.title}</h5>
                              <p className="text-xs text-gray-400">{task.type} • {task.dateScheduled}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {task.status}
                              </span>
                              <p className="text-xs font-mono font-medium mt-1">€{task.costEstimate}</p>
                            </div>
                          </div>
                        ))}
                        <button className="w-full py-2 mt-2 border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                          View all maintenance logs <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View: Cashflow */}
                  {insightType === 'CASHFLOW' && (
                    <div className="h-full w-full flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-lg">
                            <RefreshCw size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-800 dark:text-green-400 uppercase">Incoming Payout</p>
                            <h3 className="text-xl font-bold text-trust-blue dark:text-white">€2,450.00</h3>
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-white dark:bg-trust-darkcard px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                          Due in 2 Days
                        </span>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Outflows</p>
                        <div className="space-y-2">
                          {MOCK_TRANSACTIONS.filter(t => t.type === 'Debit').slice(0, 2).map(tx => (
                            <div key={tx.id} className="flex justify-between items-center p-2 border-b border-gray-50 dark:border-gray-800">
                              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]">{tx.description}</span>
                              <span className="text-sm font-mono text-red-500">-€{tx.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </GlassCard>

              {/* Properties List & Distribution */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-trust-blue dark:text-white text-xl">Portfolio</h3>
                  <TrustButton variant="outline" size="sm" onClick={() => setIsOnboardingOpen(true)}>
                    <Plus size={16} className="mr-1" /> Add
                  </TrustButton>
                </div>

                <div className="space-y-4">
                  {filteredProperties.map(prop => (
                    <GlassCard
                      key={prop.id}
                      variant="elevated"
                      padding="sm"
                      className="cursor-pointer group hover:-translate-y-1 transition-all"
                      onClick={() => setCalendarProperty(prop)}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={prop.imgUrl} alt={prop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-trust-blue dark:text-white truncate">{prop.name}</h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{prop.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`w-2 h-2 rounded-full ${prop.status === 'Active' ? 'bg-trust-green' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-bold text-gray-400">{prop.status}</span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                </div>
              </div>
            </div>

            {/* Maintenance & Quality Upgrades (Renovation) */}
            <GlassCard
              variant="elevated"
              padding="none"
              className="mt-8 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-black/20">
                <div>
                  <h3 className="font-serif font-bold text-trust-blue dark:text-white text-xl flex items-center gap-3">
                    <Hammer size={24} className="text-trust-green" />
                    Property Maintenance Ledger
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Institutional Care & Value-Add Enhancements</p>
                </div>
                <TrustButton variant="ghost" size="sm">
                  View Ledger <ArrowUpRight size={16} className="ml-1" />
                </TrustButton>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Transparent tracking of property care and value-add renovations.</p>
              </div>
              <button className="text-gray-400 hover:text-trust-blue dark:hover:text-white">
                <ArrowUpRight size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {MOCK_TASKS.map(task => (
                  <div key={task.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${task.type === 'Renovation' ? 'bg-purple-100 text-purple-700' :
                        task.type === 'Repair' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {task.type}
                      </span>
                      <span className="text-xs text-gray-400">{task.dateScheduled}</span>
                    </div>
                    <h4 className="font-medium text-trust-blue dark:text-white text-sm">{task.title}</h4>
                    <div className="mt-auto pt-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500">Est. Cost: <span className="font-semibold">{privacyMode ? '€***' : `€${task.costEstimate}`}</span></span>
                      <span className={`text-xs font-medium ${task.status === 'In Progress' ? 'text-blue-600' :
                        task.status === 'Completed' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </GlassCard>

      {/* Transactions Table */}
      <GlassCard
        variant="elevated"
        padding="none"
        className="mt-8 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-black/20">
          <h3 className="font-serif font-bold text-trust-blue dark:text-white text-xl">Recent Financial Activity</h3>
          <button className="text-gray-400 hover:text-trust-blue dark:hover:text-white">
            <ArrowUpRight size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-trust-gray dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Ledger Hash</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{tx.date}</td>
                  <td className="px-6 py-4 font-medium text-trust-blue dark:text-white">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-300">{tx.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] text-gray-400">{tx.hash}</span>
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${tx.type === 'Credit' ? 'text-trust-green' : 'text-gray-800 dark:text-gray-200'}`}>
                    {privacyMode ? <span className="blur-sm select-none text-xs text-gray-400">ENCRYPTED</span> : (
                      <>
                        {tx.type === 'Debit' ? '-' : '+'}€{tx.amount}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  )
}
          </main >

  {/* Floating Chat Buttons */ }
  < div className = "fixed bottom-6 right-6 flex flex-col gap-3 z-40" >

    {/* Support Chat Button */ }
    < button
onClick = {() => {
  setIsSupportOpen(!isSupportOpen);
  setIsChatOpen(false); // Close AI chat if open
}}
className = "w-14 h-14 bg-trust-blue text-white rounded-full shadow-lg hover:bg-opacity-90 transition-transform hover:scale-105 flex items-center justify-center relative group"
title = "Contact Support"
  >
  <div className="absolute inset-0 bg-trust-blue rounded-full animate-ping opacity-20"></div>
{
  unreadSupportCount > 0 && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white dark:border-trust-darkbg z-10">
      {unreadSupportCount}
    </span>
  )
}
<MessageSquare size={24} />
{/* Tooltip */ }
<div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
  Admin Support
</div>
        </button >

  {/* AI Chat Button */ }
  < button
onClick = {() => {
  setIsChatOpen(!isChatOpen);
  setIsSupportOpen(false); // Close Support chat if open
}}
className = "w-14 h-14 bg-white dark:bg-trust-darkcard text-trust-blue dark:text-white rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-transform hover:scale-105 flex items-center justify-center group"
title = "AI Assistant"
  >
  <Sparkles size={24} />
{/* Tooltip */ }
<div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
  AI Assistant
</div>
        </button >
      </div >

  {/* Interactive Detail Modal (General) */ }
{
  activeModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-trust-blue/30 backdrop-blur-sm transition-opacity"
        onClick={() => setActiveModal(null)}
      />
      <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        <div className="bg-trust-blue dark:bg-black/40 px-6 py-4 flex justify-between items-center text-white border-b border-white/10">
          <div className="flex items-center gap-2">
            {activeModal === 'OCCUPANCY' ? <Home size={18} /> : <Wallet size={18} />}
            <span className="font-serif font-bold text-lg">
              {activeModal === 'OCCUPANCY' ? 'Occupancy Portfolio' : 'Payout Breakdown'}
            </span>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {activeModal === 'OCCUPANCY' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-trust-blue dark:text-white">82%</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Portfolio Occupancy</p>
              </div>
              <div className="space-y-4">
                {MOCK_PROPERTIES.map(prop => (
                  <div key={prop.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-200">{prop.name}</span>
                      <span className="font-bold text-trust-blue dark:text-white">{prop.occupancyRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${prop.occupancyRate > 80 ? 'bg-green-500' : prop.occupancyRate > 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                        style={{ width: `${prop.occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-trust-gray dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Net Transfer</p>
                  <h3 className="text-2xl font-bold text-trust-blue dark:text-white">{renderFinancialValue('€2,450.00')}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Est. Date</p>
                  <p className="text-sm font-bold text-trust-blue dark:text-white">Aug 15, 2024</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gross Bookings (July)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{renderFinancialValue('€3,200.00')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Cleaning Fees Collected</span>
                  <span className="font-medium text-green-600">{renderFinancialValue('+€450.00')}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">TrustBnB Commission (20%)</span>
                  <span className="font-medium text-red-500">{renderFinancialValue('-€730.00')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">VAT & Tourism Tax</span>
                  <span className="font-medium text-red-500">{renderFinancialValue('-€470.00')}</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 items-start">
                <CreditCard size={16} className="text-trust-blue dark:text-blue-300 mt-0.5" />
                <p className="text-xs text-trust-blue dark:text-blue-200">
                  Transfer initiated to <strong>UBS Account (...8921)</strong>. Funds typically arrive within 2 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

{/* Property Calendar Modal */ }
{
  calendarProperty && (
    <PropertyFullCalendarModal
      property={calendarProperty}
      onClose={() => setCalendarProperty(null)}
    />
  )
}

{/* Footer */ }
<footer className="bg-white dark:bg-trust-darkcard border-t border-gray-200 dark:border-gray-700 py-6 mt-12 text-center text-xs text-gray-400">
  <p>&copy; 2024 TrustBnB Inc. Swiss-Albanian Property Management.</p>
  <div className="mt-2 space-x-4">
    <button onClick={() => setFooterModalType('PRIVACY')} className="hover:text-trust-blue dark:hover:text-white">Privacy</button>
    <button onClick={() => setFooterModalType('TERMS')} className="hover:text-trust-blue dark:hover:text-white">Terms</button>
    <button onClick={() => setFooterModalType('CONTACT')} className="hover:text-trust-blue dark:hover:text-white">Support</button>
  </div>
</footer>

{/* AI Chat Widget */ }
<AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} contextData={aiContext} />

{/* Support Chat Widget */ }
        <OwnerChatWidget
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
          currentUser={currentUser}
        />

        <FooterInfoModal
          type={footerModalType}
          onClose={() => setFooterModalType(null)}
        />

        <PropertyOnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={(data) => {
            addProperty(data);
            setIsOnboardingOpen(false);
          }}
        />
    </div >
  );
};