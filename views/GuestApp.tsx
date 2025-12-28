import React, { useState, useRef } from 'react';
import { Wifi, Unlock, Lock, MapPin, Coffee, Utensils, Info, MessageCircle, Star, LogOut, Sun, Moon, Diamond, Bell, ScanFace, Upload, FileCheck, Loader2, CheckCircle2, ShieldCheck, X, ChevronRight, Compass, Filter } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { AIChat } from '../components/AIChat';
import { NotificationCenter } from '../components/NotificationCenter';
import { MOCK_TRIPS } from '../constants';
import { GuideDetailsModal } from '../components/GuideDetailsModal';
import { LocalGuideTrip } from '../types';

export const GuestApp: React.FC<{ onLogout: () => void; onBack: () => void }> = ({ onLogout, onBack }) => {
  const { t, theme, setTheme, notifications, markAsRead, addNotification } = useAppContext();

  // App State
  const [isLocked, setIsLocked] = useState(true);
  const [showWifi, setShowWifi] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Guide State
  const [selectedGuide, setSelectedGuide] = useState<LocalGuideTrip | null>(null);
  const [guideFilter, setGuideFilter] = useState<'All' | 'Dining' | 'Culture' | 'Adventure' | 'Relaxation'>('All');

  // Check-in State
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'UPLOADING' | 'VERIFYING' | 'SUCCESS'>('IDLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleLock = () => {
    // Simulate smart lock interaction
    setIsLocked(!isLocked);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const processCheckIn = () => {
    if (!selectedFile) return;

    setUploadStatus('UPLOADING');

    // Simulate Upload
    setTimeout(() => {
      setUploadStatus('VERIFYING');

      // Simulate Verification
      setTimeout(() => {
        setUploadStatus('SUCCESS');

        // Finalize
        setTimeout(() => {
          setHasCheckedIn(true);
          setIsCheckInOpen(false);
          addNotification({
            title: 'Identity Verified',
            message: 'Your passport has been verified. Access granted.',
            channel: 'SYSTEM'
          });
        }, 1500);
      }, 2000);
    }, 1500);
  };

  const filteredTrips = guideFilter === 'All'
    ? MOCK_TRIPS
    : MOCK_TRIPS.filter(trip => trip.category === guideFilter);

  const aiContext = "Guest is currently staying at Villa Saranda Breeze. Check-in time was 3:00 PM. Wifi code is 'TrustBnB_Guest_2024'. Local recommendations include 'Lekursi Castle' for dinner.";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-trust-darkbg font-sans pb-24 transition-colors duration-200">

      <div className="max-w-7xl mx-auto md:p-6">
        {/* Adaptive Header */}
        <header className="bg-trust-blue text-white rounded-b-[32px] md:rounded-3xl shadow-lg relative z-30 overflow-hidden transition-all">
          {/* Background Decorations (Clipped) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-trust-green opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-5 md:p-8 pb-10 md:pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">

              <div className="flex justify-between items-center md:justify-start md:gap-4 w-full md:w-auto">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white shrink-0">
                  <Diamond size={20} className="md:w-6 md:h-6" fill="currentColor" />
                </div>

                {/* Mobile Controls (Visible only on small screens) */}
                <div className="flex gap-2 md:hidden">
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 relative"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationCenter
                      isOpen={isNotificationsOpen}
                      onClose={() => setIsNotificationsOpen(false)}
                      notifications={notifications}
                      onMarkRead={markAsRead}
                    />
                  </div>
                  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <button onClick={onLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                    <LogOut size={18} />
                  </button>
                </div>

                <div className="hidden md:block">
                  <p className="opacity-80 text-sm mb-1">{t('guest_welcome')}</p>
                  <h1 className="text-3xl font-serif font-bold">Familja Jashari</h1>
                  <div className="flex items-center gap-2 mt-2 opacity-90 text-sm">
                    <MapPin size={14} />
                    <span>Villa Saranda Breeze</span>
                  </div>
                </div>
              </div>

              {/* Mobile Title (When stacked) */}
              <div className="md:hidden mt-1">
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">{t('guest_welcome')}</p>
                <h1 className="text-3xl font-serif font-bold leading-tight">Familja Jashari</h1>
                <div className="flex items-center gap-2 mt-2 text-blue-100 text-sm">
                  <MapPin size={14} />
                  <span>Villa Saranda Breeze</span>
                </div>
              </div>

              {/* Desktop Controls */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-sm font-bold transition-colors"
                >
                  Dashboard
                </button>
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 relative transition-colors">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-trust-blue"></span>}
                </button>
                <NotificationCenter
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                  notifications={notifications}
                  onMarkRead={markAsRead}
                />
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="h-8 w-px bg-white/20"></div>
                <button onClick={onLogout} className="px-5 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 font-medium transition-colors flex items-center gap-2 text-sm">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 -mt-6 md:mt-8 md:px-0 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8">

            {/* Left Column: Property Control & Status */}
            <div className="md:col-span-5 lg:col-span-4 space-y-5 md:space-y-6">

              {/* CHECK-IN CTA (If not checked in) */}
              {!hasCheckedIn && (
                <div className="bg-white dark:bg-trust-darkcard p-1 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-900/50 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-orange-50 dark:bg-orange-900/10 p-4 md:p-5 rounded-xl border border-dashed border-orange-200 dark:border-orange-800">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4 text-center sm:text-left">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ScanFace size={20} className="md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-trust-blue dark:text-white text-sm md:text-base">Action Required</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 mb-3 leading-relaxed">
                          Complete self check-in to unlock smart home features.
                        </p>
                        <button
                          onClick={() => setIsCheckInOpen(true)}
                          className="w-full py-2.5 bg-trust-blue text-white rounded-lg text-sm font-bold shadow-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          Start Check-in <ShieldCheck size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Access Card */}
              <div className="relative group">
                <div className={`bg-white dark:bg-trust-darkcard dark:border-gray-700 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center gap-5 md:gap-6 transition-all duration-500 ${!hasCheckedIn ? 'blur-sm opacity-60 select-none pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">
                    Smart Lock System
                  </div>

                  <button
                    onClick={toggleLock}
                    className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-inner transition-all duration-500 transform hover:scale-105 active:scale-95 ${isLocked
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-8 border-red-100 dark:border-red-900/30'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-500 border-8 border-green-100 dark:border-green-900/30'
                      }`}
                  >
                    {isLocked ? <Lock size={36} className="md:w-10 md:h-10" /> : <Unlock size={36} className="md:w-10 md:h-10" />}
                  </button>

                  <div className="text-center">
                    <p className={`text-xl font-bold ${isLocked ? 'text-gray-700 dark:text-gray-200' : 'text-green-600'}`}>
                      {isLocked ? t('status_locked') : t('status_unlocked')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Tap to toggle lock state</p>
                  </div>

                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>

                  <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 md:p-4 flex items-center justify-between group-hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-trust-darkcard text-trust-blue dark:text-blue-300 rounded-lg shadow-sm">
                        <Wifi size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 dark:text-blue-200 uppercase font-bold tracking-wider">WiFi Network</span>
                        <span className="text-sm font-bold text-trust-blue dark:text-white">TrustBnB_Guest</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWifi(!showWifi)}
                      className="text-xs bg-white dark:bg-trust-darkcard px-3 py-1.5 rounded-lg font-bold text-trust-blue dark:text-white shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      {showWifi ? 'Breeze2024!' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Lock Overlay */}
                {!hasCheckedIn && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl flex items-center gap-3">
                      <Lock size={20} className="text-gray-500 dark:text-white" />
                      <span className="text-sm font-medium text-gray-800 dark:text-white">Complete Check-in to Unlock</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-white dark:bg-trust-darkcard dark:border-gray-700 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 md:gap-4 hover:shadow-lg transition-all text-left group hover:-translate-y-1"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-trust-blue/5 dark:bg-blue-900/20 flex items-center justify-center text-trust-blue dark:text-blue-300 group-hover:bg-trust-blue group-hover:text-white transition-colors">
                    <MessageCircle size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-trust-blue dark:text-white block text-sm md:text-base">{t('guest_chat')}</span>
                    <span className="text-xs text-gray-400">Ask concierge</span>
                  </div>
                </button>

                <button className="bg-white dark:bg-trust-darkcard dark:border-gray-700 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 md:gap-4 hover:shadow-lg transition-all text-left group hover:-translate-y-1">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-trust-green/10 dark:bg-green-900/20 flex items-center justify-center text-trust-green group-hover:bg-trust-green group-hover:text-white transition-colors">
                    <Info size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-trust-blue dark:text-white block text-sm md:text-base">{t('guest_checkout')}</span>
                    <span className="text-xs text-gray-400">View instructions</span>
                  </div>
                </button>
              </div>

            </div>

            {/* Right Column: Local Guide & Content */}
            <div className="md:col-span-7 lg:col-span-8 space-y-5 md:space-y-6 pb-20 md:pb-0">

              {/* Welcome Banner (Desktop only) */}
              <div className="hidden md:block bg-gradient-to-r from-trust-blue to-[#1a3b5c] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 -translate-x-10"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-serif font-bold mb-2">Experiences & Trips</h2>
                  <p className="text-blue-100 max-w-lg leading-relaxed">
                    We have curated a selection of full-day itineraries and hidden gems. Explore Saranda like a true local with our step-by-step guides.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-serif font-bold text-trust-blue dark:text-white px-2 flex items-center gap-2">
                  <Compass size={20} className="text-trust-green" />
                  {t('guest_explore')}
                </h3>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
                  {['All', 'Dining', 'Culture', 'Adventure', 'Relaxation'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGuideFilter(cat as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${guideFilter === cat
                        ? 'bg-trust-blue text-white border-trust-blue'
                        : 'bg-white dark:bg-trust-darkcard text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guide Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedGuide(trip)}
                    className="group bg-white dark:bg-trust-darkcard dark:border-gray-700 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full hover:-translate-y-1"
                  >
                    {/* Image Area */}
                    <div className="h-48 relative overflow-hidden">
                      <img src={trip.image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">
                          {trip.category}
                        </span>
                        {trip.featured && (
                          <span className="bg-trust-green text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 text-white">
                        <div className="flex items-center gap-1 text-[10px] font-bold bg-black/30 backdrop-blur px-2 py-0.5 rounded w-fit mb-1">
                          <Star size={10} fill="currentColor" className="text-yellow-400" /> {trip.rating}
                        </div>
                        <h4 className="font-bold text-lg leading-tight shadow-black drop-shadow-md">{trip.title}</h4>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {trip.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><Utensils size={12} /> {trip.stops.length} Stops</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {trip.duration}</span>
                        </div>
                        <span className="text-trust-blue dark:text-blue-300 text-xs font-bold flex items-center gap-1 group-hover:underline">
                          View Trip <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* CHECK-IN MODAL */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-trust-blue/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCheckInOpen(false)}
          />
          <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            <div className="bg-trust-blue p-6 text-white text-center relative">
              <button
                onClick={() => setIsCheckInOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanFace size={32} />
              </div>
              <h2 className="text-xl font-serif font-bold">Identity Verification</h2>
              <p className="text-xs text-blue-200 mt-1">Required by Albanian Tourism Law (Ligji Nr. 93/2015)</p>
            </div>

            <div className="p-6">
              {uploadStatus === 'IDLE' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Please upload a clear photo of your Passport or National ID card to verify your booking and unlock the property.
                  </p>

                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2 text-trust-green">
                        <FileCheck size={32} />
                        <span className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                        <span className="text-xs text-gray-400">Click to change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-trust-blue transition-colors">
                        <Upload size={32} />
                        <span className="text-sm font-medium">Tap to upload ID</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={processCheckIn}
                    disabled={!selectedFile}
                    className="w-full py-3 bg-trust-blue text-white rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Verify & Check-in
                  </button>
                </div>
              )}

              {uploadStatus === 'UPLOADING' && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 size={48} className="animate-spin text-trust-blue mx-auto" />
                  <div>
                    <h3 className="font-bold text-trust-blue dark:text-white">Uploading Document...</h3>
                    <p className="text-xs text-gray-500">Securely encrypting file</p>
                  </div>
                </div>
              )}

              {uploadStatus === 'VERIFYING' && (
                <div className="text-center py-8 space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-trust-green border-r-trust-green border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <ShieldCheck className="absolute inset-0 m-auto text-trust-green" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-trust-blue dark:text-white">Verifying Identity...</h3>
                    <p className="text-xs text-gray-500">Matching with booking records</p>
                  </div>
                </div>
              )}

              {uploadStatus === 'SUCCESS' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h3 className="font-bold text-trust-blue dark:text-white text-xl">Verification Complete</h3>
                    <p className="text-sm text-gray-500 mt-1">Unlocking smart home features...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 text-center border-t border-gray-100 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <Lock size={10} /> Your data is encrypted and deleted after checkout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TRIP DETAIL MODAL */}
      {selectedGuide && (
        <GuideDetailsModal
          trip={selectedGuide}
          onClose={() => setSelectedGuide(null)}
        />
      )}

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} contextData={aiContext} />
    </div>
  );
};
