import React, { useState } from 'react';
import { User, Mail, Calendar, MapPin, Heart, LogOut, Shield, Award, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_BOOKINGS, MOCK_PROPERTIES } from '../constants';
import { PropertyCard } from '../components/PropertyCard';
import { Booking } from '../types';

export const UserProfile: React.FC = () => {
    const { user, isAuthenticated, logout, toggleWishlist } = useAuth();
    const [activeTab, setActiveTab] = useState<'TRIPS' | 'WISHLIST' | 'ACCOUNT'>('ACCOUNT');

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <p>Please log in to view your profile.</p>
            </div>
        );
    }

    // Mock filtering for demo purposes. 
    // In real app, we'd query by user.id. Here we show all bookings if Admin, or just specific ones for Guest.
    // Let's just mock it: if role is GUEST, show bookings that match 'GUEST_TEMP' or 'GUEST_01'.
    const myTrips = MOCK_BOOKINGS.filter(b =>
        (user.role === 'ADMIN') ||
        (b.guestId === user.id) ||
        (b.guestName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0].toLowerCase()))
    );

    const wishlistProperties = MOCK_PROPERTIES.filter(p => user.wishlist.includes(p.id));

    // We need to enhance the properties for the card display (similar to Directory)
    // This logic is duplicated but acceptable for MVP. 
    const enhancedWishlist = wishlistProperties.map((prop, idx) => ({
        ...prop,
        bedrooms: 2, bathrooms: 1, maxGuests: 4, rating: 4.8, reviewCount: 50,
        instantBook: true, superhost: false
    }));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                        />
                        {user.role === 'ADMIN' && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                                <Shield size={20} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Joined {new Date(user.joinDate).toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>

                        <div className="flex gap-4">
                            {user.role === 'ADMIN' && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Shield size={12} /> Admin
                                </span>
                            )}
                            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Award size={12} /> Verified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Tabs */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('ACCOUNT')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'ACCOUNT' ? 'bg-white dark:bg-gray-800 shadow-md text-trust-blue' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                        >
                            <User size={20} /> Account Info
                        </button>
                        <button
                            onClick={() => setActiveTab('TRIPS')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'TRIPS' ? 'bg-white dark:bg-gray-800 shadow-md text-trust-blue' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                        >
                            <Calendar size={20} /> My Trips
                        </button>
                        <button
                            onClick={() => setActiveTab('WISHLIST')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'WISHLIST' ? 'bg-white dark:bg-gray-800 shadow-md text-trust-blue' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                        >
                            <Heart size={20} /> Wishlist ({user.wishlist.length})
                        </button>

                        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 mt-8">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            >
                                <LogOut size={20} /> Log Out
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">

                        {/* ACCOUNT TAB */}
                        {activeTab === 'ACCOUNT' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Legal Name</label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <User size={20} className="text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{user.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Email Address</label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <Mail size={20} className="text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{user.email}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Phone Number</label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <Phone size={20} className="text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{user.phone || 'Not provided'}</span>
                                        </div>
                                        <button className="text-sm text-trust-blue font-bold mt-2 hover:underline">Edit</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TRIPS TAB */}
                        {activeTab === 'TRIPS' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Trips</h2>
                                {myTrips.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="text-gray-400" size={32} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No trips yet</h3>
                                        <p className="text-gray-500 mb-6">Time to dust off your bags and start planning your next adventure.</p>
                                        <button className="bg-trust-blue text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all">Start Exploring</button>
                                    </div>
                                ) : (
                                    myTrips.map(booking => (
                                        <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                                                {/* Placeholder for property image since booking doesn't link directly to Image URL in types yet logic is fuzzy */}
                                                <img src={`https://source.unsplash.com/random/200x200?house&sig=${booking.propertyId}`} className="w-full h-full object-cover" alt="Property" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{booking.propertyName}</h3>
                                                        <p className="text-sm text-gray-500">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                    <span className="font-bold text-gray-900 dark:text-white">€{booking.totalPrice}</span>
                                                    <button className="text-sm font-bold text-trust-blue hover:underline">View Receipt</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* WISHLIST TAB */}
                        {activeTab === 'WISHLIST' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h2>
                                {enhancedWishlist.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Heart className="text-gray-400" size={32} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No favorites saved</h3>
                                        <p className="text-gray-500 mb-6">Create a collection of properties you love to start your wishlist.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {enhancedWishlist.map(prop => (
                                            <div key={prop.id} className="h-full">
                                                <PropertyCard
                                                    property={prop}
                                                    isFavorite={true}
                                                    onToggleFavorite={toggleWishlist}
                                                    onClick={() => {/* Navigate to detail (mock) */ }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
