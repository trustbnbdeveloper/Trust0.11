import React, { useState, useEffect } from 'react';
import { Shield, BarChart3, Heart, Globe, ArrowRight, CheckCircle2, Moon, Sun, User, Diamond, Key, X, Map, Layout, Smartphone, Lock, Wallet, FileCheck, Menu, MapPin } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';
import { PropertyMap } from '../components/PropertyMap';
import { PropertyDirectory } from './PropertyDirectory';
import { UserProfile } from './UserProfile';
import { MOCK_PROPERTIES } from '../constants';
import { FooterInfoModal, FooterModalType } from '../components/FooterInfoModal';
import { AuthModal } from '../components/AuthModal';
import { ChevronDown, User as UserIcon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrustButton } from '../components/core/TrustButton';
import { GlassCard } from '../components/core/GlassCard';

interface LandingProps {
  onLogin: (role: 'OWNER' | 'ADMIN' | 'GUEST') => void;
}

// Random headlines handled within component to access translations
const HEADLINE_KEYS = [
  { text: "hero_text_1", highlight: "hero_highlight_1" },
  { text: "hero_text_2", highlight: "hero_highlight_2" },
  { text: "hero_text_3", highlight: "hero_highlight_3" },
];

const PARTNERS = [
  "Airbnb", "Booking.com", "Expedia", "Vrbo", "TripAdvisor", "Agoda", "Hotels.com", "Trivago"
];

type PublicPage = 'HOME' | 'HOW_IT_WORKS' | 'DIASPORA' | 'PROPERTIES' | 'TRANSPARENCY';

interface ServiceDetail {
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  fullDesc: string;
  features: string[];
}

const SERVICES_DATA: ServiceDetail[] = [
  {
    title: 'Channel Sync',
    shortDesc: 'Unified calendar for Airbnb, Booking.com & Direct',
    icon: Layout,
    fullDesc: 'We utilize a bidirectional API synchronization engine to connect your property to the world\'s largest travel marketplaces. This prevents double-bookings and ensures price parity across all platforms.',
    features: [
      'Real-time calendar blocking',
      'Price synchronization algorithm',
      'Unified inbox for all platforms',
      'Direct booking website integration'
    ]
  },
  {
    title: 'Guest Screening',
    shortDesc: 'ID verification & background checks for safety',
    icon: User,
    fullDesc: 'Safety is our top priority. We employ a rigorous vetting process that includes ID verification, guest review analysis, and risk scoring before a booking is confirmed.',
    features: [
      'Government ID verification',
      'Previous host review analysis',
      'AI-based risk scoring',
      'Security deposit management'
    ]
  },
  {
    title: 'Pro Cleaning',
    shortDesc: '5-star hotel standards before every check-in',
    icon: Diamond,
    fullDesc: 'We don\'t just clean; we stage. Our professional housekeeping teams follow a 60-point checklist to ensure hotel-grade sanitation and presentation for every single guest.',
    features: [
      'Hotel-grade linens & towels',
      ' restocking of amenities',
      'Photo verification after every clean',
      'Deep cleaning scheduling'
    ]
  },
  {
    title: 'Maintenance',
    shortDesc: '24/7 on-call handyman network for instant fixes',
    icon: Shield,
    fullDesc: 'Properties wear down; we build them back up. From minor leaks to major repairs, our local network of vetted professionals is on call 24/7 to protect your asset value.',
    features: [
      '24/7 Emergency response',
      'Routine preventative inspections',
      'Transparent invoice tracking',
      'Vetted local contractor network'
    ]
  },
  {
    title: 'Financials',
    shortDesc: 'Automated monthly statements & direct payouts',
    icon: Wallet,
    fullDesc: 'Experience Swiss-level financial transparency. View your revenue in real-time and receive automated monthly payouts directly to your bank account, anywhere in the world.',
    features: [
      'Real-time revenue dashboard',
      'Automated monthly payouts',
      'Expense categorization & receipts',
      'Annual tax summary reports'
    ]
  },
  {
    title: 'Compliance',
    shortDesc: 'Tax handling & tourist registration automation',
    icon: FileCheck,
    fullDesc: 'Navigating local regulations can be complex. We handle the bureaucracy for you, ensuring your property remains fully compliant with Albanian tourism laws and tax requirements.',
    features: [
      'Tourist registration reporting',
      'City tax calculation & payment',
      'Legal contract management',
      'Insurance compliance checks'
    ]
  },
  {
    title: 'Interior Design',
    shortDesc: 'Value-add renovation consulting & staging',
    icon: Layout,
    fullDesc: 'We know what guests look for. Our design team provides consultation on furniture, layout, and amenities to maximize your Average Daily Rate (ADR) and occupancy.',
    features: [
      'ROI-focused design consultation',
      'Professional photography staging',
      'Furniture procurement assistance',
      'Amenity upgrade recommendations'
    ]
  },
  {
    title: 'Concierge',
    shortDesc: 'Multilingual guest support via AI & Humans',
    icon: Heart,
    fullDesc: 'We provide a hybrid support model using advanced AI for instant answers and local humans for complex requests, ensuring your guests feel supported in their native language.',
    features: [
      '24/7 Multilingual support',
      'Local experience recommendations',
      'Transportation & tour booking',
      'Instant check-in assistance'
    ]
  }
];

const PropertyDisplayCard = ({ property, className = "" }: { property: typeof MOCK_PROPERTIES[0], className?: string }) => (
  <GlassCard
    variant="glass"
    padding="none"
    className={`relative group animate-in fade-in slide-in-from-right duration-700 ${className}`}
  >
    <div className="relative h-[400px] overflow-hidden">
      <img
        src={property.imgUrl}
        alt={property.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-trust-darkbg/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-trust-blue dark:text-white border border-white/20">
        Live Portfolio
      </div>
    </div>
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-trust-blue dark:text-white leading-tight">{property.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={14} /> {property.location}
          </p>
        </div>
        <div className="p-3 bg-trust-blue/5 dark:bg-white/5 rounded-xl text-trust-blue dark:text-white">
          <BarChart3 size={24} />
        </div>
      </div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-trust-blue dark:text-white">€{property.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Occupancy</p>
          <p className="font-bold text-trust-green">{property.occupancyRate}%</p>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-trust-green transition-all duration-1000"
          style={{ width: `${property.occupancyRate}%` }}
        />
      </div>
    </div>
  </GlassCard>
);

export const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const { t, language, setLanguage, theme, setTheme } = useAppContext();
  const { user, isAuthenticated, logout } = useAuth();
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PublicPage>('HOME');
  const [currentView, setCurrentView] = useState<'HOME' | 'PROFILE'>('HOME');
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [propertyIndex, setPropertyIndex] = useState(0);

  // Footer Modal State
  const [footerModalType, setFooterModalType] = useState<FooterModalType>(null);

  useEffect(() => {
    // Randomize headline on mount
    setHeadlineIndex(Math.floor(Math.random() * HEADLINE_KEYS.length));
  }, []);

  // Preload the next property image for instant swap
  useEffect(() => {
    const nextIndex = (propertyIndex + 1) % MOCK_PROPERTIES.length;
    const img = new Image();
    img.src = MOCK_PROPERTIES[nextIndex].imgUrl;
  }, [propertyIndex]);

  // Set up interval for property rotation (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setPropertyIndex((prev) => (prev + 1) % MOCK_PROPERTIES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, currentView]); // Added currentView to dependencies

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headline = HEADLINE_KEYS[headlineIndex];
  const activeProperty = MOCK_PROPERTIES[propertyIndex];

  const NavButton = ({ page, label }: { page: PublicPage, label: string }) => (
    <button
      onClick={() => { setCurrentPage(page); setCurrentView('HOME'); }}
      className={`transition-all duration-200 relative py-1 text-sm font-medium ${currentPage === page
        ? 'text-trust-blue dark:text-white'
        : 'text-gray-500 dark:text-gray-400 hover:text-trust-blue dark:hover:text-white'
        }`}
      aria-current={currentPage === page ? 'page' : undefined}
      aria-label={`Navigate to ${label}`}
    >
      {label}
      <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-trust-green rounded-full transform transition-transform duration-300 origin-left ${currentPage === page ? 'scale-x-100' : 'scale-x-0'
        }`}></span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans bg-white dark:bg-trust-darkbg transition-colors duration-200 flex flex-col">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Navbar */}
      <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled || currentView === 'PROFILE' ? 'bg-white/90 dark:bg-trust-darkbg/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { setCurrentPage('HOME'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
            role="banner"
            aria-label="TrustBnB Home"
          >
            <div className="w-10 h-10 bg-trust-blue dark:bg-trust-blue rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Diamond size={20} fill="currentColor" />
            </div>
            <span className="text-trust-blue dark:text-white font-bold text-xl tracking-tight">TRUST<span className="font-light">BNB</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavButton page="HOW_IT_WORKS" label={t('nav_how')} />
            <NavButton page="DIASPORA" label={t('nav_diaspora')} />
            <NavButton page="PROPERTIES" label={t('nav_properties')} />
            <NavButton page="TRANSPARENCY" label={t('nav_transparency')} />
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative group mr-2">
              <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-trust-blue dark:hover:text-white text-xs font-bold uppercase transition-colors">
                <Globe size={14} />
                {language === 'sq' ? 'AL' : language}
              </button>
              <div className="absolute right-0 top-full mt-2 w-24 bg-white dark:bg-trust-darkcard border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                {(['en', 'sq', 'it', 'el', 'mk', 'es'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 ${language === lang ? 'font-bold text-trust-blue dark:text-white' : ''}`}
                  >
                    {lang === 'sq' ? 'AL' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-400 hover:text-trust-blue dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                {/* User Menu (Desktop) - existing logic */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all bg-white dark:bg-gray-800"
                >
                  <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                  <span className="text-sm font-bold max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                      <p className="text-xs text-gray-500 font-bold uppercase">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => { setCurrentView('PROFILE'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                    >
                      <UserIcon size={16} /> My Account
                    </button>
                    <button
                      onClick={() => { setCurrentView('PROFILE'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                    >
                      <Heart size={16} /> Wishlist
                    </button>
                    {user.role === 'ADMIN' && (
                      <a href="/admin" className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 text-blue-600 font-bold">
                        <Shield size={16} /> Admin Dashboard
                      </a>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          setCurrentView('HOME');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 flex items-center gap-2"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:flex ml-2 px-5 py-2.5 bg-trust-blue text-white rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg items-center gap-2 text-sm font-medium"
              >
                <Key size={16} /> <span className="hidden lg:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 dark:bg-trust-darkcard/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-50">
            <div className="p-6 flex flex-col gap-4">
              <button
                onClick={() => { setCurrentPage('PROPERTIES'); setCurrentView('HOME'); setIsMobileMenuOpen(false); }}
                className={`text-left px-4 py-3 rounded-xl font-serif text-lg tracking-wide transition-all ${currentPage === 'PROPERTIES' ? 'bg-trust-blue/5 text-trust-blue dark:bg-white/5 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                Our Properties
              </button>
              <button
                onClick={() => { setCurrentPage('DIASPORA'); setCurrentView('HOME'); setIsMobileMenuOpen(false); }}
                className={`text-left px-4 py-3 rounded-xl font-serif text-lg tracking-wide transition-all ${currentPage === 'DIASPORA' ? 'bg-trust-blue/5 text-trust-blue dark:bg-white/5 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                Diaspora Services
              </button>
              <button
                onClick={() => { setCurrentPage('HOW_IT_WORKS'); setCurrentView('HOME'); setIsMobileMenuOpen(false); }}
                className={`text-left px-4 py-3 rounded-xl font-serif text-lg tracking-wide transition-all ${currentPage === 'HOW_IT_WORKS' ? 'bg-trust-blue/5 text-trust-blue dark:bg-white/5 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                How It Works
              </button>

              <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => { setCurrentView('PROFILE'); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-trust-blue dark:text-white font-bold bg-trust-blue/5 dark:bg-white/5 rounded-xl"
                  >
                    <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                    {user.name}
                  </button>
                  <button
                    onClick={() => { logout(); setCurrentView('HOME'); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-3 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="bg-trust-blue text-white px-4 py-4 rounded-xl font-bold font-serif text-lg shadow-lg text-center hover:bg-[#081522] transition-colors"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Login Choice Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-trust-blue/20 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLoginModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-300" />
            </button>

            {/* Guest Option */}
            <button
              onClick={() => onLogin('GUEST')}
              className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center group border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700"
            >
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-trust-green group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <User size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-trust-blue dark:text-white mb-2">{t('login_guest')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                  Access check-in details, WiFi codes, and local recommendations.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-trust-green group-hover:underline decoration-2 underline-offset-4">
                Enter App
              </span>
            </button>

            {/* Owner Option */}
            <button
              onClick={() => { setCurrentPage('HOW_IT_WORKS'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
              className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center gap-6 bg-trust-blue text-white hover:bg-[#081522] transition-colors text-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-trust-blue dark:bg-black/20 z-0" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>

              <div className="relative z-10 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-inner">
                <Key size={40} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">{t('login_owner')}</h3>
                <p className="text-sm text-gray-300 max-w-[200px] mx-auto leading-relaxed">
                  Secure access to your property portfolio, financials, and reports.
                </p>
              </div>
              <span className="relative z-10 text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-white group-hover:underline decoration-2 underline-offset-4 flex items-center gap-2">
                <Shield size={12} /> Secure Login
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Pages */}
      <div className="flex-1 pt-12 animate-in fade-in duration-500 flex flex-col">

        {/* === HOME PAGE === */}
        {currentPage === 'HOME' && (
          <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 flex-1 flex items-center overflow-x-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-trust-gray dark:bg-trust-darkcard -z-10 rounded-l-[100px] hidden lg:block transition-colors duration-200" />
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-in slide-in-from-left duration-700 min-w-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-trust-blue/5 dark:bg-white/10 text-trust-blue dark:text-blue-300 rounded-full text-sm font-medium">
                  <Shield size={16} />
                  <span>International-grade Albanian Brand</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-serif font-bold text-trust-blue dark:text-white leading-[1.1]">
                  {t(headline.text)} <br />
                  <span className="text-trust-green">{t(headline.highlight)}</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                  {t('subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <TrustButton
                    onClick={() => { setCurrentPage('HOW_IT_WORKS'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight size={20} />}
                  >
                    {t('cta_start')}
                  </TrustButton>
                  <TrustButton
                    onClick={() => { setCurrentPage('PROPERTIES'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
                    variant="outline"
                    size="lg"
                  >
                    {t('nav_properties')}
                  </TrustButton>
                </div>

                <div className="pt-8 w-full max-w-full lg:max-w-xl overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-trust-darkbg to-transparent z-10" />
                  <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-trust-darkbg to-transparent z-10" />

                  <div className="flex gap-12 animate-infinite-scroll w-max hover:[animation-play-state:paused]">
                    {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                      <div key={i} className="font-serif font-bold text-2xl text-gray-400/60 grayscale whitespace-nowrap select-none">
                        {partner}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div className="relative animate-in slide-in-from-right duration-700 delay-100 hidden md:block aspect-[4/3] w-full max-w-[500px]">
                <PropertyDisplayCard
                  property={MOCK_PROPERTIES[propertyIndex]}
                  className="z-0"
                />
              </div>
            </div>
          </section>
        )}

        {/* === DIASPORA PAGE === */}
        {currentPage === 'DIASPORA' && (
          <section className="py-20 flex-1 bg-white dark:bg-trust-darkbg flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 animate-in slide-in-from-left duration-500">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-trust-blue/5 dark:bg-white/10 text-trust-blue dark:text-blue-300 rounded-full text-sm font-medium">
                    <Globe size={16} />
                    <span>Global Reach, Local Care</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-trust-blue dark:text-white leading-tight">
                    {t('val_diaspora_title')}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    We understand the unique challenges of managing a property from thousands of kilometers away.
                    TrustBnB bridges the gap between your life abroad and your heritage at home.
                  </p>

                  <div className="space-y-6 pt-4">
                    {[
                      { icon: Smartphone, title: 'Remote Control', desc: 'Full visibility from Zurich, London, or New York.' },
                      { icon: Wallet, title: 'Passive Income', desc: 'We handle bookings, you receive direct payouts.' },
                      { icon: Heart, title: 'Heritage Care', desc: 'White-glove maintenance for your family legacy.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-12 h-12 bg-trust-gray dark:bg-gray-800 rounded-xl flex flex-shrink-0 items-center justify-center text-trust-blue dark:text-white group-hover:bg-trust-blue group-hover:text-white transition-colors duration-300">
                          <item.icon size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-trust-blue dark:text-white text-lg">{item.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row gap-6">
                    <button
                      onClick={() => { setCurrentPage('PROPERTIES'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
                      className="px-8 py-4 bg-trust-blue text-white rounded-lg font-medium text-lg hover:bg-[#081522] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
                    >
                      {t('nav_properties')} <ArrowRight size={20} />
                    </button>
                    <button
                      onClick={() => { setCurrentPage('TRANSPARENCY'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
                      className="px-8 py-4 bg-white dark:bg-transparent dark:text-white border border-gray-200 dark:border-gray-600 text-trust-blue rounded-lg font-medium text-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      {t('nav_transparency')}
                    </button>
                  </div>
                </div>

                {/* Visual Right Side */}
                <div className="relative animate-in slide-in-from-right duration-700 delay-100">
                  <div className="relative z-10 bg-trust-gray dark:bg-trust-darkcard p-2 rounded-2xl shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                    {/* Image representing distance/travel/home */}
                    <div className="relative h-[500px] w-full bg-trust-blue rounded-xl overflow-hidden group">
                      <img
                        src="https://picsum.photos/600/800?random=12"
                        alt="Diaspora Lifestyle"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                      {/* Overlay Cards simulating connection */}
                      <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white shadow-lg transform -rotate-3 transition-transform group-hover:rotate-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">CH</div>
                          <div className="h-0.5 w-12 bg-white/50"></div>
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">AL</div>
                        </div>
                        <p className="text-xs font-mono">Distance: 1,450km</p>
                        <p className="text-xs font-mono text-green-400">Status: Connected</p>
                      </div>

                      <div className="absolute bottom-8 right-8 bg-white text-trust-blue p-4 rounded-xl shadow-xl max-w-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <Wallet size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Payout Received</p>
                            <p className="font-bold">€2,450.00</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 border-t pt-2 mt-2">To: UBS Account (...8921)</p>
                      </div>
                    </div>
                  </div>
                  {/* Decorative Blob */}
                  <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-trust-blue/5 dark:bg-white/5 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === TRANSPARENCY PAGE === */}
        {currentPage === 'TRANSPARENCY' && (
          <section className="py-20 flex-1 bg-white dark:bg-trust-darkbg flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 animate-in slide-in-from-left duration-500">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-trust-blue dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                    <Lock size={16} />
                    <span>Swiss-Level Financial Security</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-trust-blue dark:text-white">
                    {t('val_transparency_title')}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('val_transparency_desc')} No hidden fees. No mystery expenses. Every booking, every cleaning fee, and every maintenance cost is recorded on an immutable digital ledger.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {['Real-time Revenue', 'Automated Payouts', 'Digital Receipts', 'Occupancy Maps'].map(item => (
                      <div key={item} className="flex items-center gap-3 bg-white dark:bg-trust-darkcard p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                        <CheckCircle2 size={18} className="text-trust-green" />
                        <span className="font-medium text-trust-blue dark:text-gray-200 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Dashboard Preview */}
                <div className="relative animate-in slide-in-from-right duration-700 delay-100">
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-trust-blue/5 rounded-full blur-3xl"></div>

                  <div className="relative bg-white dark:bg-trust-darkcard rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-trust-blue text-white p-4 flex justify-between items-center text-sm">
                      <span className="font-mono font-medium flex items-center gap-2"><Lock size={12} /> Owner_Ledger_v1</span>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                      </div>
                    </div>
                    <div className="p-8 space-y-8">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Net Payout (Aug)</p>
                          <h3 className="text-4xl font-bold text-trust-blue dark:text-white">€5,420.00</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">+12.5% vs Last Month</p>
                        </div>
                      </div>
                      <div className="h-32 flex items-end gap-3">
                        {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-trust-blue/5 dark:bg-white/5 rounded-t-sm relative group overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-trust-blue dark:bg-trust-green rounded-t-sm transition-all duration-1000 group-hover:opacity-80" style={{ height: `${h}%` }}></div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-3">
                        <div className="flex justify-between text-sm items-center">
                          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><FileCheck size={14} /> Booking #A8291</span>
                          <span className="font-mono text-trust-green font-bold">+€850.00</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><FileCheck size={14} /> Cleaning Fee</span>
                          <span className="font-mono text-gray-400 font-medium">-€45.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-white dark:bg-trust-darkcard p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-trust-green">
                      <Shield size={20} />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-trust-blue dark:text-white">Audit Verified</div>
                      <div className="text-gray-500">Ledger hash matched</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === PROPERTIES PAGE === */}
        {currentPage === 'PROPERTIES' && currentView === 'HOME' && (
          <section className="flex-1 bg-white dark:bg-trust-darkbg">
            <PropertyDirectory />
          </section>
        )}

        {/* === USER PROFILE === */}
        {currentView === 'PROFILE' && (
          <section className="flex-1 bg-gray-50 dark:bg-trust-darkbg pt-24 pb-12">
            <UserProfile />
          </section>
        )}

        {/* === HOW_IT_WORKS PAGE === */}
        {currentPage === 'HOW_IT_WORKS' && (
          <section className="py-20 flex-1 bg-white dark:bg-trust-darkbg">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16 animate-in slide-in-from-bottom duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-trust-blue/10 dark:bg-white/10 text-trust-blue dark:text-white rounded-full text-sm font-medium mb-6">
                  <Layout size={16} />
                  <span>The Ecosystem</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-trust-blue dark:text-white mb-6">{t('eco_title')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{t('eco_desc')}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-700 delay-100">
                {SERVICES_DATA.map((item, i) => (
                  <div
                    key={item.title}
                    onClick={() => setSelectedService(item)}
                    className="bg-white dark:bg-trust-darkcard p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-trust-blue/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-trust-blue dark:text-white mb-6 group-hover:bg-trust-blue group-hover:text-white transition-colors">
                      <item.icon size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-trust-blue dark:text-gray-100 mb-3 flex items-center gap-2">
                      {item.title}
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-trust-green" />
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.shortDesc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6">
                <button
                  onClick={() => { setCurrentPage('DIASPORA'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
                  className="px-8 py-4 bg-trust-blue text-white rounded-lg font-medium text-lg hover:bg-[#081522] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
                >
                  {t('nav_diaspora')} <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => { setCurrentPage('TRANSPARENCY'); setCurrentView('HOME'); window.scrollTo(0, 0); }}
                  className="px-8 py-4 bg-white dark:bg-transparent dark:text-white border border-gray-200 dark:border-gray-600 text-trust-blue rounded-lg font-medium text-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                  {t('nav_transparency')}
                </button>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-trust-darkcard border-t border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-trust-blue dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-trust-blue">
              <Diamond size={16} fill="currentColor" />
            </div>
            <span className="font-bold text-trust-blue dark:text-white tracking-tight">TRUST<span className="font-light">BNB</span></span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; 2024 TrustBnB Inc. Swiss-Albanian Property Management.
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button onClick={() => setFooterModalType('PRIVACY')} className="hover:text-trust-blue dark:hover:text-white transition-colors">Privacy</button>
            <button onClick={() => setFooterModalType('TERMS')} className="hover:text-trust-blue dark:hover:text-white transition-colors">Terms</button>
            <button onClick={() => setFooterModalType('CONTACT')} className="hover:text-trust-blue dark:hover:text-white transition-colors">Contact</button>
          </div>
        </div>
      </footer>

      <FooterInfoModal
        type={footerModalType}
        onClose={() => setFooterModalType(null)}
      />

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedService(null)}
          />
          <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-trust-blue dark:bg-black/40 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 font-serif font-bold text-lg">
                <selectedService.icon size={20} />
                {selectedService.title}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-4 bg-white/10 rounded-lg p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = SERVICES_DATA.findIndex(s => s.title === selectedService.title);
                      const prevIndex = (currentIndex - 1 + SERVICES_DATA.length) % SERVICES_DATA.length;
                      setSelectedService(SERVICES_DATA[prevIndex]);
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                    title="Previous"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-[10px] font-mono opacity-60 px-1">
                    {SERVICES_DATA.findIndex(s => s.title === selectedService.title) + 1} / {SERVICES_DATA.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = SERVICES_DATA.findIndex(s => s.title === selectedService.title);
                      const nextIndex = (currentIndex + 1) % SERVICES_DATA.length;
                      setSelectedService(SERVICES_DATA[nextIndex]);
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-8">
              <p className="text-lg font-medium text-trust-blue dark:text-white mb-4 leading-relaxed">
                {selectedService.fullDesc}
              </p>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Key Features</h4>
                <ul className="space-y-3">
                  {selectedService.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="mt-0.5">
                        <CheckCircle2 size={16} className="text-trust-green" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedService(null)}
                className="px-6 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};