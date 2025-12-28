import React, { useState } from 'react';
import { MapPin, Calendar, Star, Clock, Heart, LogOut, User, Settings, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { MOCK_PROPERTIES } from '../constants';

interface GuestLandingProps {
    onLogout: () => void;
    onSelectTrip: (tripId: string) => void;
}

export const GuestLanding: React.FC<GuestLandingProps> = ({ onLogout, onSelectTrip }) => {
    const { user } = useAuth();
    const { t } = useAppContext(); // Removed logout from here, passed as prop
    const [activeTab, setActiveTab] = useState<'TRIPS' | 'SAVED' | 'PROFILE'>('TRIPS');

    // Filter properties for "Saved" tab (mock functionality)
    const savedProperties = MOCK_PROPERTIES.slice(0, 3);

    // Mock Trips
    const upcomingTrips = [
        {
            id: 'trip_1',
            property: MOCK_PROPERTIES[0],
            dates: 'Oct 12 - Oct 18',
            status: 'Confirmed',
            totalPrice: 1250
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-trust-darkbg p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                            Welcome back, {user?.name || 'Guest'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {activeTab === 'TRIPS' && 'Manage your upcoming adventures'}
                            {activeTab === 'SAVED' && 'Your wishlist of dream stays'}
                            {activeTab === 'PROFILE' && 'Update your personal details'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('TRIPS')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'TRIPS' ? 'bg-trust-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                My Trips
                            </button>
                            <button
                                onClick={() => setActiveTab('SAVED')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SAVED' ? 'bg-trust-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                Saved
                            </button>
                            <button
                                onClick={() => setActiveTab('PROFILE')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PROFILE' ? 'bg-trust-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                Profile
                            </button>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-3 bg-white dark:bg-gray-800 text-red-500 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Log Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* TRIPS TAB */}
                    {activeTab === 'TRIPS' && (
                        <div className="space-y-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-trust-blue text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-3xl font-bold mb-1">{upcomingTrips.length}</div>
                                        <div className="text-blue-100 text-sm font-medium">Upcoming Trips</div>
                                    </div>
                                    <MapPin className="absolute -bottom-4 -right-4 text-white/10 w-24 h-24" />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Past Adventures</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{savedProperties.length}</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Saved Places</div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Reservations</h2>

                            {upcomingTrips.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {upcomingTrips.map(trip => (
                                        <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
                                            <div className="w-32 h-32 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                                                <img src={trip.property.imgUrl} alt={trip.property.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{trip.property.name}</h3>
                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">{trip.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                        <MapPin size={14} />
                                                        {trip.property.location}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center gap-2 text-sm font-medium bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                                        <Calendar size={14} className="text-trust-blue" />
                                                        {trip.dates}
                                                    </div>
                                                    <button
                                                        onClick={() => onSelectTrip(trip.id)}
                                                        className="text-trust-blue hover:underline text-sm font-bold"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="bg-gray-50 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Calendar size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">No trips planned yet</h3>
                                    <p className="text-gray-500 mb-6">Time to start exploring Albania!</p>
                                    <button className="bg-trust-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-trust-blue/90 transition-colors">
                                        Start Exploring
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SAVED TAB */}
                    {activeTab === 'SAVED' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedProperties.map(prop => (
                                <PropertyCard key={prop.id} property={prop} onClick={() => { }} />
                            ))}
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'PROFILE' && (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-trust-blue/10 dark:bg-white/10 rounded-full flex items-center justify-center text-trust-blue dark:text-white">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{user?.name}</h2>
                                    <p className="text-gray-500">{user?.email}</p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600 font-medium">
                                        <Shield size={14} />
                                        <span>Verified Guest</span>
                                    </div>
                                </div>
                            </div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500">Full Name</label>
                                        <input type="text" defaultValue={user?.name} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500">Phone Number</label>
                                        <input type="tel" placeholder="+1 234 567 890" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500">Bio</label>
                                    <textarea placeholder="Tell hosts a bit about yourself..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-32" />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-trust-blue text-white font-bold rounded-lg shadow-lg hover:bg-trust-blue/90 transition-colors">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
