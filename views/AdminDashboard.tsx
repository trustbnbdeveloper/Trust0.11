import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Building, Settings, AlertCircle, FileText, CheckCircle, Search, Plus, MoreHorizontal, Mail, Phone, Shield, Lock, FileJson, Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Download, Printer, Hammer, Edit2, X, Save, Trash2, MessageSquare, MessageCircle, Ban, CheckSquare, Copy, Bell, MapPin, Calendar, LogOut, Globe, Sun, Moon, BookOpen, Image as ImageIcon, ChevronRight, Info, Hand, Gem, ExternalLink, Star
} from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_OWNERS, MOCK_SECURITY_LOGS, MOCK_TRANSACTIONS, MOCK_TASKS, MOCK_BLOG_POSTS, MOCK_STAFF, MOCK_EXPENSES, MOCK_UTILITY_BILLS } from '../constants';
import { Owner, BlogPost, StaffProfile, MaintenanceTask, PropertyExpense, UtilityBill } from '../types';
import { AddOwnerModal } from '../components/AddOwnerModal';
import { EditOwnerModal } from '../components/EditOwnerModal';
import { MessageComposer } from '../components/MessageComposer';
import { DirectMessageModal } from '../components/DirectMessageModal';
import { useAppContext } from '../contexts/AppContext';
import { AdminMessaging } from './AdminMessaging';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdminBookingManagement } from './AdminBookingManagement';
import { AdminGuestManagement } from './AdminGuestManagement';
import { GlassCard, TrustButton } from '../components/core';

type AdminView = 'ORCHESTRATION' | 'OWNERS' | 'PROPERTIES' | 'BOOKINGS' | 'GUESTS' | 'PROPERTY_CARE' | 'FINANCIALS' | 'SECURITY' | 'COMMUNICATIONS' | 'CONTENT' | 'SETTINGS';

interface AdminDashboardProps {
  onLogout: () => void;
}

const HandDiamond = ({ size = 18 }: { size?: number }) => (
  <div className="relative inline-flex items-center justify-center">
    <Hand size={size} />
    <Gem size={size / 2} className="absolute -top-1 -right-1 text-trust-green" fill="currentColor" />
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { addNotification, directMessages, theme, setTheme, sendDirectMessage, decryptMessage, properties, notifications, markAsRead } = useAppContext();
  const [currentView, setCurrentView] = useState<AdminView>('ORCHESTRATION');

  // Owner Management State
  const [owners, setOwners] = useState<Owner[]>(MOCK_OWNERS);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  // Property Registry State
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<'All' | 'Active' | 'Maintenance' | 'Onboarding'>('All');

  // Blog/Content State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<Partial<BlogPost>>({});

  // Bulk Selection State
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<Set<string>>(new Set());
  const [showBulkDeactivateModal, setShowBulkDeactivateModal] = useState(false);

  // Add Owner State
  const [isAddingOwner, setIsAddingOwner] = useState(false);

  // Delete Owner State
  const [deletingOwner, setDeletingOwner] = useState<Owner | null>(null);

  // Messaging State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [singleMessageRecipient, setSingleMessageRecipient] = useState<Owner | null>(null);
  const [isDMOpen, setIsDMOpen] = useState(false);
  const [dmInitialOwnerId, setDmInitialOwnerId] = useState<string | null>(null);

  // Property Care State
  const [staff, setStaff] = useState<StaffProfile[]>(MOCK_STAFF);
  const [tasks, setTasks] = useState<MaintenanceTask[]>(MOCK_TASKS);
  const [staffSelectionTask, setStaffSelectionTask] = useState<MaintenanceTask | null>(null);
  const [staffSelectionPropertyId, setStaffSelectionPropertyId] = useState<string | null>(null);

  // Expense Tracking State
  const [expenses, setExpenses] = useState<PropertyExpense[]>(MOCK_EXPENSES);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(MOCK_UTILITY_BILLS);
  const [isUtilityBillModalOpen, setIsUtilityBillModalOpen] = useState(false);
  const [selectedPropertyForBill, setSelectedPropertyForBill] = useState<string | null>(null);

  // Calculate total unread messages from owners across all conversations
  const totalUnreadMessages = Object.values(directMessages as any).reduce((total: number, msgs: any) => {
    return total + (msgs as any[]).filter((m: any) => m.sender === 'owner' && !m.read).length;
  }, 0);

  // Calculate new properties (Onboarding status)
  const newPropertiesCount = properties.filter(p => p.status === 'Onboarding' || p.status === 'Review').length;

  // Filter Owners
  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.email.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.location.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.id.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.status.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  // Filter Properties
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propertySearch.toLowerCase());
    const matchesStatus = propertyStatusFilter === 'All' || p.status === propertyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const isAllSelected = filteredOwners.length > 0 && filteredOwners.every(o => selectedOwnerIds.has(o.id));

  // Selection Handlers
  const handleSelectAll = () => {
    const next = new Set(selectedOwnerIds);
    if (isAllSelected) {
      filteredOwners.forEach(o => next.delete(o.id));
    } else {
      filteredOwners.forEach(o => next.add(o.id));
    }
    setSelectedOwnerIds(next);
  };

  const handleSelectOwner = (id: string) => {
    const next = new Set(selectedOwnerIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOwnerIds(next);
  };

  const handleBulkDeactivateClick = () => {
    setShowBulkDeactivateModal(true);
  };

  const confirmBulkDeactivate = () => {
    setOwners(prev => prev.map(o => selectedOwnerIds.has(o.id) ? { ...o, status: 'Inactive' } : o));
    addNotification({
      title: 'Bulk Action',
      message: `${selectedOwnerIds.size} owners deactivated.`,
      channel: 'SYSTEM'
    });
    setSelectedOwnerIds(new Set());
    setShowBulkDeactivateModal(false);
  };

  const handleBulkMessage = () => {
    setSingleMessageRecipient(null); // Ensure we are in bulk mode
    setIsComposerOpen(true);
  };

  // Edit Handlers
  const handleEditClick = (owner: Owner) => {
    setEditingOwner({ ...owner });
  };

  const handleSaveOwner = (updatedOwner: Owner) => {
    setOwners(prev => prev.map(o => o.id === updatedOwner.id ? updatedOwner : o));
    setEditingOwner(null);
    addNotification({
      title: 'Owner Updated',
      message: `${updatedOwner.name}'s profile has been updated.`,
      channel: 'SYSTEM'
    });
  };

  // Add Handlers
  const handleAddOwnerClick = () => {
    setIsAddingOwner(true);
  };

  const handleSaveNewOwner = (ownerData: Partial<Owner>) => {
    // Generate derived fields
    const initials = (ownerData.name || 'Unknown User').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const ownerToAdd: Owner = {
      id: Date.now().toString(),
      name: ownerData.name || 'Unknown',
      email: ownerData.email || '',
      phone: ownerData.phone || '',
      location: ownerData.location || '',
      propertyCount: 0,
      status: (ownerData.status as 'Active' | 'Inactive') || 'Active',
      joinDate: date,
      avatarInitials: initials || 'XX'
    };

    setOwners(prev => [ownerToAdd, ...prev]);
    setIsAddingOwner(false);
  };

  // Delete Handlers
  const handleDeleteClick = (owner: Owner) => {
    setDeletingOwner(owner);
  };

  const handleConfirmDelete = () => {
    if (deletingOwner) {
      setOwners(prev => prev.filter(o => o.id !== deletingOwner.id));
      setDeletingOwner(null);

      // Also remove from selection if present
      if (selectedOwnerIds.has(deletingOwner.id)) {
        const next = new Set(selectedOwnerIds);
        next.delete(deletingOwner.id);
        setSelectedOwnerIds(next);
      }
    }
  };

  // --- Blog Handlers ---
  const handleNewPost = () => {
    setCurrentBlogPost({
      status: 'Draft',
      publishDate: new Date().toISOString().split('T')[0],
      author: 'Admin'
    });
    setIsBlogModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentBlogPost({ ...post });
    setIsBlogModalOpen(true);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setBlogPosts(prev => prev.filter(p => p.id !== id));
      addNotification({
        title: 'Post Deleted',
        message: 'The blog post has been removed.',
        channel: 'SYSTEM'
      });
    }
  };

  const handleSavePost = () => {
    if (!currentBlogPost.title) return;

    if (currentBlogPost.id) {
      // Edit existing
      setBlogPosts(prev => prev.map(p => p.id === currentBlogPost.id ? currentBlogPost as BlogPost : p));
      addNotification({ title: 'Post Updated', message: 'Blog post updated successfully.', channel: 'SYSTEM' });
    } else {
      // Create new
      const newPost: BlogPost = {
        ...currentBlogPost,
        id: Date.now().toString(),
        readTime: '5 min read', // default or calc
        coverImage: currentBlogPost.coverImage || 'https://picsum.photos/800/600?random=' + Date.now(),
        excerpt: currentBlogPost.excerpt || currentBlogPost.content?.substring(0, 100) + '...' || ''
      } as BlogPost;
      setBlogPosts(prev => [newPost, ...prev]);
      addNotification({ title: 'Post Created', message: 'New blog post created.', channel: 'SYSTEM' });
    }
    setIsBlogModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-trust-darkbg font-sans flex relative transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-trust-blue dark:bg-[#020617] text-white flex flex-col fixed h-full z-20 border-r border-transparent dark:border-white/5 transition-colors duration-200">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold tracking-tight">TRUST<span className="font-light">BNB</span></span>
          <span className="ml-2 text-[10px] bg-trust-green text-white px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>
        </div>
        <nav className="flex-1 py-6 space-y-1 px-3">
          <button
            onClick={() => setCurrentView('ORCHESTRATION')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'ORCHESTRATION' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Orchestration</span>
          </button>

          <button
            onClick={() => setCurrentView('PROPERTIES')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'PROPERTIES' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Building size={18} />
            <span className="text-sm font-medium flex-1">Properties</span>
            {newPropertiesCount > 0 && (
              <div className="relative group mr-1">
                <Bell size={16} className="text-white/90" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-trust-blue shadow-sm">
                  {newPropertiesCount}
                </span>
              </div>
            )}
          </button>

          <button
            onClick={() => setCurrentView('BOOKINGS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'BOOKINGS' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Calendar size={18} />
            <span className="text-sm font-medium">Bookings</span>
          </button>

          <button
            onClick={() => setCurrentView('GUESTS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'GUESTS' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Users size={18} />
            <span className="text-sm font-medium">Guests</span>
          </button>

          <button
            onClick={() => setCurrentView('OWNERS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'OWNERS' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Users size={18} />
            <span className="text-sm font-medium flex-1">Owners</span>
            {(totalUnreadMessages as number) > 0 && (
              <div className="relative group mr-1">
                <Mail size={16} className="text-white/90" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-trust-blue shadow-sm">
                  {totalUnreadMessages as number}
                </span>
              </div>
            )}
          </button>

          <button
            onClick={() => setCurrentView('FINANCIALS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'FINANCIALS' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FileText size={18} />
            <span className="text-sm font-medium">Financials</span>
          </button>

          <button
            onClick={() => setCurrentView('PROPERTY_CARE')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'PROPERTY_CARE' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <HandDiamond size={18} />
            <span className="text-sm font-medium">Property Care</span>
          </button>

          <button
            onClick={() => setCurrentView('COMMUNICATIONS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'COMMUNICATIONS' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">Communications</span>
          </button>

          <button
            onClick={() => setCurrentView('CONTENT')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'CONTENT' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <BookOpen size={18} />
            <span className="text-sm font-medium">Content & Blog</span>
          </button>

          <button
            onClick={() => setCurrentView('SECURITY')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentView === 'SECURITY' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Shield size={18} />
            <span className="text-sm font-medium">Security & Logs</span>
          </button>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => setCurrentView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-left transition-colors ${currentView === 'SETTINGS' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Settings size={18} />
            <span className="text-sm font-medium">System Settings</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 text-left transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors text-left"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Secure Logoff</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 text-gray-900 dark:text-gray-100 transition-colors duration-200">

        {/* VIEW: ORCHESTRATION (DASHBOARD) */}
        {currentView === 'ORCHESTRATION' && (
          <>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-trust-blue dark:text-white">System Orchestration</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time ecosystem overview</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white dark:bg-trust-darkcard dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">All Systems Operational</span>
                </div>
              </div>
            </header>

            {/* Admin KPI */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <GlassCard variant="elevated" padding="md" className="flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Total Properties</p>
                  <h3 className="text-3xl font-black text-trust-blue dark:text-white mt-1 tracking-tighter">142</h3>
                </div>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full w-fit mt-3">+4 this week</span>
              </GlassCard>
              <GlassCard variant="elevated" padding="md" className="flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Active Issues</p>
                  <h3 className="text-3xl font-black text-trust-blue dark:text-white mt-1 tracking-tighter">3</h3>
                </div>
                <span className="text-[10px] text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full w-fit mt-3">Requires attention</span>
              </GlassCard>
              <GlassCard variant="elevated" padding="md" className="flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Occupancy (Avg)</p>
                  <h3 className="text-3xl font-black text-trust-blue dark:text-white mt-1 tracking-tighter">76%</h3>
                </div>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full w-fit mt-3">Sector avg: 65%</span>
              </GlassCard>
              <GlassCard variant="glass" padding="md" className="bg-trust-blue/5 dark:bg-trust-blue/10 flex flex-col justify-between border-trust-blue/20">
                <div>
                  <p className="text-[10px] text-trust-blue dark:text-blue-300 uppercase font-bold tracking-widest">Commissions (MTD)</p>
                  <h3 className="text-3xl font-black text-trust-blue dark:text-white mt-1 tracking-tighter">€18,420</h3>
                </div>
                <span className="text-[10px] text-trust-blue dark:text-blue-200 font-bold mt-3">Revenue Share (20%)</span>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Property Status */}
              <GlassCard variant="elevated" padding="none" className="col-span-2 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-black/20">
                  <h3 className="font-serif font-bold text-trust-blue dark:text-white text-lg">Live Property Status</h3>
                  <div className="flex gap-2">
                    <TrustButton variant="ghost" size="sm">Filter</TrustButton>
                    <TrustButton variant="primary" size="sm">Export Report</TrustButton>
                  </div>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Next Action</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {properties.slice(0, 5).map((prop) => (
                      <tr key={prop.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-trust-blue dark:text-white">{prop.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${prop.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                            {prop.status === 'Active' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                            {prop.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs font-medium">
                          {prop.status === 'Active' ? 'Guest Checkout (Tomorrow)' : 'Plumber Scheduled (2pm)'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-trust-blue dark:text-blue-400 hover:text-trust-green text-[10px] font-bold uppercase tracking-wider transition-colors">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>

              {/* Renovation Queue */}
              <GlassCard variant="elevated" padding="none" className="flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                  <h3 className="font-bold text-trust-blue dark:text-white flex items-center gap-2">
                    <Hammer size={16} className="text-purple-500" /> Renovation Queue
                  </h3>
                  <span className="text-[10px] font-black bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wider">3 Active</span>
                </div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                  {MOCK_TASKS.map(task => (
                    <div key={task.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-trust-darkcard/50 hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer group">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-trust-blue dark:text-white">{task.title}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${task.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>{task.priority}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">Prop ID: {task.propertyId} • {task.type}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-trust-blue dark:text-blue-300 uppercase tracking-wider">{task.status}</span>
                        <span className="text-[10px] text-gray-500 font-mono">Est: €{task.costEstimate}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/20 text-center">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-trust-blue dark:text-blue-400 hover:text-purple-500 transition-colors">View All Tickets</button>
                </div>
              </GlassCard>
            </div>
          </>
        )}

        {/* VIEW: PROPERTIES */}
        {currentView === 'PROPERTIES' && (
          <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-trust-blue dark:text-white">Property Registry</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage listings, availability, and standards</p>
              </div>
              <TrustButton variant="primary" size="md" className="shadow-lg shadow-trust-blue/20">
                <Plus size={16} /> Add Property
              </TrustButton>
            </header>

            {/* Search & Filters */}
            <GlassCard variant="flat" padding="sm" className="mb-6 flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search properties by name or location..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-none bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                />
              </div>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
              <select
                className="px-4 py-2 bg-transparent dark:text-white text-sm font-medium focus:outline-none cursor-pointer"
                value={propertyStatusFilter}
                onChange={(e) => setPropertyStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </GlassCard>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(prop => (
                <GlassCard key={prop.id} variant="elevated" padding="none" className="group hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 relative overflow-hidden">
                    <img src={prop.imgUrl} alt={prop.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-lg ${prop.status === 'Active' ? 'bg-green-500/90 text-white border-green-400/50' :
                        prop.status === 'Maintenance' ? 'bg-orange-500/90 text-white border-orange-400/50' :
                          'bg-blue-500/90 text-white border-blue-400/50'
                        }`}>
                        {prop.status}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-bold text-xl truncate tracking-tight">{prop.name}</h3>
                      <p className="text-white/80 text-xs flex items-center gap-1 mt-1 font-medium"><MapPin size={12} /> {prop.location}</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Occupancy</p>
                        <p className="text-sm font-bold text-trust-blue dark:text-white mt-1">{prop.occupancyRate}%</p>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Revenue</p>
                        <p className="text-sm font-bold text-trust-blue dark:text-white mt-1">€{prop.monthlyRevenue}</p>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Quality</p>
                        <p className={`text-sm font-bold mt-1 ${prop.qualityScore >= 90 ? 'text-green-600' : 'text-orange-500'}`}>{prop.qualityScore}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex -space-x-2">
                        {prop.channels.map(c => (
                          <div key={c} className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shadow-sm" title={c}>
                            {c[0]}
                          </div>
                        ))}
                      </div>
                      <button className="text-[10px] font-bold text-trust-blue dark:text-blue-400 hover:text-trust-green uppercase tracking-wider transition-colors">Manage Property</button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: PROPERTY CARE (NEW) */}
        {currentView === 'PROPERTY_CARE' && (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-trust-blue dark:text-white flex items-center gap-3">
                  <HandDiamond size={28} />
                  Property Care & Operations
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Geographical Matching, Staff Directory & Expenses</p>
              </div>
              <div className="flex gap-4">
                <GlassCard variant="flat" padding="sm" className="bg-white/50 backdrop-blur-sm border-trust-blue/10 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Op. Expenses (MTD)</p>
                    <p className="text-lg font-black text-trust-blue dark:text-white">€{tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0) + expenses.filter(e => e.type === 'Utility').reduce((sum, e) => sum + e.amount, 0)}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <TrustButton
                    onClick={() => setIsUtilityBillModalOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Wallet size={16} className="mr-2" /> Add Utility Bill
                  </TrustButton>
                  <TrustButton variant="primary" size="sm" className="shadow-lg shadow-trust-blue/20">
                    <Plus size={16} className="mr-2" /> New Ticket
                  </TrustButton>
                </GlassCard>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Maintenance Queue */}
              <GlassCard variant="elevated" padding="none" className="lg:col-span-2 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
                  <h3 className="font-bold text-trust-blue dark:text-white flex items-center gap-2">
                    <Hammer size={18} className="text-trust-blue" /> Maintenance Tickets
                  </h3>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {tasks.filter(t => t.status !== 'Completed').length} Pending
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Task Details</th>
                        <th className="px-6 py-4">Property Location</th>
                        <th className="px-6 py-4">Assignment</th>
                        <th className="px-6 py-4 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {tasks.map(task => {
                        const prop = properties.find(p => p.id === task.propertyId);
                        const assignedStaff = staff.find(s => s.id === task.assignedStaffId);
                        return (
                          <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-trust-blue dark:text-white">{task.title}</p>
                              <div className="flex gap-2 items-center mt-1">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                  }`}>{task.priority}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{task.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">{prop?.name}</span>
                                <span className="text-[10px] opacity-70 flex items-center gap-0.5"><MapPin size={10} /> {prop?.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {assignedStaff ? (
                                <div className="flex items-center gap-2">
                                  <img src={assignedStaff.photo} className="w-6 h-6 rounded-full border border-gray-200" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-trust-blue dark:text-white">{assignedStaff.name}</span>
                                    <span className="text-[9px] text-trust-green font-bold">READY TO DISPATCH</span>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setStaffSelectionTask(task);
                                    setStaffSelectionPropertyId(task.propertyId);
                                  }}
                                  className="text-[10px] text-trust-blue dark:text-blue-400 hover:text-trust-green flex items-center gap-1 font-bold uppercase tracking-wider group transition-all"
                                >
                                  <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                                  Appoint Handyman
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="font-bold text-trust-blue dark:text-white">€{task.actualCost || '---'}</p>
                              {task.actualCost && <p className="text-[9px] text-gray-400 font-bold uppercase italic">Confirmed</p>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Cleaning Ops */}
              <GlassCard variant="elevated" padding="none" className="overflow-hidden flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="font-bold text-trust-blue dark:text-white flex items-center gap-2">
                    <CheckCircle size={18} className="text-trust-green" /> Deep Cleaning Ops
                  </h3>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar">
                  {properties.slice(0, 4).map(prop => (
                    <div key={prop.id} className="p-4 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 hover:border-trust-green/30 transition-all border-l-4 border-l-trust-green shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-trust-blue dark:text-white">{prop.name}</h4>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mt-0.5">{prop.location.split(',')[0]}</p>
                        </div>
                        <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">AUTO-SCHEDULED</div>
                      </div>
                      <div className="flex gap-2">
                        <TrustButton
                          onClick={() => {
                            setStaffSelectionTask({
                              id: `C-${prop.id}`,
                              propertyId: prop.id,
                              title: 'Checkout Deep Cleaning',
                              type: 'Cleaning',
                              status: 'Pending',
                              priority: 'Medium',
                              costEstimate: 40,
                              dateScheduled: new Date().toISOString()
                            });
                            setStaffSelectionPropertyId(prop.id);
                          }}
                          variant="primary"
                          size="sm"
                          className="flex-1 text-[10px] uppercase tracking-wider"
                        >
                          <Plus size={12} className="mr-1" /> Find Local Cleaner
                        </TrustButton>
                        <button className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-trust-blue transition-all">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 text-center">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-trust-blue transition-colors">Expand Operational Board</button>
                </div>
              </GlassCard>
            </div>

            {/* Staff & Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <GlassCard variant="elevated" padding="md">
                <p className="text-[10px] text-gray-400 uppercase font-black mb-4 tracking-widest">Active Staff Directory</p>
                <div className="flex flex-col gap-3">
                  {staff.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group">
                      <img src={s.photo} className="w-8 h-8 rounded-full border border-gray-100" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-trust-blue dark:text-white">{s.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{s.location} • {s.type}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                        <Phone size={12} className="text-gray-400" />
                        <Gem size={12} className="text-trust-green" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
              <GlassCard variant="elevated" padding="md">
                <p className="text-[10px] text-gray-400 uppercase font-black mb-4 tracking-widest">Inventory Health</p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-gray-600 dark:text-gray-300">Linens & Towels</span>
                      <span className="text-red-500">22% CRITICAL</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: '22%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-gray-600 dark:text-gray-300">Cleaning Supplies</span>
                      <span className="text-trust-green">89% STABLE</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-trust-green h-full" style={{ width: '89%' }} />
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard variant="elevated" padding="md" className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-white to-green-50/50 dark:from-trust-darkcard dark:to-green-900/10">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-trust-green rounded-full flex items-center justify-center mb-3 shadow-inner">
                  <TrendingUp size={28} />
                </div>
                <h3 className="text-4xl font-black text-trust-blue dark:text-white tracking-tighter">94.2</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Care Quality Index</p>
              </GlassCard>
            </div>

            {/* Expense Analytics & Reports */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Expenses */}
              <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
                  <h3 className="font-bold text-trust-blue dark:text-white flex items-center gap-2">
                    <FileText size={18} /> Recent Expenses
                  </h3>
                  <button className="text-xs font-bold text-trust-blue dark:text-blue-400 hover:underline">View All</button>
                </div>
                <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {expenses.slice(-10).reverse().map(expense => {
                    const property = properties.find(p => p.id === expense.propertyId);
                    const owner = owners.find(o => o.id === expense.ownerId);
                    return (
                      <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-trust-blue/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-trust-blue dark:text-white">{expense.description}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{property?.name} • {owner?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-orange-500">-€{expense.amount}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${expense.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              expense.status === 'Approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}>{expense.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${expense.type === 'Maintenance' ? 'bg-orange-100 text-orange-600' :
                            expense.type === 'Cleaning' ? 'bg-blue-100 text-blue-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>{expense.type}</span>
                          {expense.category && <span className="text-gray-400">• {expense.category}</span>}
                          <span className="text-gray-400 ml-auto">{expense.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expense Breakdown by Type */}
              <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="font-bold text-trust-blue dark:text-white flex items-center gap-2">
                    <TrendingUp size={18} /> Expense Breakdown
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { type: 'Maintenance', color: 'orange', amount: expenses.filter(e => e.type === 'Maintenance').reduce((sum, e) => sum + e.amount, 0) },
                    { type: 'Cleaning', color: 'blue', amount: expenses.filter(e => e.type === 'Cleaning').reduce((sum, e) => sum + e.amount, 0) },
                    { type: 'Utility', color: 'purple', amount: expenses.filter(e => e.type === 'Utility').reduce((sum, e) => sum + e.amount, 0) }
                  ].map(({ type, color, amount }) => {
                    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{type}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-trust-blue dark:text-white">€{amount.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400 ml-2">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`bg-${color}-500 h-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Expenses</span>
                      <span className="text-xl font-black text-orange-500">€{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-trust-blue text-white py-2.5 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Download size={16} /> Export Expense Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: FINANCIALS */}
        {currentView === 'FINANCIALS' && (
          <div className="animate-in fade-in duration-300">
            <AnalyticsDashboard />
          </div>
        )}

        {/* VIEW: COMMUNICATIONS (NEW) */}
        {currentView === 'COMMUNICATIONS' && (
          <div className="h-[calc(100vh-100px)] animate-in fade-in duration-300">
            <AdminMessaging />
          </div>
        )}

        {/* VIEW: BOOKINGS */}
        {currentView === 'BOOKINGS' && (
          <div className="animate-in fade-in duration-300">
            <AdminBookingManagement />
          </div>
        )}

        {/* VIEW: GUESTS */}
        {currentView === 'GUESTS' && (
          <div className="animate-in fade-in duration-300">
            <AdminGuestManagement />
          </div>
        )}

        {/* VIEW: CONTENT & BLOG */}
        {currentView === 'CONTENT' && (
          <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-trust-blue dark:text-white">Content Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage blog posts, news, and updates</p>
              </div>
              <button
                onClick={handleNewPost}
                className="bg-trust-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus size={16} /> New Post
              </button>
            </header>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-trust-darkcard dark:border-gray-700 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md border backdrop-blur-sm ${post.status === 'Published'
                        ? 'bg-green-500/80 text-white border-green-400/50'
                        : 'bg-gray-500/80 text-white border-gray-400/50'
                        }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-trust-blue dark:text-white text-lg mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 flex-1">{post.excerpt}</p>

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                      <div className="text-xs text-gray-400">
                        <span>{post.publishDate}</span> • <span>{post.readTime}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-1.5 text-gray-500 hover:text-trust-blue dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SECURITY & LOGS */}
        {currentView === 'SECURITY' && (
          <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-trust-blue dark:text-white">Security & Audit Logs</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Immutable ledger of all system activities</p>
              </div>
              <button className="bg-trust-darkcard dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                <Lock size={16} /> View Integrity Report
              </button>
            </header>

            <div className="bg-white dark:bg-trust-darkcard dark:border-gray-700 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-900 text-white dark:bg-gray-950 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Actor</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Hash</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-mono text-xs">
                  {MOCK_SECURITY_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{log.timestamp}</td>
                      <td className="px-6 py-3 font-bold text-trust-blue dark:text-white">{log.actor}</td>
                      <td className="px-6 py-3">{log.action}</td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{log.ipAddress}</td>
                      <td className="px-6 py-3 text-gray-400">{log.hash}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-green-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle size={12} /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {currentView === 'SETTINGS' && (
          <div className="animate-in fade-in duration-300">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-trust-blue dark:text-white">System Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Configure platform parameters and integrations</p>
              </div>
              <button className="bg-trust-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm flex items-center gap-2">
                <Save size={16} /> Save Changes
              </button>
            </header>

            {/* ... */}
            <div className="space-y-6">
              {/* General Settings */}
              <div className="bg-white dark:bg-trust-darkcard dark:border-gray-700 rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-trust-blue dark:text-white mb-4 flex items-center gap-2">
                  <Settings size={20} /> General Configuration
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Platform Name</label>
                    <input type="text" defaultValue="TrustBnB Ecosystem" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue/20 dark:text-white" />
                  </div>
                  {/* ... other settings inputs ... */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Support Email</label>
                    <input type="email" defaultValue="support@trustbnb.com" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue/20 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Default Currency</label>
                    <select className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue/20 dark:text-white">
                      <option>EUR (€)</option>
                      <option>USD ($)</option>
                      <option>ALL (L)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Timezone</label>
                    <select className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue/20 dark:text-white">
                      <option>Europe/Tirane (GMT+1)</option>
                      <option>Europe/Zurich (GMT+1)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ... Integrations ... */}
              <div className="bg-white dark:bg-trust-darkcard dark:border-gray-700 rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-trust-blue dark:text-white mb-4 flex items-center gap-2">
                  <Globe size={20} /> API Integrations
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <span className="font-bold text-[#FF385C]">A</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white">Airbnb API</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Syncs calendars, messages, and pricing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10} /> Connected</span>
                      <button className="text-xs text-gray-500 dark:text-gray-400 underline hover:text-trust-blue dark:hover:text-white">Configure</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <span className="font-bold text-[#003580]">B</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white">Booking.com Connectivity</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Channel manager connection</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10} /> Connected</span>
                      <button className="text-xs text-gray-500 dark:text-gray-400 underline hover:text-trust-blue dark:hover:text-white">Configure</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <Wallet size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white">Stripe Payments</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment processing and payouts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10} /> Live</span>
                      <button className="text-xs text-gray-500 dark:text-gray-400 underline hover:text-trust-blue dark:hover:text-white">Configure</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: OWNERS (included because needed for context) */}
        {currentView === 'OWNERS' && (
          <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-trust-blue dark:text-white">Owner Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage diaspora investors and partners</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkMessage}
                  className="bg-white dark:bg-trust-darkcard border border-gray-200 dark:border-gray-700 text-trust-blue dark:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <MessageSquare size={16} /> Broadcast Message
                </button>
                <button
                  onClick={() => {
                    setDmInitialOwnerId(null);
                    setIsDMOpen(true);
                  }}
                  className="bg-white dark:bg-trust-darkcard border border-gray-200 dark:border-gray-700 text-trust-blue dark:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
                >
                  <MessageCircle size={16} /> Direct Message
                  {(totalUnreadMessages as number) > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                      {totalUnreadMessages as number}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleAddOwnerClick}
                  className="bg-trust-blue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-opacity-90 shadow-sm transition-colors"
                >
                  <Plus size={16} /> Add Owner
                </button>
              </div>
            </header>

            {/* Bulk Actions Toolbar */}
            {selectedOwnerIds.size > 0 && (
              <div className="bg-trust-blue text-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <CheckSquare size={20} className="text-trust-green" />
                  <span className="font-semibold text-sm">{selectedOwnerIds.size} Owners Selected</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleBulkMessage} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-sm flex items-center gap-2 transition-colors border border-white/20">
                    <Mail size={16} /> Send Message
                  </button>
                  <button onClick={handleBulkDeactivateClick} className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-md text-sm flex items-center gap-2 transition-colors border border-red-400/50 shadow-sm">
                    <Ban size={16} /> Bulk Deactivate
                  </button>
                  <button onClick={() => setSelectedOwnerIds(new Set())} className="px-3 py-1.5 text-white/60 hover:text-white text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            {!selectedOwnerIds.size && (
              <div className="bg-white dark:bg-trust-darkcard dark:border-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search owners by name, email, location, ID, or status..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm"
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                  <input
                    type="checkbox"
                    id="selectAll"
                    className="w-4 h-4 text-trust-blue rounded border-gray-300 focus:ring-trust-blue cursor-pointer"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="text-sm text-gray-600 dark:text-gray-300 font-medium cursor-pointer">Select All</label>
                </div>
              </div>
            )}

            {/* Owners Grid Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* ... (Card rendering maintained) ... */}
              {filteredOwners.length > 0 ? (
                filteredOwners.map(owner => {
                  const propertyCount = MOCK_PROPERTIES.filter(p => p.ownerId === owner.id).length;
                  const isSelected = selectedOwnerIds.has(owner.id);

                  return (
                    <div
                      key={owner.id}
                      className={`group bg-white dark:bg-trust-darkcard rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden flex flex-col relative h-full ${isSelected ? 'border-trust-blue ring-2 ring-trust-blue/20 dark:ring-blue-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-trust-blue/50 dark:hover:border-blue-500/50 hover:shadow-md'
                        }`}
                    >
                      {/* Card Header / Photo */}
                      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden shrink-0">
                        <img
                          src={`https://i.pravatar.cc/400?u=${owner.email}`}
                          alt={owner.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90"></div>

                        {/* Selection Overlay/Checkbox - Top Left */}
                        <div className="absolute top-3 left-3 z-10">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-trust-blue rounded border-gray-300 focus:ring-trust-blue cursor-pointer shadow-sm bg-white"
                            checked={isSelected}
                            onChange={() => handleSelectOwner(owner.id)}
                          />
                        </div>

                        {/* Status Badge - Top Right */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${owner.status === 'Active'
                            ? 'bg-green-500/80 text-white border-green-400/50'
                            : 'bg-gray-500/80 text-white border-gray-400/50'
                            }`}>
                            {owner.status}
                          </span>
                        </div>

                        {/* Name & ID on Photo - Bottom Left */}
                        <div className="absolute bottom-3 left-4 text-white right-24">
                          <h3 className="font-bold text-lg leading-tight text-shadow truncate">{owner.name}</h3>
                          <p className="text-xs text-white/80 font-mono mt-0.5">ID: #{owner.id}</p>
                        </div>

                        {/* Edit & Delete Actions - Bottom Right of Picture */}
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditClick(owner); }}
                            className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-trust-blue rounded-lg backdrop-blur-sm transition-all shadow-sm"
                            title="Edit Profile"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(owner); }}
                            className="p-1.5 bg-white/20 hover:bg-red-500 text-white hover:text-white rounded-lg backdrop-blur-sm transition-all shadow-sm"
                            title="Delete Owner"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col gap-3">

                        {/* Row 1: Inline Properties, Joined, Message */}
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-1">
                          <div className="flex gap-3 text-xs font-medium text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-trust-blue dark:text-blue-300 px-2 py-1 rounded">
                              <Building size={12} />
                              <span>{propertyCount} Props</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                              <Calendar size={12} />
                              <span>{owner.joinDate.split(',')[1]?.trim() || owner.joinDate}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setDmInitialOwnerId(owner.id);
                                setIsDMOpen(true);
                              }}
                              className="text-trust-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-full transition-colors"
                              title="Secure Chat"
                            >
                              <MessageCircle size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSingleMessageRecipient(owner);
                                setIsComposerOpen(true);
                              }}
                              className="text-gray-500 hover:text-trust-blue dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-full transition-colors"
                              title="Send Email/SMS"
                            >
                              <Mail size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Phone */}
                        <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                          <div className="w-5 flex justify-center"><Phone size={14} className="text-gray-400 dark:text-gray-500" /></div>
                          <span className="font-medium">{owner.phone}</span>
                        </div>

                        {/* Row 3: Email */}
                        <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                          <div className="w-5 flex justify-center"><Mail size={14} className="text-gray-400 dark:text-gray-500" /></div>
                          <span className="truncate" title={owner.email}>{owner.email}</span>
                        </div>

                        {/* Row 4: Address */}
                        <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                          <div className="w-5 flex justify-center"><MapPin size={14} className="text-gray-400 dark:text-gray-500" /></div>
                          <span className="truncate" title={owner.location}>{owner.location}</span>
                        </div>

                        {/* Financial Summary */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Account Balance</span>
                            <span className={`text-sm font-black ${(owner.accountBalance || 0) >= 0 ? 'text-trust-green' : 'text-red-500'}`}>
                              €{(owner.accountBalance || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400">Revenue</span>
                            <span className="text-gray-600 dark:text-gray-300 font-bold">€{(owner.totalRevenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400">Expenses</span>
                            <span className="text-orange-500 font-bold">-€{(owner.totalExpenses || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-trust-darkcard rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
                    <Users size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No owners found</h3>
                  <p className="text-sm mt-1">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ... (Existing Modals) ... */}

      {/* Blog Post Editor Modal (UPDATED FOR CONTRAST) */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-trust-blue px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-serif font-bold text-lg flex items-center gap-2">
                <Edit2 size={18} /> {currentBlogPost.id ? 'Edit Blog Post' : 'Create New Post'}
              </h2>
              <button onClick={() => setIsBlogModalOpen(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Title</label>
                <input
                  type="text"
                  value={currentBlogPost.title || ''}
                  onChange={(e) => setCurrentBlogPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Author</label>
                  <input
                    type="text"
                    value={currentBlogPost.author || ''}
                    onChange={(e) => setCurrentBlogPost(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</label>
                  <select
                    value={currentBlogPost.status || 'Draft'}
                    onChange={(e) => setCurrentBlogPost(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cover Image URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={currentBlogPost.coverImage || ''}
                      onChange={(e) => setCurrentBlogPost(prev => ({ ...prev, coverImage: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Content</label>
                <textarea
                  value={currentBlogPost.content || ''}
                  onChange={(e) => setCurrentBlogPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  placeholder="Write your article content here..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 text-sm resize-none font-mono text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePost}
                className="px-4 py-2 text-sm font-medium text-white bg-trust-blue hover:bg-opacity-90 rounded-lg shadow-md flex items-center gap-2"
              >
                <Save size={16} /> Save Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... (Other Modals: EditOwnerModal, AddOwnerModal, etc.) ... */}
      <EditOwnerModal
        isOpen={!!editingOwner}
        onClose={() => setEditingOwner(null)}
        onSave={handleSaveOwner}
        owner={editingOwner}
      />

      <AddOwnerModal
        isOpen={isAddingOwner}
        onClose={() => setIsAddingOwner(false)}
        onSave={handleSaveNewOwner}
      />

      <MessageComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        recipients={singleMessageRecipient
          ? [{ id: singleMessageRecipient.id, name: singleMessageRecipient.name }]
          : selectedOwnerIds.size > 0
            ? owners.filter(o => selectedOwnerIds.has(o.id)).map(o => ({ id: o.id, name: o.name }))
            : filteredOwners.map(o => ({ id: o.id, name: o.name }))
        }
        onSend={async (channel, subject, message) => {
          const targetRecipients = singleMessageRecipient
            ? [singleMessageRecipient]
            : selectedOwnerIds.size > 0
              ? owners.filter(o => selectedOwnerIds.has(o.id))
              : filteredOwners;

          for (const recipient of targetRecipients) {
            const fullMessage = `[VIA ${channel}] ${subject ? `Subject: ${subject}\n` : ''}${message}`;
            await sendDirectMessage(recipient.id, fullMessage, 'admin');
            addNotification({
              title: subject || 'New Message',
              message: message,
              channel: channel
            });
          }

          if (selectedOwnerIds.size > 0) setSelectedOwnerIds(new Set());
          if (singleMessageRecipient) setSingleMessageRecipient(null);
        }}
      />

      <DirectMessageModal
        isOpen={isDMOpen}
        onClose={() => {
          setIsDMOpen(false);
          setDmInitialOwnerId(null);
        }}
        owners={owners}
        initialOwnerId={dmInitialOwnerId}
      />

      {/* Delete Confirmation Modal */}
      {deletingOwner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Owner?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to remove <span className="font-semibold text-gray-800 dark:text-white">{deletingOwner.name}</span>?
                This action cannot be undone and will archive associated property records.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeletingOwner(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors"
                >
                  Delete Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Deactivate Modal */}
      {showBulkDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-trust-darkcard rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 dark:text-orange-400">
                <Ban size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Deactivate {selectedOwnerIds.size} Owners?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to deactivate these accounts?
                They will lose access to the platform immediately, but data will be preserved.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowBulkDeactivateModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDeactivate}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-md transition-colors"
                >
                  Confirm Deactivation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {notifications.length > 0 && !notifications[0].read && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white dark:bg-trust-darkcard border-l-4 border-trust-blue p-4 rounded-lg shadow-2xl flex items-start gap-3 min-w-[300px]">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-trust-blue rounded-full">
              <Info size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-trust-blue dark:text-white">{notifications[0].title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notifications[0].message}</p>
            </div>
            <button onClick={() => markAsRead(notifications[0].id)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      {/* Staff Selection Modal */}
      {staffSelectionTask && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setStaffSelectionTask(null)} />
          <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-trust-blue p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-xl">Assign {staffSelectionTask.type === 'Cleaning' ? 'Cleaner' : 'Service Staff'}</h3>
                <p className="text-xs opacity-80 mt-1">
                  Task: {staffSelectionTask.title} | {properties.find(p => p.id === staffSelectionPropertyId)?.name}
                </p>
              </div>
              <button onClick={() => setStaffSelectionTask(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto">
              {/* Geographical Filtering Notice */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-trust-blue shadow-sm">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-trust-blue dark:text-blue-300">Geographical Matching Active</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Showing staff within 10km of {properties.find(p => p.id === staffSelectionPropertyId)?.location.split(',')[0]}.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(staff.filter(s => {
                  const propertyCity = properties.find(p => p.id === staffSelectionPropertyId)?.location.split(',')[0].trim();
                  return s.location.includes(propertyCity || '') && (staffSelectionTask.type === 'Cleaning' ? s.type === 'Cleaner' : s.type === 'Handyman');
                })).length > 0 ? (
                  staff.filter(s => {
                    const propertyCity = properties.find(p => p.id === staffSelectionPropertyId)?.location.split(',')[0].trim();
                    return s.location.includes(propertyCity || '') && (staffSelectionTask.type === 'Cleaning' ? s.type === 'Cleaner' : s.type === 'Handyman');
                  }).map(s => (
                    <div key={s.id} className="bg-white dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-trust-blue/50 transition-all group shadow-sm flex flex-col">
                      <div className="flex gap-4">
                        <img src={s.photo} className="w-16 h-16 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-trust-blue dark:text-white truncate">{s.name}</h4>
                          <p className="text-[10px] text-trust-green font-bold uppercase tracking-widest">{s.type}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 truncate">
                            <MapPin size={12} /> {s.address}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-trust-blue dark:text-white">€{s.hourlyRate}<span className="text-[10px] font-normal text-gray-400">/hr</span></p>
                          <div className="flex items-center justify-end gap-1 text-orange-400 mt-1">
                            <span className="text-xs font-bold">{s.rating}</span>
                            <Star size={10} fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      {s.skills && (
                        <div className="mt-4 flex flex-wrap gap-1">
                          {s.skills.map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-bold rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto pt-6 flex gap-2">
                        <button
                          onClick={() => {
                            const property = properties.find(p => p.id === staffSelectionPropertyId);
                            const owner = owners.find(o => o.id === property?.ownerId);
                            const costAmount = s.hourlyRate * 4; // Estimated 4 hours

                            // Create expense record
                            const newExpense: PropertyExpense = {
                              id: `EXP-${Date.now()}`,
                              propertyId: staffSelectionPropertyId!,
                              ownerId: property?.ownerId || '',
                              type: staffSelectionTask.type === 'Cleaning' ? 'Cleaning' : 'Maintenance',
                              description: `${staffSelectionTask.title} - ${s.name}`,
                              amount: costAmount,
                              date: new Date().toISOString().split('T')[0],
                              status: 'Approved',
                              staffId: s.id
                            };

                            setExpenses(prev => [...prev, newExpense]);

                            // Update owner balance
                            setOwners(prev => prev.map(o =>
                              o.id === property?.ownerId
                                ? {
                                  ...o,
                                  accountBalance: (o.accountBalance || 0) - costAmount,
                                  totalExpenses: (o.totalExpenses || 0) + costAmount
                                }
                                : o
                            ));

                            // Automated Notification
                            addNotification({
                              id: `AN-${Date.now()}`,
                              title: 'Expense Deducted',
                              message: `€${costAmount} deducted from ${owner?.name}'s account for ${staffSelectionTask.title}. New balance: €${((owner?.accountBalance || 0) - costAmount).toFixed(2)}`,
                              channel: 'SYSTEM',
                              timestamp: new Date().toISOString(),
                              read: false,
                              priority: 'High'
                            });

                            // Update task state
                            setTasks(prev => prev.map(t =>
                              t.id === staffSelectionTask.id || (t.propertyId === staffSelectionTask.propertyId && t.type === staffSelectionTask.type && t.status === 'Pending')
                                ? { ...t, assignedStaffId: s.id, status: 'In Progress', actualCost: costAmount }
                                : t
                            ));

                            setStaffSelectionTask(null);
                          }}
                          className="flex-1 bg-trust-blue text-white text-[10px] font-bold py-2.5 rounded-lg hover:bg-opacity-90 shadow-sm transition-all active:scale-95"
                        >
                          Confirm Assignment
                        </button>
                        <a href={`tel:${s.phone}`} title="Call" className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 hover:text-trust-blue transition-all">
                          <Phone size={14} />
                        </a>
                        <a href={s.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp" className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 hover:bg-green-500 hover:text-white transition-all">
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <Users size={32} />
                    </div>
                    <h4 className="font-bold text-gray-700 dark:text-white">No local staff found in {properties.find(p => p.id === staffSelectionPropertyId)?.location.split(',')[0]}</h4>
                    <p className="text-xs text-gray-500 mt-1">Recruitment suggested for this geographical sector.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Utility Bill Entry Modal */}
      {isUtilityBillModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsUtilityBillModalOpen(false)} />
          <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-trust-blue p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">Add Utility Bill</h3>
                <p className="text-xs opacity-80 mt-1">Record electricity, water, or internet expenses</p>
              </div>
              <button onClick={() => setIsUtilityBillModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const property = properties.find(p => p.id === selectedPropertyForBill);
                const amount = parseFloat(formData.get('amount') as string);

                const newBill: UtilityBill = {
                  id: `UTIL-${Date.now()}`,
                  propertyId: selectedPropertyForBill!,
                  ownerId: property?.ownerId || '',
                  utilityType: formData.get('utilityType') as any,
                  provider: formData.get('provider') as string,
                  amount,
                  billingPeriod: formData.get('billingPeriod') as string,
                  dueDate: formData.get('dueDate') as string,
                  status: 'Pending',
                  meterReading: formData.get('meterReading') as string || undefined
                };

                const newExpense: PropertyExpense = {
                  id: `EXP-${Date.now()}`,
                  propertyId: selectedPropertyForBill!,
                  ownerId: property?.ownerId || '',
                  type: 'Utility',
                  category: newBill.utilityType,
                  description: `${newBill.utilityType} Bill - ${newBill.billingPeriod}`,
                  amount,
                  date: new Date().toISOString().split('T')[0],
                  status: 'Pending'
                };

                setUtilityBills(prev => [...prev, newBill]);
                setExpenses(prev => [...prev, newExpense]);

                // Deduct from owner balance
                setOwners(prev => prev.map(o =>
                  o.id === property?.ownerId
                    ? {
                      ...o,
                      accountBalance: (o.accountBalance || 0) - amount,
                      totalExpenses: (o.totalExpenses || 0) + amount
                    }
                    : o
                ));

                addNotification({
                  id: `UTIL-${Date.now()}`,
                  title: 'Utility Bill Added',
                  message: `${newBill.utilityType} bill (€${amount}) added for ${property?.name}`,
                  channel: 'SYSTEM',
                  timestamp: new Date().toISOString(),
                  read: false
                });

                setIsUtilityBillModalOpen(false);
                setSelectedPropertyForBill(null);
              }}
              className="p-8 space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Property</label>
                  <select
                    name="property"
                    value={selectedPropertyForBill || ''}
                    onChange={(e) => setSelectedPropertyForBill(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Utility Type</label>
                  <select
                    name="utilityType"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    required
                  >
                    <option value="Electricity">Electricity</option>
                    <option value="Water">Water</option>
                    <option value="Internet">Internet</option>
                    <option value="Gas">Gas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Provider</label>
                  <input
                    type="text"
                    name="provider"
                    placeholder="e.g., OSHEE Albania"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Amount (€)</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Billing Period</label>
                  <input
                    type="text"
                    name="billingPeriod"
                    placeholder="e.g., August 2024"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Meter Reading (Optional)</label>
                  <input
                    type="text"
                    name="meterReading"
                    placeholder="e.g., 12458 kWh"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsUtilityBillModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-trust-blue hover:bg-opacity-90 rounded-lg shadow-sm transition-all active:scale-95"
                >
                  Add Bill & Deduct from Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};